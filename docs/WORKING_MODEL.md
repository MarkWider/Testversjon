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

## Oppgaver til agenter

Når Human Owner skal instruere en agent, leverer Chief of Staff som hovedregel en
ferdig melding som kan kopieres direkte. Den inneholder:

- rolle
- objective
- nødvendig context
- acceptance criteria
- constraints
- relevant branch eller PR
- anbefalt modell og effort
- hva agenten skal rapportere tilbake

Human Owner skal ikke måtte oversette mellom agentene.

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
