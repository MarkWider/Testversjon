import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption } from 'echarts/core'
import { countries, formatUsd, gdpPerCapitaSample } from '../data/gdpPerCapita'

echarts.use([GridComponent, LegendComponent, TooltipComponent, LineChart, CanvasRenderer])

const colors = {
  Norge: '#0a5c4e',
  Sverige: '#2b6cb0',
  Danmark: '#b94b37',
}

export default function GdpChart() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const chart = echarts.init(container, undefined, { renderer: 'canvas' })
    const option: EChartsCoreOption = {
      animationDuration: 700,
      color: countries.map((country) => colors[country]),
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#14362f',
        borderWidth: 0,
        textStyle: { color: '#fbfaf5', fontFamily: 'DM Mono, monospace' },
        padding: [12, 14],
        formatter: (params: unknown) => {
          const points = params as Array<{ axisValue: string; marker: string; seriesName: string; value: number }>
          return [`<strong>${points[0].axisValue}</strong>`, ...points.map((point) => `${point.marker} ${point.seriesName}: ${formatUsd(point.value)}`)].join('<br/>')
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
      grid: { top: 58, right: 12, bottom: 34, left: 68 },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: gdpPerCapitaSample.map((point) => point.year),
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
          formatter: (value: number) => `$${Math.round(value / 1000)}k`,
        },
      },
      series: countries.map((country) => ({
        name: country,
        type: 'line',
        data: gdpPerCapitaSample.map((point) => point[country]),
        smooth: 0.28,
        symbol: 'circle',
        symbolSize: 7,
        showSymbol: false,
        lineStyle: { width: country === 'Norge' ? 3 : 2 },
        emphasis: { focus: 'series', scale: true },
      })),
    }

    chart.setOption(option)
    const observer = new ResizeObserver(() => chart.resize())
    observer.observe(container)
    return () => {
      observer.disconnect()
      chart.dispose()
    }
  }, [])

  return <div ref={containerRef} className="chart" role="img" aria-label="Linjegraf som sammenligner BNP per innbygger i Norge, Sverige og Danmark fra 2015 til 2023." />
}
