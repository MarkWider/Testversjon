import { describe, expect, it, vi } from 'vitest'
import { validateIndicatorSeries } from '../contracts/validate'
import { IndicatorError } from '../services/indicators'
import {
  createWorldBankSource,
  fetchWorldBankSeries,
  normalizeWorldBank,
  parseWorldBankPayload,
} from './worldBank'
import realResponse from './__fixtures__/worldBank.gdpPerCapita.json'

const fixture = realResponse as unknown

/** Build a minimal World Bank `[meta, rows]` body. */
function wbBody(
  rows: unknown[],
  meta: Record<string, unknown> = {},
): unknown {
  return [
    { page: 1, pages: 1, per_page: 1000, total: rows.length, lastupdated: '2026-07-13', ...meta },
    rows,
  ]
}

function wbRow(iso3: string, date: string, value: number | null): unknown {
  return {
    indicator: { id: 'NY.GDP.PCAP.CD', value: 'GDP per capita (current US$)' },
    country: { id: iso3.slice(0, 2), value: iso3 },
    countryiso3code: iso3,
    date,
    value,
  }
}

describe('parseWorldBankPayload', () => {
  it('parses the real captured response', () => {
    const parsed = parseWorldBankPayload(fixture)
    expect(parsed.meta.pages).toBe(1)
    expect(parsed.meta.lastupdated).toBe('2026-07-13')
    expect(parsed.rows).toHaveLength(27)
  })

  it('rejects a non-array body', () => {
    expect(() => parseWorldBankPayload({ nope: true })).toThrow(IndicatorError)
  })

  it('rejects a body without a data part', () => {
    expect(() => parseWorldBankPayload([{ page: 1, pages: 1 }])).toThrow(/datadelen/)
  })

  it('treats [meta, null] as an empty row set', () => {
    const parsed = parseWorldBankPayload([{ page: 1, pages: 0, per_page: 1000, total: 0 }, null])
    expect(parsed.rows).toEqual([])
  })

  it('maps a World Bank error envelope to not_found', () => {
    try {
      parseWorldBankPayload([{ message: [{ id: '120', key: 'Invalid value', value: 'bad parameter' }] }])
      expect.unreachable()
    } catch (err) {
      expect(err).toBeInstanceOf(IndicatorError)
      expect((err as IndicatorError).code).toBe('not_found')
    }
  })

  it('rejects a row missing countryiso3code / date', () => {
    expect(() => parseWorldBankPayload(wbBody([{ date: '2020', value: 1 }]))).toThrow(
      /countryiso3code/,
    )
  })

  it('rejects a non-numeric value', () => {
    expect(() =>
      parseWorldBankPayload(wbBody([{ countryiso3code: 'NOR', date: '2020', value: 'x' }])),
    ).toThrow(/ikke-numerisk/)
  })
})

describe('normalizeWorldBank', () => {
  const series = normalizeWorldBank(parseWorldBankPayload(fixture), 'gdp_per_capita')

  it('produces a contract-valid IndicatorSeries', () => {
    expect(validateIndicatorSeries(series)).toEqual([])
  })

  it('sets indicator + presentation metadata', () => {
    expect(series.indicator).toBe('gdp_per_capita')
    expect(series.title).toBe('BNP per innbygger')
    expect(series.subtitle).toBe('Løpende priser')
    expect(series.unit).toEqual({
      code: 'USD',
      display: 'currency',
      currency: 'USD',
      decimals: 0,
    })
  })

  it('marks the source as official World Bank with its refresh date', () => {
    expect(series.source).toEqual({
      id: 'worldbank',
      label: 'Verdensbanken',
      official: true,
      fetchedAt: '2026-07-13',
    })
  })

  it('exposes regions NO/SE/DK in canonical order', () => {
    expect(series.regions).toEqual([
      { code: 'NO', name: 'Norge' },
      { code: 'SE', name: 'Sverige' },
      { code: 'DK', name: 'Danmark' },
    ])
  })

  it('returns 27 points sorted by period then region order', () => {
    expect(series.points).toHaveLength(27)
    expect(series.points.slice(0, 3)).toEqual([
      { region: 'NO', period: '2015', value: 77220.9524311414 },
      { region: 'SE', period: '2015', value: 51188.1652120493 },
      { region: 'DK', period: '2015', value: 53094.0133607574 },
    ])
    for (let i = 1; i < series.points.length; i += 1) {
      expect(series.points[i - 1].period <= series.points[i].period).toBe(true)
    }
  })

  it('keeps full upstream precision and passes null values through as gaps', () => {
    const withGap = normalizeWorldBank(
      parseWorldBankPayload(wbBody([wbRow('NOR', '2024', null), wbRow('NOR', '2023', 90984.4087141111)])),
      'gdp_per_capita',
    )
    expect(withGap.points).toContainEqual({ region: 'NO', period: '2023', value: 90984.4087141111 })
    expect(withGap.points).toContainEqual({ region: 'NO', period: '2024', value: null })
  })

  it('drops countries outside the region contract', () => {
    const withUsa = normalizeWorldBank(
      parseWorldBankPayload(wbBody([wbRow('USA', '2023', 82769), wbRow('NOR', '2023', 90984)])),
      'gdp_per_capita',
    )
    expect(withUsa.regions.map((r) => r.code)).toEqual(['NO'])
    expect(withUsa.points.every((p) => p.region === 'NO')).toBe(true)
  })

  it('rejects an unknown indicator id', () => {
    expect(() => normalizeWorldBank(parseWorldBankPayload(fixture), 'unknown')).toThrow(
      IndicatorError,
    )
  })

  it('rejects a payload with no known-country rows', () => {
    expect(() =>
      normalizeWorldBank(parseWorldBankPayload(wbBody([wbRow('USA', '2023', 1)])), 'gdp_per_capita'),
    ).toThrow(/ingen observasjoner/)
  })
})

