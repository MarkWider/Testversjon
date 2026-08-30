import { useEffect, useState } from 'react'
import type { IndicatorSeries, RegionCode } from '../contracts/indicator'
import IndicatorChart from '../charts/IndicatorChart'
import { formatValue } from '../charts/formatValue'

export type IndicatorContentState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; series: IndicatorSeries }

export type PeriodSelection = 10 | 25 | 'all'

const periodLabels: Array<{ value: PeriodSelection; label: string }> = [
  { value: 10, label: '10 år' },
  { value: 25, label: '25 år' },
  { value: 'all', label: 'Hele perioden' },
]

export function selectRecentPeriods(points: IndicatorSeries['points'], selection: PeriodSelection) {
  const periods = [...new Set(points.map((point) => point.period))].sort()
  return selection === 'all' ? periods : periods.slice(-selection)
}

export function filterSeries(
  series: IndicatorSeries,
  selection: PeriodSelection,
  visibleCodes: ReadonlySet<RegionCode>,
): IndicatorSeries {
  const periods = new Set(selectRecentPeriods(series.points, selection))
  return {
    ...series,
    regions: series.regions.filter((region) => visibleCodes.has(region.code)),
    points: series.points.filter(
      (point) => periods.has(point.period) && visibleCodes.has(point.region),
    ),
  }
}

function latestValues(series: IndicatorSeries) {
  const latestPeriod = selectRecentPeriods(series.points, 'all').at(-1)
  const values = series.points
    .filter((point) => point.period === latestPeriod && point.value !== null)
    .map((point) => ({
      ...point,
      name: series.regions.find((region) => region.code === point.region)?.name ?? point.region,
    }))
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

  return { latestPeriod, values }
}

function Findings({ series, periodSelection }: { series: IndicatorSeries; periodSelection: PeriodSelection }) {
  const { latestPeriod, values } = latestValues(series)
  const highest = values[0]
  const lowest = values.at(-1)
  const rangeLabel = periodSelection === 'all' ? 'hele tilgjengelige perioden' : `de siste ${periodSelection} observerte årene`

  return (
    <section className="reading" aria-labelledby="findings-title">
      <p className="eyebrow">HVA VISER DETTE?</p>
      <h2 id="findings-title">Norge ligger høyest i utvalget</h2>
      <p className="reading-lead">
        I {rangeLabel} har Norge gjennomgående hatt høyere BNP per innbygger enn
        sammenligningslandene som vises her.
      </p>
      <div className="reading-notes">
        <p>
          {highest && latestPeriod
            ? `I ${latestPeriod} ligger ${highest.name} høyest, på ${formatValue(highest.value, series.unit)}.`
            : 'Det finnes ingen observerte verdier i den valgte visningen.'}
        </p>
        <p>
          {lowest && highest && lowest.region !== highest.region
            ? `Spennet mellom landene i siste observerte år er ${formatValue(lowest.value, series.unit)} til ${formatValue(highest.value, series.unit)}.`
            : 'Legg til et sammenligningsland for å se forskjellen i siste observerte år.'}
        </p>
        <p>
          Tallene er i løpende amerikanske dollar. Valutakurser og petroleumsinntekter
          kan gi store utslag, så grafen er ikke et direkte mål på produktivitet eller kjøpekraft.
        </p>
      </div>
    </section>
  )
}

