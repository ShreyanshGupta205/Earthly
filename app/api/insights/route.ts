import { NextResponse } from 'next/server'
import { generateInsights } from '@/lib/ai/gemini'
import { WeeklyData } from '@/types'

// Simple in-memory cache keyed by userId+weekStart
const cache = new Map<string, { insights: any[]; at: number }>()
const TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { weeklyData, userName, userId, weekStart } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const cacheKey = `${userId}-${weekStart}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.at < TTL) {
      return NextResponse.json({ insights: cached.insights, cached: true })
    }

    // Always generate — even with zero data (onboarding insights)
    const data = weeklyData || { totalCO2: 0, byCategory: {}, dailyAvg: 0, previousWeek: 0, topActivity: 'transport' }
    const insights = await generateInsights(data as WeeklyData, userName || 'there')

    cache.set(cacheKey, { insights, at: Date.now() })

    return NextResponse.json({ insights, cached: false })
  } catch (error: any) {
    console.error('Insights API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId    = searchParams.get('userId')
  const weekStart = searchParams.get('weekStart')

  if (!userId || !weekStart) {
    return NextResponse.json({ insights: [] })
  }

  const cacheKey = `${userId}-${weekStart}`
  const cached = cache.get(cacheKey)

  if (cached && Date.now() - cached.at < TTL) {
    return NextResponse.json({ insights: cached.insights, cached: true })
  }

  return NextResponse.json({ insights: [] })
}
