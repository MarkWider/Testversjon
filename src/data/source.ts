// Internal seam between the service and a concrete data source.
//
// NOT part of the frontend-facing contract. The sample source and every real
// adapter (World Bank today; SSB / Eurostat / OECD later) implement this and
// return the same `IndicatorSeries` shape.
//
// No registry / source selection yet — `getIndicatorData` talks to one source
// directly. Add selection logic here when more than one source is active.

import type {
  GetIndicatorOptions,
  IndicatorId,
  IndicatorSeries,
} from '../contracts/indicator'

export interface IndicatorSource {
  readonly id: string
  /** Return the series, or null if this source does not provide `id`. */
  fetch(
    id: IndicatorId,
    options?: GetIndicatorOptions,
  ): Promise<IndicatorSeries | null>
}
