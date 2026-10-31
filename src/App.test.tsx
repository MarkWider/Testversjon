import { describe, expect, it, vi } from 'vitest'
import type { IndicatorSeries } from './contracts/indicator'
import { startIndicatorRequest } from './App'

describe('indicator requests', () => {
  it('does not display a delayed response after switching indicators', async () => {
    let resolveOld!: (series: IndicatorSeries) => void
    let resolveNew!: (series: IndicatorSeries) => void
    const oldRequest = new Promise<IndicatorSeries>((resolve) => { resolveOld = resolve })
    const newRequest = new Promise<IndicatorSeries>((resolve) => { resolveNew = resolve })
    const load = vi.fn((id: string) => id === 'gdp_per_capita' ? oldRequest : newRequest)
    const onSuccess = vi.fn()
    const onError = vi.fn()
    const cancelOld = startIndicatorRequest('gdp_per_capita', onSuccess, onError, load)
    cancelOld()
    startIndicatorRequest('cpi_annual_total', onSuccess, onError, load)

    const cpi = { indicator: 'cpi_annual_total' } as IndicatorSeries
    resolveNew(cpi)
    await newRequest
    resolveOld({ indicator: 'gdp_per_capita' } as IndicatorSeries)
    await oldRequest
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(onSuccess).toHaveBeenCalledWith(cpi)
    expect(onError).not.toHaveBeenCalled()
  })

  it('reports a failure for the active indicator', async () => {
    const error = new Error('offline')
    const onError = vi.fn()
    startIndicatorRequest('cpi_annual_total', vi.fn(), onError, () => Promise.reject(error))
    await vi.waitFor(() => expect(onError).toHaveBeenCalledWith(error))
  })
})
