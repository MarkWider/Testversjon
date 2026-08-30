import { describe, expect, it } from 'vitest'
import type { IndicatorSeries } from '../contracts/indicator'
import { buildIndicatorChartOption } from './IndicatorChart'

const series: IndicatorSeries = {
  indicator: 'example',
  title: 'Eksempelindikator',
  unit: { code: 'count', display: 'number' },
  source: { id: 'sample', label: 'Eksempel', official: false },
  regions: [{ code: 'NO', name: 'Norge' }, { code: 'SE', name: 'Sverige' }],
  points: [
    { region: 'NO', period: '2022', value: 10 },
    { region: 'SE', period: '2022', value: 20 },
    { region: 'NO', period: '2023', value: 15 },
    { region: 'SE', period: '2023', value: 25 },
  ],
}

describe('buildIndicatorChartOption', () => {
  it('builds periods and display-ordered series from long-format data', () => {
    const option = buildIndicatorChartOption(series, { latestPeriod: '2023', reducedMotion: true }) as {
      xAxis: { data: string[] }
      animation: boolean
      series: Array<{ name: string; data: Array<number | null>; markPoint?: unknown }>
    }

    expect(option.xAxis.data).toEqual(['2022', '2023'])
    expect(option.animation).toBe(false)
    expect(option.series).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'Norge', data: [10, 15], markPoint: expect.anything() }),
      expect.objectContaining({ name: 'Sverige', data: [20, 25] }),
    ]))
  })

  it('uses the supplied last observed period for endpoint markers', () => {
    const withTrailingNulls: IndicatorSeries = {
      ...series,
      points: [
        ...series.points,
        { region: 'NO', period: '2024', value: null },
        { region: 'SE', period: '2024', value: null },
      ],
    }
    const option = buildIndicatorChartOption(withTrailingNulls, { latestPeriod: '2023', reducedMotion: true }) as {
      series: Array<{ markPoint?: { data: Array<{ coord: [string, number] }> } }>
    }

    expect(option.series[0].markPoint?.data[0].coord).toEqual(['2023', 15])
  })
})
