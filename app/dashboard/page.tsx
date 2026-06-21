'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { StatsBar } from '@/components/dashboard/StatsBar'
import { CO2Ring } from '@/components/dashboard/CO2Ring'
import { WeeklyBarChart } from '@/components/dashboard/WeeklyBarChart'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { ActionChecklist } from '@/components/dashboard/ActionChecklist'
import { InsightCards } from '@/components/dashboard/InsightCards'
import {
  getRecentLogs, getWeeklySummaries, getTodayActions,
  setTodayActions, getDailySummary,
} from '@/lib/firebase/firestore'
import { dailyToAnnualTonnes, calcGreenScore, generateActions, getWeekStart } from '@/lib/utils'
import type { InsightItem } from '@/types'
import { Analytics } from '@/lib/analytics'

export default function DashboardPage() {
  const { user, profile, refreshProfile } = useAuthContext()
  const today = new Date().toISOString().split('T')[0]
  const [insights, setInsights] = useState<InsightItem[]>([])
  const [insightsLoading, setInsightsLoading] = useState(false)
  const hasFetchedInsights = useRef(false)

  // Weekly summaries
  const { data: weeklySummaries = [], refetch: refetchSummaries } = useQuery({
    queryKey: ['weekly-summaries', user?.uid],
    queryFn:  () => getWeeklySummaries(user!.uid, 7),
    enabled:  !!user,
  })

  // Recent logs
  const { data: recentLogs = [], refetch: refetchLogs } = useQuery({
    queryKey: ['recent-logs', user?.uid],
    queryFn:  () => getRecentLogs(user!.uid, 10),
    enabled:  !!user,
  })

  // Today's summary
  const { data: todaySummary } = useQuery({
    queryKey: ['today-summary', user?.uid, today],
    queryFn:  () => getDailySummary(user!.uid, today),
    enabled:  !!user,
  })

  // Actions
  const { data: actions = [], refetch: refetchActions } = useQuery({
    queryKey: ['actions', user?.uid, today],
    queryFn:  () => getTodayActions(user!.uid),
    enabled:  !!user,
  })

  // Seed daily actions if none exist
  useEffect(() => {
    if (!user || actions.length > 0) return
    const topCategories = weeklySummaries
      .flatMap(s => [
        { category: 'transport', co2: s.transportCo2 },
        { category: 'food', co2: s.foodCo2 },
        { category: 'energy', co2: s.energyCo2 },
        { category: 'shopping', co2: s.shoppingCo2 },
      ])
      .sort((a, b) => b.co2 - a.co2)
      .slice(0, 3)

    if (topCategories.some(c => c.co2 > 0)) {
      const newActions = generateActions(topCategories)
      setTodayActions(user.uid, newActions.map(a => ({
        date: today, ...a, userId: user.uid, isCompleted: false,
      }))).then(() => refetchActions())
    }
  }, [user, actions.length, weeklySummaries, today, refetchActions])

  // Compute category totals as stable primitives (avoids array reference instability)
  const totalCo2Week = weeklySummaries.reduce((s, d) => s + d.totalCo2, 0)
  const byCatWeek = {
    transport: weeklySummaries.reduce((s, d) => s + d.transportCo2, 0),
    food:      weeklySummaries.reduce((s, d) => s + d.foodCo2, 0),
    energy:    weeklySummaries.reduce((s, d) => s + d.energyCo2, 0),
    shopping:  weeklySummaries.reduce((s, d) => s + d.shoppingCo2, 0),
    waste:     weeklySummaries.reduce((s, d) => s + d.wasteCo2, 0),
    travel:    weeklySummaries.reduce((s, d) => s + d.travelCo2, 0),
    home:      weeklySummaries.reduce((s, d) => s + d.homeCo2, 0),
  }
  // Stable fingerprint — only changes when actual values change
  const weekFingerprint = `${user?.uid}-${totalCo2Week.toFixed(2)}`

  // Load insights — only once per session (or on manual refresh)
  const loadInsights = useCallback(async () => {
    if (!user || !profile) return
    setInsightsLoading(true)
    hasFetchedInsights.current = true
    try {
      const weekStart = getWeekStart()
      const avg    = totalCo2Week / 7 || 0
      const topCat = Object.entries(byCatWeek).sort(([, a], [, b]) => b - a)[0]?.[0] || 'transport'

      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId:   user.uid,
          weekStart,
          userName: profile.fullName || 'there',
          weeklyData: {
            totalCO2:    totalCo2Week,
            byCategory:  byCatWeek,
            dailyAvg:    avg,
            previousWeek: totalCo2Week * 0.9,
            topActivity: topCat,
          },
        }),
      })
      const json = await res.json()
      if (json.insights?.length) setInsights(json.insights)
    } catch (e) {
      console.error('Insights error:', e)
    } finally {
      setInsightsLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, profile?.fullName, weekFingerprint])

  // Only fire once when user + data are ready
  useEffect(() => {
    if (hasFetchedInsights.current) return
    loadInsights()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, weekFingerprint])

  useEffect(() => {
    Analytics.viewDashboard()
  }, [])

  // Compute stats
  const todayCo2   = todaySummary?.totalCo2 || 0
  const monthlyCo2 = weeklySummaries.reduce((s, d) => s + d.totalCo2, 0)
  const dailyAvg   = monthlyCo2 / 7 || 0
  const annualT    = dailyToAnnualTonnes(dailyAvg)
  const greenScore = calcGreenScore(dailyAvg)

  const refetchAll = () => {
    refetchSummaries()
    refetchLogs()
    refreshProfile()
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-sand">
            Good {getGreeting()}, {profile?.fullName?.split(' ')[0] || 'there'} 🌿
          </h1>
          <p className="text-muted text-sm mt-1">Here&apos;s your carbon footprint overview</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted glass-card px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
          {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Stats bar */}
      <StatsBar
        todayCo2={todayCo2}
        monthlyCo2={monthlyCo2}
        streakDays={profile?.streakDays || 0}
        greenScore={greenScore}
      />

      {/* Main row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* CO₂ Ring + chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <CO2Ring value={annualT} size={200} />
              <div className="flex-1 w-full">
                <h2 className="font-display font-semibold text-sand mb-1">7-Day CO₂ Trend</h2>
                <p className="text-muted text-xs mb-4">Daily emissions breakdown by category</p>
                <WeeklyBarChart data={weeklySummaries} />
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold text-sand mb-4">Recent Activity</h2>
            <ActivityFeed logs={recentLogs} onDelete={refetchAll} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold text-sand mb-4">Today&apos;s Actions</h2>
            <ActionChecklist actions={actions} onUpdate={refetchActions} />
          </div>

          {/* Insights */}
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold text-sand mb-4">AI Insights</h2>
            <InsightCards insights={insights} loading={insightsLoading} onRefresh={loadInsights} />
          </div>
        </div>
      </div>
    </div>
  )
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
