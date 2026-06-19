import { EMISSION_FACTORS } from './factors'

export interface ActivityInput {
  subType: string
  quantity: number
}

// Calculate CO₂ for a given activity (client-safe, no DB call)
export function calculateCO2(input: ActivityInput): number {
  const factor = EMISSION_FACTORS[input.subType]
  if (!factor) throw new Error(`No emission factor for: ${input.subType}`)
  return parseFloat((factor.co2PerUnit * input.quantity).toFixed(6))
}

// Live preview: returns kg as formatted string
export function previewCO2(subType: string, quantity: number): string {
  if (!subType || quantity <= 0) return '—'
  try {
    const kg = calculateCO2({ subType, quantity })
    if (kg === 0) return '0 kg CO₂'
    if (kg < 0.001) return `${(kg * 1000000).toFixed(0)}μg CO₂`
    if (kg < 1) return `${(kg * 1000).toFixed(0)}g CO₂`
    return `${kg.toFixed(2)} kg CO₂`
  } catch {
    return '—'
  }
}

// Calculate annual CO₂ from daily average kg
export function dailyToAnnualTonnes(dailyKg: number): number {
  return parseFloat((dailyKg * 365 / 1000).toFixed(2))
}

// Global benchmarks (kg CO₂/day)
export const BENCHMARKS = {
  globalAvg:  13,
  indiaAvg:   4.7,
  target15:   5.5,   // 1.5°C pathway
  target2:    7.5,   // 2°C pathway
}
