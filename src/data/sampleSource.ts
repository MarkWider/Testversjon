// The bundled sample data source.
//
// Implements the internal `IndicatorSource` seam (src/data/source.ts). It is the
// active default behind `getIndicatorData` until a real adapter is wired in.

import type { IndicatorSeries } from '../contracts/indicator'
import { withinPeriodRange } from './period'
import type { IndicatorSource } from './source'
import { gdpPerCapitaSampleSeries } from './sample/gdpPerCapita'

export type { IndicatorSource } from './source'

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
        withinPeriodRange(p.period, options?.from, options?.to),
      )
    }

    return Promise.resolve(series)
  },
}
