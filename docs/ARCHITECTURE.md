# Architecture

## Frontend

Vite serverer en enkel React/TypeScript-enkeltside. `src/App.tsx` eier sidens innhold og komposisjon, mens `src/components/GdpChart.tsx` isolerer ECharts-integrasjonen.

## Data

`src/data/gdpPerCapita.ts` er den foreløpige datakontrakten og inneholder uttrykkelig merkede eksempeldata. Visualiseringen mottar kun en standardisert årlig serie per land.

## Fremtidig offisiell datakilde

En senere adapter kan hente data fra SSB, OECD, Eurostat eller Verdensbanken, normalisere til `GdpObservation[]`, og erstatte lokalserien uten at diagramkomponenten endres. Denne piloten bygger ikke ETL, database eller backend.

## Visualisering

Apache ECharts rendrer en responsiv linjegraf med legend, akser og tooltip. `ResizeObserver` holder grafen korrekt ved endret vindusstørrelse.
