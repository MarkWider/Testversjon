import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { IndicatorSeries } from '../contracts/indicator'
import IndicatorContent from './IndicatorContent'

const series: IndicatorSeries = {
  indicator: 'gdp_per_capita',
  title: 'BNP per innbygger',
  unit: { code: 'USD', display: 'currency', currency: 'USD' },
  source: { id: 'sample', label: 'Lokalt eksempeldata', official: false },
  regions: [{ code: 'NO', name: 'Norge' }, { code: 'SE', name: 'Sverige' }],
  points: [
    { region: 'NO', period: '2023', value: 101200 },
    { region: 'SE', period: '2023', value: 56900 },
  ],
}

describe('IndicatorContent', () => {
  it('renders a loading state', () => {
    expect(renderToStaticMarkup(<IndicatorContent state={{ status: 'loading' }} />)).toContain('Laster indikator')
  })

  it('renders a service error state', () => {
    const markup = renderToStaticMarkup(<IndicatorContent state={{ status: 'error', message: 'Kilden er utilgjengelig.' }} />)
    expect(markup).toContain('Data kunne ikke lastes')
    expect(markup).toContain('Kilden er utilgjengelig.')
  })

  it('renders a chart shell from an IndicatorSeries', () => {
    const markup = renderToStaticMarkup(<IndicatorContent state={{ status: 'success', series }} />)
    expect(markup).toContain('BNP per innbygger')
    expect(markup).toContain('Linjegraf for BNP per innbygger')
    expect(markup).toContain('Lokalt eksempeldata - ikke offisielle tall')
  })
})
