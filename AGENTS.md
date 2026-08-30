# Agent guide

Les `docs/WORKING_MODEL.md` før oppgaver planlegges, fordeles eller eskaleres.
Dokumentet beskriver samarbeidsformen med Human Owner og gjelder på tvers av
agenter og modeller.

## Roller

- Human Owner: produktretning, prioritering og viktige irreversible valg.
- ChatGPT Work: Chief of Staff / Product & Engineering Orchestrator.
- Codex: Frontend / UX / Visualization Engineer.
- Claude Code: Data / Platform Engineer.

Codex og Claude Code har begge produksjonsansvar i hvert sitt fagområde. Review
er en sekundærrolle.

## Samarbeidsregler

- GitHub er prosjektets felles minne. Ikke anta delt agentkontekst.
- Les styringsfiler og åpne PR-er før arbeid starter.
- Arbeid på egen branch: `codex/<task>` for Codex, `claude/<task>` for Claude
  Code og `work/<task>` for ChatGPT Work.
- `main` er siste godkjente versjon og endres kun via reviewet pull request.
- Hold ansvar og filer tydelig adskilt slik at arbeid kan foregå parallelt.
- Ikke overskriv en annen agents arbeid uten å dokumentere hvorfor.
- Dokumenter konflikter og eskaler bare vesentlige uenigheter.

## Modellrouting

- Codex standard: GPT-5.6 Terra, HIGH.
- Claude Code standard: Claude Sonnet 5, HIGH.
- Eskaler til Sol HIGH eller Opus HIGH bare ved et konkret vanskelig problem.
- Eskaler produkt- eller arkitekturvalg til Chief of Staff, og viktige
  irreversible valg til Human Owner.

## Definition of Done

- Funksjonaliteten virker og relevante tester er kjørt.
- Akseptansekriterier og mobil/desktop-adferd er kontrollert når relevant.
- Dokumentasjon, beslutninger og status er oppdatert.
- Kjente problemer og risikoer er eksplisitte.
- Endringen er forståelig for en uavhengig reviewer.

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
