import { type ClassValue, clsx } from 'clsx'
import { LEVELS } from '@/types'
import type { Level, Category } from '@/types'

/**
 * Merges class names, filtering out falsy values.
 * Uses clsx for conditional class handling.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

/**
 * Formats a CO₂ value in kg into a human-readable string.
 * - >= 1000 kg → tonnes (e.g. "1.50t")
 * - >= 1 kg → kilograms (e.g. "2.10kg")
 * - < 1 kg → grams (e.g. "500g")
 */
export function formatCO2(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)}t`
  if (kg >= 1)    return `${kg.toFixed(2)}kg`
  return `${(kg * 1000).toFixed(0)}g`
}

/** Formats a YYYY-MM-DD date string for display (locale-aware). */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * Returns a relative date label: "Today", "Yesterday", "Xd ago",
 * or a formatted date string for dates older than 7 days.
 */
export function getRelativeDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7)  return `${diff}d ago`
  return formatDate(dateStr)
}

/**
 * Calculates a green score from 0 to 100 based on daily CO₂ average.
 * A score of 100 means zero emissions; 0 means at or above the global average (13 kg/day).
 */
export function calcGreenScore(dailyAvgKg: number): number {
  const globalAvg = 13 // kg CO₂/day
  const score = Math.max(0, Math.min(100, (1 - dailyAvgKg / globalAvg) * 100))
  return Math.round(score * 10) / 10
}

/**
 * Returns the gamification Level object for a given green score.
 * Levels are defined in the LEVELS constant in types/index.ts.
 */
export function getLevel(greenScore: number): Level {
  const levels = [...LEVELS].reverse()
  return levels.find(l => greenScore >= l.min) || LEVELS[0]
}

/**
 * Returns a color hex string indicating CO₂ level relative to climate targets.
 * - Green (#CAFF33): on target (≤ 2t/year)
 * - Amber (#F5A523): moderate (≤ 6t/year)
 * - Red (#FF4F4F): high (> 6t/year)
 */
export function getCO2Color(annualTonnes: number): string {
  if (annualTonnes <= 2)  return '#CAFF33' // green — on target
  if (annualTonnes <= 6)  return '#F5A523' // amber — moderate
  return '#FF4F4F'                          // red — high
}

/**
 * Returns the ISO date string (YYYY-MM-DD) for the Monday of the week
 * containing the given date. Defaults to the current week.
 */
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

/**
 * Returns an array of the last N date strings (YYYY-MM-DD),
 * ordered oldest-first, ending with today.
 */
export function getLastNDays(n: number): string[] {
  const days: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

/**
 * Converts kilograms to metric tonnes, rounded to 2 decimal places.
 */
export function kgToTonnes(kg: number): number {
  return Math.round((kg / 1000) * 100) / 100
}

/**
 * Converts a daily CO₂ average (kg/day) to annual tonnes.
 * Formula: dailyKg × 365 / 1000, rounded to 2 decimal places.
 */
export function dailyToAnnualTonnes(dailyKg: number): number {
  return parseFloat((dailyKg * 365 / 1000).toFixed(2))
}

/** Global CO₂ emission benchmarks in kg/day, sourced from IPCC 2023 and CEA India. */
export const BENCHMARKS = {
  globalAvg: 13,
  indiaAvg:  4.7,
  target15:  5.5,
  target2:   7.5,
}

/**
 * Formats a number with locale-appropriate grouping separators.
 * @param n - The number to format
 * @param decimals - Maximum decimal places (default: 1)
 */
export function formatNumber(n: number, decimals = 1): string {
  return n.toLocaleString('en-IN', { maximumFractionDigits: decimals })
}

/**
 * Clamps a value between min and max (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Returns a short weekday label (e.g. "Mon", "Tue") for a date string.
 */
export function getShortDay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' })
}

/**
 * Generates a list of daily action suggestions based on the user's top emission categories.
 * Returns up to 3 actions, one per top category.
 * @param topCategories - Array of category objects with co2 values, sorted highest-first
 */
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
