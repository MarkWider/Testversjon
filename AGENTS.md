# Agent guide

## Roller

- Human Owner: retning, prioritering og irreversible valg.
- ChatGPT / Work: Chief of Staff og Product Lead.
- Codex: Primary Engineer og implementer.
- Claude Code: uavhengig reviewer og QA etter PR.

## Samarbeidsregler

- GitHub er prosjektets felles minne. Ikke anta delt agentkontekst.
- Arbeid pa egen branch: `codex/<task>` for Codex og `claude/<task>` for Claude.
- `main` er siste godkjente versjon og endres kun via reviewet pull request.
- Ikke overskriv en annen agents arbeid uten a dokumentere hvorfor.
- Dokumenter konflikter og eskaler vesentlige uenigheter.

## Modellrouting

- Codex standard for utvikling: GPT-5.6 Terra, HIGH.
- Claude standard for review: Claude Sonnet 5, HIGH.
- Anbefal, men ikke simuler, modellbytte ved reelt behov for en sterkere modell.
- Eskaler teknisk kompleksitet til Sol HIGH eller Opus HIGH etter to normale forsok pa samme problem.
- Eskaler produkt- eller arkitekturvalg til Chief of Staff, og irreversible valg til Human Owner.

## Definition of Done

- Funksjonaliteten virker og relevante tester er kjort.
- Akseptansekriterier og mobil/desktop-adferd er kontrollert.
- Dokumentasjon, beslutninger og status er oppdatert.
- Kjente problemer og risikoer er eksplisitte.
- Endringen er forstaelig for en uavhengig reviewer.

## Oppgaveformat

```text
TASK ID
Objective:
Context:
Acceptance criteria:
Constraints:
Deliverables:
Recommended agent:
Recommended model:
Recommended effort:
```
