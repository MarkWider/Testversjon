import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { IndicatorSeries } from '../contracts/indicator'
import { validateIndicatorSeries } from '../contracts/validate'
import { IndicatorError, getIndicatorData } from './indicators'
import wbFixture from '../adapters/__fixtures__/worldBank.gdpPerCapita.json'

const [WB_META, WB_ROWS] = wbFixture as [
  unknown,
  Array<{ countryiso3code: string; date: string; value: number | null }>,
]

function response(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: () => Promise.resolve(body) } as unknown as Response
}

/** URL-aware World Bank mock: honours the `country/{iso3;iso3}` path segment. */
function worldBankMock(url: string): Promise<Response> {
  const match = /\/country\/([^/]+)\/indicator\//.exec(url)
  const iso3s = match ? decodeURIComponent(match[1]).split(';') : []
  const rows =
    iso3s.length > 0
      ? WB_ROWS.filter((r) => iso3s.includes(r.countryiso3code))
      : WB_ROWS
  return Promise.resolve(response([WB_META, rows]))
}

function stubFetch(impl: (url: string) => Promise<Response>) {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: string | URL | Request) => impl(String(input))),
  )
}

beforeEach(() => stubFetch(worldBankMock))
afterEach(() => vi.unstubAllGlobals())

function uniquePeriods(series: IndicatorSeries): string[] {
  return [...new Set(series.points.map((p) => p.period))].sort()
}

function periodsInOrder(series: IndicatorSeries): boolean {
  const order = new Map(series.regions.map((r, i) => [r.code, i]))
  for (let i = 1; i < series.points.length; i += 1) {
    const prev = series.points[i - 1]
    const cur = series.points[i]
    if (prev.period > cur.period) return false
    if (
      prev.period === cur.period &&
      (order.get(prev.region) ?? 0) > (order.get(cur.region) ?? 0)
    ) {
      return false
    }
  }
  return true
}

