# Architecture proposal: frontend ↔ datalag-kontrakt

**Status: PROPOSAL — NOT IMPLEMENTED**
**Review requested from: Codex / Frontend & Visualization Engineer**

Mål: én stabil grense slik at Codex bygger frontend og Claude bygger datakilder
uten å endre hverandres filer. Dette dokumentet er kun til review og diskusjon.
Ingen kode (`contracts/`, `services/`, `data/`, `adapters/`) er skrevet ennå.

---

## Åpne spørsmål til reviewer (Codex)

Disse to punktene ønskes eksplisitt vurdert fra frontend-perspektiv. Kontrakten
under er med hensikt **ikke** redesignet rundt dem ennå — det avventer din review.

### Spørsmål 1 — `RegionCode` / ISO-landkode

`RegionCode` er nå definert som ISO 3166-1 alpha-2 (`"NO"`, `"SE"`, `"DK"`).
Er dette begrepet for snevert, gitt at «Norge i tall» senere kan inneholde
**fylker, kommuner eller andre geografiske nivåer**? Aktuelle retninger (ikke
avgjort): beholde `RegionCode` som en fri streng med en separat
`RegionLevel`-markør (`country | county | municipality`), bruke offisielle
SSB-region­koder direkte, eller la `RegionMeta` bære nivået. Påvirker dette
hvordan frontend vil gruppere, filtrere eller vise legender?

### Spørsmål 2 — `source: SourceMeta` som én kilde

`IndicatorSeries.source` er nå **én** `SourceMeta`. Er det et fornuftig enkelt
valg nå, uten at vi låser oss unødvendig dersom en senere indikator bygger på
**flere kilder** (f.eks. SSB spleiset med OECD for lengre tidsserie)? Alternativ
uten stor omskriving: gjøre feltet til `source: SourceMeta | SourceMeta[]`, eller
la enkeltkilden stå og legge per-punkt-opphav i `IndicatorPoint` senere hvis det
trengs. Trenger frontend å vise kildeblanding eksplisitt, eller holder det med én
samlet kildeetikett per serie?

Ikke redesign kontrakten rundt disse før review er gjort.

---

## 1. Data contract

Frontend mottar alltid **én normalisert `IndicatorSeries`** i *long format*
(én rad = én region + én periode + én verdi). Samme form uansett indikator,
antall land eller kilde.

```ts
// src/contracts/indicator.ts — kun typer, null runtime-avhengigheter

export type IndicatorId = string    // "gdp_per_capita"
export type RegionCode  = string    // ISO 3166-1 alpha-2: "NO" | "SE" | "DK"   ← se Spørsmål 1

export interface IndicatorPoint {
  region: RegionCode
  period: string                    // ISO 8601: "2023" | "2023-Q4" | "2023-11"
  value: number | null              // null = kjent hull i dataene
}

export interface IndicatorUnit {
  code: string                      // "USD" | "NOK" | "percent"
  display: 'currency' | 'number' | 'percent'
  currency?: string                 // når display === 'currency'
  decimals?: number                 // default 0
}

export interface RegionMeta { code: RegionCode; name: string }   // "NO" → "Norge"

export interface SourceMeta {
  id: string                        // "sample" | "ssb" | "oecd"
  label: string                     // "Lokalt eksempeldata"
  official: boolean                 // false for sample
  fetchedAt?: string                // ISO-tid, når fra live kilde
}

export interface IndicatorSeries {
  indicator: IndicatorId
  title: string                     // "BNP per innbygger"
  subtitle?: string                 // "Løpende priser"
  unit: IndicatorUnit
  source: SourceMeta                // ← se Spørsmål 2
  regions: RegionMeta[]             // regioner som finnes, i visningsrekkefølge
  points: IndicatorPoint[]          // long format
}
```

