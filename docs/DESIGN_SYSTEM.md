# Design foundation

Dette er det levende designgrunnlaget for Norge i tall. Dokumentet beskriver
visuell retning, fargebruk, typografi og redaksjonell stemme. Det skal senere
utvides med komponentregler og sidestruktur før frontend implementeres.

## Hovedretning

**Premium datajournalistikk × nordisk minimalisme**

Retningen kombinerer redaksjonell tyngde med en ren, skandinavisk
premiumfølelse. Produktet skal oppleves seriøst og tillitsvekkende, men også
moderne, visuelt engasjerende og tilgjengelig for et bredt publikum.

Designet skal prioritere:

- tydelig kobling mellom graf, forklaring og kontekst
- mye luft og et rolig visuelt hierarki
- sterke redaksjonelle innganger fremfor et tett dashboard
- få, tydelige interaksjoner
- data som hovedinnhold, ikke dekorasjon
- gjenbrukbare regler som kan skaleres til mange temaer

Designet skal unngå:

- for mange KPI-kort og portalpreg
- teknisk dashboard-estetikk som førstegangsopplevelse
- dekorasjon som konkurrerer med dataene
- overdrevet dramatikk eller digitalt «tech»-uttrykk
- så mye minimalisme at innganger og oppdagelseslyst forsvinner

Nordisk minimalisme er fundamentet. Premium datajournalistikk tilfører
redaksjonell autoritet, forklaring og et tydeligere forhold mellom tekst og
visualisering.

## Fargesystem

### Merkevare og grensesnitt

| Rolle | Navn | Kode | Primær bruk |
|---|---|---:|---|
| Primær mørk | Midnattsblå | `#102A43` | Logo, hovedoverskrifter og viktige datalinjer |
| Sekundær mørk | Dyp marineblå | `#103B5C` | Navigasjon, grafserier og interaktive elementer |
| Aksent | Norsk aksentrød | `#C83D4B` | Utvalgte markører, viktige innganger og små høydepunkter |
| Interaktiv blå | Fjordblå | `#2789B8` | Lenker, hover og sekundære handlinger |
| Lys blå | Isblå | `#B8DDEB` | Rolige flater, bakgrunner og sekundære dataserier |
| Hovedbakgrunn | Snøhvit | `#F7F8F5` | Dominerende sidebakgrunn |
| Sekundær bakgrunn | Varm stein | `#E7E3DC` | Kort, seksjoner og visuell separasjon |
| Brødtekst | Kullgrå | `#20262D` | Løpende tekst |
| Sekundær tekst | Tåkegrå | `#6F7B84` | Metadata, akser, kilder og forklaringer |

Den varme snøhvite bakgrunnen er et viktig grep. Den skal gjøre uttrykket mer
redaksjonelt og mindre sterilt enn ren hvit.

### Datapalett

| Navn | Kode |
|---|---:|
| Havblå | `#277DA1` |
| Fjordturkis | `#2A9D8F` |
| Mosegrønn | `#668C5A` |
| Oker | `#D4A72C` |
| Varm korall | `#E76F51` |
| Dempet rød-lilla | `#B55372` |
| Fjellfiolett | `#7566A8` |
| Skiferblå | `#607D8B` |

### Kontrastsett

| Sett | Farger | Anbefalt bruk |
|---|---|---|
| Blå–korall | `#247BA0`, `#E9ECEF`, `#D95D52` | Tydelig kontrast mellom to sider eller kategorier |
| Turkis–oker | `#258F85`, `#ECE8DF`, `#C98B2E` | Varmere sammenligninger uten politiske blå/røde signaler |
| Fiolett–grønn | `#7566A8`, `#ECEBF0`, `#668C5A` | Alternative kategorier og ikke-politiske motsetninger |

### Kartskalaer

Sekvensiell blå skala, lav til høy:

`#E8F2F6` → `#C5E1EB` → `#8FC6D8` → `#4D9ABB` →
`#17698C` → `#103F5C`

Divergerende skala, negativ via nøytral til positiv:

`#B43A44` → `#D96A6F` → `#F1B5B3` → `#EEEDE8` →
`#ACD6E1` → `#559CBC` → `#17698C`

### Regler for fargebruk

- Midnattsblå eller marineblå brukes normalt for Norge eller hovedserien.
- Sammenligningsland og kategorier bruker datapaletten.
- Rødt brukes sparsomt som aksent og betyr ikke automatisk «negativt».
- Rødt og blått brukes ikke som generell politisk partikoding.
- Politiske visninger må ha eksplisitt, konsekvent og dokumentert fargelogikk.
- Samme farge skal bety det samme innenfor én visualisering.
- Farge skal aldri være eneste informasjonsbærer; bruk også etiketter,
  linjestiler, symboler eller mønstre.
- Kart bruker de definerte skalaene fremfor tilfeldige kategori- eller
  merkevarefarger.
- Kontrast og lesbarhet skal fungere på både lys skjerm og mobil.

## Typografi

### Prinsipp

Bruk en kombinasjon av redaksjonell serif og moderne sans-serif:

- **Newsreader** for store overskrifter og redaksjonelle statements.
- **Inter** for brødtekst, navigasjon, grafer, tall og øvrig UI.

Newsreader gir sentrale budskap redaksjonell tyngde og personlighet. Inter holder
grensesnittet rent, nordisk og svært lesbart. Sammen skal de gjøre produktet mer
til en moderne datapublikasjon enn et offentlig dashboard.

