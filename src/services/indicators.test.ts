import { describe, expect, it } from 'vitest'
import type { IndicatorSeries } from '../contracts/indicator'
import { validateIndicatorSeries } from '../contracts/validate'
import { IndicatorError, getIndicatorData } from './indicators'

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

describe('getIndicatorData("gdp_per_capita")', () => {
  it('resolves to a contract-valid IndicatorSeries', async () => {
    const series = await getIndicatorData('gdp_per_capita')
    expect(validateIndicatorSeries(series)).toEqual([])
  })

  it('returns the requested indicator', async () => {
    const series = await getIndicatorData('gdp_per_capita')
    expect(series.indicator).toBe('gdp_per_capita')
    expect(series.title).toBe('BNP per innbygger')
    expect(series.subtitle).toBe('Løpende priser')
  })

  it('exposes the three regions with codes and names, in display order', async () => {
    const series = await getIndicatorData('gdp_per_capita')
    expect(series.regions.map((r) => r.code)).toEqual(['NO', 'SE', 'DK'])
    expect(series.regions.map((r) => r.name)).toEqual([
      'Norge',
      'Sverige',
      'Danmark',
    ])
  })

  it('covers the periods 2015..2023 for every region', async () => {
    const series = await getIndicatorData('gdp_per_capita')
    const periods = [...new Set(series.points.map((p) => p.period))].sort()
    expect(periods).toEqual([
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

  it('returns points sorted by period ascending, then region order', async () => {
    const series = await getIndicatorData('gdp_per_capita')
    expect(periodsInOrder(series)).toBe(true)
    // first three points are the earliest period, in regions order
    expect(series.points.slice(0, 3)).toEqual([
      { region: 'NO', period: '2015', value: 74400 },
      { region: 'SE', period: '2015', value: 51600 },
      { region: 'DK', period: '2015', value: 53100 },
    ])
  })

  it('carries the expected values', async () => {
    const series = await getIndicatorData('gdp_per_capita')
    const at = (region: string, period: string) =>
      series.points.find((p) => p.region === region && p.period === period)?.value
    expect(at('NO', '2015')).toBe(74400)
    expect(at('NO', '2022')).toBe(106300)
    expect(at('SE', '2020')).toBe(52300)
    expect(at('DK', '2023')).toBe(68200)
    expect(series.points.every((p) => typeof p.value === 'number')).toBe(true)
  })

  it('describes its unit and marks the source as unofficial sample data', async () => {
    const series = await getIndicatorData('gdp_per_capita')
    expect(series.unit).toEqual({
      code: 'USD',
      display: 'currency',
      currency: 'USD',
      decimals: 0,
    })
    expect(series.source).toEqual({
      id: 'sample',
      label: 'Lokalt eksempeldata',
      official: false,
    })
  })

  it('returns an independent copy on each call', async () => {
    const a = await getIndicatorData('gdp_per_capita')
    a.points[0].value = -1
    a.regions.pop()
    const b = await getIndicatorData('gdp_per_capita')
    expect(b.points[0].value).toBe(74400)
    expect(b.regions).toHaveLength(3)
  })
})

describe('getIndicatorData options', () => {
  it('filters to the requested regions', async () => {
    const series = await getIndicatorData('gdp_per_capita', { regions: ['NO'] })
    expect(series.regions.map((r) => r.code)).toEqual(['NO'])
    expect(series.points).toHaveLength(9)
    expect(series.points.every((p) => p.region === 'NO')).toBe(true)
  })

  it('keeps region display order and stays sorted with a multi-region filter', async () => {
    const series = await getIndicatorData('gdp_per_capita', {
      regions: ['DK', 'NO'],
    })
    expect(series.regions.map((r) => r.code)).toEqual(['NO', 'DK'])
    expect(series.points).toHaveLength(18)
    expect(periodsInOrder(series)).toBe(true)
  })

  it('ignores unknown region codes', async () => {
    const series = await getIndicatorData('gdp_per_capita', {
      regions: ['XX', 'NO'],
    })
    expect(series.regions.map((r) => r.code)).toEqual(['NO'])
  })

  it('clamps to an inclusive period range', async () => {
    const series = await getIndicatorData('gdp_per_capita', {
      from: '2020',
      to: '2022',
    })
    const periods = [...new Set(series.points.map((p) => p.period))].sort()
    expect(periods).toEqual(['2020', '2021', '2022'])
    expect(series.points).toHaveLength(3 * 3)
  })
})

describe('getIndicatorData errors', () => {
  it('rejects unknown indicators with IndicatorError { code: "not_found" }', async () => {
    await expect(getIndicatorData('does_not_exist')).rejects.toBeInstanceOf(
      IndicatorError,
    )
    await expect(getIndicatorData('does_not_exist')).rejects.toMatchObject({
      code: 'not_found',
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
    expect(
      validateIndicatorSeries(bad).some((m) => m.includes('ZZ')),
    ).toBe(true)
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