BNP-eksempel: `indicator: "gdp_per_capita"`,
`unit: { code: "USD", display: "currency", currency: "USD", decimals: 0 }`,
`regions: [{ code: "NO", name: "Norge" }, …]`,
`points: [{ region: "NO", period: "2015", value: 74400 }, …]`.

Gjenbruk: ny indikator = ny `IndicatorId` + nye `points`. Ingen typeendring.
Nytt land = én ekstra `RegionMeta` + flere `points`. Kvartalsdata =
`period: "2023-Q4"`. `formatUsd` forsvinner fra datalaget — frontend formaterer
ut fra `unit`.

## 2. Service interface

Frontend importerer **kun** dette fra datalaget:

```ts
// src/services/indicators.ts
import type { IndicatorId, IndicatorSeries, RegionCode } from '../contracts/indicator'

export interface GetIndicatorOptions {
  regions?: RegionCode[]            // default: alle
  from?: string; to?: string       // ISO-periode, inklusive
}

export function getIndicatorData(
  id: IndicatorId,
  options?: GetIndicatorOptions,
): Promise<IndicatorSeries>
// rejects med IndicatorError { code: 'not_found' | 'source_unavailable' | 'invalid', message }
```

- **Async fra dag én** — sample-implementasjonen returnerer `Promise.resolve(...)`.
  Når ekte SSB-henting (nettverk) kommer, endres ikke signaturen.
- Frontend kaller `await getIndicatorData('gdp_per_capita')` og kjenner aldri
  SSB/OECD-detaljer.

## 3. File structure

| Mappe | Ansvar |
|---|---|
| `src/contracts/` | Kun TS-typer/interfaces for grensen mellom lagene. Ingen logikk, ingen avhengigheter. Én sannhet begge sider importerer. |
| `src/services/` | Tynn, stabil frontend-vendt API (`getIndicatorData`). Velger hvilken kilde/adapter som brukes. Returnerer data som allerede oppfyller `contracts/`. Eneste datalags-modul frontend rører. |
| `src/data/` | Konkrete datasett + sample-kilden (dagens BNP-tall uttrykt i kontraktform). Fixtures. Implementerer et internt `IndicatorSource`-grensesnitt. |
| `src/adapters/` | Én modul per ekstern kilde (SSB, OECD, Eurostat, Verdensbanken). Henter fra API og **normaliserer** til `contracts/`. Opprettes først ved ekte integrasjon. Bare `services/` kjenner dem. |

Internt datalags-seam (ikke synlig for frontend), holder adaptere utskiftbare:

```ts
// src/data/source.ts
export interface IndicatorSource {
  id: string
  supports(indicator: IndicatorId): boolean
  fetch(indicator: IndicatorId, options?: GetIndicatorOptions): Promise<IndicatorSeries>
}
```

`sampleSource` og hver adapter implementerer denne; `services/` holder en liten
liste og velger. *Valgfritt for steg 1* — `services/` kan kalle sample direkte
først, legge til seamen når første adapter kommer.

## 4. Ownership

- **Claude primary:** `src/services/` (implementasjon), `src/data/`,
  `src/adapters/`, `src/data/source.ts`, datalags-tester.
- **Codex primary:** `src/components/` (inkl. `GdpChart.tsx`), `src/App.tsx`,
  `src/main.tsx`, `styles.css`, `index.html`, verdi/etikett-formatering for
  visning (`formatValue(value, unit)`), UI-tester.
- **Shared** (endring = forslag + cross-review + notat i `docs/DECISIONS.md`):
  `src/contracts/`, den offentlige signaturen til `getIndicatorData`,
  `package.json`, arkitekturdok.

Regel: fritt frem i eget primærområde. `src/contracts/` er den ene filen som
tvinger koordinering, fordi begge kompilerer mot den.

## 5. Parallel development

Kontrakten + den async signaturen er det eneste synkroniseringspunktet. Etter at
de er avtalt:

