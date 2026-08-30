import { useEffect, useState } from 'react'
import IndicatorContent, { type IndicatorContentState } from './components/IndicatorContent'
import { IndicatorError, getIndicatorData } from './services/indicators'

export default function App() {
  const [state, setState] = useState<IndicatorContentState>({ status: 'loading' })
  const [request, setRequest] = useState(0)

  useEffect(() => {
    let active = true
    setState({ status: 'loading' })

    getIndicatorData('gdp_per_capita', { periodMode: 'all' })
      .then((series) => {
        if (active) setState({ status: 'success', series })
      })
      .catch((error: unknown) => {
        if (!active) return
        const message = error instanceof IndicatorError
          ? error.message
          : 'Vi fikk ikke hentet tallene akkurat nå. Prøv igjen om litt.'
        setState({ status: 'error', message })
      })

    return () => {
      active = false
    }
  }, [request])

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#main-content" aria-label="Norge i tall, til innholdet">
          Norge i tall
        </a>
        <p>Data om Norge, forklart</p>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">OKONOMI / INNSIKT</p>
        <h1 id="page-title">BNP per innbygger</h1>
        <p className="intro">
          Hvor mye økonomisk verdi skaper Norge per innbygger, og hvordan skiller
          utviklingen seg fra Sverige og Danmark?
        </p>
      </section>

      <IndicatorContent state={state} onRetry={() => setRequest((value) => value + 1)} />
    </main>
  )
}
