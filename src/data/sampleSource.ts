// The bundled sample data source.
//
// `IndicatorSource` is the internal seam between the service and a concrete
// source. It is NOT part of the frontend-facing contract. A future SSB / OECD /
// Eurostat adapter implements this same interface and returns the same
// `IndicatorSeries` shape.
//
// No registry yet: the service talks to `sampleSource` directly. Promote
// `IndicatorSource` to its own module and add selection logic when the first
// real adapter lands (docs/proposals/data-contract.md: registry is optional for
// step 1).

import type {
  GetIndicatorOptions,
  IndicatorId,
  IndicatorSeries,
} from '../contracts/indicator'
import { gdpPerCapitaSampleSeries } from './sample/gdpPerCapita'

export interface IndicatorSource {
  readonly id: string
  /** Return the series, or null if this source does not provide `id`. */
  fetch(
    id: IndicatorId,
    options?: GetIndicatorOptions,
  ): Promise<IndicatorSeries | null>
}

const SERIES_BY_ID: Record<string, IndicatorSeries> = {
  [gdpPerCapitaSampleSeries.indicator]: gdpPerCapitaSampleSeries,
}

/** Deep copy so callers can never mutate the module-level sample data. */
function clone(series: IndicatorSeries): IndicatorSeries {
  return {
    ...series,
    unit: { ...series.unit },
    source: { ...series.source },
    regions: series.regions.map((r) => ({ ...r })),
    points: series.points.map((p) => ({ ...p })),
  }
}

// String comparison is correct for ISO 8601 periods at a single granularity
// (the sample is yearly). Mixed-granularity ranges are out of scope here.
function withinRange(period: string, from?: string, to?: string): boolean {
  if (from !== undefined && period < from) return false
  if (to !== undefined && period > to) return false
  return true
}

export const sampleSource: IndicatorSource = {
  id: 'sample',
  fetch(id, options) {
    const base = SERIES_BY_ID[id]
    if (!base) return Promise.resolve(null)

    const series = clone(base)

    const regionFilter = options?.regions
    if (regionFilter && regionFilter.length > 0) {
      const keep = new Set(regionFilter)
      series.regions = series.regions.filter((r) => keep.has(r.code))
      series.points = series.points.filter((p) => keep.has(p.region))
    }

    if (options?.from !== undefined || options?.to !== undefined) {
      series.points = series.points.filter((p) =>
        withinRange(p.period, options?.from, options?.to),
      )
    }

    return Promise.resolve(series)
  },
}
