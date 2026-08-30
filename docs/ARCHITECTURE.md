# Architecture

## Frontend

Vite serverer en React/TypeScript-enkeltside. `src/App.tsx` henter én indikator
gjennom den offentlige `getIndicatorData()`-tjenesten med `periodMode: 'all'` og
presenterer loading-, feil- og suksess-tilstander. `src/components/IndicatorContent.tsx`
filtrerer deretter den hentede `IndicatorSeries` klient-side til 10, 25 eller alle
observerte perioder, og viser/skjuler sammenligningsland uten ny datahenting.
`src/charts/IndicatorChart.tsx` oversetter long format til en responsiv
ECharts-linjegraf uten å kjenne den konkrete datakilden. En progressiv datatabell
gir samme eksakte verdier til tastatur- og skjermleserbrukere.

## Datakontrakt og tjenestelag

Grensen mellom frontend og datalaget er en stabil kontrakt slik at de to kan
utvikles parallelt. Fire mapper:

- `src/contracts/` — kun TS-typer. `IndicatorSeries` (normalisert *long format*:
  én rad = én region + én periode + én verdi), `GetIndicatorOptions`, og en
  liten `validateIndicatorSeries`-sjekk. Delt/endringskontrollert.
- `src/services/` — `getIndicatorData(id, options?)`, den eneste datalags-modulen
  frontend importerer. Async fra dag én. Garanterer at `points` er sortert
  (periode stigende, deretter `regions`-rekkefølge) og at svaret er validert mot
  kontrakten. Kaster `IndicatorError` med `code` `not_found | source_unavailable
  | invalid`.
- `src/data/` — konkrete datasett og sample-kilden. `source.ts` definerer det
  interne `IndicatorSource`-grensesnittet (implementeres av `sampleSource` og
  hver adapter); `period.ts` har delte periode-hjelpere (range-filter, sortering).
- `src/adapters/` — én modul per ekstern kilde som normaliserer upstream-format
  til `IndicatorSeries`. Første adapter: `worldBank.ts` (World Bank
  `NY.GDP.PCAP.CD`). Adapterne eksponerer rene `parse` + `normalize`-funksjoner
  for deterministisk testing, pluss en `IndicatorSource`-innpakning med
  injiserbar `fetchJson`.

`src/data/gdpPerCapita.ts` (bred `GdpObservation[]`-form) beholdes midlertidig
som legacy-data og testgrunnlag. Frontend importerer den ikke lenger; den kan
fjernes av datalag-eier når migreringen er koordinert ferdig.

## Datakilder

`src/adapters/worldBank.ts` henter fra
`https://api.worldbank.org/v2/country/{iso3;iso3}/indicator/{code}?format=json`
(ingen nøkkel, CORS) og normaliserer til `IndicatorSeries`: `countryiso3code` →
`RegionCode` via en fast tabell, `date` → `period`, `value` (kan være `null`) →
`value`, `meta.lastupdated` → `source.fetchedAt`. Ukjente land droppes; `points`
sorteres.

**`worldBankSource` er den aktive kilden for `gdp_per_capita`** (DEC-007).
`getIndicatorData` sender `IndicatorError` fra kilden videre med uendret `code`
(kun ukjente feil blir `source_unavailable`). `sampleSource` og
`src/data/sample/gdpPerCapita.ts` beholdes i koden for reversibilitet, men er ikke
lenger koblet inn.

Periodevindu velges kildeuavhengig via `GetIndicatorDataOptions.periodMode`
(DEC-008): `'default'` (eller utelatt) legger på pilotvinduet 2015–2023 per
grense når `from`/`to` mangler; `'all'` legger ikke på noen automatiske grenser,
så kilden returnerer hele tilgjengelige historikken. Eksplisitte `from`/`to`
vinner alltid. `periodMode` strippes fra options før `IndicatorSource` kalles —
adapterne ser det aldri.

Senere kilder (SSB, Eurostat, OECD) legges til på samme måte, med en resolver som
velger kilde per region. Piloten bygger ikke ETL, database, caching eller backend.
`NY.GDP.PCAP.CD` er en pilot-indikator, ikke et endelig metodisk produktvalg.

## Visualisering

Apache ECharts rendrer en responsiv linjegraf med legend, akser og tooltip. `ResizeObserver` holder grafen korrekt ved endret vindusstørrelse.
