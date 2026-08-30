import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption } from 'echarts/core'
import type { IndicatorSeries } from '../contracts/indicator'
import { formatCompactValue, formatValue } from './formatValue'

echarts.use([GridComponent, LegendComponent, TooltipComponent, LineChart, CanvasRenderer])

const palette = ['#0a5c4e', '#2b6cb0', '#b94b37', '#a97325', '#7557a8']

type TooltipPoint = {
  axisValue: string
  marker: string
  seriesName: string
  value: number | null
}

export function buildIndicatorChartOption(series: IndicatorSeries): EChartsCoreOption {
  const periods = [...new Set(series.points.map((point) => point.period))]
  const values = new Map(series.points.map((point) => [`${point.region}:${point.period}`, point.value]))

  return {
    animationDuration: 700,
    color: series.regions.map((_, index) => palette[index % palette.length]),
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#14362f',
      borderWidth: 0,
      textStyle: { color: '#fbfaf5', fontFamily: 'DM Mono, monospace' },
      padding: [12, 14],
      formatter: (params: unknown) => {
        const points = params as TooltipPoint[]
        if (points.length === 0) return ''
        return [
          `<strong>${points[0].axisValue}</strong>`,
          ...points.map((point) => `${point.marker} ${point.seriesName}: ${formatValue(point.value, series.unit)}`),
        ].join('<br/>')
      },
    },
    legend: {
      top: 4,
      right: 4,
      icon: 'circle',
      itemWidth: 9,
      itemHeight: 9,
      itemGap: 20,
      textStyle: { color: '#426158', fontFamily: 'DM Mono, monospace', fontSize: 12 },
    },
    grid: { top: 58, right: 12, bottom: 34, left: 82 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: periods,
      axisLine: { lineStyle: { color: '#cbd8d0' } },
      axisTick: { show: false },
      axisLabel: { color: '#587067', fontFamily: 'DM Mono, monospace', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#dce6df', type: 'dashed' } },
      axisLabel: {
        color: '#587067',
        fontFamily: 'DM Mono, monospace',
        fontSize: 11,
        formatter: (value: number) => formatCompactValue(value, series.unit),
      },
    },
    series: series.regions.map((region, index) => ({
      name: region.name,
      type: 'line',
      data: periods.map((period) => values.get(`${region.code}:${period}`) ?? null),
      smooth: 0.28,
      symbol: 'circle',
      symbolSize: 7,
      showSymbol: false,
      lineStyle: { width: index === 0 ? 3 : 2 },
      emphasis: { focus: 'series', scale: true },
    })),
  }
}

type IndicatorChartProps = {
  series: IndicatorSeries
}

export default function IndicatorChart({ series }: IndicatorChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const chart = echarts.init(container, undefined, { renderer: 'canvas' })
    chart.setOption(buildIndicatorChartOption(series))

    const observer = new ResizeObserver(() => chart.resize())
    observer.observe(container)
    return () => {
      observer.disconnect()
      chart.dispose()
    }
  }, [series])

  return (
    <div
      ref={containerRef}
      className="chart"
      role="img"
      aria-label={`Linjegraf for ${series.title}`}
    />
  )
}
