// Statistics Norway (SSB) adapter.
//
// Translates SSB's PxWebApi v2 (JSON-stat2) into our internal `IndicatorSeries`
// contract. After this module, nothing else in the app needs to know how the
// SSB API is shaped.
//
//   API:   https://data.ssb.no/api/pxwebapi/v2  (docs: https://www.ssb.no/api/pxwebapiv2)
//   Auth:  none (no API key)
//   CORS:  `access-control-allow-origin: *` (verified 2026-10-31)
//   Limit: 40 calls per 60 s per client (`x-ratelimit-*` headers)
//   Body:  JSON-stat 2.0 dataset — see SsbDataset below
//
// First indicator: `cpi_annual_total` = the official ANNUAL AVERAGE consumer
// price index (KPI), total index ("I alt"), Norway, from table 14701
// (2025=100). Table 14700 is the MONTHLY twin and is deliberately not used:
// the annual series is published by SSB and is not derived here from months.
//
// Index LEVEL only. Year-on-year percentage change ("Aarsendring") is a
// different measure and is never mixed into this series.

import type {
  GetIndicatorOptions,
  IndicatorId,
  IndicatorPoint,
  IndicatorSeries,
  IndicatorUnit,
  RegionMeta,
} from '../contracts/indicator'
import { validateIndicatorSeries } from '../contracts/validate'
import { withinPeriodRange, sortPointsByPeriodThenRegion } from '../data/period'
import type { IndicatorSource } from '../data/source'
// Same layering note as worldBank.ts: IndicatorError lives in the service module.
import { IndicatorError } from '../services/indicators'

const SSB_API = 'https://data.ssb.no/api/pxwebapi/v2'
const SOURCE_ID = 'ssb'
const SOURCE_LABEL = 'Statistisk sentralbyrå'

/** SSB dimension ids used by the KPI tables. */
const DIM_GROUP = 'VareTjenesteGrp'
const DIM_CONTENTS = 'ContentsCode'
const DIM_TIME = 'Tid'

interface SsbIndicatorSpec {
  /** SSB table id, e.g. "14701". */
  tableId: string
  /** Value of the ContentsCode dimension, e.g. "KpiAar" (index level). */
  contentsCode: string
  /** Value of the VareTjenesteGrp dimension, e.g. "00" ("I alt"). */
  groupCode: string
  /** Base period SSB must report for the contents code; guards the unit label. */
  basePeriod: string
  /** Regex a period code must match (annual: four digits). */
  periodPattern: RegExp
  title: string
  subtitle?: string
  unit: IndicatorUnit
}

/** Our IndicatorId -> SSB table/selection + how to present it. */
export const SSB_INDICATORS: Record<string, SsbIndicatorSpec> = {
  cpi_annual_total: {
    tableId: '14701',
    contentsCode: 'KpiAar',
    groupCode: '00',
    basePeriod: '2025',
    periodPattern: /^\d{4}$/,
    title: 'Konsumprisindeks (KPI), totalindeks',
    subtitle: 'Årsgjennomsnitt, indeksnivå',
    unit: { code: 'Indeks (2025=100)', display: 'number', decimals: 1 },
  },
}

/** The single region this adapter serves. Table 14701 is national only. */
const NORWAY: RegionMeta = { code: 'NO', name: 'Norge' }
const REGION_ORDER = [NORWAY.code]

// --- JSON-stat2 shapes -------------------------------------------------------

interface SsbCategory {
  /** Category codes in positional order (JSON-stat allows array or code->position). */
  codes: string[]
  /** Extension block of the dimension (refperiod, basePeriod, ...). */
  extension: Record<string, unknown>
}

export interface SsbDataset {
  /** Dimension ids in storage order. Value index = row-major over this order. */
  ids: string[]
  sizes: number[]
  dimensions: Record<string, SsbCategory>
  values: Array<number | null>
  /** SSB's own "table last updated" timestamp (ISO 8601), if present. */
  updated?: string
}