function DataTable({ series }: { series: IndicatorSeries }) {
  const periods = selectRecentPeriods(series.points, 'all')
  const pointByKey = new Map(series.points.map((point) => [`${point.period}:${point.region}`, point.value]))

  return (
    <details className="data-details">
      <summary>Se verdier i tabell</summary>
      <p id="chart-data-description">
        Tabellen inneholder de eksakte verdiene som vises i grafen for valgt periode og land.
      </p>
      <div className="table-scroll">
        <table>
          <caption>BNP per innbygger, {series.unit.code}</caption>
          <thead>
            <tr>
              <th scope="col">År</th>
              {series.regions.map((region) => <th key={region.code} scope="col">{region.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => (
              <tr key={period}>
                <th scope="row">{period}</th>
                {series.regions.map((region) => (
                  <td key={region.code}>{formatValue(pointByKey.get(`${period}:${region.code}`) ?? null, series.unit)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}

function AboutData({ series }: { series: IndicatorSeries }) {
  return (
    <details className="about-data">
      <summary>Om tallene</summary>
      <div>
        <p><strong>Definisjon:</strong> BNP per innbygger i løpende amerikanske dollar.</p>
        <p><strong>Kilde:</strong> {series.source.label}{series.source.fetchedAt ? `, sist oppdatert ${series.source.fetchedAt}` : ''}.</p>
        <p><strong>Forbehold:</strong> Valutakurser og petroleumsinntekter påvirker sammenligningen. Indikatoren kan ikke alene si noe sikkert om produktivitet eller kjøpekraft.</p>
      </div>
    </details>
  )
}

function SuccessContent({ series }: { series: IndicatorSeries }) {
  const [periodSelection, setPeriodSelection] = useState<PeriodSelection>(25)
  const [visibleCodes, setVisibleCodes] = useState<Set<RegionCode>>(
    () => new Set(series.regions.map((region) => region.code)),
  )
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  const visibleSeries = filterSeries(series, periodSelection, visibleCodes)
  const latestPeriod = selectRecentPeriods(visibleSeries.points, 'all').at(-1)

  const toggleRegion = (code: RegionCode) => {
    if (code === 'NO') return
    setVisibleCodes((current) => {
      const next = new Set(current)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  return (
    <>
      <section id="main-content" className="visual-section" aria-labelledby="chart-title">
        <div className="chart-intro">
          <div>
            <p className="eyebrow">OVERSIKT</p>
            <h2 id="chart-title">{series.title}</h2>
          </div>
          <p className="unit">{series.unit.code}{series.subtitle ? ` / ${series.subtitle}` : ''}</p>
        </div>

        <div className="chart-controls" aria-label="Grafvalg">
          <fieldset>
            <legend>Periode</legend>
            <div className="control-group">
              {periodLabels.map((period) => (
                <button aria-pressed={periodSelection === period.value} className={periodSelection === period.value ? 'is-active' : ''} key={String(period.value)} onClick={() => setPeriodSelection(period.value)} type="button">
                  {period.label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Sammenlign med</legend>
            <div className="control-group">
              {series.regions.filter((region) => region.code !== 'NO').map((region) => (
                <button aria-pressed={visibleCodes.has(region.code)} className={visibleCodes.has(region.code) ? 'is-active' : ''} key={region.code} onClick={() => toggleRegion(region.code)} type="button">
                  {visibleCodes.has(region.code) ? 'Viser ' : 'Vis '}{region.name}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <IndicatorChart reducedMotion={reducedMotion} series={visibleSeries} latestPeriod={latestPeriod} descriptionId="chart-data-description" />
        <p className="data-notice">Kilde: {series.source.label}</p>
        <DataTable series={visibleSeries} />
      </section>
      <Findings series={visibleSeries} periodSelection={periodSelection} />
      <AboutData series={series} />
    </>
  )
}

export default function IndicatorContent({ state, onRetry }: { state: IndicatorContentState; onRetry: () => void }) {
  if (state.status === 'loading') {
    return <section id="main-content" className="data-state" aria-live="polite"><p className="eyebrow">DATA</p><h2>Laster grafen</h2><p>Vi henter den tilgjengelige tidsserien.</p></section>
  }

  if (state.status === 'error') {
    return <section id="main-content" className="data-state data-state--error" role="alert"><p className="eyebrow">DATA</p><h2>Data kunne ikke lastes</h2><p>{state.message}</p><button className="retry-button" onClick={onRetry} type="button">Prøv igjen</button></section>
  }

  return <SuccessContent series={state.series} />
}
