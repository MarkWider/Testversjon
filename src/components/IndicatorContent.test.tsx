import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { IndicatorSeries } from '../contracts/indicator'
import IndicatorContent, { buildFindings, filterSeries, getLatestObservedPeriod, selectRecentPeriods } from './IndicatorContent'

function createSeries(): IndicatorSeries {
  const periods = Array.from({ length: 30 }, (_, index) => String(1995 + index))
  return {
  indicator: 'gdp_per_capita',
  title: 'BNP per innbygger',
  unit: { code: 'USD', display: 'currency', currency: 'USD' },
  source: { id: 'worldbank', label: 'Verdensbanken', official: true, fetchedAt: '2026-07-13' },
  regions: [{ code: 'NO', name: 'Norge' }, { code: 'SE', name: 'Sverige' }, { code: 'DK', name: 'Danmark' }],
   points: [
     ...periods.flatMap((period, index) => [
       { period, region: 'NO', value: index < 15 ? 60_000 + index : 90_000 + index },
       { period, region: 'SE', value: index < 15 ? 80_000 + index : 70_000 + index },
       { period, region: 'DK', value: 50_000 + index },
     ]),
     // The source can append a not-yet-observed year. It must not become the latest chart marker or finding.
     { period: '2025', region: 'NO', value: null },
     { period: '2025', region: 'SE', value: null },
     { period: '2025', region: 'DK', value: null },
   ],
  }
}

const series = createSeries()

describe('period selection', () => {
  it('uses the last 10 or 25 observed periods without calendar-year knowledge', () => {
    expect(selectRecentPeriods(series.points, 10)).toEqual(Array.from({ length: 10 }, (_, index) => String(2015 + index)))
    expect(selectRecentPeriods(series.points, 25)).toEqual(Array.from({ length: 25 }, (_, index) => String(2000 + index)))
    expect(selectRecentPeriods(series.points, 'all')).toEqual(Array.from({ length: 30 }, (_, index) => String(1995 + index)))
  })

  it('filters periods and comparison countries while keeping Norway visible', () => {
    const filtered = filterSeries(series, 10, new Set(['NO', 'DK']))
    expect(filtered.regions.map((region) => region.code)).toEqual(['NO', 'DK'])
    expect(filtered.points.every((point) => point.region === 'NO' || point.region === 'DK')).toBe(true)
    expect(new Set(filtered.points.map((point) => point.period))).toHaveLength(10)
    expect(new Set(filtered.points.map((point) => point.period))).toEqual(new Set(Array.from({ length: 10 }, (_, index) => String(2015 + index))))
  })

  it('does not count data from hidden countries as an active observed period', () => {
    const withDenmarkOnlyInTail = createSeries()
    withDenmarkOnlyInTail.points = withDenmarkOnlyInTail.points.map((point) => point.period === '2025' && point.region === 'DK'
      ? { ...point, value: 55_000 }
      : point)

    const filtered = filterSeries(withDenmarkOnlyInTail, 10, new Set(['NO', 'SE']))
    expect(new Set(filtered.points.map((point) => point.period))).toEqual(new Set(Array.from({ length: 10 }, (_, index) => String(2015 + index))))
    expect(filtered.points.some((point) => point.period === '2025')).toBe(false)
  })

  it('uses the last valid observed period when a trailing period has only null values', () => {
    expect(getLatestObservedPeriod(series)).toBe('2024')
  })
})

describe('data-derived findings', () => {
  it('does not make a comparison claim when only Norway is visible', () => {
    const norwayOnly = filterSeries(series, 'all', new Set(['NO']))
    const findings = buildFindings(norwayOnly, 'all')

    expect(findings.heading).toBe('Norges utvikling i perioden')
    expect(findings.lead).not.toContain('høyest')
  })

  it('separates the latest leader from a historical lead that changes', () => {
    const findings = buildFindings(series, 'all')

    expect(findings.heading).toBe('Norge ligger høyest i siste observerte år')
    expect(findings.lead).toContain('har ikke gjort det i hele tilgjengelige perioden')
    expect(findings.latest).toContain('2024')
  })

  it('names another country when it has the latest observed lead', () => {
    const swedenLeads = createSeries()
    swedenLeads.points = swedenLeads.points.map((point) => point.period === '2024' && point.region === 'SE'
      ? { ...point, value: 100_000 }
      : point)

    expect(buildFindings(swedenLeads, 'all').heading).toBe('Sverige ligger høyest i siste observerte år')
  })

  it('uses a through-period claim only when one country has the unique lead in every comparable period', () => {
    const norwayLeads = createSeries()
    norwayLeads.points = norwayLeads.points.map((point) => point.value === null
      ? point
      : point.region === 'NO' ? { ...point, value: 100_000 } : point)

    expect(buildFindings(norwayLeads, 'all').heading).toBe('Norge ligger gjennomgående høyest')
  })

  it('does not treat a period with one valid country as proof of a consistent lead', () => {
    const insufficientComparison: IndicatorSeries = {
      ...createSeries(),
      points: [
        { period: '2024', region: 'NO', value: 100_000 },
        { period: '2024', region: 'SE', value: null },
        { period: '2024', region: 'DK', value: null },
      ],
    }

    expect(buildFindings(insufficientComparison, 'all').heading).toBe('Norge ligger høyest i siste observerte år')
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
    expect(markup).toContain('id="chart-data-description"')
    expect(markup.indexOf('id="chart-data-description"')).toBeLessThan(markup.indexOf('<details class="data-details"'))
  })
})
