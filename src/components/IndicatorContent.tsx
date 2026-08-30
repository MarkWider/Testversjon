import type { IndicatorSeries } from '../contracts/indicator'
import IndicatorChart from '../charts/IndicatorChart'
import { formatValue } from '../charts/formatValue'

export type IndicatorContentState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; series: IndicatorSeries }

function latestValues(series: IndicatorSeries) {
  const periods = [...new Set(series.points.map((point) => point.period))]
  const latestPeriod = periods.at(-1)
  const values = series.points
    .filter((point) => point.period === latestPeriod && point.value !== null)
    .map((point) => ({ ...point, name: series.regions.find((region) => region.code === point.region)?.name ?? point.region }))
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

  return { latestPeriod, values }
}

function Findings({ series }: { series: IndicatorSeries }) {
  const { latestPeriod, values } = latestValues(series)
  const highest = values[0]
  const lowest = values.at(-1)

  return (
    <section className="findings" aria-labelledby="findings-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">LESNING</p>
          <h2 id="findings-title">Noen enkle funn</h2>
        </div>
      </div>
      <div className="finding-grid">
        <article>
          <span>01</span>
          <p>{latestPeriod ? `Serien dekker perioden frem til ${latestPeriod}.` : 'Serien har ingen observerte perioder.'}</p>
        </article>
        <article>
          <span>02</span>
          <p>{highest ? `${highest.name} har høyest verdi i siste periode: ${formatValue(highest.value, series.unit)}.` : 'Ingen verdier er tilgjengelige i siste periode.'}</p>
        </article>
        <article>
          <span>03</span>
          <p>{lowest && highest && lowest.region !== highest.region ? `Spennet i siste periode går fra ${formatValue(lowest.value, series.unit)} til ${formatValue(highest.value, series.unit)}.` : 'Sammenligning blir tilgjengelig når flere regioner har data.'}</p>
        </article>
      </div>
    </section>
  )
}

export default function IndicatorContent({ state }: { state: IndicatorContentState }) {
  if (state.status === 'loading') {
    return <section className="data-state" aria-live="polite"><p className="eyebrow">DATA</p><h2>Laster indikator</h2><p>Vi henter den siste tilgjengelige serien.</p></section>
  }

  if (state.status === 'error') {
    return <section className="data-state data-state--error" role="alert"><p className="eyebrow">DATA</p><h2>Data kunne ikke lastes</h2><p>{state.message}</p></section>
  }

  const { series } = state
  const sourceLabel = series.source.official ? series.source.label : `${series.source.label} - ikke offisielle tall`

  return (
    <>
      <section className="visual-section" aria-labelledby="chart-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">OVERSIKT</p>
            <h2 id="chart-title">{series.title}</h2>
          </div>
          <p className="unit">{series.unit.code}{series.subtitle ? `, ${series.subtitle}` : ''}</p>
        </div>
        <IndicatorChart series={series} />
        <p className="data-notice">Kilde: {sourceLabel}</p>
      </section>
      <Findings series={series} />
      <footer>
        <p><strong>Kilde:</strong> {sourceLabel}</p>
        <p>Visualiseringen bruker en standardisert indikatorserie og kan beholde samme grensesnitt når datakilden byttes.</p>
      </footer>
    </>
  )
}
