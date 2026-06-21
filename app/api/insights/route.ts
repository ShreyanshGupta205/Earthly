import { NextResponse } from 'next/server'
import { z } from 'zod'
import { generateInsights } from '@/lib/ai/gemini'
import type { WeeklyData, InsightItem } from '@/types'

/** Common security headers for all API responses. */
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
} as const

/** Zod schema for POST request body validation. */
const InsightsPostSchema = z.object({
  userId:    z.string().min(1),
  weekStart: z.string().min(1),
  userName:  z.string().optional(),
  weeklyData: z.object({
    totalCO2:     z.number().min(0),
    byCategory:   z.record(z.string(), z.number()),
    dailyAvg:     z.number().min(0),
    previousWeek: z.number().min(0),
    topActivity:  z.string(),
  }).optional(),
})

/** Cache entry for insights. */
interface CacheEntry {
  insights: InsightItem[]
  at: number
}

/** Bounded in-memory cache — max 500 entries to prevent memory leaks. */
const MAX_CACHE_SIZE = 500
const cache = new Map<string, CacheEntry>()
const TTL = 7 * 24 * 60 * 60 * 1000 // 7 days in ms

/** Evict oldest entries when cache exceeds max size. */
function pruneCache() {
  if (cache.size <= MAX_CACHE_SIZE) return
  const oldest = Array.from(cache.entries()).sort((a, b) => a[1].at - b[1].at)
  for (const [key] of oldest.slice(0, cache.size - MAX_CACHE_SIZE)) {
    cache.delete(key)
  }
}

/**
 * POST /api/insights
 * Generates AI insights for a user's weekly emission data.
 * Returns cached insights if within TTL.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = InsightsPostSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    const { userId, weekStart, userName, weeklyData } = parsed.data

    const cacheKey = `${userId}-${weekStart}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.at < TTL) {
      return NextResponse.json(
        { insights: cached.insights, cached: true },
        { headers: SECURITY_HEADERS }
      )
    }

    // Always generate — even with zero data (onboarding insights)
    const data: WeeklyData = weeklyData ?? {
      totalCO2: 0,
      byCategory: {},
      dailyAvg: 0,
      previousWeek: 0,
      topActivity: 'transport',
    }

    const insights = await generateInsights(data, userName ?? 'there')

    cache.set(cacheKey, { insights, at: Date.now() })
    pruneCache()

    return NextResponse.json(
      { insights, cached: false },
      { headers: SECURITY_HEADERS }
    )
  } catch (error: unknown) {
    console.error('Insights API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}

/**
 * GET /api/insights?userId=...&weekStart=...
 * Returns cached insights if available, otherwise empty array.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId    = searchParams.get('userId')
  const weekStart = searchParams.get('weekStart')

  if (!userId || !weekStart) {
    return NextResponse.json(
      { insights: [] },
      { headers: SECURITY_HEADERS }
    )
  }

  const cacheKey = `${userId}-${weekStart}`
  const cached = cache.get(cacheKey)

  if (cached && Date.now() - cached.at < TTL) {
    return NextResponse.json(
      { insights: cached.insights, cached: true },
      { headers: SECURITY_HEADERS }
    )
  }

  return NextResponse.json(
    { insights: [] },
    { headers: SECURITY_HEADERS }
  )
}

