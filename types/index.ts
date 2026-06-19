// ─── Profile ─────────────────────────────────────────────
export interface Profile {
  id: string
  username: string
  fullName: string
  avatarUrl: string
  country: string
  createdAt: string
  streakDays: number
  lastActive: string
  greenScore: number
  totalSaved: number
}

// ─── Activity ─────────────────────────────────────────────
export type Category = 'transport' | 'food' | 'energy' | 'shopping' | 'waste' | 'travel' | 'home'

export interface ActivityLog {
  id: string
  userId: string
  category: Category
  subType: string
  quantity: number
  unit: string
  co2Kg: number
  loggedAt: string
  date: string
  notes?: string
}

// ─── Daily Summary ────────────────────────────────────────
export interface DailySummary {
  date: string
  totalCo2: number
  transportCo2: number
  foodCo2: number
  energyCo2: number
  shoppingCo2: number
  wasteCo2: number
  travelCo2: number
  homeCo2: number
}

// ─── Action ───────────────────────────────────────────────
export interface Action {
  id: string
  userId: string
  date: string
  title: string
  category: Category
  savingKg: number
  isCompleted: boolean
  completedAt?: string
}

// ─── Insight ──────────────────────────────────────────────
export type InsightType = 'win' | 'pattern' | 'info' | 'alert'

export interface InsightItem {
  type: InsightType
  title: string
  text: string
  metric: string
  action: string
}

export interface InsightRecord {
  id: string
  userId: string
  weekStart: string
  insightsJson: InsightItem[]
  createdAt: string
}

// ─── Emission Factor ──────────────────────────────────────
export interface EmissionFactor {
  category: Category
  subType: string
  label: string
  co2PerUnit: number
  unit: string
  source: string
}

// ─── Level / Gamification ─────────────────────────────────
export interface Level {
  min: number
  label: string
  color: string
  emoji: string
}

export const LEVELS: Level[] = [
  { min: 0,  label: 'Carbon Starter',   color: '#527A5F', emoji: '🌱' },
  { min: 20, label: 'Eco Aware',        color: '#7DDFAA', emoji: '🌿' },
  { min: 40, label: 'Green Thinker',    color: '#CAFF33', emoji: '🍃' },
  { min: 60, label: 'Climate Champion', color: '#CAFF33', emoji: '🌍' },
  { min: 80, label: 'Planet Guardian',  color: '#F5A523', emoji: '🌟' },
  { min: 95, label: 'Carbon Hero',      color: '#CAFF33', emoji: '🦸' },
]

export const CATEGORY_META: Record<Category, { label: string; emoji: string; unit: string; color: string }> = {
  transport: { label: 'Transport', emoji: '🚗', unit: 'km',  color: '#5BA4FF' },
  food:      { label: 'Food',      emoji: '🍽️', unit: 'meal', color: '#F5A523' },
  energy:    { label: 'Energy',    emoji: '⚡', unit: 'kWh', color: '#CAFF33' },
  shopping:  { label: 'Shopping',  emoji: '🛍️', unit: 'item', color: '#7DDFAA' },
  waste:     { label: 'Waste',     emoji: '🗑️', unit: 'kg',  color: '#FF4F4F' },
  travel:    { label: 'Travel',    emoji: '✈️', unit: 'km',  color: '#b47fff' },
  home:      { label: 'Home',      emoji: '🏠', unit: 'unit', color: '#FF9B4F' },
}

// ─── Weekly data for AI ───────────────────────────────────
export interface WeeklyData {
  totalCO2: number
  byCategory: Record<string, number>
  dailyAvg: number
  previousWeek: number
  topActivity: string
}

// ─── API Response types ───────────────────────────────────
export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface LogResponse {
  log: ActivityLog
  co2Kg: number
}
