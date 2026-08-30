# Architecture

## Frontend

Vite serverer en enkel React/TypeScript-enkeltside. `src/App.tsx` henter én
indikator gjennom den offentlige `getIndicatorData()`-tjenesten og presenterer
loading-, feil- og suksess-tilstander. `src/charts/IndicatorChart.tsx` oversetter
en `IndicatorSeries` i long format til en responsiv ECharts-linjegraf uten å
kjenne den konkrete datakilden. `src/charts/formatValue.ts` formaterer tall fra
`IndicatorUnit`-metadata.

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
- `src/data/` — konkrete datasett og sample-kilden. `sampleSource` uttrykker
  dagens eksempeldata i kontraktform og implementerer det interne
  `IndicatorSource`-grensesnittet.
- `src/adapters/` — én modul per ekstern kilde (SSB, OECD, Eurostat,
  Verdensbanken) som normaliserer til `contracts/`. Opprettes først ved ekte
  integrasjon.

`src/data/gdpPerCapita.ts` (bred `GdpObservation[]`-form) beholdes midlertidig
som legacy-data og testgrunnlag. Frontend importerer den ikke lenger; den kan
fjernes av datalag-eier når migreringen er koordinert ferdig.

## Fremtidig offisiell datakilde

En senere adapter i `src/adapters/` henter fra SSB, OECD, Eurostat eller
Verdensbanken, normaliserer til `IndicatorSeries`, og settes inn bak
`getIndicatorData` uten at kontrakten eller frontend endres. Denne piloten bygger
ikke ETL, database, caching eller backend.

## Visualisering

Apache ECharts rendrer en responsiv linjegraf med legend, akser og tooltip. `ResizeObserver` holder grafen korrekt ved endret vindusstørrelse.
