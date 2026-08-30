import { useEffect, useState } from 'react'
import IndicatorContent, { type IndicatorContentState } from './components/IndicatorContent'
import { IndicatorError, getIndicatorData } from './services/indicators'

export default function App() {
  const [state, setState] = useState<IndicatorContentState>({ status: 'loading' })

  useEffect(() => {
    let active = true

    getIndicatorData('gdp_per_capita')
      .then((series) => {
        if (active) setState({ status: 'success', series })
      })
      .catch((error: unknown) => {
        if (!active) return
        const message = error instanceof IndicatorError
          ? error.message
          : 'Prøv igjen senere.'
        setState({ status: 'error', message })
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <main>
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">AGENT PILOT / 01</p>
        <h1 id="page-title">Norge i tall</h1>
        <p className="tagline">Forstå Norges utvikling gjennom data</p>
        <p className="intro">
          En liten teknisk pilot for å gjøre samfunnsutvikling lettere å se. Her sammenligner vi BNP per innbygger i Norge, Sverige og Danmark over tid.
        </p>
      </section>

      <IndicatorContent state={state} />
    </main>
  )
}
