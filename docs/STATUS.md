# Project status

## Current state

Baseline (#1), data-kontrakt-proposal (#2), foundation-laget (#3),
frontend-migreringen (#4), World Bank-adapteren (#5) og World Bank-aktiveringen
(#8) er merget til `main`. Designgrunnlaget (`docs/DESIGN_SYSTEM.md`, #9) er også
merget.

`getIndicatorData('gdp_per_capita')` serveres av **World Bank**
(`NY.GDP.PCAP.CD`, løpende USD) gjennom den uendrede `IndicatorSeries`-kontrakten,
med pilotvindu 2015–2023 som standard.

`periodMode`-utvidelsen er merget (#10). Første UX-sprint er nå under utvikling
på `codex/gdp-ux-sprint` og bruker hele serien i frontend for periodevelgeren.

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

## In progress

- Første UX-sprint (PR #11, `codex/gdp-ux-sprint`): BNP-siden omarbeides med
  datadrevet periodevelger, landvalg og tilgjengelig dataalternativ.

## Next

- Deretter neste kilde-lag: SSB (Norge), så Eurostat, så OECD, med resolver og
  fler-kilde-`source` (kontrakt-endring, eget forslag).
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

Codex GPT-5.6 Terra HIGH for første UX-sprint; Claude Sonnet 5 HIGH for neste
kilde-lag (SSB) og resolver.
