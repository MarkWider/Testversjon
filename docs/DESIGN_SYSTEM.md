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

## UX- og innholdsretning

### Referanser og egen retning

Norge i tall kombinerer:

- **USAFacts:** ro, struktur, tydelige temaområder og sterke redaksjonelle
  innganger.
- **Sverige i siffror:** store datavisualiseringer, grafen som sentralt innhold
  og redaksjonell presentasjon av data.
- **Norge i tall:** et mer premium nordisk designsystem, strengere
  informasjonshierarki og en tydelig redaksjonell stemme.

Referansene skal brukes som prinsipper, ikke kopieres som layouts eller
komponenter.

### Lite på skjermen, mye under overflaten

Første møte skal være luftig og enkelt. Brukeren skal raskt forstå:

1. hvilket tema siden handler om
2. hva som er viktigst å forstå
3. hvilken graf eller innsikt som bør sees først
4. hvor man kan gå videre

Kompleksitet kan ligge lenger ned på siden eller bak tydelig interaksjon. Unngå
at mange KPI-er, filtre, grafer og bokser konkurrerer samtidig.

### Temastruktur

Temaområdene er nettstedets hovedarkitektur. Foreløpige hovedtemaer:

- Befolkning
- Økonomi
- Offentlige finanser / statsbudsjett
- Arbeid
- Utdanning
- Helse
- Levekår
- Kriminalitet og trygghet
- Klima, energi og natur

Hierarkiet er:

**Tema → undertema → indikator / innsikt**

Eksempel for Økonomi:

- Verdiskaping
- Produktivitet
- Inflasjon og kjøpekraft
- Arbeidsmarked
- Handel
- BNP per innbygger

Brukeren skal alltid forstå hvor innholdet hører hjemme og hvordan man finner
tilbake. Temastrukturen er stabil selv om innholdet presenteres redaksjonelt.

### Temasider: oversikt og historier

En temaside er ikke en liste over indikatorer. Den skal først definere området
og spørsmålene siden forsøker å besvare, deretter gi noen få sterke innganger.

Eksempel:

> ## Økonomi
>
> **Hvordan utvikler norsk økonomi seg – og blir vi faktisk rikere?**
>
> Kort introduksjon som forklarer området og spørsmålene siden skal hjelpe
> brukeren å forstå.

Mulige innganger:

- **Blir Norge rikere?** BNP per innbygger og langsiktig økonomisk vekst.
- **Får folk bedre råd?** Lønninger, inflasjon og disponibel inntekt.
- **Hvor produktive er vi?** Verdi skapt per arbeidstime.
- **Hvor mange er i arbeid?** Sysselsetting, ledighet og arbeidstimer.

### Grafer som hovedinnhold

Grafen skal ofte være det første store visuelle elementet:

**Overskrift → kort forklaring → stor graf**

Som hovedregel:

- vis én tydelig hovedgraf om gangen
- gi grafen nok plass til at utviklingen kan forstås visuelt
- bruk få farger og lite grid/støy
- fremhev Norge tydelig
- bruk direkte etiketter når det er mer lesbart enn en legend
- marker siste tilgjengelige observasjon
- gjør kilde og definisjon lett tilgjengelig
- bruk interaktivitet for å skape forståelse, ikke som dekorasjon
- sørg for at standardvisningen allerede forteller en historie

### Interaktivitet er en kjernefunksjon

Grafene skal ikke være statiske illustrasjoner. Brukeren skal kunne undersøke
hvordan bildet endrer seg når sentrale forutsetninger eller visninger justeres.

Der det er relevant skal brukeren enkelt kunne:

- velge tidsperiode, eksempelvis 10 år, 25 år eller hele tilgjengelige perioden
- legge til eller fjerne sammenligningsland
- vise eller skjule politiske perioder
- se eksakte verdier og metadata ved hover eller tastaturfokus
- fremheve eller isolere en serie
- åpne underliggende data
- lese definisjon, metode og kilde
- laste ned data når datagrunnlaget er klart for det

