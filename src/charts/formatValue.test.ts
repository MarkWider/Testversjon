import { describe, expect, it } from 'vitest'
import { formatValue } from './formatValue'

describe('formatValue', () => {
  it('formats currency from unit metadata', () => {
    expect(formatValue(74400, { code: 'USD', display: 'currency', currency: 'USD' })).toContain('USD')
  })

  it('formats number and percent values', () => {
    expect(formatValue(1234.5, { code: 'count', display: 'number', decimals: 1 })).toContain('1')
    expect(formatValue(12.5, { code: 'percent', display: 'percent', decimals: 1 })).toContain('%')
  })

  it('labels null values as missing data', () => {
    expect(formatValue(null, { code: 'count', display: 'number' })).toBe('Ingen data')
  })
})
