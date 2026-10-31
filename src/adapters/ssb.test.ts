import { describe, expect, it, vi } from 'vitest'
import { validateIndicatorSeries } from '../contracts/validate'
import { IndicatorError } from '../services/indicators'
import {
  SSB_INDICATORS,
  buildSsbUrl,
  createSsbSource,
  fetchSsbSeries,
  normalizeSsb,
  parseSsbPayload,
} from './ssb'
// Real, unmodified SSB response captured 2026-10-31T16:07:27Z from
//   https://data.ssb.no/api/pxwebapi/v2/tables/14701/data?lang=no&outputFormat=json-stat2
//   &valuecodes[ContentsCode]=KpiAar&valuecodes[VareTjenesteGrp]=00&valuecodes[Tid]=*
import realResponse from './__fixtures__/ssb.cpiAnnualTotal.json'

const fixture = realResponse as unknown
const FETCHED_AT = '2026-10-31T16:07:27.000Z'
const ID = 'cpi_annual_total'

type Json = Record<string, unknown>

/** Deep copy of the real fixture to mutate in a test. */
function fixtureCopy(): Json {
  return JSON.parse(JSON.stringify(realResponse)) as Json
}

/**
 * Synthetic JSON-stat2 body (NOT real SSB data) with several categories in every
 * dimension, to prove cells are located by dimension id and stride. Values are
 * `group*100 + contents*10 + time` so every cell is distinguishable.
 */
function synthetic(order: Array<'VareTjenesteGrp' | 'ContentsCode' | 'Tid'>): Json {
  const cats = {
    VareTjenesteGrp: ['00', '01'],
    ContentsCode: ['KpiAar', 'Aarsendring'],
    Tid: ['2023', '2024', '2025'],
  }
  const size = order.map((d) => cats[d].length)
  const value: number[] = []
  const walk = (depth: number, pos: Record<string, number>) => {
    if (depth === order.length) {
      value.push(pos.VareTjenesteGrp * 100 + pos.ContentsCode * 10 + pos.Tid)
      return
    }
    for (let i = 0; i < cats[order[depth]].length; i += 1) walk(depth + 1, { ...pos, [order[depth]]: i })
  }
  walk(0, {})
  const base = fixtureCopy().dimension as Json
  const dimension: Json = {}
  for (const d of order) {
    const orig = base[d] as Json
    dimension[d] = {
      ...orig,
      category: {
        index: Object.fromEntries(cats[d].map((c, i) => [c, i])),
        label: Object.fromEntries(cats[d].map((c) => [c, c])),
      },
      extension:
        d === 'ContentsCode'
          ? {
              basePeriod: { KpiAar: '2025', Aarsendring: '2025' },
              measuringType: { KpiAar: 'Average', Aarsendring: 'Average' },
            }
          : {},
    }
  }
  return { class: 'dataset', id: order, size, dimension, value, updated: '2026-02-10T07:00:00Z' }
}

describe('SSB_INDICATORS', () => {
  it('maps cpi_annual_total to the annual table 14701, not the monthly 14700', () => {
    expect(SSB_INDICATORS[ID].tableId).toBe('14701')
    expect(SSB_INDICATORS[ID].contentsCode).toBe('KpiAar')
    expect(SSB_INDICATORS[ID].groupCode).toBe('00')
  })
})

