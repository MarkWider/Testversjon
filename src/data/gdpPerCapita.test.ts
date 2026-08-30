import { describe, expect, it } from 'vitest'
import { countries, formatUsd, gdpPerCapitaSample } from './gdpPerCapita'

describe('GDP sample data', () => {
  it('contains a complete and chronological observation for each country', () => {
    expect(gdpPerCapitaSample.length).toBeGreaterThan(1)
    expect(countries).toHaveLength(3)
    expect(gdpPerCapitaSample.every((point, index) => index === 0 || point.year > gdpPerCapitaSample[index - 1].year)).toBe(true)
    expect(gdpPerCapitaSample.every((point) => countries.every((country) => point[country] > 0))).toBe(true)
  })

  it('formats chart values as Norwegian-locale US dollars', () => {
    expect(formatUsd(74400)).toContain('74')
    expect(formatUsd(74400)).toContain('USD')
  })
})
