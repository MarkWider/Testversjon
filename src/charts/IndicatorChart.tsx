import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption } from 'echarts/core'
import type { IndicatorSeries } from '../contracts/indicator'
import { formatCompactValue, formatValue } from './formatValue'

echarts.use([GridComponent, LegendComponent, TooltipComponent, LineChart, CanvasRenderer])

const palette = ['#102a43', '#277da1', '#e76f51', '#668c5a', '#7566a8']

type TooltipPoint = {
  axisValue: string
  marker: string
  seriesName: string
  value: number | null
}

type ChartOptions = {
  latestPeriod?: string
  reducedMotion?: boolean
}

export function buildIndicatorChartOption(series: IndicatorSeries, options: ChartOptions = {}): EChartsCoreOption {
  const periods = [...new Set(series.points.map((point) => point.period))]
  const values = new Map(series.points.map((point) => [`${point.region}:${point.period}`, point.value]))

  return {
    animation: !options.reducedMotion,
    animationDuration: options.reducedMotion ? 0 : 420,
    color: series.regions.map((_, index) => palette[index % palette.length]),
    tooltip: {
      trigger: 'axis',
      triggerOn: 'mousemove|click',
      backgroundColor: '#102a43',
      borderWidth: 0,
      textStyle: { color: '#f7f8f5', fontFamily: 'Inter, sans-serif' },
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
      top: 2,
      right: 0,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 16,
      textStyle: { color: '#52606d', fontFamily: 'Inter, sans-serif', fontSize: 12 },
    },
    grid: { top: 56, right: 30, bottom: 34, left: 70 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: periods,
      axisLine: { lineStyle: { color: '#cbd5dd' } },
      axisTick: { show: false },
      axisLabel: { color: '#52606d', fontFamily: 'Inter, sans-serif', fontSize: 11, hideOverlap: true },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#dfe5e8', type: 'dashed' } },
      axisLabel: {
        color: '#52606d',
        fontFamily: 'Inter, sans-serif',
        fontSize: 11,
        formatter: (value: number) => formatCompactValue(value, series.unit),
      },
    },
    series: series.regions.map((region, index) => {
      const data = periods.map((period) => values.get(`${region.code}:${period}`) ?? null)
      const latestValue = options.latestPeriod ? values.get(`${region.code}:${options.latestPeriod}`) : null
      return {
        name: region.name,
        type: 'line',
        data,
        smooth: 0.18,
        symbol: 'none',
        lineStyle: { width: region.code === 'NO' ? 3.5 : 2, type: 'solid' },
        emphasis: { focus: 'series', lineStyle: { width: region.code === 'NO' ? 4 : 3 } },
        markPoint: options.latestPeriod && latestValue !== null && latestValue !== undefined
          ? { symbol: 'circle', symbolSize: region.code === 'NO' ? 10 : 7, data: [{ coord: [options.latestPeriod, latestValue] }] }
          : undefined,
        z: index === 0 ? 3 : 2,
      }
    }),
  }
}

type IndicatorChartProps = {
  descriptionId: string
  latestPeriod?: string
  reducedMotion: boolean
  series: IndicatorSeries
}

export default function IndicatorChart({ series, latestPeriod, reducedMotion, descriptionId }: IndicatorChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const chart = echarts.init(container, undefined, { renderer: 'canvas' })
    chart.setOption(buildIndicatorChartOption(series, { latestPeriod, reducedMotion }))

    const observer = new ResizeObserver(() => chart.resize())
    observer.observe(container)
    return () => {
      observer.disconnect()
      chart.dispose()
    }
  }, [series, latestPeriod, reducedMotion])

  return <div ref={containerRef} className="chart" role="img" aria-describedby={descriptionId} aria-label={`Linjegraf for ${series.title}`} />
}