describe('parseSsbPayload', () => {
  it('parses the real captured response', () => {
    const parsed = parseSsbPayload(fixture)
    expect(parsed.ids).toEqual(['VareTjenesteGrp', 'ContentsCode', 'Tid'])
    expect(parsed.sizes).toEqual([1, 1, 26])
    expect(parsed.values).toHaveLength(26)
    expect(parsed.updated).toBe('2026-02-10T07:00:00Z')
    expect(parsed.dimensions.Tid.codes[0]).toBe('2000')
    expect(parsed.dimensions.Tid.codes[25]).toBe('2025')
  })

  it('rejects a non-object body', () => {
    expect(() => parseSsbPayload([1, 2])).toThrow(IndicatorError)
    expect(() => parseSsbPayload('x')).toThrow(/ikke et objekt/)
  })

  it('maps SSB problem-details bodies: 404 -> not_found, others -> source_unavailable', () => {
    const code = (status: number) => {
      try {
        parseSsbPayload({ type: 'x', title: 'Not found', status })
        return 'no error'
      } catch (err) {
        return (err as IndicatorError).code
      }
    }
    expect(code(404)).toBe('not_found')
    expect(code(429)).toBe('source_unavailable')
    expect(code(500)).toBe('source_unavailable')
  })

  it('rejects a body that is not a JSON-stat2 dataset', () => {
    expect(() => parseSsbPayload({ class: 'collection' })).toThrow(/JSON-stat2/)
  })

  it('rejects an id list that does not match size', () => {
    const body = fixtureCopy()
    body.size = [1, 26]
    expect(() => parseSsbPayload(body)).toThrow(/size/)
  })

  it('rejects a dimension whose category count disagrees with size', () => {
    const body = fixtureCopy()
    body.size = [1, 1, 25]
    expect(() => parseSsbPayload(body)).toThrow(/kategorier/)
  })

  it('rejects a value array of the wrong length', () => {
    const body = fixtureCopy()
    ;(body.value as unknown[]).pop()
    expect(() => parseSsbPayload(body)).toThrow(/forventet 26/)
  })

  it('rejects non-numeric and non-finite values', () => {
    for (const bad of ['100', Number.NaN, Number.POSITIVE_INFINITY, undefined, {}]) {
      const body = fixtureCopy()
      ;(body.value as unknown[])[3] = bad
      expect(() => parseSsbPayload(body)).toThrow(/verken tall eller null/)
    }
  })

  it('keeps null as null', () => {
    const body = fixtureCopy()
    ;(body.value as unknown[])[3] = null
    expect(parseSsbPayload(body).values[3]).toBeNull()
  })

  it('rejects an invalid updated timestamp', () => {
    const body = fixtureCopy()
    body.updated = 'i fjor'
    expect(() => parseSsbPayload(body)).toThrow(/updated/)
  })
})

