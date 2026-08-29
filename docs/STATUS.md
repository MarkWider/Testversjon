# Project status

## Current state

Første Agent Pilot implementeres på `codex/agent-pilot-mvp`.

## Completed

- Repository er koblet til GitHub.
- `main` er opprettet som framtidig godkjent hovedgren.
- React/TypeScript/ECharts-førsteversjon og prosjektminne er lagt til arbeidsgrenen.
- Datatester, TypeScript-sjekk og produksjonsbygg er bestått.
- Desktop- og mobilvisning er kontrollert i nettleser uten konsollfeil.

## In progress

- Push og Pull Request mot `main`.

## Next

- Claude Code gjennomfører uavhengig review av PR-en.
- Codex behandler eventuelle reviewfunn.
- Neste produktiterasjon velger og implementerer en offisiell dataadapter.

## Known issues

- Codex sin innebygde Node-runtime ble brukt for bygg og tester. En vanlig lokal Node.js-installasjon vil fortsatt være nødvendig for utvikling utenfor Codex.
- GitHub-standardgrenen var opprinnelig `master`; `main` er opprettet, men standardgren-innstillingen kan ikke verifiseres i GitHub UI fordi den tilgjengelige nettlesersesjonen ikke er innlogget.

## Recommended model for next task

Claude Sonnet 5, HIGH for uavhengig PR-review.