Interaksjon skal gi umiddelbar og forståelig visuell respons. Valg skal ha tydelig
aktiv tilstand, og brukeren skal lett kunne gå tilbake til standardvisningen.

Interaksjonsregler:

- behold akser, enheter og kontekst når visningen endres
- unngå kontroller som endrer grafen uten at endringen er tydelig
- bruk progressive valg: vis de viktigste kontrollene først, legg avanserte valg
  bak «Flere valg» eller tilsvarende
- på mobil erstattes hover med trykk/fokus og store nok treffflater
- alle sentrale grafhandlinger skal kunne brukes med tastatur
- animasjon mellom tilstander skal hjelpe brukeren å forstå endringen, ikke
  forsinke arbeidet
- URL eller annen persistens for valgte visninger vurderes senere når deling blir
  en faktisk funksjon

### Graf og redaksjonell konklusjon

Leseren skal ikke måtte analysere grafen helt alene. Ved siden av eller under
grafen vises normalt:

> ### Hva viser dette?
>
> **Én kort konklusjon som uttrykker hovedfunnet.**
>
> To til fire setninger som skiller mellom hva tallene viser, sannsynlige
> forklaringer og reell usikkerhet.

Konklusjonen må enten være gyldig for standardvisningen eller oppdateres når
brukeren endrer grafen. En statisk tekst skal ikke motsi den aktive visningen.

### Redaksjonelle kort

Redaksjonelle kort skaper nysgjerrighet og leder til historier eller innsikter.
De består normalt av:

1. bilde eller datadrevet illustrasjon
2. kort kategori
3. interessant, forklarende overskrift
4. én kort teaser

Foretrekk:

> **Hvorfor blir Norge stadig eldre?**

fremfor:

> Alderssammensetning 1980–2050

Kortene skal være redaksjonelle innganger, ikke en alternativ KPI-matrise.

### Bilder

Bilder skal:

- ha et tydelig og enkelt motiv
- fungere som små thumbnails
- følge en konsekvent fotografisk stil
- harmonere med fargepaletten
- unngå generiske og tilfeldige stockbilder
- kunne få en svak, tematilpasset fargetone uten at motivet blir kunstig

En samling med ulike motiver skal fortsatt oppleves som én publikasjon.

### Datakort og nøkkeltall

Ikke gjør alle kort til KPI-kort. Et nøkkeltall bør normalt vise både nivå og
retning, eksempelvis:

- aktuell verdi
- liten sparkline
- endring over en relevant periode
- tydelig enhet og periode

Kontekst er viktigere enn antall KPI-er.

## Informasjonshierarki

| Nivå | Mål | Typisk innhold |
|---|---|---|
| 1 – Forstå på fem sekunder | Få hovedpoenget | Overskrift, hovedpoeng og hovedgraf |
| 2 – Forstå utviklingen | Se mønster og kontekst | Kort forklaring, sammenligning og få visualiseringer |
| 3 – Utforske | Undersøke alternative visninger | Land, perioder, regioner og relaterte indikatorer |
| 4 – Etterprøve | Kontrollere grunnlaget | Definisjon, metode, kilde, tabell og rådata |

En vanlig leser skal få verdi på nivå 1–2. Journalister, analytikere og særlig
interesserte skal kunne gå videre til nivå 3–4.

## BNP per innbygger: referanseside for første UX-runde

Den første BNP-siden skal demonstrere designprinsippene i liten skala.

### Foreslått rekkefølge

1. **Tittel:** BNP per innbygger
2. **Ingress:** Hvor mye økonomisk verdi skaper Norge per innbygger – og hvordan
   har det utviklet seg over tid?
3. **Stor interaktiv hovedgraf**
4. **Hva viser dette?** Kort konklusjon og kontekst
5. **Hvordan ligger Norge an mot andre land?** Sammenligningsvisning
6. **Hva driver utviklingen?** Bare dersom analysen og datagrunnlaget støtter det
7. **Relaterte historier:** to til fire redaksjonelle kort
8. **Om tallene:** definisjon, kilde, metode, sist oppdatert og dataadgang