describe('normalizeSsb', () => {
  const series = normalizeSsb(parseSsbPayload(fixture), ID, FETCHED_AT)

  it('produces a contract-valid IndicatorSeries', () => {
    expect(validateIndicatorSeries(series)).toEqual([])
  })

  it('sets indicator, unit and base-year metadata (index level, not percent change)', () => {
    expect(series.indicator).toBe(ID)
    expect(series.title).toBe('Konsumprisindeks (KPI), totalindeks')
    expect(series.subtitle).toBe('Årsgjennomsnitt, indeksnivå')
    expect(series.unit).toEqual({ code: 'Indeks (2025=100)', display: 'number', decimals: 1 })
    expect(series.unit.display).not.toBe('percent')
  })

  it('marks the source as official SSB table 14701 with the supplied retrieval time', () => {
    expect(series.source).toEqual({
      id: 'ssb',
      label: 'Statistisk sentralbyrå, tabell 14701',
      official: true,
      fetchedAt: FETCHED_AT,
    })
  })

  it('exposes only Norway', () => {
    expect(series.regions).toEqual([{ code: 'NO', name: 'Norge' }])
    expect(series.points.every((p) => p.region === 'NO')).toBe(true)
  })

  it('returns 26 yearly points 2000–2025 in ascending order', () => {
    expect(series.points).toHaveLength(26)
    expect(series.points[0]).toEqual({ region: 'NO', period: '2000', value: 54.8 })
    expect(series.points[25]).toEqual({ region: 'NO', period: '2025', value: 100 })
    const periods = series.points.map((p) => p.period)
    expect(periods).toEqual([...periods].sort())
  })

  it('carries the real SSB values unchanged (2000, 2015, 2024, 2025)', () => {
    const byYear = new Map(series.points.map((p) => [p.period, p.value]))
    expect(byYear.get('2000')).toBe(54.8)
    expect(byYear.get('2015')).toBe(72.6)
    expect(byYear.get('2024')).toBe(97.1)
    expect(byYear.get('2025')).toBe(100)
  })

  it('passes null through as a gap and never converts it to 0', () => {
    const body = fixtureCopy()
    ;(body.value as unknown[])[24] = null // 2024
    const s = normalizeSsb(parseSsbPayload(body), ID, FETCHED_AT)
    expect(s.points.find((p) => p.period === '2024')).toEqual({ region: 'NO', period: '2024', value: null })
    expect(s.points.filter((p) => p.value === 0)).toHaveLength(0)
    expect(validateIndicatorSeries(s)).toEqual([])
  })

  it('sorts by period even when the category index is stored out of order', () => {
    const body = fixtureCopy()
    const time = (body.dimension as Json).Tid as { category: { index: Record<string, number> } }
    // Positions reversed in the object: 2025 -> 0 ... 2000 -> 25, values re-ordered to match.
    time.category.index = Object.fromEntries(
      Object.keys(time.category.index).reverse().map((code, i) => [code, i]),
    )
    ;(body.value as number[]).reverse()
    const s = normalizeSsb(parseSsbPayload(body), ID, FETCHED_AT)
    expect(s.points[0]).toEqual({ region: 'NO', period: '2000', value: 54.8 })
    expect(s.points[25]).toEqual({ region: 'NO', period: '2025', value: 100 })
  })

  it('selects KpiAar for group 00 whatever the dimension storage order (no level/percent mix-up)', () => {
    const orders: Array<Array<'VareTjenesteGrp' | 'ContentsCode' | 'Tid'>> = [
      ['VareTjenesteGrp', 'ContentsCode', 'Tid'],
      ['Tid', 'ContentsCode', 'VareTjenesteGrp'],
      ['ContentsCode', 'Tid', 'VareTjenesteGrp'],
    ]
    for (const order of orders) {
      const s = normalizeSsb(parseSsbPayload(synthetic(order)), ID, FETCHED_AT)
      // group index 0, contents index 0 => value = time index
      expect(s.points.map((p) => p.value)).toEqual([0, 1, 2])
      expect(s.points.map((p) => p.period)).toEqual(['2023', '2024', '2025'])
    }
  })

  it('rejects a changed base year instead of mislabelling the series', () => {
    const body = fixtureCopy()
    const ext = ((body.dimension as Json).ContentsCode as { extension: Json }).extension
    ext.basePeriod = { KpiAar: '2030' }
    expect(() => normalizeSsb(parseSsbPayload(body), ID, FETCHED_AT)).toThrow(/basisåret/)
  })

  it('rejects a measuring type other than annual average', () => {
    const body = fixtureCopy()
    const ext = ((body.dimension as Json).ContentsCode as { extension: Json }).extension
    ext.measuringType = { KpiAar: 'Point' }
    expect(() => normalizeSsb(parseSsbPayload(body), ID, FETCHED_AT)).toThrow(/Average/)
  })

  it('rejects a dataset missing a required dimension', () => {
    const body = fixtureCopy()
    body.id = ['VareTjenesteGrp', 'ContentsCode', 'Aar']
    ;(body.dimension as Json).Aar = (body.dimension as Json).Tid
    delete (body.dimension as Json).Tid
    expect(() => normalizeSsb(parseSsbPayload(body), ID, FETCHED_AT)).toThrow(/Tid/)
  })

  it('rejects a dataset without the expected contents code or group', () => {
    const noContents = fixtureCopy()
    const cc = (noContents.dimension as Json).ContentsCode as { category: { index: Json } }
    cc.category.index = { KpiMnd: 0 }
    expect(() => normalizeSsb(parseSsbPayload(noContents), ID, FETCHED_AT)).toThrow(/KpiAar/)

    const noGroup = fixtureCopy()
    const g = (noGroup.dimension as Json).VareTjenesteGrp as { category: { index: Json } }
    g.category.index = { '01': 0 }
    expect(() => normalizeSsb(parseSsbPayload(noGroup), ID, FETCHED_AT)).toThrow(/«00»/)
  })

  it('rejects non-annual period codes (e.g. a monthly table by mistake)', () => {
    const body = fixtureCopy()
    const t = (body.dimension as Json).Tid as { category: { index: Json } }
    t.category.index = Object.fromEntries(
      Object.keys(t.category.index).map((_, i) => [`2000M${String(i + 1).padStart(2, '0')}`, i]),
    )
    expect(() => normalizeSsb(parseSsbPayload(body), ID, FETCHED_AT)).toThrow(/ikke et årstall/)
  })

  it('rejects an unknown indicator id', () => {
    expect(() => normalizeSsb(parseSsbPayload(fixture), 'nope', FETCHED_AT)).toThrow(IndicatorError)
  })

  it('reports not_found when the dataset has no periods', () => {
    const body = fixtureCopy()
    body.size = [1, 1, 0]
    ;((body.dimension as Json).Tid as { category: { index: unknown[] } }).category.index = []
    body.value = []
    try {
      normalizeSsb(parseSsbPayload(body), ID, FETCHED_AT)
      expect.unreachable()
    } catch (err) {
      expect((err as IndicatorError).code).toBe('not_found')
    }
  })
})

describe('buildSsbUrl', () => {
  it('requests table 14701, KpiAar, group 00 and all periods as json-stat2', () => {
    const url = new URL(buildSsbUrl(SSB_INDICATORS[ID]))
    expect(url.origin + url.pathname).toBe('https://data.ssb.no/api/pxwebapi/v2/tables/14701/data')
    expect(url.searchParams.get('outputFormat')).toBe('json-stat2')
    expect(url.searchParams.get('valuecodes[ContentsCode]')).toBe('KpiAar')
    expect(url.searchParams.get('valuecodes[VareTjenesteGrp]')).toBe('00')
    expect(url.searchParams.get('valuecodes[Tid]')).toBe('*')
  })
})

