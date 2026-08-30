import type { IndicatorUnit } from '../contracts/indicator'

const locale = 'nb-NO'

export function formatValue(value: number | null, unit: IndicatorUnit): string {
  if (value === null) return 'Ingen data'

  const decimals = unit.decimals ?? 0

  if (unit.display === 'currency') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: unit.currency ?? unit.code,
      currencyDisplay: 'code',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  }

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)

  return unit.display === 'percent' ? `${formatted} %` : formatted
}

export function formatCompactValue(value: number, unit: IndicatorUnit): string {
  const decimals = unit.decimals ?? 0
  const formatted = new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: decimals,
  }).format(value)

  if (unit.display === 'percent') return `${formatted} %`
  if (unit.display === 'currency') return `${formatted} ${unit.currency ?? unit.code}`
  return formatted
}