### Kontroller ved hovedgrafen

- **Periode:** 10 år | 25 år | Hele tilgjengelige perioden
- **Sammenlign med:** Sverige | Danmark | senere OECD eller andre relevante land
- **Politisk kontekst:** Vis/skjul politiske perioder
- **Detaljer:** hover/fokus for eksakte verdier
- **Etterprøvbarhet:** kilde, definisjon og underliggende data

Årstall skal komme fra faktisk tilgjengelig datagrunnlag. Designskisser kan vise
målbildet, men produksjonsvisningen må ikke antyde data frem til et år kilden
ikke leverer. Dagens World Bank-pilot bruker 2015–2023 som standard, mens
tjenestelaget allerede støtter eksplisitte periodevalg.

Den første implementasjonen trenger ikke bygge hele temasiden eller alle fire
informasjonsnivåer. Den skal først bevise at én stor graf kan være både
redaksjonelt tydelig og reelt interaktiv på desktop og mobil.

## Komponent- og layoutregler

Et **design token** er en navngitt standardverdi for eksempelvis farge, avstand
eller radius. Tokens gjør at hele siden bruker samme visuelle regler, og at en
senere justering kan gjøres ett sted i stedet for i hver komponent.

### Grunnleggende tokens

- Avstandsskala: 4, 8, 12, 16, 24, 32, 48, 64 og 96 px.
- Maksimal innholdsbredde: omtrent 1280 px.
- Maksimal bredde for lange tekstlinjer: omtrent 720–760 px.
- Hovedgraf kan bruke opptil omtrent 1120 px når skjermen tillater det.
- Standard kort-radius: 8 px; små elementer: 4 px.
- Pilleform brukes bare når funksjonen krever det, eksempelvis segmenterte valg.
- Kanter er tynne og dempede. Skygger brukes svært sparsomt.
- Luft og bakgrunnsskift skal normalt skille seksjoner før rammer og skygger.

Eksakte CSS-variabler etableres av frontend-eier i implementeringen, men skal
følge denne begrensede skalaen.

### Komponentprinsipper

- **Header:** rolig, lav visuell høyde, tydelig logo og få primærvalg.
- **Ingress:** begrenset tekstbredde og klar sammenheng med hovedgrafen.
- **Grafkontroller:** plasseres nær grafen, grupperes etter funksjon og viser
  aktiv tilstand tydelig.
- **Segmenterte periodevalg:** 10 år, 25 år og hele perioden; én aktiv om gangen.
- **Landvalg:** enkle av/på-valg med både navn og visuell status.
- **Kilde-/metodepanel:** progressivt tilgjengelig uten å dominere hovedhistorien.
- **Redaksjonelle kort:** bilde, kategori, overskrift og kort teaser; hele kortet
  kan aktiveres, men får tydelig fokusmarkering.
- **«Hva viser dette?»** er en egen rolig tekstblokk, ikke et varselkort.
- **Feiltilstand:** forklar kort hva som skjedde og gi en tydelig ny
  forsøksmulighet.
- **Loading:** reserver grafens plass slik at siden ikke hopper når data lastes.

## Responsivt design

Layouten skal tilpasse seg innholdet, ikke bestemte telefonmodeller.

- Desktop kan bruke bred graf og eventuelt tekst ved siden av når leseretningen
  forblir tydelig.
- På smalere skjermer stables overskrift, kontroller, graf og forklaring.
- Grafkontroller kan brytes over flere linjer eller samles i et enkelt panel.
- Ingen side eller graf skal få horisontal overflow.
- Grafens plot-område skal prioriteres fremfor dekorasjon og lange etiketter.
- Direkte etiketter kan erstattes eller forkortes på mobil dersom alternativet
  er overlapp.
