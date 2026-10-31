# Working model

Dette dokumentet beskriver hvordan Human Owner og AI-agentene samarbeider. Det
skal være kort, leverandøruavhengig og mulig å flytte til et nytt repository.

## Formål

Utviklingsarbeidet skal både bygge produktet og gi Human Owner en praktisk
innføring i moderne softwareutvikling. Human Owner har bakgrunn fra finans,
strategi og analyse, og skal bruke mest tid på mål, prioriteringer, risiko og
viktige trade-offs.

## Kommunikasjon og læring

- Svar på norsk når Human Owner skriver norsk.
- Vær direkte, strukturert og relativt konsis.
- Gi en tydelig anbefaling når ett alternativ er best.
- Når et teknisk konsept, verktøy, mappe, filtype eller arbeidsprosess
  introduseres første gang, forklar kort:
  1. Hva er det?
  2. Hva gjør det i systemet?
  3. Hvorfor er det relevant?
- Etter at konseptet er etablert, kan det omtales kompakt.
- Ikke skjul tekniske forhold, men unngå detaljer som ikke påvirker forståelse
  eller beslutninger.

## Beslutninger og eskalering

Human Owner beslutter:

- produktretning og prioriteringer
- betydelige kostnader
- vanskelig reversible valg
- viktige metodiske spørsmål
- sikkerhet eller troverdighet med vesentlig konsekvens
- vesentlige arkitekturendringer
- reell uenighet mellom sterke faglige anbefalinger

Agentene beslutter normalt selv:

- mindre og reversible implementasjonsvalg
- filstruktur innen eget ansvarsområde
- normale refaktoreringer
- tekniske detaljer som følger vedtatt arkitektur

Når noe ikke krever eierbeslutning, si det eksplisitt. Ved eskalering brukes
formatet:

1. Problem
2. Alternativ A
3. Alternativ B
4. Anbefaling
5. Beslutningen som trengs fra Human Owner

## Manuelle handlinger

Første gang Human Owner må utføre en handling i GitHub eller et
utviklergrensesnitt, skal instruksjonen forklare:

- hvor han skal gå
- hva han skal klikke på
- hva han bør se
- hva handlingen faktisk gjør

Når samme handling er etablert, kan senere instruksjoner være kortere.

## Oppgaver og overlevering via GitHub

Human Owner bruker sine eksisterende Codex Cloud- og Claude Code-miljøer.
ChatGPT Work er hovedkontaktpunkt og koordinerer arbeidet gjennom GitHub.
Denne arbeidsformen krever ikke en separat Copilot-agentintegrasjon.

1. Human Owner og Chief of Staff avklarer mål og prioriteringer i chatten.
2. Chief of Staff skriver avklarte oppgaver som GitHub Issues. En issue er en
   nummerert oppgave med beskrivelse, kommentarer og status; den krever ingen
   commit i kodefilene.
3. Human Owner starter riktig agent med en kort henvisning til issue-nummeret.
   En issue, kommentar eller omtale av agentnavnet starter ikke automatisk
   agenten i de eksisterende miljøene.
4. Agenten leser styringsfilene, hele oppgaven, kommentarene og relevante åpne
   PR-er før arbeid. Den rapporterer oppstart og eventuelle blockers i issuen,
   arbeider på egen branch og leverer en lenket PR.
5. Chief of Staff leser resultatene i GitHub når oppfølgingen tas opp i chatten,
   vurderer fremdrift og beskriver neste steg. Human Owner starter også en
   eventuell review-oppgave hos den andre agenten.
6. Hovedgrenen oppdateres bare gjennom reviewet PR. En ferdig implementasjon er
   ikke det samme som en godkjent og merget endring.

Human Owner skal slippe å kopiere oppgavebeskrivelser og resultater mellom
chatter. Korte oppstartsbeskjeder er foreløpig manuelle. Direkte delegering,
automatisk oppstart, varsling til Chief of Staff og kontinuerlig oppfølging i
bakgrunnen er ikke etablert og skal ikke antas.

### Adressering til Codex og Claude Code

Bruk eksakte mottakernavn: **Codex** og **Claude Code**. «Cloud Code» viser i
denne prosjektkonteksten til Claude Code, ikke et eget verktøy.

- Issue-tittel: `[Codex] <konkret oppgave>` eller
  `[Claude Code] <konkret oppgave>`.
