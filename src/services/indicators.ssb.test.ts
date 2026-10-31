import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { validateIndicatorSeries } from '../contracts/validate'
import { IndicatorError, getIndicatorData } from './indicators'
import ssbFixture from '../adapters/__fixtures__/ssb.cpiAnnualTotal.json'
import wbFixture from '../adapters/__fixtures__/worldBank.gdpPerCapita.json'

// Service-level behaviour for the SSB-served indicator `cpi_annual_total`
// (DEC-010): routing, period windows and that the World Bank route is unchanged.
// `fetch` is stubbed per host; no test touches the network.

const ID = 'cpi_annual_total'

function response(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: () => Promise.resolve(body) } as unknown as Response
}

let calls: string[]
let ssbReply: () => Promise<Response>

beforeEach(() => {
  calls = []
  ssbReply = () => Promise.resolve(response(ssbFixture))
  vi.stubGlobal(
    'fetch',
    vi.fn((input: string | URL | Request) => {
      const url = String(input)
      calls.push(url)
      if (url.startsWith('https://data.ssb.no/')) return ssbReply()
      if (url.startsWith('https://api.worldbank.org/')) return Promise.resolve(response(wbFixture))
      return Promise.reject(new Error(`unexpected host: ${url}`))
    }),
  )
})
afterEach(() => vi.unstubAllGlobals())

const periods = (s: { points: { period: string }[] }) => s.points.map((p) => p.period)

describe('getIndicatorData("cpi_annual_total") — SSB source', () => {
  it('resolves to a contract-valid series served by SSB, not the World Bank', async () => {
    const series = await getIndicatorData(ID)
    expect(validateIndicatorSeries(series)).toEqual([])
    expect(series.source.id).toBe('ssb')
    expect(series.source.official).toBe(true)
    expect(calls).toHaveLength(1)
    expect(calls[0]).toContain('data.ssb.no/api/pxwebapi/v2/tables/14701/data')
  })

  it('does NOT inherit the BNP pilot window: default returns the full 2000–2025 series', async () => {
    const series = await getIndicatorData(ID)
    expect(periods(series)[0]).toBe('2000')
    expect(periods(series)[series.points.length - 1]).toBe('2025')
    expect(series.points).toHaveLength(26)
  })

  it('treats periodMode "default" and "all" identically for SSB (full series)', async () => {
    const def = await getIndicatorData(ID, { periodMode: 'default' })
    const all = await getIndicatorData(ID, { periodMode: 'all' })
    expect(periods(def)).toEqual(periods(all))
    expect(def.points).toHaveLength(26)
  })

  it('honours explicit from/to, and one-sided bounds are not filled from any default', async () => {
    const ranged = await getIndicatorData(ID, { from: '2018', to: '2020' })
    expect(periods(ranged)).toEqual(['2018', '2019', '2020'])
    const fromOnly = await getIndicatorData(ID, { from: '2023' })
    expect(periods(fromOnly)).toEqual(['2023', '2024', '2025'])
    const toOnlyAll = await getIndicatorData(ID, { to: '2002', periodMode: 'all' })
    expect(periods(toOnlyAll)).toEqual(['2000', '2001', '2002'])
  })

  it('never sends periodMode (or any period bound) to the source', async () => {
    await getIndicatorData(ID, { periodMode: 'all', from: '2010' })
    const url = new URL(calls[0])
    expect(url.searchParams.get('periodMode')).toBeNull()
    expect(url.searchParams.get('valuecodes[Tid]')).toBe('*')
  })

  it('returns points sorted by period', async () => {
    const series = await getIndicatorData(ID)
    expect(periods(series)).toEqual([...periods(series)].sort())
  })

  it('keeps SSB values as index levels (2000 = 54.8, 2025 = 100)', async () => {
    const series = await getIndicatorData(ID)
    expect(series.points[0].value).toBe(54.8)
    expect(series.points[25].value).toBe(100)
    expect(series.unit.display).toBe('number')
  })

  it('maps an SSB HTTP failure to source_unavailable, naming the source', async () => {
    ssbReply = () => Promise.resolve(response({}, false, 503))
    await expect(getIndicatorData(ID)).rejects.toMatchObject({
      code: 'source_unavailable',
    })
  })

  it('maps a network failure to source_unavailable', async () => {
    ssbReply = () => Promise.reject(new TypeError('Failed to fetch'))
    const err = await getIndicatorData(ID).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(IndicatorError)
    expect((err as IndicatorError).code).toBe('source_unavailable')
  })

  it('maps a malformed SSB body to invalid, with no silent fallback', async () => {
    ssbReply = () => Promise.resolve(response({ class: 'dataset', id: [] }))
    await expect(getIndicatorData(ID)).rejects.toMatchObject({ code: 'invalid' })
    expect(calls).toHaveLength(1)
  })
})

describe('World Bank route is unchanged by the SSB route', () => {
  it('gdp_per_capita still defaults to the 2015–2023 pilot window and calls the World Bank only', async () => {
    const series = await getIndicatorData('gdp_per_capita')
    expect(series.source.id).toBe('worldbank')
    expect(calls.every((u) => u.startsWith('https://api.worldbank.org/'))).toBe(true)
    expect(calls[0]).toContain('date=2015%3A2023')
  })

  it('gdp_per_capita with periodMode "all" still adds no date bounds', async () => {
    await getIndicatorData('gdp_per_capita', { periodMode: 'all' })
    expect(calls[0]).not.toContain('date=')
  })

  it('an unknown indicator is still not_found and never reaches SSB', async () => {
    await expect(getIndicatorData('nope')).rejects.toMatchObject({ code: 'not_found' })
    expect(calls.some((u) => u.includes('data.ssb.no'))).toBe(false)
  })
})
