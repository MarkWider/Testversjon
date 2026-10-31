# Norge i tall - Agent Pilot

En liten React-applikasjon og samarbeids-pilot for AI-basert produktutvikling. Den visualiserer BNP per innbygger for Norge, Sverige og Danmark med lokalt eksempeldata.

> Tallene i appen er eksempeldata og er ikke offisiell statistikk.

## Kom i gang

Krever Node.js 20 eller nyere.

```bash
pnpm install
pnpm dev
```

Kjør tester og produksjonsbygg:

```bash
pnpm test
pnpm build
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

`main` er siste godkjente versjon. Codex implementerer på `codex/<task>`, Claude Code på `claude/<task>`, og ChatGPT Work på `work/<task>`. Rene reviews uten filendringer rapporteres i PR-en og trenger ingen egen branch. Se [AGENTS.md](AGENTS.md) og [arbeidsmodellen](docs/WORKING_MODEL.md) for oppgaver og overlevering.