export interface SsbDeps {
  /** Fetch and JSON-parse a URL. Injectable so unit tests stay offline. */
  fetchJson?: (url: string) => Promise<unknown>
  /** Clock for `source.fetchedAt`. Injectable so tests are deterministic. */
  now?: () => Date
}

// --- pure: parse + validate the raw envelope ---------------------------------

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function invalid(message: string): IndicatorError {
  return new IndicatorError('invalid', message)
}

function parseCategory(dimId: string, raw: unknown): SsbCategory {
  if (!isObject(raw) || !isObject(raw.category)) {
    throw invalid(`SSB-dimensjonen «${dimId}» mangler category.`)
  }
  const index = raw.category.index
  let codes: string[]
  if (Array.isArray(index)) {
    codes = index.map(String)
  } else if (isObject(index)) {
    // code -> position. Order by position so sorting never depends on key order.
    codes = Object.entries(index)
      .sort(([, a], [, b]) => Number(a) - Number(b))
      .map(([code]) => code)
  } else {
    throw invalid(`SSB-dimensjonen «${dimId}» mangler category.index.`)
  }
  return { codes, extension: isObject(raw.extension) ? raw.extension : {} }
}

/**
 * Turn an unknown SSB JSON body into a typed {@link SsbDataset}.
 * Throws {@link IndicatorError} `invalid` on anything that is not a JSON-stat2
 * dataset with a consistent size/value layout, and `not_found` on an SSB error
 * body (`{ status, title, ... }`).
 */
export function parseSsbPayload(payload: unknown): SsbDataset {
  if (!isObject(payload)) {
    throw invalid('SSB-svaret er ikke et objekt.')
  }

  // PxWebApi v2 error bodies are problem-details objects (no `class`).
  if (payload.class === undefined && typeof payload.status === 'number') {
    const text = typeof payload.title === 'string' ? payload.title : 'ukjent feil'
    throw new IndicatorError(
      payload.status === 404 ? 'not_found' : 'source_unavailable',
      `SSB avviste forespørselen (${payload.status}): ${text}`,
    )
  }
  if (payload.class !== 'dataset') {
    throw invalid('SSB-svaret er ikke et JSON-stat2-datasett.')
  }

  const ids = payload.id
  const sizes = payload.size
  if (!Array.isArray(ids) || ids.some((x) => typeof x !== 'string') || ids.length === 0) {
    throw invalid('SSB-datasettet mangler gyldig id-liste.')
  }
  if (
    !Array.isArray(sizes) ||
    sizes.length !== ids.length ||
    sizes.some((n) => !Number.isInteger(n) || (n as number) < 0)
  ) {
    throw invalid('SSB-datasettets size passer ikke til id-listen.')
  }
  if (!isObject(payload.dimension)) {
    throw invalid('SSB-datasettet mangler dimension.')
  }

  const dimensions: Record<string, SsbCategory> = {}
  ids.forEach((dimId, i) => {
    const cat = parseCategory(dimId as string, (payload.dimension as Record<string, unknown>)[dimId as string])
    if (cat.codes.length !== sizes[i]) {
      throw invalid(`SSB-dimensjonen «${dimId}» har ${cat.codes.length} kategorier, men size sier ${sizes[i]}.`)
    }
    dimensions[dimId as string] = cat
  })

  const expectedCells = (sizes as number[]).reduce((a, b) => a * b, 1)
  if (!Array.isArray(payload.value) || payload.value.length !== expectedCells) {
    throw invalid(`SSB-datasettet har ${Array.isArray(payload.value) ? payload.value.length : 'ingen'} verdier, forventet ${expectedCells}.`)
  }
  const values = payload.value.map((v, i) => {
    // Missing data stays null. It is never coerced to 0.
    if (v === null) return null
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      throw invalid(`SSB-verdi ${i} er verken tall eller null.`)
    }
    return v
  })

  let updated: string | undefined
  if (payload.updated !== undefined) {
    if (typeof payload.updated !== 'string' || Number.isNaN(Date.parse(payload.updated))) {
      throw invalid('SSB-datasettets updated er ikke et gyldig tidsstempel.')
    }
    updated = payload.updated
  }

  return {
    ids: ids as string[],
    sizes: sizes as number[],
    dimensions,
    values,
    ...(updated ? { updated } : {}),
  }
}

