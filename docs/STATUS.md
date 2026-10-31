# Project status

## Current state

Baseline (#1), data-kontrakt-proposal (#2), foundation-laget (#3),
frontend-migreringen (#4), World Bank-adapteren (#5) og World Bank-aktiveringen
(#8) er merget til `main`. Designgrunnlaget (`docs/DESIGN_SYSTEM.md`, #9) er også
merget.

`getIndicatorData('gdp_per_capita')` serveres av **World Bank**
(`NY.GDP.PCAP.CD`, løpende USD) gjennom den uendrede `IndicatorSeries`-kontrakten,
med pilotvindu 2015–2023 som standard.

`periodMode`-utvidelsen (#10) og første UX-sprint (#11) er merget til `main`.
BNP-siden bruker hele serien i frontend for periodevelgeren og viser data fra
Verdensbanken. Dette er en teknisk pilot, ikke en bekreftet offentlig lansering.

## Completed

- React/TypeScript/ECharts-baseline merget (#1).
- Uavhengig Claude-review av baseline: PASS etter tre blocker-fikser.
- Data-kontrakt-proposal godkjent av Codex (APPROVE) og merget (#2).
- Foundation-lag merget (#3): `src/contracts/`, `src/services/getIndicatorData`,
  `sampleSource`, med tester.
- Frontend-migrering merget (#4): App og grafkomponenter bruker kun
  `getIndicatorData()` / `IndicatorSeries`; generisk `IndicatorChart`,
  `formatValue(value, unit)`, loading/error/success-tilstander.
  Claude cross-review: APPROVE.
- World Bank-adapter merget (#5): `src/adapters/worldBank.ts` bak kontrakten,
  fixture-baserte tester + live-API-verifikasjon.
- World Bank aktivert som kilde for `gdp_per_capita` merget (#8, DEC-007):
  standard periodevindu 2015–2023, `IndicatorError`-koder bevart fra kilden.
- Designgrunnlag merget (#9): `docs/DESIGN_SYSTEM.md` — visuelt/redaksjonelt
  system, typografi, UX-arkitektur, interaktiv graf, første UX-sprint.
- `periodMode` merget (#10): kildeuavhengig `periodMode: 'default' | 'all'` i
  `getIndicatorData`, uten kontrakt- eller adapterendring.
- Første UX-sprint merget (#11): interaktiv graf med periode- og landvalg,
  datadrevne funn og tilgjengelig tabell. Siste verifisering i PR-en: 79 tester
  og produksjonsbygg bestått.

## In progress

- Ingen aktiv utviklings-PR identifisert ved statusgjennomgang 31. oktober 2026.
- Skybasert arbeidsflyt er ikke bekreftet konfigurert eller testet for prosjektet.

## Next

- Sett opp og test et Codex Cloud-miljø med dette repositoryet, inkludert en
  liten oppgave som kan kjøres mens eierens PC er avslått.
- Test deretter Claude Code i skyen og etabler en skybasert koordinator med
  GitHub som felles hukommelse. Direkte delegering mellom agentene er ikke
  bekreftet og må testes før den legges til grunn.
- Velg neste produktoppgave med Human Owner. SSB er en mulig neste datakilde;
  Eurostat, OECD, resolver og fler-kilde-`source` er senere forslag, ikke
  igangsatte oppgaver eller vedtatte kontraktendringer.
- Koordinert opprydding: `src/data/gdpPerCapita.ts` + `gdpPerCapita.test.ts`
  fjernes av datalag-eier (ikke lenger importert av produksjonskode).

## Known issues

- `src/data/gdpPerCapita.ts` finnes fortsatt som legacy-sampledata (bare importert
  av sin egen test). Fjernes i en koordinert opprydding.
- `sampleSource` er ikke lenger koblet inn i `getIndicatorData`, men beholdt i
  koden for reversibilitet.
- `worldBankSource` bruker global `fetch` ved runtime. Tester stubber `fetch`.
  En senere build-time snapshot injiserer `fetchJson` via
  `createWorldBankSource({ fetchJson })`.
- `source.fetchedAt` fra World Bank er kildens `lastupdated` (dato, ikke
  klokkeslett) — bevisst valg for determinisme.
- Lokal runtime er Node 24.19.0 LTS + pnpm 11.19.0 (via Corepack).

## Recommended model for next task

Codex for oppsett og verifisering av skybasert arbeidsflyt; modellvalg følger
gjeldende arbeidsmodell og hva som er tilgjengelig på kontoen.
