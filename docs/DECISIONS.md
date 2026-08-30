# Decisions

## DEC-001

Decision:
Bruke React, TypeScript, Vite og Apache ECharts.

Reason:
Liten, moderne frontend-stack som oppfyller pilotens behov for en robust responsiv graf uten a introdusere backend-kompleksitet.

Alternatives:
Ren HTML/JavaScript, eller en annen grafbibliotek.

Consequences:
Prosjektet krever Node.js for lokal utvikling og bygg.

## DEC-002

Decision:
Bruke lokalt eksempeldata for BNP per innbygger i første versjon.

Reason:
Piloten tester samarbeidsflyt og visualisering, ikke datapipeline eller statistisk kvalitet.

Alternatives:
Direkte henting fra SSB, OECD, Eurostat eller Verdensbanken.

Consequences:
Appen merker dataene tydelig som ikke-offisielle. En adapter kan byttes inn senere.

## DEC-003

Decision:
`main` er godkjent hovedgren; implementasjon leveres fra `codex/agent-pilot-mvp` som pull request.

Reason:
Gjor review-loopen med Claude Code eksplisitt og holder godkjent kode adskilt fra arbeid.

Alternatives:
Direkte commits til hovedgren.

Consequences:
Alle substansielle endringer ma ga gjennom PR-review.