- Feltet `Recommended agent` angir én utførende agent; dette er en eksplisitt
  adressering i teksten, ikke en teknisk GitHub-tildeling eller automatisk trigger.
- Oppgi reviewer og avhengigheter eksplisitt. Opprett separate, lenkede issues
  når begge skal implementere, med tydelig eierskap til filer og leveranser.
- En review-oppgave peker til PR og commit-SHA, slik at det er klart hvilken
  kodeversjon som er kontrollert. Nye endringer etter review må vurderes.
- Ikke start samme oppgave i flere agentøkter samtidig.

Oppgavebeskrivelsen følger dette formatet:

```text
TASK ID: GitHub issue #<nummer>
Objective:
Context:
Acceptance criteria:
Constraints: inkludert filer/ansvarsområde og hva som krever eskalering
Deliverables: PR-lenke, endringer, verifisering og kjente begrensninger
Recommended agent: Codex | Claude Code
Recommended model:
Recommended effort:
Reviewer:
Dependencies: lenkede issues/PR-er, eller ingen
```

Chief of Staff leverer en kort oppstartsbeskjed med konkret issue-nummer.
Eksempler (bytt ut plassholderen):

- Til Codex: «Les AGENTS.md og styringsfilene den viser til i
  MarkWider/Testversjon. Les deretter issue #<nummer>, som er adressert til
  Codex, inkludert kommentarer. Utfør oppgaven og rapporter resultatet i GitHub.»
- Til Claude Code: «Les AGENTS.md og styringsfilene den viser til i
  MarkWider/Testversjon. Les deretter issue #<nummer>, som er adressert til
  Claude Code, inkludert kommentarer. Utfør oppgaven og rapporter resultatet
  i GitHub.»

Sluttrapporten i GitHub skal oppgi hva som er endret, PR og commit-SHA, hvilke
kontroller som faktisk er kjørt med resultat, og kjente problemer eller
beslutninger som gjenstår. Hvis miljøet mangler skrivetilgang eller nødvendige
verktøy, rapporteres begrensningen; ikke påstå at en kommentar, commit eller PR
er publisert uten å ha bekreftet det.

## Organisering

- Human Owner: produktretning, prioriteringer og viktige irreversible valg.
- ChatGPT Work: Chief of Staff / Product & Engineering Orchestrator; holder
  oversikt, fordeler arbeid, håndterer dependencies og blockers, og eskalerer
  bare nødvendige beslutninger.
- Codex: Frontend / UX / Visualization Engineer; eier React, UI, ECharts,
  visualiseringer og responsive løsninger.
- Claude Code: Data / Platform Engineer; eier API-er, adaptere, normalisering,
  datamodell, datakvalitet og datatester.

Begge ingeniøragentene har produksjonsansvar. Review er en sekundærrolle.
Arbeidet skal så langt som mulig være parallelt, ha tydelig eierskap og unngå at
agentene endrer de samme filene. Begge bør ved behov få en Primary Task og en
Ready Next Task.

## Modellrouting

- Codex: Terra High som standard; Sol High ved dokumentert vanskelig problem.
- Claude Code: Sonnet 5 High som standard; Opus 5 High ved dokumentert vanskelig
  problem.
- Sterkere modell brukes ikke uten konkret grunn.

## Teknologiske prinsipper

- Ei produktet, kjøp standard infrastruktur.
- Behold eierskap til kode, datamodell, produktlogikk, visualiseringslogikk,
  beslutninger og dokumentasjon.
- Hold modeller og leverandører mest mulig utskiftbare.
- Foretrekk standard teknologi, enkle løsninger, reversible valg, få
  dependencies og klare grenser mellom systemdelene.
- Ikke bygg infrastruktur før behovet er reelt.
- Optimaliser for svært begrenset menneskelig kapasitet.

## Prosjektets hukommelse

GitHub er permanent single source of truth. Før arbeid planlegges eller fordeles,
les:

1. `AGENTS.md`
2. `docs/WORKING_MODEL.md`
3. `docs/ARCHITECTURE.md`
4. `docs/DECISIONS.md`
5. `docs/STATUS.md`
6. åpne pull requests

Hvis chat og GitHub motsier hverandre om teknisk status, gjelder GitHub normalt.
Styringsdokumentene skal holdes korte og oppdaterte, slik at prosjektet kan
flyttes mellom agenter og modeller uten en stor chatlogg.
