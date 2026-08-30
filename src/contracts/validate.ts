// Minimal runtime check that a value satisfies the IndicatorSeries contract.
//
// Plain predicate style: returns a list of human-readable problems, empty = ok.
// No assertion signatures, no schema library. Used by the service to guard the
// 'invalid' error path, and available to future adapters to self-check their
// normalized output before returning it.

import type { IndicatorSeries } from './indicator'

const DISPLAY_VALUES = new Set(['currency', 'number', 'percent'])

/**
 * Validate an untrusted value against the IndicatorSeries contract.
 * Returns a list of contract violations; an empty array means the value is a
 * well-formed IndicatorSeries.
 */
export function validateIndicatorSeries(value: unknown): string[] {
  const problems: string[] = []

  if (typeof value !== 'object' || value === null) {
    return ['series må være et objekt']
  }
  const s = value as Record<string, unknown>

  if (typeof s.indicator !== 'string' || s.indicator.length === 0) {
    problems.push('indicator må være en ikke-tom streng')
  }
  if (typeof s.title !== 'string' || s.title.length === 0) {
    problems.push('title må være en ikke-tom streng')
  }
  if (s.subtitle !== undefined && typeof s.subtitle !== 'string') {
    problems.push('subtitle må være en streng når den er satt')
  }

  const unit = s.unit as Record<string, unknown> | undefined
  if (!unit || typeof unit !== 'object') {
    problems.push('unit må være et objekt')
  } else {
    if (typeof unit.code !== 'string' || unit.code.length === 0) {
      problems.push('unit.code må være en ikke-tom streng')
    }
    if (typeof unit.display !== 'string' || !DISPLAY_VALUES.has(unit.display)) {
      problems.push("unit.display må være 'currency' | 'number' | 'percent'")
    } else if (
      unit.display === 'currency' &&
      (typeof unit.currency !== 'string' || unit.currency.length === 0)
    ) {
      problems.push("unit.currency må være satt når unit.display === 'currency'")
    }
    if (unit.decimals !== undefined && typeof unit.decimals !== 'number') {
      problems.push('unit.decimals må være et tall når det er satt')
    }
  }

  const source = s.source as Record<string, unknown> | undefined
  if (!source || typeof source !== 'object') {
    problems.push('source må være et objekt')
  } else {
    if (typeof source.id !== 'string' || source.id.length === 0) {
      problems.push('source.id må være en ikke-tom streng')
    }
    if (typeof source.label !== 'string' || source.label.length === 0) {
      problems.push('source.label må være en ikke-tom streng')
    }
    if (typeof source.official !== 'boolean') {
      problems.push('source.official må være en boolean')
    }
  }

  const regionCodes = new Set<string>()
  if (!Array.isArray(s.regions) || s.regions.length === 0) {
    problems.push('regions må inneholde minst én region')
  } else {
    s.regions.forEach((r, i) => {
      const rr = r as Record<string, unknown>
      if (!rr || typeof rr.code !== 'string' || typeof rr.name !== 'string') {
        problems.push(`regions[${i}] må ha streng-verdier for code og name`)
      } else {
        regionCodes.add(rr.code)
      }
    })
  }

  if (!Array.isArray(s.points)) {
    problems.push('points må være en array')
  } else {
    s.points.forEach((p, i) => {
      const pp = p as Record<string, unknown>
      if (!pp || typeof pp.region !== 'string') {
        problems.push(`points[${i}].region må være en streng`)
      } else if (regionCodes.size > 0 && !regionCodes.has(pp.region)) {
        problems.push(`points[${i}].region «${pp.region}» finnes ikke i regions`)
      }
      if (!pp || typeof pp.period !== 'string' || pp.period.length === 0) {
        problems.push(`points[${i}].period må være en ikke-tom streng`)
      }
      if (!pp || (typeof pp.value !== 'number' && pp.value !== null)) {
        problems.push(`points[${i}].value må være number eller null`)
      }
    })
  }

  return problems
}

/** Convenience boolean form of {@link validateIndicatorSeries}. */
export function isValidIndicatorSeries(value: unknown): value is IndicatorSeries {
  return validateIndicatorSeries(value).length === 0
}
