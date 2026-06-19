import { type ClassValue, clsx } from 'clsx'
import { Level, LEVELS, Category } from '@/types'

// Tailwind class merge helper (lightweight)
export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ')
}

// Format CO₂ value
export function formatCO2(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)}t`
  if (kg >= 1)    return `${kg.toFixed(2)}kg`
  return `${(kg * 1000).toFixed(0)}g`
}

// Format date for display
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Get relative date label
export function getRelativeDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7)  return `${diff}d ago`
  return formatDate(dateStr)
}

// Calculate green score (0–100)
export function calcGreenScore(dailyAvgKg: number): number {
  const globalAvg = 13 // kg CO₂/day
  const score = Math.max(0, Math.min(100, (1 - dailyAvgKg / globalAvg) * 100))
  return Math.round(score * 10) / 10
}

// Get level based on green score
export function getLevel(greenScore: number): Level {
  const levels = [...LEVELS].reverse()
  return levels.find(l => greenScore >= l.min) || LEVELS[0]
}

// Get color for CO₂ value relative to target
export function getCO2Color(annualTonnes: number): string {
  if (annualTonnes <= 2)  return '#CAFF33' // green — on target
  if (annualTonnes <= 6)  return '#F5A523' // amber — moderate
  return '#FF4F4F'                          // red — high
}

// Get week start date (Monday)
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

// Get last N days as date strings
export function getLastNDays(n: number): string[] {
  const days: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

// Convert annual kg to tonnes
export function kgToTonnes(kg: number): number {
  return Math.round((kg / 1000) * 100) / 100
}

// Convert daily kg CO₂ to annual tonnes
export function dailyToAnnualTonnes(dailyKg: number): number {
  return parseFloat((dailyKg * 365 / 1000).toFixed(2))
}

// Global benchmarks (kg CO₂/day)
export const BENCHMARKS = {
  globalAvg: 13,
  indiaAvg:  4.7,
  target15:  5.5,
  target2:   7.5,
}

// Format number with commas
export function formatNumber(n: number, decimals = 1): string {
  return n.toLocaleString('en-IN', { maximumFractionDigits: decimals })
}

// Clamp value
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// Short day labels
export function getShortDay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' })
}

// Generate daily action suggestions based on top emissions
export function generateActions(topCategories: Array<{ category: string; co2: number }>) {
  const actionMap: Record<string, Array<{ title: string; savingKg: number }>> = {
    transport: [
      { title: 'Walk or cycle for trips under 2km', savingKg: 0.42 },
      { title: 'Use public transport today',         savingKg: 0.85 },
      { title: 'Carpool with a colleague',           savingKg: 0.6 },
    ],
    food: [
      { title: 'Have a plant-based meal today',   savingKg: 1.3 },
      { title: 'Skip beef, choose chicken instead', savingKg: 4.5 },
      { title: 'Eat locally sourced food',         savingKg: 0.5 },
    ],
    energy: [
      { title: 'Turn off lights in unused rooms',   savingKg: 0.2 },
      { title: 'Lower AC by 2°C today',             savingKg: 0.35 },
      { title: 'Air-dry clothes instead of dryer',  savingKg: 0.8 },
    ],
    shopping: [
      { title: 'Avoid single-use plastic purchases', savingKg: 0.3 },
      { title: 'Buy second-hand instead of new',     savingKg: 3.0 },
    ],
    waste: [
      { title: 'Compost food scraps today',    savingKg: 0.25 },
      { title: 'Recycle plastic and paper',    savingKg: 0.15 },
    ],
    travel: [
      { title: 'Choose train over short flights', savingKg: 50 },
      { title: 'Pack light to reduce fuel use',   savingKg: 2 },
    ],
    home: [
      { title: 'Fix dripping taps to save energy', savingKg: 0.1 },
      { title: 'Use LED bulbs throughout',          savingKg: 0.5 },
    ],
  }

  const actions: Array<{ title: string; category: Category; savingKg: number }> = []
  for (const { category } of topCategories.slice(0, 3)) {
    const opts = actionMap[category] || []
    const pick = opts[Math.floor(Math.random() * opts.length)]
    if (pick) actions.push({ ...pick, category: category as Category })
  }
  return actions
}
