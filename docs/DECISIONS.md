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

## DEC-004

Decision:
Innfor en stabil frontend <-> datalag-kontrakt som et foundation-lag:
`IndicatorSeries` i `src/contracts/`, en async `getIndicatorData(id, options?)` i
`src/services/`, og en sample-kilde i `src/data/` som leverer samme kontrakt som
framtidige adaptere. Basert pa godkjent forslag i
`docs/proposals/data-contract.md` (#2).

Reason:
Lar frontend (Codex) og datakilder (Claude) utvikles parallelt uten a endre
hverandres filer. Frontend importerer kun `src/services/` og `src/contracts/`,
aldri `src/data/`.

Alternatives:
Beholde dagens direkte import av `src/data/gdpPerCapita.ts` fra komponentene.

Consequences:
`src/contracts/` er delt og endres kun via forslag + cross-review + notat her.
`getIndicatorData` er async fra dag en. Tjenesten garanterer at `points` er
sortert (periode stigende, deretter `regions`-rekkefolge) og at data er validert
mot kontrakten. SSB/OECD/Eurostat er ikke implementert enna - kun sample-kilden.
`src/data/gdpPerCapita.ts` beholdes til frontend er migrert til `getIndicatorData`
(forslagets "Migration"-seksjon), deretter kan den slettes.

## DEC-005

Decision:
`RegionCode` holdes som fri streng (i praksis ISO 3166-1 alpha-2 na), og
`SourceMeta` er inntil videre en enkelt kilde per serie.

Reason:
De to apne sporsmalene fra proposalet (geografisk granularitet;
en-vs-flere-kilder) ble markert som ikke-blokkerende av Codex. Fri streng og
enkelt-kilde er de enkleste valgene som ikke laser oss: a utvide til
fylker/kommuner krever ingen typeendring, og `source` kan senere bli
`SourceMeta | SourceMeta[]` uten a bryte eksisterende konsumenter.

Alternatives:
Innfore `RegionLevel`-markor og/eller kilde-array na.

Consequences:
Revurderes nar forste indikator faktisk trenger sub-nasjonal geografi eller
flere kilder. Ingen kode bygget rundt de avviste alternativene.

## DEC-006

Decision:
Forste ekte eksterne datakilde-adapter er World Bank
(`NY.GDP.PCAP.CD`, BNP per innbygger, lopende USD) for NO/SE/DK. Adapteren legges
i `src/adapters/worldBank.ts` bak kontrakten, men aktiveres IKKE som default i
`getIndicatorData` i denne omgang - `sampleSource` er fortsatt aktiv standard.

Reason:
World Bank er valgt som forste kilde fordi den dekker alle tre land, har apent
API uten nokkel, og lar dagens trelandsvisualisering sta uendret. Aktivering
holdes tilbake sa Codex sin frontend-migrering og denne adapteren kan merges og
verifiseres uavhengig for det lille integrasjonssteget der ekte data slas pa.

Alternatives:
SSB forst (kun Norge - ville endret grafen); aktivere World Bank i samme PR.

Consequences:
`src/adapters/` og de interne modulene `src/data/source.ts` (flyttet
`IndicatorSource`) og `src/data/period.ts` (delte periode-hjelpere) finnes na.
`IndicatorError` importeres av adapteren fra `src/services/` - kan flyttes til
`src/contracts/` senere (ikke-brytende). For World Bank kan bli default ma
`getIndicatorData` slippe gjennom `IndicatorError` fra kilden i stedet for a pakke
alt som `source_unavailable`.

## DEC-007

Decision:
Aktiver World Bank-adapteren som kilde for `gdp_per_capita` i `getIndicatorData`.
Standard periodevindu er 2015-2023 nar caller ikke oppgir `from`/`to` (fylles per
grense; eksplisitte verdier vinner alltid). `getIndicatorData` sender
`IndicatorError` fra kilden videre uendret; kun ukjente feil oversettes til
`source_unavailable`.

Reason:
Piloten skal vise ekte offentlige tall. `NY.GDP.PCAP.CD` dekker NO/SE/DK i
lopende USD og passer dagens `IndicatorSeries`-kontrakt uten frontend-endring.
2015-2023 bevarer pilotens navaerende visuelle omfang (World Bank uten range gir
ellers hele historikken, ~1960-).

Alternatives:
Beholde `sampleSource`; aktivere uten default-vindu.

Consequences:
`NY.GDP.PCAP.CD` er valgt for den *tekniske* piloten, ikke som endelig metodisk
produktindikator. `sampleSource` og `src/data/sample/gdpPerCapita.ts` beholdes i
koden (ikke lenger koblet inn i `getIndicatorData`) for reversibilitet. Ingen
registry/resolver/caching/config - neste kilde-lag (SSB m.fl.) er egne PR-er.
`getIndicatorData` kaller `worldBankSource`, som ved runtime bruker global
`fetch`; tester stubber `fetch` mot den fangede fixturen.

## DEC-008

Decision:
`getIndicatorData` far et kildeuavhengig service-valg `periodMode: 'default' |
'all'`, via `GetIndicatorDataOptions extends GetIndicatorOptions` i
`src/services/indicators.ts`.
- `'default'` / utelatt: dagens pilotvindu 2015-2023, med per-grense-fyll av
  manglende `from`/`to`.
- `'all'`: ingen automatiske `from`/`to`; kilden returnerer hele tilgjengelige
  historikken. Eksplisitte `from`/`to` beholdes, og motsatt grense fylles ikke.
`periodMode` fjernes fra options for datakilden kalles.

Reason:
Forste UX-sprint (docs/DESIGN_SYSTEM.md, "Teknisk dependency for
frontendimplementering") trenger et periodevalg "Hele perioden" uten a hardkode
World Banks start-/sluttar i frontend.

Alternatives:
Egen `getFullHistory`-funksjon; la frontend sende en veldig lav `from`; utvide
`GetIndicatorOptions` i kontrakten (ville lekket service-begrep til adapterne).

Consequences:
`IndicatorSeries` og World Bank-adapteren er uendret. `periodMode` er
tjenestespesifikt og nar aldri `IndicatorSource`/adapteren. Liten og reversibel:
utvidelsen er én ny type og én gren i `getIndicatorData`. Frontend-periodevalgene
"10 ar"/"25 ar" bruker eksplisitte grenser; "Hele perioden" bruker
`periodMode: 'all'`.
