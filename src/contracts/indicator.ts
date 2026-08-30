// Public data contract between the frontend and the data layer.
//
// Types only — no runtime code, no dependencies. Both the frontend (Codex) and
// the data layer (Claude) import from here. Implements the approved proposal in
// docs/proposals/data-contract.md.
//
// Changes to this file are shared/change-controlled: propose + cross-review +
// note in docs/DECISIONS.md, because both sides compile against it.

/** Stable indicator identifier, e.g. "gdp_per_capita". */
export type IndicatorId = string

/**
 * Region identifier. Currently ISO 3166-1 alpha-2, uppercase: "NO", "SE", "DK".
 *
 * Kept as a plain string on purpose: "Norge i tall" may later carry fylker,
 * kommuner or other geographic levels (docs/proposals/data-contract.md,
 * "Spørsmål 1"). Widening the set of valid codes then needs no type change.
 */
export type RegionCode = string

/** One observation: one region, one period, one value. */
export interface IndicatorPoint {
  region: RegionCode
  /** ISO 8601 period: "2023" (year), "2023-Q4" (quarter), "2023-11" (month). */
  period: string
  /** Observed value, or null for a known gap (missing observation). */
  value: number | null
}

/**
 * Unit + display metadata for the series' values.
 *
 * Invariant: when `display === 'currency'`, `currency` is expected to be set
 * (ISO 4217, e.g. "USD"). This is NOT enforced at the type level by design
 * (no discriminated unions yet) — the sample source and every future adapter
 * must uphold it, and `validateIndicatorSeries` checks it at runtime.
 */
export interface IndicatorUnit {
  /** Free-form unit code, e.g. "USD", "NOK", "percent". */
  code: string
  display: 'currency' | 'number' | 'percent'
  /** Expected when `display === 'currency'`. ISO 4217, e.g. "USD". */
  currency?: string
  /** Fraction digits for display. Treated as 0 when omitted. */
  decimals?: number
}

/** Display metadata for one region present in the series. */
export interface RegionMeta {
  code: RegionCode
  /** Human-readable name, e.g. "Norge". */
  name: string
}

/** Where the series' data came from. */
export interface SourceMeta {
  /** Source id, e.g. "sample", "ssb", "oecd". */
  id: string
  /** Human-readable label, e.g. "Lokalt eksempeldata". */
  label: string
  /** True only for official statistics. The sample source is false. */
  official: boolean
  /** ISO 8601 timestamp; set when fetched from a live source. */
  fetchedAt?: string
}

/**
 * Everything the frontend needs to render one indicator.
 *
 * Sorting guarantee: the `points` array returned by `getIndicatorData` is sorted
 * by `period` ascending, then by the order of `regions`. Consumers may rely on
 * this. A raw source is not required to pre-sort — the service normalizes before
 * returning.
 */
export interface IndicatorSeries {
  indicator: IndicatorId
  /** Human-readable title, e.g. "BNP per innbygger". */
  title: string
  /** Optional secondary label, e.g. "Løpende priser". */
  subtitle?: string
  unit: IndicatorUnit
  source: SourceMeta
  /** Regions present in the series, in intended display order. */
  regions: RegionMeta[]
  /** Long-format observations. See the sorting guarantee above. */
  points: IndicatorPoint[]
}

/**
 * Options for requesting an indicator. All fields optional; an omitted field
 * means "no restriction".
 */
export interface GetIndicatorOptions {
  /** Restrict to these region codes. Unknown codes are ignored. Default: all. */
  regions?: RegionCode[]
  /** Inclusive ISO 8601 lower bound on `period`, e.g. "2018". */
  from?: string
  /** Inclusive ISO 8601 upper bound on `period`, e.g. "2023". */
  to?: string
}