Uttrykket skal ha redaksjonell autoritet, men være visuelt lettere, renere og mer
nordisk enn en tradisjonell nyhetspublikasjon. Tallene og innholdet er
hovedpersonen; typografien gir struktur og karakter uten å dominere.

### Hierarki

| Element | Skrift | Vekt | Retning |
|---|---|---|---|
| Store side- og historieoverskrifter | Newsreader | Medium eller semibold | Tydelig redaksjonell inngang med god luft |
| Redaksjonelle statements | Newsreader | Medium eller semibold | Korte, meningsbærende formuleringer |
| Seksjonsoverskrifter | Inter som standard; Newsreader når overskriften er redaksjonell | Semibold | Funksjonell eller redaksjonell etter innhold |
| Brødtekst | Inter | Regular | Rolig, lesbar og relativt korte linjer |
| Nøkkeltall | Inter | Medium eller semibold | Store, rene tall uten unødvendig dekorasjon |
| Grafetiketter og akser | Inter | Regular eller medium | Kompakt og tydelig |
| Navigasjon, knapper og filtre | Inter | Medium | Funksjonell og konsistent |
| Kilder og metadata | Inter | Regular | Sekundær, men fortsatt lett å lese |
| Små labels og kategorier | Inter | Medium | Moderat økt bokstavavstand |

### Regler

- Bruk få fontvekter og et begrenset antall størrelser.
- Newsreader brukes selektivt; den skal signalisere redaksjonell betydning, ikke
  dekorere alle overskrifter.
- Inter er standardskriften for all funksjonell informasjon og alle tall.
- Unngå svært tynn tekst, særlig på mobil og i grafer.
- Bruk luft, linjehøyde og plassering til å skape hierarki før flere størrelser
  eller vekter introduseres.
- Brødtekst skal ha en behagelig maksimal linjelengde og ikke strekkes over hele
  brede skjermer.
- Nøkkeltall skal bruke tabellariske sifre når sammenstilling eller justering
  krever det.
- Graftekst og kilder skal ikke bli så små at premiumfølelsen oppnås på
  bekostning av lesbarhet.
- Fontinnlasting skal ikke blokkere forståelig visning; definer egnede
  fallback-fonter for både serif og sans-serif.

## Redaksjonell stemme

### Analytisk klarhet med redaksjonell tyngde

Teksten skal være intelligent uten å være akademisk, tydelig uten å bli banal,
og selvsikker uten å bli skråsikker. Ambisjonen er redaksjonell klarhet med en
direkte og resonnerende form.

Skriv som en svært kunnskapsrik person som forsøker å forklare saken ærlig til en
intelligent venn — ikke som en forskningsrapport, politisk kommentar eller
offentlig informasjonsbrosjyre.

### Prinsipper

Teksten skal:

- begynne med det viktigste funnet
- bruke enkle, presise ord og relativt korte setninger
- skille mellom observasjon, forklaring og vurdering
- forklare sannsynlige drivere uten å presentere dem som sikre årsaker
- synliggjøre reell usikkerhet og relevante alternative forklaringer
- være tydelig når tallene gir en robust konklusjon
- gi nødvendig kontekst uten å drukne leseren i forbehold
- la leseren danne sin egen vurdering
- kunne bruke tørr eleganse eller understatement, men aldri dramatikk

Teksten skal ikke:

- bli akademisk, byråkratisk eller unødvendig teknisk
- bruke dramatikk for å skape interesse
- moralisere eller fortelle leseren hva vedkommende bør mene
- skjule usikkerhet bak skråsikre formuleringer
- gjemme tydelige funn bak overdreven balansering
- bruke politiske eller verdiladede merkelapper uten analytisk behov
- forveksle korrelasjon med årsak

### Struktur for datatekster

| Del | Spørsmål teksten besvarer |
|---|---|
| Hovedfunn | Hva viser tallene? |
| Betydning | Hvorfor er utviklingen relevant? |
| Mulig forklaring | Hva ligger sannsynligvis bak? |
| Forbehold | Hva kan tallene ikke alene fortelle oss? |
| Sammenligning | Er utviklingen særnorsk eller del av et bredere mønster? |

Ikke alle tekster trenger alle fem delene. En kort grafkommentar kan stoppe etter
hovedfunn og et vesentlig forbehold.

### Eksempel

Unngå generelle formuleringer som:

> BNP per innbygger har utviklet seg positivt i Norge. Norge ligger fortsatt på
> et høyt nivå sammenlignet med våre naboland.

Foretrekk en formulering som forklarer både funnet og målets begrensning:

> Norge har klart høyest BNP per innbygger av de tre landene. Noe av forskjellen
> skyldes petroleumsinntektene og valutakursen, ikke bare høyere produktivitet i
> resten av økonomien. Målt i løpende dollar kan dessuten kronebevegelser gi
> store utslag fra ett år til det neste.

### Hvor stemmen brukes

Den redaksjonelle stemmen brukes i:

- analytiske overskrifter
- ingresser og grafintroduksjoner
- forklaring av utviklingen
- korte funn og annotasjoner
- metodiske forbehold
- sammenligninger mellom land og perioder

Navigasjon, knapper, filtre, kildehenvisninger og feilmeldinger skal være enda
enklere og mer funksjonelle, uten redaksjonell stilisering.

## Åpne deler

Følgende legges til før dokumentet brukes som komplett implementeringsgrunnlag:

- innholdshierarki og sidestruktur
- komponentregler
- graf- og interaksjonsdetaljer
- responsive regler
- tilgjengelighetskrav