describe('fetchSsbSeries', () => {
  const clock = () => new Date(FETCHED_AT)
  const okFetch = (_url: string) => Promise.resolve(fixture)

  it('returns a validated series, makes one request and stamps the retrieval time', async () => {
    const fetchJson = vi.fn(okFetch)
    const series = await fetchSsbSeries(ID, undefined, { fetchJson, now: clock })
    expect(fetchJson).toHaveBeenCalledTimes(1)
    expect(validateIndicatorSeries(series)).toEqual([])
    expect(series.points).toHaveLength(26)
    expect(series.source.fetchedAt).toBe(FETCHED_AT)
  })

  it('applies an inclusive from/to range client-side without changing the request', async () => {
    const a = vi.fn(okFetch)
    const b = vi.fn(okFetch)
    const full = await fetchSsbSeries(ID, undefined, { fetchJson: a, now: clock })
    const ranged = await fetchSsbSeries(ID, { from: '2018', to: '2020' }, { fetchJson: b, now: clock })
    expect(a.mock.calls[0][0]).toBe(b.mock.calls[0][0])
    expect(ranged.points.map((p) => p.period)).toEqual(['2018', '2019', '2020'])
    expect(ranged.points[0].value).toBe(full.points.find((p) => p.period === '2018')?.value)
  })

  it('supports one-sided ranges', async () => {
    const fromOnly = await fetchSsbSeries(ID, { from: '2023' }, { fetchJson: okFetch, now: clock })
    expect(fromOnly.points.map((p) => p.period)).toEqual(['2023', '2024', '2025'])
    const toOnly = await fetchSsbSeries(ID, { to: '2001' }, { fetchJson: okFetch, now: clock })
    expect(toOnly.points.map((p) => p.period)).toEqual(['2000', '2001'])
  })

  it('returns a valid empty point list when the range excludes everything', async () => {
    const s = await fetchSsbSeries(ID, { from: '2030' }, { fetchJson: okFetch, now: clock })
    expect(s.points).toEqual([])
    expect(validateIndicatorSeries(s)).toEqual([])
  })

  it('accepts a region filter containing NO and rejects one without it', async () => {
    const ok = await fetchSsbSeries(ID, { regions: ['NO', 'SE'] }, { fetchJson: okFetch, now: clock })
    expect(ok.regions.map((r) => r.code)).toEqual(['NO'])
    await expect(
      fetchSsbSeries(ID, { regions: ['SE'] }, { fetchJson: okFetch, now: clock }),
    ).rejects.toMatchObject({ code: 'invalid' })
  })

  it('maps transport failures to source_unavailable but keeps typed errors', async () => {
    await expect(
      fetchSsbSeries(ID, undefined, { fetchJson: () => Promise.reject(new Error('offline')), now: clock }),
    ).rejects.toMatchObject({ code: 'source_unavailable', message: expect.stringContaining('offline') })
    await expect(
      fetchSsbSeries(ID, undefined, {
        fetchJson: () => Promise.reject(new IndicatorError('not_found', 'x')),
        now: clock,
      }),
    ).rejects.toMatchObject({ code: 'not_found' })
  })

  it('rejects malformed bodies as invalid', async () => {
    await expect(
      fetchSsbSeries(ID, undefined, { fetchJson: () => Promise.resolve({ hei: 1 }), now: clock }),
    ).rejects.toMatchObject({ code: 'invalid' })
  })

  it('rejects an unknown indicator without fetching', async () => {
    const fetchJson = vi.fn(okFetch)
    await expect(fetchSsbSeries('unknown', undefined, { fetchJson })).rejects.toThrow(IndicatorError)
    expect(fetchJson).not.toHaveBeenCalled()
  })
})

describe('createSsbSource', () => {
  it('has id "ssb", serves cpi_annual_total and returns null for other ids', async () => {
    const fetchJson = vi.fn((_url: string) => Promise.resolve(fixture))
    const source = createSsbSource({ fetchJson, now: () => new Date(FETCHED_AT) })
    expect(source.id).toBe('ssb')
    expect(await source.fetch('gdp_per_capita')).toBeNull()
    expect(fetchJson).not.toHaveBeenCalled()
    const series = await source.fetch(ID)
    expect(series?.indicator).toBe(ID)
  })
})
