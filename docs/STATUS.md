# Project status

## Current state

Baseline (#1), data-kontrakt-proposal (#2), foundation-laget (#3),
frontend-migreringen (#4) og World Bank-adapteren (#5) er merget til `main`.

`getIndicatorData('gdp_per_capita')` serveres nå av **World Bank**
(`NY.GDP.PCAP.CD`, løpende USD) gjennom den uendrede `IndicatorSeries`-kontrakten.
Aktiveringen ligger som egen PR (`claude/world-bank-activation`).

## Completed

- React/TypeScript/ECharts-baseline merget (#1).
- Uavhengig Claude-review av baseline: PASS etter tre blocker-fikser.
- Data-kontrakt-proposal godkjent av Codex (APPROVE) og merget (#2).
- Foundation-lag merget (#3): `src/contracts/`, `src/services/getIndicatorData`,
  `sampleSource`, med tester.
- Frontend-migrering merget (#4): App og grafkomponenter bruker kun
  `getIndicatorData()` / `IndicatorSeries`; generisk `IndicatorChart`,
  `formatValue(value, unit)`, loading/error/success-tilstander; gammel `GdpChart`
  og direkte `src/data/gdpPerCapita.ts`-import fjernet fra frontend.
  Claude cross-review: APPROVE.
- World Bank-adapter merget (#5): `src/adapters/worldBank.ts` bak kontrakten,
  fixture-baserte tester + live-API-verifikasjon.
- World Bank aktivert som kilde for `gdp_per_capita` (denne PR-en, DEC-007):
  standard periodevindu 2015–2023, `IndicatorError`-koder bevart fra kilden.

## In progress

- Review + merge av aktiverings-PR (`claude/world-bank-activation`).

## Next

- Neste kilde-lag: SSB (Norge), så Eurostat, så OECD, med resolver og
  fler-kilde-`source` (kontrakt-endring, eget forslag).
- Koordinert opprydding: `src/data/gdpPerCapita.ts` + `gdpPerCapita.test.ts`
  fjernes av datalag-eier (ikke lenger importert av produksjonskode).
  `sampleSource` beholdes så lenge den er nyttig for test/reversibilitet.

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

Claude Sonnet 5, HIGH for SSB-adapter, resolver og fler-kilde-normalisering.