// --- pure: normalise into the contract --------------------------------------

/** Read `extension[key][code]` as a string, or undefined. */
function extString(ext: Record<string, unknown>, key: string, code: string): string | undefined {
  const block = ext[key]
  if (!isObject(block)) return undefined
  const v = block[code]
  return typeof v === 'string' ? v : undefined
}

/**
 * Map a parsed SSB dataset onto an {@link IndicatorSeries}. Cells are located by
 * DIMENSION ID, never by assumed position, so a reordered `id` list still maps
 * correctly. `null` values are kept as contract gaps. Points are returned sorted
 * by period ascending. `fetchedAt` is the actual retrieval time.
 */
export function normalizeSsb(
  dataset: SsbDataset,
  indicatorId: IndicatorId,
  fetchedAt: string,
): IndicatorSeries {
  const spec = SSB_INDICATORS[indicatorId]
  if (!spec) {
    throw new IndicatorError(
      'not_found',
      `SSB-adapteren kjenner ikke indikatoren «${indicatorId}».`,
    )
  }

  for (const dim of [DIM_GROUP, DIM_CONTENTS, DIM_TIME]) {
    if (!(dim in dataset.dimensions)) {
      throw invalid(`SSB-datasettet mangler dimensjonen «${dim}».`)
    }
  }

  const contents = dataset.dimensions[DIM_CONTENTS]
  const group = dataset.dimensions[DIM_GROUP]
  const time = dataset.dimensions[DIM_TIME]
  const contentsPos = contents.codes.indexOf(spec.contentsCode)
  const groupPos = group.codes.indexOf(spec.groupCode)
  if (contentsPos < 0) {
    throw invalid(`SSB-datasettet har ikke statistikkvariabelen «${spec.contentsCode}».`)
  }
  if (groupPos < 0) {
    throw invalid(`SSB-datasettet har ikke vare- og tjenestegruppen «${spec.groupCode}».`)
  }

  // Guard the hard-coded presentation: fail loudly if SSB changes the base
  // year or the time definition instead of silently mislabelling the series.
  const basePeriod = extString(contents.extension, 'basePeriod', spec.contentsCode)
  if (basePeriod !== spec.basePeriod) {
    throw invalid(
      `SSB-basisåret er «${basePeriod ?? 'ukjent'}», forventet «${spec.basePeriod}». Enhetsmerkingen må oppdateres.`,
    )
  }
  const measuring = extString(contents.extension, 'measuringType', spec.contentsCode)
  if (measuring !== 'Average') {
    throw invalid(`SSB-målingstypen er «${measuring ?? 'ukjent'}», forventet «Average» (årsgjennomsnitt).`)
  }

  // Row-major strides over the storage order given by `id`.
  const strides = new Array<number>(dataset.ids.length).fill(1)
  for (let i = dataset.ids.length - 2; i >= 0; i -= 1) {
    strides[i] = strides[i + 1] * dataset.sizes[i + 1]
  }
  const stride = (dim: string) => strides[dataset.ids.indexOf(dim)]
  const base = contentsPos * stride(DIM_CONTENTS) + groupPos * stride(DIM_GROUP)

  const points: IndicatorPoint[] = time.codes.map((period, timePos) => {
    if (!spec.periodPattern.test(period)) {
      throw invalid(`SSB-perioden «${period}» er ikke et årstall.`)
    }
    return {
      region: NORWAY.code,
      period,
      value: dataset.values[base + timePos * stride(DIM_TIME)],
    }
  })

  if (points.length === 0) {
    throw new IndicatorError('not_found', `SSB returnerte ingen observasjoner for «${indicatorId}».`)
  }

  return {
    indicator: indicatorId,
    title: spec.title,
    ...(spec.subtitle ? { subtitle: spec.subtitle } : {}),
    unit: { ...spec.unit },
    source: {
      id: SOURCE_ID,
      label: `${SOURCE_LABEL}, tabell ${spec.tableId}`,
      official: true,
      // Actual retrieval time. SSB's own table-update time is on
      // `SsbDataset.updated` and is documented, not part of the contract.
      fetchedAt,
    },
    regions: [{ ...NORWAY }],
    points: sortPointsByPeriodThenRegion(points, REGION_ORDER),
  }
}

