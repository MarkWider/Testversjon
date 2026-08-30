# Project status

## Current state

Baseline (#1), data-kontrakt-proposal (#2), foundation-laget (#3) og
frontend-migreringen (#4) er merget til `main`. `main` er nå den generelle
løsningen: frontend konsumerer `getIndicatorData()` / `IndicatorSeries` via en
generisk `IndicatorChart` med loading-, error- og success-tilstander, og
importerer ikke lenger legacy `src/data/gdpPerCapita.ts`.

World Bank-adapteren (PR #5, `claude/world-bank-adapter`) er implementert bak
kontrakten og klar for review/merge. Den er **ikke** aktivert som default source.

## Completed

- React/TypeScript/ECharts-baseline merget (#1).
- Uavhengig Claude-review av baseline: PASS etter tre blocker-fikser, verifisert
  med reell `pnpm install` / `test` / `build`.
- Data-kontrakt-proposal godkjent av Codex (APPROVE) og merget (#2,
  `docs/proposals/data-contract.md`).
- Foundation-lag merget (#3): `src/contracts/`, `src/services/getIndicatorData`,
  `sampleSource`, med tester.
- Frontend-migrering merget (#4): App og grafkomponenter bruker kun
  `getIndicatorData()` / `IndicatorSeries`; generisk `IndicatorChart`,
  `formatValue(value, unit)`, og loading/error/success-tilstander; den gamle
  `GdpChart` og den direkte importen av `src/data/gdpPerCapita.ts` er fjernet fra
  frontend. Claude cross-review: APPROVE.
- World Bank-adapter implementert bak kontrakten (`src/adapters/worldBank.ts`),
  med fixture-baserte tester og live-API-verifikasjon (PR #5). Ikke aktivert.

## In progress

- Review + merge av World Bank-adapter-PR (`claude/world-bank-adapter`, #5).

## Next

- Separat aktiverings-PR: bytt default source i `getIndicatorData` fra
  `sampleSource` til `worldBankSource` (eller config-styrt), etter at #5 er
  merget. Krever også at `getIndicatorData` slipper gjennom `IndicatorError` fra
  kilden, og en beslutning om standard periode-vindu (World Bank uten range
  henter ~1960–2023).
- Deretter neste kilde-lag: SSB (Norge), så Eurostat, så OECD, med resolver og
  fler-kilde-`source` (kontrakt-endring, eget forslag).
- Koordinert opprydding: `src/data/gdpPerCapita.ts` + `gdpPerCapita.test.ts`
  fjernes av datalag-eier (ikke lenger importert av produksjonskode).

## Known issues

- `src/data/gdpPerCapita.ts` finnes fortsatt som legacy-sampledata, men importeres
  ikke lenger av frontend — bare av sin egen test. Fjernes i en koordinert
  opprydding.
- Før World Bank kan aktiveres: `getIndicatorData` må slippe gjennom
  `IndicatorError` fra kilden i stedet for å pakke alt som `source_unavailable`
  (bare catch-blokk i `src/services/indicators.ts`).
- `worldBankSource` bruker global `fetch` ved runtime. Ved en senere build-time
  snapshot injiseres `fetchJson` via `createWorldBankSource({ fetchJson })`.
- `source.fetchedAt` fra World Bank er kildens `lastupdated` (dato, ikke
  klokkeslett) — bevisst valg for determinisme i en snapshot-pipeline.
- Lokal runtime er Node 24.19.0 LTS + pnpm 11.19.0 (via Corepack).

## Recommended model for next task

Claude Sonnet 5, HIGH for aktiverings-PR og deretter SSB-adapter / resolver.
