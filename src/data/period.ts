// Shared period helpers for the data layer (sample source, adapters, and a
// future resolver). Kept separate so every source applies identical semantics.

/**
 * Inclusive range check on an ISO 8601 period string. Lexical comparison is
 * correct at a single granularity (yearly / quarterly / monthly). Comparing
 * across granularities is out of scope.
 */
export function withinPeriodRange(
  period: string,
  from?: string,
  to?: string,
): boolean {
  if (from !== undefined && period < from) return false
  if (to !== undefined && period > to) return false
  return true
}

/**
 * Sort observations by `period` ascending, then by the given region order.
 * Matches the sorting guarantee that {@link getIndicatorData} promises.
 */
export function sortPointsByPeriodThenRegion<
  T extends { period: string; region: string },
>(points: readonly T[], regionOrder: readonly string[]): T[] {
  const rank = new Map(regionOrder.map((code, index) => [code, index]))
  return [...points].sort((a, b) => {
    if (a.period !== b.period) return a.period < b.period ? -1 : 1
    return (rank.get(a.region) ?? 0) - (rank.get(b.region) ?? 0)
  })
}
