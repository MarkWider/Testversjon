import { useEffect, useState } from 'react'
import IndicatorContent, { type IndicatorContentState } from './components/IndicatorContent'
import { IndicatorError, getIndicatorData } from './services/indicators'

type IndicatorChoice = 'gdp_per_capita' | 'cpi_annual_total'

export function startIndicatorRequest(
  indicator: IndicatorChoice,
  onSuccess: (series: Awaited<ReturnType<typeof getIndicatorData>>) => void,
  onError: (error: unknown) => void,
  load: typeof getIndicatorData = getIndicatorData,
) {
  let active = true
  load(indicator, { periodMode: 'all' })
    .then((series) => { if (active) onSuccess(series) })
    .catch((error: unknown) => { if (active) onError(error) })
  return () => { active = false }
}

function IndicatorPanel({ indicator }: { indicator: IndicatorChoice }) {
  const [state, setState] = useState<IndicatorContentState>({ status: 'loading' })
  const [request, setRequest] = useState(0)

  useEffect(() => {
    setState({ status: 'loading' })
    return startIndicatorRequest(indicator,
      (series) => setState({ status: 'success', series }),
      (error) => {
        const message = error instanceof IndicatorError
          ? error.message
          : 'Vi fikk ikke hentet tallene akkurat nå. Prøv igjen om litt.'
        setState({ status: 'error', message })
      },
    )
  }, [indicator, request])

  return <IndicatorContent state={state} onRetry={() => setRequest((value) => value + 1)} />
}

export default function App() {
  const [indicator, setIndicator] = useState<IndicatorChoice>('gdp_per_capita')
  const isCpi = indicator === 'cpi_annual_total'

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#main-content" aria-label="Norge i tall, til innholdet">
          Norge i tall
        </a>
        <p>Data om Norge, forklart</p>
      </header>

      <section className={isCpi ? 'hero hero--cpi' : 'hero'} aria-labelledby="page-title">
        <p className="eyebrow">OKONOMI / INNSIKT</p>
        <h1 id="page-title">{isCpi ? 'Konsumprisindeks (KPI)' : 'BNP per innbygger'}</h1>
        <p className="intro">
          {isCpi
            ? 'Hvordan har det samlede prisnivået i Norge utviklet seg over tid? Se SSBs årlige gjennomsnitt for konsumprisindeksen.'
            : 'Hvor mye økonomisk verdi skaper Norge per innbygger, og hvordan skiller utviklingen seg fra Sverige og Danmark?'}
        </p>
        <fieldset className="indicator-choice">
          <legend>Velg indikator</legend>
          <div className="control-group">
            <button type="button" aria-pressed={!isCpi} className={!isCpi ? 'is-active' : ''} onClick={() => setIndicator('gdp_per_capita')}>BNP per innbygger</button>
            <button type="button" aria-pressed={isCpi} className={isCpi ? 'is-active' : ''} onClick={() => setIndicator('cpi_annual_total')}>Konsumprisindeks (KPI)</button>
          </div>
        </fieldset>
      </section>

      <IndicatorPanel key={indicator} indicator={indicator} />
    </main>
  )
}
