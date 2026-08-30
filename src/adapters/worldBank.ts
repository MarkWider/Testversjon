// World Bank adapter.
//
// Translates the World Bank Indicators API into our internal `IndicatorSeries`
// contract. After this module, nothing else in the app needs to know how the
// World Bank API is shaped.
//
//   API:  https://api.worldbank.org/v2/country/{iso3;iso3}/indicator/{code}?format=json
//   Auth: none (no API key)
//   CORS: enabled
//   Body: JSON `[meta, rows]` — see WorldBankMeta / WorldBankRow below
//
// NOT wired into getIndicatorData() yet: the sample source stays the active
// default until the frontend migration (Codex) and this adapter are both merged
// and verified. Activation steps are listed in the PR HANDOFF.

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
// IndicatorError is defined in the service module; imported (not modified) so the
// adapter surfaces the same error type the contract documents. If the layering
// bothers us later, move IndicatorError into src/contracts/ (non-breaking).
import { IndicatorError } from '../services/indicators'

const WORLD_BANK_API = 'https://api.worldbank.org/v2'
const SOURCE_ID = 'worldbank'
const SOURCE_LABEL = 'Verdensbanken'
/** Generous page size so a single request covers this pilot's volume. */
const PER_PAGE = 1000

interface WorldBankIndicatorSpec {
  /** World Bank series code, e.g. "NY.GDP.PCAP.CD". */
  wbCode: string
  title: string
  subtitle?: string
  unit: IndicatorUnit
}

/** Our IndicatorId -> World Bank series + how to present it. */
export const WORLD_BANK_INDICATORS: Record<string, WorldBankIndicatorSpec> = {
  gdp_per_capita: {
    wbCode: 'NY.GDP.PCAP.CD',
    title: 'BNP per innbygger',
    subtitle: 'Løpende priser',
    unit: { code: 'USD', display: 'currency', currency: 'USD', decimals: 0 },
  },
}

/** Our RegionCode -> World Bank ISO 3166-1 alpha-3 code + display name. */
const REGION_TABLE: ReadonlyArray<RegionMeta & { iso3: string }> = [
  { code: 'NO', name: 'Norge', iso3: 'NOR' },
  { code: 'SE', name: 'Sverige', iso3: 'SWE' },
  { code: 'DK', name: 'Danmark', iso3: 'DNK' },
]
const REGION_BY_ISO3 = new Map(REGION_TABLE.map((r) => [r.iso3, r]))
const REGION_ORDER = REGION_TABLE.map((r) => r.code)

// --- World Bank response shapes ------------------------------------------------

interface WorldBankMeta {
  page: number
  pages: number
  per_page: number
  total: number
  lastupdated?: string
}

interface WorldBankRow {
  indicator: { id: string; value: string }
  country: { id: string; value: string }
  countryiso3code: string
  date: string
  value: number | null
}

export interface WorldBankPayload {
  meta: WorldBankMeta
  rows: WorldBankRow[]
}

export interface WorldBankDeps {
  /** Fetch and JSON-parse a URL. Injectable so unit tests stay offline. */
  fetchJson?: (url: string) => Promise<unknown>
}

// --- pure: parse + validate the raw envelope ---------------------------------

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

/**
 * Turn an unknown World Bank JSON body into a typed {@link WorldBankPayload}.
 * Throws {@link IndicatorError} `invalid` on anything that is not the documented
 * `[meta, rows]` shape, and `not_found` on a World Bank error envelope.
 */