- **Codex** importerer `getIndicatorData` + typer fra `contracts/`, bygger graf,
  indikatorvalg, formatering, loading/feil-tilstander mot kontrakten. Dag én
  returnerer tjenesten sample-tallene (samme tall som i dag) i ny form. Rører
  aldri `data/` eller `adapters/`.
- **Claude** jobber bak `getIndicatorData`: bytter sample-kilden mot ekte
  SSB/OECD-adaptere, normalisering, validering, caching, hull-håndtering. Så
  lenge returverdien oppfyller `IndicatorSeries` kreves ingen frontend-endring.
- **Mock = ekte form:** sample-kilden og hver adapter returnerer *samme*
  `IndicatorSeries`-type, håndhevet av TypeScript. «Mockdata» er bare
  «sample-`IndicatorSource`»; å bytte til ekte data er en registerendring i
  `services/`, usynlig for frontend.
- **Ingen venter:** blokkeres Claude på SSB (API-spørsmål, nøkkel), serverer
  sample-kilden frontend videre. Har ikke Codex bygget UI ennå, verifiserer
  Claude via datalags-tester mot kontrakten.
- Trengs en kontraktendring: det ene tilfellet som krever håndslag — foreslå,
  begge reviewer, land, så fortsetter begge. Hold dem sjeldne.

## 6. Migration — minste nødvendige endring

Fra dagens direkte kobling (`GdpChart.tsx` + `App.tsx` importerer
`{ countries, formatUsd, gdpPerCapitaSample }` fra `src/data/gdpPerCapita.ts`):

1. **Ny** `src/contracts/indicator.ts` (kun typene over).
2. **Ny** `src/services/indicators.ts` — `getIndicatorData` returnerer dagens
   9 rader remappet til `IndicatorSeries` via `Promise.resolve`. Tallene kan bli
   stående inline her i steg 1, eller flyttes til
   `src/data/sample/gdpPerCapita.ts` (ren flytting).
3. **Codex, liten endring** i `App.tsx`: last `getIndicatorData('gdp_per_capita')`
   én gang (`useState`/`useEffect`), send `IndicatorSeries` ned som prop. De tre
   «funn»-tallene leses fra series i stedet for `latest`.
4. **Codex, liten endring** i `GdpChart.tsx`: prop `{ series }`; x-akse fra unike
   `series.points.period`; ECharts-serier ved å gruppere `points` på `region`,
   rekkefølge/navn fra `series.regions`; bytt `formatUsd(x)` → lokal
   `formatValue(x, series.unit)` (~5 linjer, seedet fra dagens `formatUsd`-kropp
   — identisk oppførsel for sample).
5. **Slett** `src/data/gdpPerCapita.ts` når ingenting importerer den; de to
   datasjekk-testene flyttes til å dekke tjenesten/kontrakten.

Ingen nye avhengigheter, ingen nettverk, ingen visuell endring. Reversibelt:
behold `gdpPerCapita.ts` til steg 5; `getIndicatorData` kan midlertidig
re-eksportere gammel form hvis vi vil rulle tilbake.

**Arbeidsdeling i selve migreringen:** steg 1–2 og 5 = Claude, steg 3–4 = Codex —
som allerede demonstrerer den parallelle grensen.

---

## Bevisste avgrensninger (unngå over-engineering)

- Kontrakten er rene TS-typer — ingen runtime-valideringsbibliotek. Validering
  hører hjemme i datalaget (adaptere validerer upstream før normalisering; ev.
  `assertIndicatorSeries()` i `contracts/` senere hvis vi vil ha runtime-sjekk —
  reversibelt).
- `IndicatorSource`-registeret er valgfritt for steg 1.
- Ingen codegen, ingen DI, ingen ny mappe før den trengs (`adapters/` opprettes
  først ved ekte integrasjon).

## Prioriteringer dette forslaget forsøker å innfri

enkelhet · lav coupling · tydelig eierskap · parallell utvikling · reverserbare
valg.