describe('fetchWorldBankSeries', () => {
  const okFetch = (_url: string) => Promise.resolve(fixture)

  it('returns a validated series and calls the expected URL', async () => {
    const fetchJson = vi.fn(okFetch)
    const series = await fetchWorldBankSeries('gdp_per_capita', undefined, { fetchJson })
    expect(validateIndicatorSeries(series)).toEqual([])
    expect(series.points).toHaveLength(27)
    const url = fetchJson.mock.calls[0][0] as string
    expect(url).toContain('/country/NOR;SWE;DNK/indicator/NY.GDP.PCAP.CD')
    expect(url).toContain('format=json')
  })

  it('requests only the filtered regions', async () => {
    const fetchJson = vi.fn((_url: string) =>
      Promise.resolve(
        parseWorldBankPayload(fixture).rows.filter((r) => r.countryiso3code === 'NOR'),
      ).then((rows) => wbBody(rows as unknown[])),
    )
    const series = await fetchWorldBankSeries('gdp_per_capita', { regions: ['NO'] }, { fetchJson })
    expect((fetchJson.mock.calls[0][0] as string)).toContain('/country/NOR/indicator/')
    expect(series.regions.map((r) => r.code)).toEqual(['NO'])
  })

  it('passes a two-sided date range to the API and trims one-sided ranges client-side', async () => {
    const twoSided = vi.fn(okFetch)
    await fetchWorldBankSeries('gdp_per_capita', { from: '2018', to: '2020' }, { fetchJson: twoSided })
    expect((twoSided.mock.calls[0][0] as string)).toContain('date=2018%3A2020')

    const oneSided = vi.fn(okFetch)
    const series = await fetchWorldBankSeries('gdp_per_capita', { from: '2021' }, { fetchJson: oneSided })
    expect((oneSided.mock.calls[0][0] as string)).not.toContain('date=')
    expect(series.points.every((p) => p.period >= '2021')).toBe(true)
    expect(series.points.length).toBe(3 * 3)
  })

  it('follows pagination', async () => {
    const all = parseWorldBankPayload(fixture).rows as unknown[]
    const fetchJson = vi.fn((url: string) => {
      const page = new URL(url).searchParams.get('page')
      return Promise.resolve(
        page === '2'
          ? wbBody(all.slice(14), { page: 2, pages: 2 })
          : wbBody(all.slice(0, 14), { pages: 2 }),
      )
    })
    const series = await fetchWorldBankSeries('gdp_per_capita', undefined, { fetchJson })
    expect(fetchJson).toHaveBeenCalledTimes(2)
    expect(series.points).toHaveLength(27)
  })

  it('rejects an unknown indicator without fetching', async () => {
    const fetchJson = vi.fn(okFetch)
    await expect(fetchWorldBankSeries('nope', undefined, { fetchJson })).rejects.toMatchObject({
      code: 'not_found',
    })
    expect(fetchJson).not.toHaveBeenCalled()
  })

  it('maps a transport failure to source_unavailable', async () => {
    const fetchJson = vi.fn(() => Promise.reject(new Error('ECONNRESET')))
    await expect(
      fetchWorldBankSeries('gdp_per_capita', undefined, { fetchJson }),
    ).rejects.toMatchObject({ code: 'source_unavailable' })
  })

  it('propagates a contract violation as invalid', async () => {
    const fetchJson = vi.fn(() => Promise.resolve('garbage'))
    await expect(
      fetchWorldBankSeries('gdp_per_capita', undefined, { fetchJson }),
    ).rejects.toMatchObject({ code: 'invalid' })
  })
})

describe('createWorldBankSource', () => {
  it('implements IndicatorSource and returns null for unknown ids', async () => {
    const source = createWorldBankSource({ fetchJson: () => Promise.resolve(fixture) })
    expect(source.id).toBe('worldbank')
    expect(await source.fetch('unknown_indicator')).toBeNull()
    const series = await source.fetch('gdp_per_capita')
    expect(series?.source.id).toBe('worldbank')
  })
})
