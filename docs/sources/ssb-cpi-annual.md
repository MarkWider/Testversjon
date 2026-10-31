# SSB: konsumprisindeks (KPI), årsgjennomsnitt, totalindeks

Kilde- og metodenotat for indikatoren `cpi_annual_total` (issue #15). Verifisert
mot SSBs API 31. oktober 2026.

## Kilde

| Felt | Verdi |
|---|---|
| Utgiver | Statistisk sentralbyrå (offisiell statistikk) |
| API | PxWebApi v2, `https://data.ssb.no/api/pxwebapi/v2` (dok.: `https://www.ssb.no/api/pxwebapiv2`) |
| **Tabell** | **14701** «Konsumprisindeks (KPI), etter vare- og tjenestegruppe (2025=100) 2000-2025», `timeUnit: Annual` |
| Erstatter | Tabell 03014 (årlig). Månedstabellen 14700 erstatter 03013 og brukes **ikke** av adapteren |
| Statistikkvariabel | `ContentsCode = KpiAar` («Konsumprisindeks (2025=100)»). `Aarsendring` (prosent) brukes ikke |
| Gruppe | `VareTjenesteGrp = 00` («I alt», total KPI) |
| Perioder | `Tid = *` (alle). 2000–2025, 26 årsverdier |
| Region | Norge (`NO`). Tabellen er nasjonal |
| Lisens/tilgang | Åpent API, ingen nøkkel. `access-control-allow-origin: *`. Grense 40 kall per 60 s |

**Merk om issuen:** #15 viser til tabell 14700, men den er månedlig. SSBs offisielle
årsserie ligger i 14701, som er det kriterium 1 ber om («SSBs årsserie, ikke
desemberindeks eller egen beregning av månedsmiddel»). Ingen metodeendring var nødvendig.

## Uttrekk (eksakt)

```text
GET https://data.ssb.no/api/pxwebapi/v2/tables/14701/data
    ?lang=no&outputFormat=json-stat2
    &valuecodes[ContentsCode]=KpiAar
    &valuecodes[VareTjenesteGrp]=00
    &valuecodes[Tid]=*
```

Responsen er JSON-stat2 med `id = [VareTjenesteGrp, ContentsCode, Tid]` og
`size = [1, 1, 26]`. Adapteren finner celler via dimensjons-id og stride, ikke
via antatt posisjon. Perioden `from`/`to` brukes **etter** henting, så forespørselen
er lik uansett vindu.

## Måleenhet, basisår og tidsdefinisjon

Fra SSBs egen metadata for `KpiAar`:

| Metadata | Verdi | Betydning |
|---|---|---|
| `unit.base` / `decimals` | `indeks` / 1 | Indeksnivå med én desimal |
| `basePeriod` | `2025` | 2025 = 100. 2025-verdien er derfor 100,0 |
| `refperiod` | «Gjennomsnitt for året» | Kalenderåret |
| `measuringType` | `Average` | Gjennomsnitt av årets månedsindekser, beregnet av SSB |

Adapteren avviser svaret (`invalid`) hvis `basePeriod` ikke er `2025` eller
`measuringType` ikke er `Average`. Da ville enhetsmerkingen «Indeks (2025=100)»
ellers vært feil uten at noen merket det.

**Indeksnivå og prosentvis prisvekst blandes aldri.** Verdiene er nivå (54,8 → 100).
Enheten er `display: 'number'`, ikke `'percent'`. Årsendring kan beregnes av
konsument, men leveres ikke her.

## Tidsstempler

| Hva | Verdi |
|---|---|
| Tabellen sist oppdatert hos SSB (`updated`) | `2026-02-10T07:00:00Z` |
| Fixture hentet | `2026-10-31T16:07:27Z` |
| Siste ende-til-ende-kall (live-test) | `2026-10-31T16:11:50Z` |
| `source.fetchedAt` i serien | Faktisk hentetid (ISO 8601), ikke SSBs `updated` |

Kontrakten har bare `fetchedAt`. SSBs `updated` er tilgjengelig som
`parseSsbPayload(...).updated`, men ikke i `IndicatorSeries`. Å eksponere den krever
en kontraktendring (DEC-004) og er ikke gjort.

## Kontroll mot SSB

Alle verdier er hentet fra SSB 31. oktober 2026. Kolonnen «Gjennomsnitt av
månedstall» er en **uavhengig kontroll** fra månedstabell 14700 (`KpiIndMnd`, `00`,
12 måneder). Adapteren bruker den ikke.

| År | Årstabell 14701 | Gjennomsnitt av månedstall 14700 | Merknad |
|---|---|---|---|
| 2000 | 54,8 | – | Første år (ikke månedskontrollert) |
| 2015 | 72,6 | – | Pinnet i nettverkstest |
| 2023 | 94,1 | 94,058 | Samsvarer |
| 2024 | 97,1 | 97,050 | Samsvarer (97,05 rundet) |
| **2025** | **100,0** | **100,000** | **Siste fullførte år.** Samsvarer, og 100 er basisåret |

Siste fullførte år er **2025**. Årsverdien for 2026 finnes ikke før året er ferdig
(månedstabellen går til 2026M09).

## Tester

- `pnpm test`: deterministiske tester mot fixturen
  `src/adapters/__fixtures__/ssb.cpiAnnualTotal.json` (SSBs uendrede respons, 5,4 kB),
  pluss syntetiske varianter som er merket som syntetiske i testene.
- `pnpm test:live`: nettverkstest mot ekte SSB, adskilt fra ordinære tester. I
  Claude Code-skymiljøet kreves proxy-støtte i Node:
  `NODE_USE_ENV_PROXY=1 pnpm test:live`.

## Kjente begrensninger

- Verdiene gjelder indeksvintage 2025=100 (COICOP 2018). Eldre publiserte verdier
  (2015=100) er ikke sammenlignbare nivå for nivå. Bytter SSB basisår igjen, feiler
  adapteren med `invalid` i stedet for å vise feil enhet.
- Serien har ingen manglende verdier i dag. `null` håndteres som hull, aldri som 0.
- Ingen caching og ingen backend: ett kall per `getIndicatorData`.
- CORS er verifisert via svarhodet (`access-control-allow-origin: *`), ikke i en
  nettleser. Ingen frontend-bruk er koblet inn.
