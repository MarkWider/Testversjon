# Project status

## Current state

Baseline (#1), architecture proposal (#2) og foundation-laget (#3) er merget til
`main`. Forste reelle parallelle utviklingsrunde pagar:

- Codex: migrerer frontend til `IndicatorSeries` / `getIndicatorData()`
  (`codex/indicator-frontend`).
- Claude Code: forste ekte datakilde-adapter (World Bank) paa
  `claude/world-bank-adapter`, ligger som PR mot `main`.

## Completed

- React/TypeScript/ECharts-baseline merget (#1).
- Uavhengig Claude-review av baseline: PASS etter tre blocker-fikser, verifisert
  med reell `pnpm install` / `test` / `build`.
- Data-kontrakt-proposal godkjent av Codex og merget (#2).
- Foundation-lag merget (#3): `src/contracts/`, `src/services/getIndicatorData`,
  `sampleSource`, med tester.
- World Bank-adapter implementert bak kontrakten (`src/adapters/worldBank.ts`),
  med fixture-baserte tester og live-API-verifikasjon. Ikke aktivert som default.

## In progress

- Review + merge av World Bank-adapter-PR (`claude/world-bank-adapter`).
- Review + merge av frontend-migrerings-PR (`codex/indicator-frontend`).

## Next

- Nar begge PR-ene er merget: lite integrasjonssteg som bytter default source i
  `getIndicatorData` fra `sampleSource` til `worldBankSource` (egen PR).
- Deretter neste kilde-lag: SSB (Norge), sa Eurostat, sa OECD, med resolver og
  fler-kilde-`source` (kontrakt-endring, eget forslag).

## Known issues

- `src/data/gdpPerCapita.ts` finnes fortsatt til frontend-migreringen er merget.
- For World Bank kan aktiveres: `getIndicatorData` maa slippe gjennom
  `IndicatorError` fra kilden i stedet for a pakke alt som `source_unavailable`
  (bare catch-blokk i `src/services/indicators.ts`).
- `worldBankSource` bruker global `fetch` ved runtime. Ved build-time snapshot
  senere injiseres `fetchJson` via `createWorldBankSource({ fetchJson })`.
- `source.fetchedAt` fra World Bank er kildens `lastupdated` (dato, ikke
  klokkeslett) - bevisst valg for determinisme i en snapshot-pipeline.

## Recommended model for next task

Claude Sonnet 5, HIGH for SSB-adapter, resolver og fler-kilde-normalisering.
