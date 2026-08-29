# Norge i tall - Agent Pilot

En liten React-applikasjon og samarbeids-pilot for AI-basert produktutvikling. Den visualiserer BNP per innbygger for Norge, Sverige og Danmark med lokalt eksempeldata.

> Tallene i appen er eksempeldata og er ikke offisiell statistikk.

## Kom i gang

Krever Node.js 20 eller nyere.

```bash
npm install
npm run dev
```

Kjor tester og produksjonsbygg:

```bash
npm test
npm run build
```

## Stack

- React + TypeScript + Vite
- Apache ECharts for visualisering
- Vitest for en liten datasjekk

## Struktur

```text
src/
  components/      ECharts-komponenter
  data/            Lokale eksempeldata og fremtidig dataadapter-grense
docs/              Arkitektur, beslutninger og prosjektstatus
AGENTS.md          Agentkontrakt og Git-regler
```

## Samarbeid

`main` er siste godkjente versjon. Implementasjon skjer på `codex/<task>`, og reviewarbeid på `claude/<task>`. Se [AGENTS.md](AGENTS.md) for full arbeidsflyt.