export function parseWorldBankPayload(payload: unknown): WorldBankPayload {
  if (!Array.isArray(payload)) {
    throw new IndicatorError('invalid', 'World Bank-svaret er ikke en array.')
  }

  // Error envelope: [{ message: [{ id, key, value }] }]
  const head = payload[0]
  if (isObject(head) && Array.isArray(head.message)) {
    const first = head.message[0]
    const text = isObject(first) && typeof first.value === 'string'
      ? first.value
      : 'ukjent feil'
    throw new IndicatorError('not_found', `World Bank avviste forespørselen: ${text}`)
  }

  if (payload.length < 2) {
    throw new IndicatorError('invalid', 'World Bank-svaret mangler datadelen.')
  }

  if (!isObject(head) || typeof head.pages !== 'number') {
    throw new IndicatorError('invalid', 'World Bank-metadata mangler eller er ugyldig.')
  }
  const meta: WorldBankMeta = {
    page: Number(head.page) || 1,
    pages: head.pages,
    per_page: Number(head.per_page) || PER_PAGE,
    total: Number(head.total) || 0,
    lastupdated: typeof head.lastupdated === 'string' ? head.lastupdated : undefined,
  }

  // A query with no data yields [meta, null].
  const rawRows = payload[1] === null ? [] : payload[1]
  if (!Array.isArray(rawRows)) {
    throw new IndicatorError('invalid', 'World Bank-datadelen er ikke en array.')
  }

  const rows: WorldBankRow[] = rawRows.map((row, i) => {
    if (!isObject(row)) {
      throw new IndicatorError('invalid', `World Bank-rad ${i} er ikke et objekt.`)
    }
    const iso3 = row.countryiso3code
    const date = row.date
    const value = row.value
    if (typeof iso3 !== 'string' || typeof date !== 'string') {
      throw new IndicatorError('invalid', `World Bank-rad ${i} mangler countryiso3code/date.`)
    }
    if (value !== null && typeof value !== 'number') {
      throw new IndicatorError('invalid', `World Bank-rad ${i} har en ikke-numerisk value.`)
    }
    return {
      indicator: (isObject(row.indicator)
        ? row.indicator
        : { id: '', value: '' }) as WorldBankRow['indicator'],
      country: (isObject(row.country)
        ? row.country
        : { id: '', value: '' }) as WorldBankRow['country'],
      countryiso3code: iso3,
      date,
      value,
    }
  })

  return { meta, rows }
}

// --- pure: normalise into the contract --------------------------------------

/**
 * Map a parsed World Bank payload onto an {@link IndicatorSeries}. Unknown
 * countries are dropped; `null` values are kept as contract gaps; points are
 * returned sorted (period ascending, then canonical region order).
 */
export function normalizeWorldBank(
  payload: WorldBankPayload,
  indicatorId: IndicatorId,
): IndicatorSeries {
  const spec = WORLD_BANK_INDICATORS[indicatorId]
  if (!spec) {
    throw new IndicatorError(
      'not_found',
      `World Bank-adapteren kjenner ikke indikatoren «${indicatorId}».`,
    )
  }

  const seenRegionCodes = new Set<string>()
  const points: IndicatorPoint[] = []
  for (const row of payload.rows) {
    const region = REGION_BY_ISO3.get(row.countryiso3code)
    if (!region) continue // country outside our region contract
    seenRegionCodes.add(region.code)
    points.push({ region: region.code, period: row.date, value: row.value })
  }

  if (points.length === 0) {
    throw new IndicatorError(
      'not_found',
      `World Bank returnerte ingen observasjoner for «${indicatorId}».`,
    )
  }

  const regions: RegionMeta[] = REGION_TABLE.filter((r) =>
    seenRegionCodes.has(r.code),
  ).map((r) => ({ code: r.code, name: r.name }))

  const series: IndicatorSeries = {
    indicator: indicatorId,
    title: spec.title,
    ...(spec.subtitle ? { subtitle: spec.subtitle } : {}),
    unit: { ...spec.unit },
    source: {
      id: SOURCE_ID,
      label: SOURCE_LABEL,
      official: true,
      // World Bank's own "data last refreshed" date. Deterministic for a
      // snapshot pipeline and more meaningful than wall-clock fetch time.
      ...(payload.meta.lastupdated ? { fetchedAt: payload.meta.lastupdated } : {}),
    },
    regions,
    points: sortPointsByPeriodThenRegion(points, REGION_ORDER),
  }
  return series
}

// --- fetch orchestration ---------------------------------------------------

