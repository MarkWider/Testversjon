# Project status

## Current state

Foundation-laget er merget til `main`. Frontend-migreringen til den offentlige
kontrakten er implementert på `codex/indicator-frontend` og klar for PR-review.

## Completed

- Repository koblet til GitHub; `main` er godkjent hovedgren og default branch.
- React/TypeScript/ECharts-baseline merget (PR #1).
- Uavhengig Claude-review av baseline: PASS etter tre blocker-fikser, verifisert
  med reell `pnpm install` / `test` / `build`.
- Data-kontrakt-proposal godkjent av Codex (APPROVE, ingen blocking changes) og
  merget (PR #2, `docs/proposals/data-contract.md`).
- Foundation-lag implementert: `src/contracts/indicator.ts`,
  `src/contracts/validate.ts`, `src/services/indicators.ts`,
  `src/data/sampleSource.ts`, `src/data/sample/gdpPerCapita.ts`, med tester.
- Frontend bruker nå kun `getIndicatorData()` og `IndicatorSeries`; den direkte
  importen av `src/data/gdpPerCapita.ts` er fjernet fra App og grafkomponenter.

## In progress

- Review og merge av frontend-PR (`codex/indicator-frontend`).

## Next

- Etter at foundation er merget: forste ekte datakilde-adapter (SSB) i
  `src/adapters/`, bak samme kontrakt.

## Known issues

- `src/data/gdpPerCapita.ts` finnes fortsatt som legacy-sampledata. Den blir ikke
  lenger importert av frontend og kan slettes av datalag-eier i en koordinert
  opprydding.
- `IndicatorError`-kodene `source_unavailable` og `invalid` er definert for
  framtidige adaptere; sample-kilden utloser dem ikke, saa de er kun daekket av
  enhetstest av validatoren, ikke ende-til-ende.
- Lokal runtime er na Node 24.19.0 LTS + pnpm 11.19.0 (via Corepack) paa
  utviklingsmaskinen.

## Recommended model for next task

Claude Sonnet 5, HIGH for SSB-adapter og normalisering.
