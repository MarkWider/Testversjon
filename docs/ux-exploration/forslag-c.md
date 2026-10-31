# Forslag C: visuelt datamagasin

Referanse: Human Owners forslag 12, «Visuelt datamagasin × Nordisk minimalisme –
fargerik variant». Landskapsbilde, myk overgang til varm hvit, Newsreader/Inter,
marineblå tekst og temafarger følger referansens retning.

Åpne `/ux-exploration/index.html`. Bruk hele filstien: en mappeadresse kan bli
tolket som en rute til pilotappen. C er standard også uten URL-parametere og før JavaScript
starter. A og B beholdes i bryteren øverst. CSS og JavaScript har en versjonsnøkkel
slik at nettleseren ikke gjenbruker den gamle A/B-velgeren ved oppdatering.
Historiekortene er foreslåtte innganger, ikke ferdige artikler. Nøkkeltallstripen
bruker streker i stedet for oppdiktede tall. Ingen nye dataintegrasjoner.

## Bilder

Generert med det innebygde bildeverktøyet. Alle er AI-genererte
illustrasjonsbilder, ikke dokumentasjon av bestemte steder eller personer.
Prosjektfilene ligger i `public/ux-exploration/images/` som JPEG.

Felles promptretning: «Sophisticated Nordic editorial photography, soft warm
diffused daylight, restrained natural colours, navy shadows and ivory highlights,
realistic textures. No text, logos, chart or watermark.» Motivspesifikasjoner:

- `hero.jpg`: panoramisk norsk fjord, øyer, skog og fjell i morgenlys; rolig
  dis på venstre side til tekst, landskap mest mot høyre.
- `people.jpg`: to generasjoner sett bakfra på tur ved en norsk fjord.
- `homes.jpg`: moderne norsk boligbygg med tre, stein, balkonger og bjørketrær.
- `economy.jpg`: norsk samtidsarkitektur i lys stein ved vannet.
- `climate.jpg`: norsk bre ved blågrønt vann, blå is og fjell.

Kortbildene ble generert i stående format og landskapet i liggende format.
PNG-originalene ble konvertert til JPEG til bruk på nettet.

## Avgrensning

Arbeidet er isolert til UX-utforskningen og tilhørende skjermbilder. Issue #20,
pilotkomponenter, datalag og kontrakt er ikke endret. Eksisterende privat Sites-
forhåndsvisning oppdateres; ingen ny hosting eller utvidet tilgang etableres.

## Inngang til publisert forhåndsvisning

`node scripts/package-ux-preview.mjs <eksisterende Sites-checkout>` kjøres etter
`pnpm build`. Den kopierer bygget og gjør bare i hostingartefakten hovedadressen
til en inngang til UX-forslagene, med C valgt. Pilotappen beholdes på `/pilot/index.html`,
og pilotlenkene tilpasses. Lokal utvikling og vanlig produksjonsbygg er uendret.

## Kontroll etter tilbakemelding på delt lenke

Hovedadressen viste fortsatt pilotappen, og UX-siden valgte A uten et eksplisitt
URL-valg. Rettelsen gjør C til standard og hovedadressen til en inngang til C.
Publisert HTML bekrefter standard C og nye ressursversjoner. Alle fem publiserte
JPEG-filer, `app.js` og `magazine.css` er kontrollert med HTTP 200 og identiske
SHA-256-hasher mot prosjektfilene. Den pakkede inngangen er kontrollert i lokal
nettleser på desktop og mobil; alle fem bilder lastes, uten horisontal overflyt
eller konsollfeil. A og B kan fortsatt velges. 190 tester og build bestått.
Innlogging i den private siden er ikke visuelt verifisert i agentens nettleser.