function buildUrl(
  wbCode: string,
  iso3s: string[],
  options: GetIndicatorOptions | undefined,
  page: number,
): string {
  const params = new URLSearchParams({
    format: 'json',
    per_page: String(PER_PAGE),
    page: String(page),
  })
  // World Bank needs both ends for a date range; otherwise we filter client-side.
  if (options?.from !== undefined && options?.to !== undefined) {
    params.set('date', `${options.from}:${options.to}`)
  }
  return `${WORLD_BANK_API}/country/${iso3s.join(';')}/indicator/${wbCode}?${params.toString()}`
}

function pickRegions(codes: readonly string[] | undefined) {
  if (!codes || codes.length === 0) return REGION_TABLE
  const keep = new Set(codes)
  return REGION_TABLE.filter((r) => keep.has(r.code))
}

async function defaultFetchJson(url: string): Promise<unknown> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new IndicatorError('source_unavailable', `World Bank svarte HTTP ${res.status}.`)
  }
  return res.json() as Promise<unknown>
}

/**
 * Run a fetch step. Contract errors thrown by the caller's parser must survive,
 * but any transport / JSON failure becomes `source_unavailable`.
 */
async function fetchJsonGuarded(
  fetchJson: (url: string) => Promise<unknown>,
  url: string,
): Promise<unknown> {
  try {
    return await fetchJson(url)
  } catch (err) {
    if (err instanceof IndicatorError) throw err
    throw new IndicatorError(
      'source_unavailable',
      `World Bank-henting feilet: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
}

/**
 * Fetch one indicator from the World Bank API and return it as a validated,
 * sorted {@link IndicatorSeries}.
 *
 * Rejects with {@link IndicatorError}: `not_found` (unknown indicator / no data),
 * `source_unavailable` (network / HTTP failure), `invalid` (unexpected body or a
 * result that violates the contract).
 */
export async function fetchWorldBankSeries(
  indicatorId: IndicatorId,
  options?: GetIndicatorOptions,
  deps?: WorldBankDeps,
): Promise<IndicatorSeries> {
  const spec = WORLD_BANK_INDICATORS[indicatorId]
  if (!spec) {
    throw new IndicatorError(
      'not_found',
      `World Bank-adapteren kjenner ikke indikatoren «${indicatorId}».`,
    )
  }

  const fetchJson = deps?.fetchJson ?? defaultFetchJson
  const wanted = pickRegions(options?.regions)
  if (wanted.length === 0) {
    throw new IndicatorError('invalid', 'Ingen kjente regioner å hente fra World Bank.')
  }
  const iso3s = wanted.map((r) => r.iso3)

  const first = parseWorldBankPayload(
    await fetchJsonGuarded(fetchJson, buildUrl(spec.wbCode, iso3s, options, 1)),
  )
  const rows = [...first.rows]
  for (let page = 2; page <= first.meta.pages; page += 1) {
    const next = parseWorldBankPayload(
      await fetchJsonGuarded(fetchJson, buildUrl(spec.wbCode, iso3s, options, page)),
    )
    rows.push(...next.rows)
  }

  let series = normalizeWorldBank({ meta: first.meta, rows }, indicatorId)

  // Client-side range trim (covers a one-sided from/to that buildUrl skipped).
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
    throw new IndicatorError(
      'invalid',
      `World Bank-data bryter kontrakten: ${problems.join('; ')}`,
    )
  }
  return series
}

// --- IndicatorSource wrapper ---------------------------------------------------

/** Create a World Bank {@link IndicatorSource}, optionally with injected deps. */
export function createWorldBankSource(deps?: WorldBankDeps): IndicatorSource {
  return {
    id: SOURCE_ID,
    fetch(id, options) {
      if (!(id in WORLD_BANK_INDICATORS)) return Promise.resolve(null)
      return fetchWorldBankSeries(id, options, deps)
    },
  }
}

/** Default World Bank source (real network fetch). Not yet used by the service. */
export const worldBankSource: IndicatorSource = createWorldBankSource()
