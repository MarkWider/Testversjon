# Architecture

## Frontend

Vite serverer en enkel React/TypeScript-enkeltside. `src/App.tsx` eier sidens innhold og komposisjon, mens `src/components/GdpChart.tsx` isolerer ECharts-integrasjonen.

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
fordi komponentene fortsatt importerer den direkte; den fjernes når frontend er
migrert til `getIndicatorData`.

## Datakilder

`src/adapters/worldBank.ts` henter fra
`https://api.worldbank.org/v2/country/{iso3;iso3}/indicator/{code}?format=json`
(ingen nøkkel, CORS) og normaliserer til `IndicatorSeries`: `countryiso3code` →
`RegionCode` via en fast tabell, `date` → `period`, `value` (kan være `null`) →
`value`, `meta.lastupdated` → `source.fetchedAt`. Ukjente land droppes; `points`
sorteres.

Adapteren er **ikke** aktiv default ennå — `sampleSource` står bak
`getIndicatorData` til frontend-migrering og adapter er merget hver for seg.
Senere kilder (SSB, Eurostat, OECD) legges til på samme måte, med en resolver som
velger kilde per region. Piloten bygger ikke ETL, database, caching eller
backend.

## Visualisering

Apache ECharts rendrer en responsiv linjegraf med legend, akser og tooltip. `ResizeObserver` holder grafen korrekt ved endret vindusstørrelse.
