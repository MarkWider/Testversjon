# Project status

## Current state

Baseline (PR #1) og architecture proposal (PR #2) er merget til `main`.
`main` er GitHub default branch. Foundation-laget for frontend <-> data-kontrakten
er implementert paa `claude/indicator-contract-foundation` og ligger som PR mot
`main` til review.

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

## In progress

- Review og merge av foundation-PR (`claude/indicator-contract-foundation`).

## Next

- Codex migrerer frontend til `getIndicatorData` (proposalets Migration, steg
  3-5) og fjerner den direkte importen av `src/data/gdpPerCapita.ts`.
- Etter at foundation er merget: forste ekte datakilde-adapter (SSB) i
  `src/adapters/`, bak samme kontrakt.

## Known issues

- `src/data/gdpPerCapita.ts` finnes fortsatt og importeres av `src/App.tsx` og
  `src/components/GdpChart.tsx`. Den fjernes naar frontend er migrert til
  `getIndicatorData`. Sample-verdiene finnes da to steder til migreringen er
  gjort.
- `IndicatorError`-kodene `source_unavailable` og `invalid` er definert for
  framtidige adaptere; sample-kilden utloser dem ikke, saa de er kun daekket av
  enhetstest av validatoren, ikke ende-til-ende.
- Lokal runtime er na Node 24.19.0 LTS + pnpm 11.19.0 (via Corepack) paa
  utviklingsmaskinen.

## Recommended model for next task

Claude Sonnet 5, HIGH for SSB-adapter og normalisering.
