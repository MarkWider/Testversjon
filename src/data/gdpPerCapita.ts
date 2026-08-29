export type Country = 'Norge' | 'Sverige' | 'Danmark'

export type GdpObservation = {
  year: number
  Norge: number
  Sverige: number
  Danmark: number
}

// Deliberately local sample data: it lets the pilot test the UI before an official data adapter exists.
export const gdpPerCapitaSample: GdpObservation[] = [
  { year: 2015, Norge: 74400, Sverige: 51600, Danmark: 53100 },
  { year: 2016, Norge: 70200, Sverige: 52500, Danmark: 54600 },
  { year: 2017, Norge: 72700, Sverige: 53700, Danmark: 56500 },
  { year: 2018, Norge: 81600, Sverige: 54800, Danmark: 60900 },
  { year: 2019, Norge: 75400, Sverige: 53600, Danmark: 59600 },
  { year: 2020, Norge: 67200, Sverige: 52300, Danmark: 61100 },
  { year: 2021, Norge: 89200, Sverige: 60300, Danmark: 68400 },
  { year: 2022, Norge: 106300, Sverige: 59300, Danmark: 68100 },
  { year: 2023, Norge: 101200, Sverige: 56900, Danmark: 68200 },
]

export const countries: Country[] = ['Norge', 'Sverige', 'Danmark']

export function formatUsd(value: number): string {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}