describe('getIndicatorData("gdp_per_capita") — World Bank source', () => {
  it('resolves to a contract-valid IndicatorSeries', async () => {
    const series = await getIndicatorData('gdp_per_capita')
    expect(validateIndicatorSeries(series)).toEqual([])
  })

  it('is served by the World Bank source', async () => {
    const series = await getIndicatorData('gdp_per_capita')
    expect(series.source).toEqual({
      id: 'worldbank',
      label: 'Verdensbanken',
      official: true,
      fetchedAt: '2026-07-13',
    })
  })

  it('returns the requested indicator and its presentation metadata', async () => {
    const series = await getIndicatorData('gdp_per_capita')
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

  it('exposes NO/SE/DK in display order', async () => {
    const series = await getIndicatorData('gdp_per_capita')
    expect(series.regions.map((r) => r.code)).toEqual(['NO', 'SE', 'DK'])
    expect(series.regions.map((r) => r.name)).toEqual([
      'Norge',
      'Sverige',
      'Danmark',
    ])
  })

  it('defaults to the 2015–2023 pilot window when no range is given', async () => {
    const series = await getIndicatorData('gdp_per_capita')
    expect(uniquePeriods(series)).toEqual([
      '2015',
      '2016',
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
    ])
    expect(series.points).toHaveLength(9 * 3)
  })

  it('passes the default window to the World Bank API as date=2015:2023', async () => {
    const fetchSpy = vi.fn(worldBankMock)
    stubFetch(fetchSpy)
    await getIndicatorData('gdp_per_capita')
    expect(String(fetchSpy.mock.calls[0][0])).toContain('date=2015%3A2023')
  })

  it('returns points sorted by period then region order', async () => {
    const series = await getIndicatorData('gdp_per_capita')
    expect(periodsInOrder(series)).toBe(true)
    expect(series.points.slice(0, 3)).toEqual([
      { region: 'NO', period: '2015', value: 77220.9524311414 },
      { region: 'SE', period: '2015', value: 51188.1652120493 },
      { region: 'DK', period: '2015', value: 53094.0133607574 },
    ])
  })

  it('carries the real World Bank values', async () => {
    const series = await getIndicatorData('gdp_per_capita')
    const at = (region: string, period: string) =>
      series.points.find((p) => p.region === region && p.period === period)?.value
    expect(at('NO', '2022')).toBe(113122.130765691)
    expect(at('SE', '2020')).toBe(52568.5726980146)
    expect(at('DK', '2023')).toBe(68043.5466971243)
    expect(series.points.every((p) => typeof p.value === 'number')).toBe(true)
  })

  it('returns an independent copy on each call', async () => {
    const a = await getIndicatorData('gdp_per_capita')
    a.points[0].value = -1
    a.regions.pop()
    const b = await getIndicatorData('gdp_per_capita')
    expect(b.points[0].value).toBe(77220.9524311414)
    expect(b.regions).toHaveLength(3)
  })
})

describe('getIndicatorData options', () => {
  it('respects an explicit inclusive from/to over the pilot default', async () => {
    const series = await getIndicatorData('gdp_per_capita', {
      from: '2020',
      to: '2022',
    })
    expect(uniquePeriods(series)).toEqual(['2020', '2021', '2022'])
    expect(series.points).toHaveLength(3 * 3)
  })

  it('sends an explicit range to the World Bank API', async () => {
    const fetchSpy = vi.fn(worldBankMock)
    stubFetch(fetchSpy)
    await getIndicatorData('gdp_per_capita', { from: '2018', to: '2019' })
    expect(String(fetchSpy.mock.calls[0][0])).toContain('date=2018%3A2019')
  })

  it('fills only the missing bound from the pilot default', async () => {
    const series = await getIndicatorData('gdp_per_capita', { from: '2021' })
    expect(uniquePeriods(series)).toEqual(['2021', '2022', '2023'])
  })

  it('filters to the requested regions', async () => {
    const series = await getIndicatorData('gdp_per_capita', { regions: ['NO'] })
    expect(series.regions.map((r) => r.code)).toEqual(['NO'])
    expect(series.points.every((p) => p.region === 'NO')).toBe(true)
    expect(series.points).toHaveLength(9)
  })

  it('keeps region display order with a multi-region filter', async () => {
    const series = await getIndicatorData('gdp_per_capita', {
      regions: ['DK', 'NO'],
    })
    expect(series.regions.map((r) => r.code)).toEqual(['NO', 'DK'])
    expect(periodsInOrder(series)).toBe(true)
  })

  it('ignores unknown region codes', async () => {
    const series = await getIndicatorData('gdp_per_capita', {
      regions: ['XX', 'NO'],
    })
    expect(series.regions.map((r) => r.code)).toEqual(['NO'])
  })
})

describe('getIndicatorData error codes', () => {
  it('unknown indicator → not_found, without hitting the source', async () => {
    const fetchSpy = vi.fn(worldBankMock)
    stubFetch(fetchSpy)
    await expect(getIndicatorData('does_not_exist')).rejects.toBeInstanceOf(
      IndicatorError,
    )
    await expect(getIndicatorData('does_not_exist')).rejects.toMatchObject({
      code: 'not_found',
    })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('World Bank error envelope → not_found (code preserved from source)', async () => {
    stubFetch(() =>
      Promise.resolve(response([{ message: [{ value: 'bad parameter' }] }])),
    )
    await expect(getIndicatorData('gdp_per_capita')).rejects.toMatchObject({
      code: 'not_found',
    })
  })

  it('HTTP failure → source_unavailable', async () => {
    stubFetch(() => Promise.resolve(response(null, false, 503)))
    await expect(getIndicatorData('gdp_per_capita')).rejects.toMatchObject({
      code: 'source_unavailable',
    })
  })

  it('network throw → source_unavailable', async () => {
    stubFetch(() => Promise.reject(new Error('ECONNRESET')))
    await expect(getIndicatorData('gdp_per_capita')).rejects.toMatchObject({
      code: 'source_unavailable',
    })
  })

  it('unparseable body → invalid (code preserved from source)', async () => {
    stubFetch(() => Promise.resolve(response('garbage')))
    await expect(getIndicatorData('gdp_per_capita')).rejects.toMatchObject({
      code: 'invalid',
    })
  })
})

describe('validateIndicatorSeries', () => {
  const base = (): IndicatorSeries => ({
    indicator: 'x',
    title: 'X',
    unit: { code: 'USD', display: 'currency', currency: 'USD', decimals: 0 },
    source: { id: 'sample', label: 'Sample', official: false },
    regions: [{ code: 'NO', name: 'Norge' }],
    points: [{ region: 'NO', period: '2020', value: 1 }],
  })

  it('accepts a well-formed series', () => {
    expect(validateIndicatorSeries(base())).toEqual([])
  })

  it('rejects a non-object', () => {
    expect(validateIndicatorSeries(null).length).toBeGreaterThan(0)
    expect(validateIndicatorSeries('nope').length).toBeGreaterThan(0)
  })

  it('requires unit.currency when unit.display is "currency"', () => {
    const bad = base()
    delete bad.unit.currency
    expect(validateIndicatorSeries(bad)).toContain(
      "unit.currency må være satt når unit.display === 'currency'",
    )
  })

  it('rejects a point whose region is not declared in regions', () => {
    const bad = base()
    bad.points.push({ region: 'ZZ', period: '2020', value: 2 })
    expect(validateIndicatorSeries(bad).some((m) => m.includes('ZZ'))).toBe(true)
  })

  it('rejects an empty regions list', () => {
    const bad = base()
    bad.regions = []
    expect(validateIndicatorSeries(bad)).toContain(
      'regions må inneholde minst én region',
    )
  })

  it('accepts null as a point value (known gap)', () => {
    const ok = base()
    ok.points.push({ region: 'NO', period: '2021', value: null })
    expect(validateIndicatorSeries(ok)).toEqual([])
  })
})