// --- fetch orchestration ---------------------------------------------------

/** Build the data URL: one table, one contents code, one group, all periods. */
export function buildSsbUrl(spec: SsbIndicatorSpec): string {
  const params = new URLSearchParams({
    lang: 'no',
    outputFormat: 'json-stat2',
  })
  params.set(`valuecodes[${DIM_CONTENTS}]`, spec.contentsCode)
  params.set(`valuecodes[${DIM_GROUP}]`, spec.groupCode)
  // All periods; the period window is applied client-side so the request is
  // identical whatever from/to a caller passes (one cacheable, tiny call).
  params.set(`valuecodes[${DIM_TIME}]`, '*')
  return `${SSB_API}/tables/${spec.tableId}/data?${params.toString()}`
}

async function defaultFetchJson(url: string): Promise<unknown> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new IndicatorError(
      res.status === 404 ? 'not_found' : 'source_unavailable',
      `SSB svarte HTTP ${res.status}.`,
    )
  }
  return res.json() as Promise<unknown>
}

/**
 * Fetch one SSB indicator and return it as a validated, sorted
 * {@link IndicatorSeries}.
 *
 * Rejects with {@link IndicatorError}: `not_found` (unknown indicator / no data),
 * `source_unavailable` (network / HTTP failure), `invalid` (unexpected body, a
 * changed base year/definition, or a result that violates the contract).
 */
export async function fetchSsbSeries(
  indicatorId: IndicatorId,
  options?: GetIndicatorOptions,
  deps?: SsbDeps,
): Promise<IndicatorSeries> {
  const spec = SSB_INDICATORS[indicatorId]
  if (!spec) {
    throw new IndicatorError(
      'not_found',
      `SSB-adapteren kjenner ikke indikatoren «${indicatorId}».`,
    )
  }
  if (options?.regions && options.regions.length > 0 && !options.regions.includes(NORWAY.code)) {
    throw new IndicatorError('invalid', 'SSB-indikatoren dekker bare Norge (NO).')
  }

  const fetchJson = deps?.fetchJson ?? defaultFetchJson
  const now = deps?.now ?? (() => new Date())

  let body: unknown
  try {
    body = await fetchJson(buildSsbUrl(spec))
  } catch (err) {
    if (err instanceof IndicatorError) throw err
    throw new IndicatorError(
      'source_unavailable',
      `SSB-henting feilet: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
  const fetchedAt = now().toISOString()

  let series = normalizeSsb(parseSsbPayload(body), indicatorId, fetchedAt)

  if (options?.from !== undefined || options?.to !== undefined) {
    series = {
      ...series,
      points: series.points.filter((p) =>
        withinPeriodRange(p.period, options?.from, options?.to),
      ),
    }
  }

  const problems = validateIndicatorSeries(series)
  if (problems.length > 0) {
    throw new IndicatorError('invalid', `SSB-data bryter kontrakten: ${problems.join('; ')}`)
  }
  return series
}

// --- IndicatorSource wrapper ---------------------------------------------------

/** Create an SSB {@link IndicatorSource}, optionally with injected deps. */
export function createSsbSource(deps?: SsbDeps): IndicatorSource {
  return {
    id: SOURCE_ID,
    fetch(id, options) {
      if (!(id in SSB_INDICATORS)) return Promise.resolve(null)
      return fetchSsbSeries(id, options, deps)
    },
  }
}

/** Default SSB source (real network fetch). */
export const ssbSource: IndicatorSource = createSsbSource()