- Hover-funksjoner skal ha tilsvarende trykk- og tastaturadferd.
- Berøringsmål skal være minst 44 × 44 px der det er praktisk mulig.
- Viktigste konklusjon og graf skal komme før sekundære kontroller på mobil.
- Kontroller og tekst skal testes minst rundt 390 px, 768 px og 1440 px bredde,
  men skal også fungere mellom disse målene.

## Tilgjengelighet

Første UX-runde skal følge WCAG 2.2 AA som praktisk mål.

- All sentral funksjonalitet kan brukes med tastatur.
- Fokusmarkering er tydelig og har tilstrekkelig kontrast.
- Farge er aldri eneste informasjonsbærer.
- Tekst og UI møter krav til kontrast.
- Grafen har en meningsfull tekstlig beskrivelse og tilgjengelig datalternativ.
- Tooltip-informasjon kan nås med tastaturfokus og trykk, ikke bare mus.
- Statusendringer som loading og feil kommuniseres til hjelpemidler.
- Bevegelse respekterer `prefers-reduced-motion`.
- Zoom og større tekst skal ikke ødelegge hovedinnhold eller kontroller.
- Kilder og metode skal være lesbare, ikke gjemmes i svært liten skrift.

## Første UX-sprint

### Mål

Bevise at én side kan kombinere redaksjonell klarhet, premium nordisk uttrykk og
reell datautforskning uten dashboard-følelse.

### In scope

- visuell omarbeiding av eksisterende BNP-side
- Newsreader × Inter
- design tokens basert på dokumentets palett og avstandsskala
- tydelig overskrift og ingress
- én stor interaktiv hovedgraf
- periodevalg: 10 år, 25 år og hele tilgjengelige perioden
- vise/skjule Sverige og Danmark
- hover, trykk og tastaturfokus med eksakte verdier
- tydelig markering av siste observasjon
- dynamisk eller visningsnøytral «Hva viser dette?»-tekst som ikke motsier
  aktive grafvalg
- kilde, definisjon, metode og sist oppdatert
- loading- og feiltilstander
- desktop- og mobiltilpasning
- relevante komponent- og interaksjonstester

### Out of scope

- full forside eller komplett temaside
- politiske perioder i grafen
- nye datakilder eller indikatorer
- avansert landvelger utover Norge, Sverige og Danmark
- redaksjonelle artikkelkort med produksjonsbilder
- innlogging, lagring, deling eller URL-persistens
- nedlasting dersom det krever nytt dataformat eller backend
- registry, resolver, caching, database eller annen infrastruktur

Politiske perioder er en egen etterfølgende oppgave. Data / Platform Engineer
skal først etablere et kontrollert datasett og en enkel kontrakt; frontend skal
ikke hardkode tilfeldig politisk historikk.

### Akseptansekriterier

- Standardvisningen er forståelig uten at brukeren gjør noe.
- Alle grafvalg gir umiddelbar og tydelig respons.
- Brukeren kan endre periode og sammenligningsland uten sideoppdatering.
- Grafen og kontrollene fungerer med mus, tastatur og trykk.
- Ingen horisontal overflow ved omtrent 390 px.
- Siden fungerer visuelt ved omtrent 390, 768 og 1440 px.
- Kilde, definisjon, metode og oppdateringsdato er tilgjengelig.
- Ekte World Bank-data brukes gjennom eksisterende `getIndicatorData`.
- Ingen frontendkode importerer adapter- eller datamoduler direkte.
- Eksisterende tester består, og nye interaksjoner har relevante tester.
- Produksjonsbuild består uten nye ikke-dokumenterte advarsler.
- Browser console er fri for feil i normal bruk.

## Åpne deler

Følgende kan konkretiseres gjennom implementering og review uten ny eierbeslutning:

- endelige CSS-tokennavn og små størrelsesjusteringer
- presise animasjonskurver og varigheter
- detaljer i grafetiketter ved svært smale bredder
