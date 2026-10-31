// NETWORK TEST — not part of `pnpm test`.
//
// Run manually with `pnpm test:live`. Calls the real SSB API (rate limit: 40
// calls / 60 s) and compares the adapter's output with:
//   1. values recorded from SSB's annual table 14701 (checked 2026-10-31), and
//   2. an INDEPENDENT consistency check: the rounded mean of the 12 monthly
//      values for the same year from the monthly table 14700 (never used by the
//      adapter itself).
// Because SSB may later publish 2026 or revise the base year, only the recorded
// years are pinned; newer years are reported, not asserted.

import { describe, expect, it } from 'vitest'
import { fetchSsbSeries } from './ssb'

const RECORDED: Record<string, number> = {
  '2000': 54.8,
  '2015': 72.6,
  '2023': 94.1,
  '2024': 97.1,
  '2025': 100,
}

describe('SSB live — cpi_annual_total', () => {
  it('matches the recorded SSB annual values and has no gaps', async () => {
    const series = await fetchSsbSeries('cpi_annual_total')
    const byYear = new Map(series.points.map((p) => [p.period, p.value]))
    for (const [year, value] of Object.entries(RECORDED)) {
      expect(byYear.get(year), `year ${year}`).toBe(value)
    }
    expect(series.points[0].period).toBe('2000')
    expect(series.points.every((p) => p.value !== null)).toBe(true)
    expect(new Date(series.source.fetchedAt ?? '').getTime()).toBeGreaterThan(Date.parse('2026-10-31'))
  })

  it('agrees with the mean of SSB monthly table 14700 for 2023–2025 (rounded to 1 decimal)', async () => {
    const url =
      'https://data.ssb.no/api/pxwebapi/v2/tables/14700/data?lang=no&outputFormat=json-stat2' +
      '&valuecodes[ContentsCode]=KpiIndMnd&valuecodes[VareTjenesteGrp]=00' +
      '&valuecodes[Tid]=2023M01,2023M02,2023M03,2023M04,2023M05,2023M06,2023M07,2023M08,2023M09,2023M10,2023M11,2023M12,' +
      '2024M01,2024M02,2024M03,2024M04,2024M05,2024M06,2024M07,2024M08,2024M09,2024M10,2024M11,2024M12,' +
      '2025M01,2025M02,2025M03,2025M04,2025M05,2025M06,2025M07,2025M08,2025M09,2025M10,2025M11,2025M12'
    const res = await fetch(url)
    expect(res.ok).toBe(true)
    const body = (await res.json()) as {
      value: number[]
      dimension: { Tid: { category: { index: Record<string, number> } } }
    }
    const months = Object.keys(body.dimension.Tid.category.index)
    const series = await fetchSsbSeries('cpi_annual_total')
    for (const year of ['2023', '2024', '2025']) {
      const xs = months.map((m, i) => [m, body.value[i]] as const).filter(([m]) => m.startsWith(year))
      expect(xs).toHaveLength(12)
      const mean = xs.reduce((a, [, v]) => a + v, 0) / 12
      const annual = series.points.find((p) => p.period === year)?.value
      // Monthly values are themselves rounded to 1 decimal, so allow 0.05.
      expect(Math.abs((annual as number) - mean), `year ${year}`).toBeLessThanOrEqual(0.05)
    }
  })
})
