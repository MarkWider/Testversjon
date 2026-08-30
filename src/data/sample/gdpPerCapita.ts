// Local sample series for the "gdp_per_capita" indicator, in contract shape.
//
// Values mirror the legacy src/data/gdpPerCapita.ts. That legacy module still
// exists only because the frontend imports it directly; it is removed once the
// frontend is migrated to getIndicatorData() (docs/proposals/data-contract.md,
// section "Migration"). NOT official statistics.

import type {
  IndicatorPoint,
  IndicatorSeries,
  RegionMeta,
} from '../../contracts/indicator'

interface Row {
  year: number
  NO: number
  SE: number
  DK: number
}

const ROWS: Row[] = [
  { year: 2015, NO: 74400, SE: 51600, DK: 53100 },
  { year: 2016, NO: 70200, SE: 52500, DK: 54600 },
  { year: 2017, NO: 72700, SE: 53700, DK: 56500 },
  { year: 2018, NO: 81600, SE: 54800, DK: 60900 },
  { year: 2019, NO: 75400, SE: 53600, DK: 59600 },
  { year: 2020, NO: 67200, SE: 52300, DK: 61100 },
  { year: 2021, NO: 89200, SE: 60300, DK: 68400 },
  { year: 2022, NO: 106300, SE: 59300, DK: 68100 },
  { year: 2023, NO: 101200, SE: 56900, DK: 68200 },
]

const REGIONS: RegionMeta[] = [
  { code: 'NO', name: 'Norge' },
  { code: 'SE', name: 'Sverige' },
  { code: 'DK', name: 'Danmark' },
]

// Deliberately built grouped by region (period NOT globally ascending) so the
// service's sorting guarantee is exercised rather than incidentally satisfied.
const points: IndicatorPoint[] = REGIONS.flatMap(({ code }) =>
  ROWS.map((row) => ({
    region: code,
    period: String(row.year),
    value: row[code as keyof Row],
  })),
)

export const gdpPerCapitaSampleSeries: IndicatorSeries = {
  indicator: 'gdp_per_capita',
  title: 'BNP per innbygger',
  subtitle: 'Løpende priser',
  unit: { code: 'USD', display: 'currency', currency: 'USD', decimals: 0 },
  source: { id: 'sample', label: 'Lokalt eksempeldata', official: false },
  regions: REGIONS,
  points,
}
