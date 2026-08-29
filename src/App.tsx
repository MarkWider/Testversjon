import GdpChart from './components/GdpChart'
import { formatUsd, gdpPerCapitaSample } from './data/gdpPerCapita'

const latest = gdpPerCapitaSample.at(-1)!

export default function App() {
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

      <section className="visual-section" aria-labelledby="chart-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">OVERSIKT</p>
            <h2 id="chart-title">BNP per innbygger</h2>
          </div>
          <p className="unit">USD, løpende priser</p>
        </div>
        <GdpChart />
        <p className="data-notice">Eksempeldata for denne tekniske piloten. Tallene er ikke offisielle statistiske data.</p>
      </section>

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
            <p>Norge ligger høyest i hele perioden og hadde den sterkeste oppgangen i 2021-2022.</p>
          </article>
          <article>
            <span>02</span>
            <p>Danmark henter inn Sverige etter 2020 og ligger høyere i de siste observasjonene.</p>
          </article>
          <article>
            <span>03</span>
            <p>I 2023 er avstanden mellom Norge og de to nabolandene fortsatt stor: {formatUsd(latest.Norge)} mot rundt {formatUsd(latest.Danmark)}.</p>
          </article>
        </div>
      </section>

      <footer>
        <p><strong>Kilde:</strong> Lokalt eksempeldata, kun for Agent Pilot.</p>
        <p>Neste steg er en utskiftbar datakildeadapter for offisiell statistikk fra for eksempel SSB, OECD eller Verdensbanken.</p>
      </footer>
    </main>
  )
}
