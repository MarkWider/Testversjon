// Stable, frontend-facing entry point to the data layer.
//
// The frontend imports ONLY from this module and from ../contracts/indicator.
// It must never need to import ../data/* directly. Today this resolves from the
// bundled sample source; a future SSB / OECD / Eurostat adapter slots in behind
// the same `getIndicatorData` signature with no frontend change.

import type {
  GetIndicatorOptions,
  IndicatorId,
  IndicatorSeries,
} from '../contracts/indicator'
import { validateIndicatorSeries } from '../contracts/validate'
import { sampleSource } from '../data/sampleSource'

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
 * Fetch one indicator as a normalized {@link IndicatorSeries}.
 *
 * Guarantees on the resolved value:
 *  - `points` is sorted by `period` ascending, then by `regions` order
 *  - the shape has been validated against the contract
 *
 * Rejects with {@link IndicatorError}:
 *  - `not_found`          — unknown indicator id
 *  - `source_unavailable` — upstream source unreachable (future adapters only)
 *  - `invalid`            — source returned data that violates the contract
 */
export async function getIndicatorData(
  id: IndicatorId,
  options?: GetIndicatorOptions,
): Promise<IndicatorSeries> {
  let raw: IndicatorSeries | null
  try {
    raw = await sampleSource.fetch(id, options)
  } catch {
    throw new IndicatorError(
      'source_unavailable',
      `Kilden «${sampleSource.id}» kunne ikke levere «${id}».`,
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
