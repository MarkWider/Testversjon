import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { IndicatorSeries } from '../contracts/indicator'
import IndicatorContent, { filterSeries, selectRecentPeriods } from './IndicatorContent'

const series: IndicatorSeries = {
  indicator: 'gdp_per_capita',
  title: 'BNP per innbygger',
  unit: { code: 'USD', display: 'currency', currency: 'USD' },
  source: { id: 'worldbank', label: 'Verdensbanken', official: true, fetchedAt: '2026-07-13' },
  regions: [{ code: 'NO', name: 'Norge' }, { code: 'SE', name: 'Sverige' }, { code: 'DK', name: 'Danmark' }],
  points: Array.from({ length: 30 }, (_, index) => {
    const year = String(1995 + Math.floor(index / 3))
    const region = ['NO', 'SE', 'DK'][index % 3]
    return { period: year, region, value: 50000 + index }
  }),
}

describe('period selection', () => {
  it('uses the last 10 or 25 observed periods without calendar-year knowledge', () => {
    expect(selectRecentPeriods(series.points, 10)).toEqual(['1995', '1996', '1997', '1998', '1999', '2000', '2001', '2002', '2003', '2004'])
    expect(selectRecentPeriods(series.points, 25)).toHaveLength(10)
    expect(selectRecentPeriods(series.points, 'all')).toHaveLength(10)
  })

  it('filters periods and comparison countries while keeping Norway visible', () => {
    const filtered = filterSeries(series, 10, new Set(['NO', 'DK']))
    expect(filtered.regions.map((region) => region.code)).toEqual(['NO', 'DK'])
    expect(filtered.points.every((point) => point.region === 'NO' || point.region === 'DK')).toBe(true)
    expect(new Set(filtered.points.map((point) => point.period))).toHaveLength(10)
  })
})

describe('IndicatorContent', () => {
  it('renders a loading state with reserved graph content', () => {
    const markup = renderToStaticMarkup(<IndicatorContent onRetry={() => undefined} state={{ status: 'loading' }} />)
    expect(markup).toContain('Laster grafen')
    expect(markup).toContain('data-state')
  })

  it('renders an accessible error state and retry action', () => {
    const markup = renderToStaticMarkup(<IndicatorContent onRetry={() => undefined} state={{ status: 'error', message: 'Kilden er utilgjengelig.' }} />)
    expect(markup).toContain('role="alert"')
    expect(markup).toContain('Prøv igjen')
  })

  it('renders controls, source metadata and a keyboard-accessible data alternative', () => {
    const markup = renderToStaticMarkup(<IndicatorContent onRetry={() => undefined} state={{ status: 'success', series }} />)
    expect(markup).toContain('aria-pressed="true"')
    expect(markup).toContain('Hele perioden')
    expect(markup).toContain('Verdensbanken')
    expect(markup).toContain('Se verdier i tabell')
    expect(markup).toContain('Om tallene')
  })
})
