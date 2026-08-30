// Stable, frontend-facing entry point to the data layer.
//
// The frontend imports ONLY from this module and from ../contracts/indicator.
// It must never need to import ../data/* or ../adapters/* directly.
//
// Active source for `gdp_per_capita`: the World Bank adapter (docs/DECISIONS.md
// DEC-007). `sampleSource` is kept in the codebase for reversibility but is no
// longer wired in here.

import type {
  GetIndicatorOptions,
  IndicatorId,
  IndicatorSeries,
} from '../contracts/indicator'
import { validateIndicatorSeries } from '../contracts/validate'
import { worldBankSource } from '../adapters/worldBank'

export type {
  GetIndicatorOptions,
  IndicatorId,
  IndicatorSeries,
  IndicatorPoint,
  IndicatorUnit,
  RegionCode,
  RegionMeta,
  SourceMeta,
} from '../contracts/indicator'

export type IndicatorErrorCode = 'not_found' | 'source_unavailable' | 'invalid'

/**
 * Error thrown (as a rejected promise) by {@link getIndicatorData}.
 * `code` is stable and meant for UI branching.
 */
export class IndicatorError extends Error {
  readonly code: IndicatorErrorCode

  constructor(code: IndicatorErrorCode, message: string) {
    super(message)
    this.name = 'IndicatorError'
    this.code = code
  }
}

/**
 * Default period window for the technical pilot. Applied per bound only when the
 * caller leaves it unset, so the visualisation keeps its current 2015–2023 scope
 * without a real source (World Bank) otherwise returning its full history
 * (~1960–). An explicit `from` / `to` from the caller always wins.
 *
 * This is a pilot display choice, not a methodological statement about the
 * indicator.
 */
const PILOT_PERIOD = { from: '2015', to: '2023' } as const

/**
 * Fetch one indicator as a normalized {@link IndicatorSeries}.
 *
 * Guarantees on the resolved value:
 *  - `points` is sorted by `period` ascending, then by `regions` order
 *  - the shape has been validated against the contract
 *
 * Rejects with {@link IndicatorError}:
 *  - `not_found`          — unknown indicator id, or the source has no data for it
 *  - `source_unavailable` — upstream source unreachable / unexpected failure
 *  - `invalid`            — source returned data that violates the contract
 */
export async function getIndicatorData(
  id: IndicatorId,
  options?: GetIndicatorOptions,
): Promise<IndicatorSeries> {
  const effectiveOptions: GetIndicatorOptions = {
    ...options,
    from: options?.from ?? PILOT_PERIOD.from,
    to: options?.to ?? PILOT_PERIOD.to,
  }

  let raw: IndicatorSeries | null
  try {
    raw = await worldBankSource.fetch(id, effectiveOptions)
  } catch (err) {
    // A typed IndicatorError from the source already carries the right code —
    // pass it through unchanged. Only genuinely unexpected failures become
    // `source_unavailable`.
    if (err instanceof IndicatorError) throw err
    throw new IndicatorError(
      'source_unavailable',
      `Kilden «${worldBankSource.id}» kunne ikke levere «${id}».`,
    )
  }

  if (raw === null) {
    throw new IndicatorError('not_found', `Ukjent indikator: «${id}».`)
  }

  const problems = validateIndicatorSeries(raw)
  if (problems.length > 0) {
    throw new IndicatorError(
      'invalid',
      `Kilden returnerte data som bryter kontrakten: ${problems.join('; ')}`,
    )
  }

  return sortPoints(raw)
}

/** Apply the contract's sorting guarantee: period ascending, then regions order. */
function sortPoints(series: IndicatorSeries): IndicatorSeries {
  const regionOrder = new Map(series.regions.map((r, i) => [r.code, i]))
  const points = [...series.points].sort((a, b) => {
    if (a.period !== b.period) return a.period < b.period ? -1 : 1
    return (regionOrder.get(a.region) ?? 0) - (regionOrder.get(b.region) ?? 0)
  })
  return { ...series, points }
}
