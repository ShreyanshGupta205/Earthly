'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { InsightCards } from '@/components/dashboard/InsightCards'
import { WeeklyBarChart } from '@/components/dashboard/WeeklyBarChart'
import { useQuery } from '@tanstack/react-query'
import { getWeeklySummaries, getLogsByDateRange } from '@/lib/firebase/firestore'
import { InsightItem, CATEGORY_META } from '@/types'
import { getWeekStart, calcGreenScore, BENCHMARKS, dailyToAnnualTonnes } from '@/lib/utils'
import { calculateCO2 } from '@/lib/co2/calculator'
import { EMISSION_FACTORS } from '@/lib/co2/factors'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getShortDay } from '@/lib/utils'
import { Analytics } from '@/lib/analytics'


export default function InsightsPage() {
  const { user, profile } = useAuthContext()
  const [insights, setInsights] = useState<InsightItem[]>([])
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [whatIfSubType, setWhatIfSubType] = useState('car_petrol')
  const [whatIfKm, setWhatIfKm] = useState(20)
  const hasFetched = useRef(false)

  const { data: weeklySummaries = [] } = useQuery({
    queryKey: ['weekly-summaries', user?.uid],
    queryFn:  () => getWeeklySummaries(user!.uid, 7),
    enabled:  !!user,
  })

  const totalCo2   = weeklySummaries.reduce((s, d) => s + d.totalCo2, 0)
  const dailyAvg   = totalCo2 / 7 || 0
  const annualT    = dailyToAnnualTonnes(dailyAvg)

  // What-if calculator
  const currentFactor = EMISSION_FACTORS[whatIfSubType]
  const whatIfSaving  = whatIfKm * (currentFactor?.co2PerUnit || 0) * 365 / 1000

  // Stable fingerprint — only changes when CO2 values change
  const weekFingerprint = `${user?.uid}-${totalCo2.toFixed(2)}`

  const loadInsights = useCallback(async () => {
    if (!user || !profile) return
    setInsightsLoading(true)
    hasFetched.current = true
    Analytics.viewInsights()

    try {
      const weekStart = getWeekStart()
      const byCat = {
        transport: weeklySummaries.reduce((s, d) => s + d.transportCo2, 0),
        food:      weeklySummaries.reduce((s, d) => s + d.foodCo2, 0),
        energy:    weeklySummaries.reduce((s, d) => s + d.energyCo2, 0),
        shopping:  weeklySummaries.reduce((s, d) => s + d.shoppingCo2, 0),
        waste:     weeklySummaries.reduce((s, d) => s + ((d as any).wasteCo2 || 0), 0),
        travel:    weeklySummaries.reduce((s, d) => s + ((d as any).travelCo2 || 0), 0),
        home:      weeklySummaries.reduce((s, d) => s + ((d as any).homeCo2 || 0), 0),
      }
      const topCat = Object.entries(byCat).sort(([,a],[,b]) => b-a)[0]?.[0] || 'transport'

      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId:    user.uid,
          weekStart,
          userName:  profile.fullName || 'there',
          weeklyData: {
            totalCO2:     totalCo2,
            byCategory:   byCat,
            dailyAvg,
            previousWeek: totalCo2 * 0.9,
            topActivity:  topCat,
          },
        }),
      })
      const json = await res.json()
      if (json.insights?.length) setInsights(json.insights)
    } finally {
      setInsightsLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, profile?.fullName, weekFingerprint])

  // Only fire once per page load (or on manual refresh)
  useEffect(() => {
    if (hasFetched.current) return
    loadInsights()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, weekFingerprint])

  const chartData = weeklySummaries.map(d => ({
    day:       getShortDay(d.date),
    transport: d.transportCo2,
    food:      d.foodCo2,
    energy:    d.energyCo2,
    shopping:  d.shoppingCo2,
    waste:     d.wasteCo2,
    travel:    d.travelCo2,
    home:      d.homeCo2,
  }))

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-sand">AI Insights</h1>
        <p className="text-muted text-sm mt-1">Your weekly carbon analysis powered by Google Gemini</p>
      </div>

      {/* Gemini Insights */}
      <div className="glass-card p-6">
        <InsightCards insights={insights} loading={insightsLoading} onRefresh={loadInsights} />
      </div>

      {/* Benchmark comparison */}
      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-sand mb-6">How You Compare</h2>
        <div className="space-y-4">
          {[
            { label: 'Your daily average', value: dailyAvg, max: 15, color: '#CAFF33' },
            { label: 'India average',       value: BENCHMARKS.indiaAvg, max: 15, color: '#7DDFAA' },
            { label: 'Global average',      value: BENCHMARKS.globalAvg, max: 15, color: '#F5A523' },
            { label: '1.5°C target',        value: BENCHMARKS.target15, max: 15, color: '#FF4F4F' },
          ].map(b => (
            <div key={b.label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted">{b.label}</span>
                <span className="font-semibold" style={{ color: b.color }}>{b.value.toFixed(1)} kg/day</span>
              </div>
              <div className="h-2 bg-card2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((b.value / b.max) * 100, 100)}%`, background: b.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-day trend chart */}
      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-sand mb-2">7-Day Breakdown</h2>
        <p className="text-muted text-xs mb-5">Emissions by category per day</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                {[
                  ['transport', '#5BA4FF'], ['food', '#F5A523'], ['energy', '#CAFF33'],
                  ['shopping', '#7DDFAA'], ['waste', '#FF4F4F'],
                ].map(([k, c]) => (
                  <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={c} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={c} stopOpacity={0}   />
                  </linearGradient>
                ))}
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} width={30} />
              <Tooltip contentStyle={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--sand)', fontSize: '12px' }} />
              {[
                ['transport','#5BA4FF'], ['food','#F5A523'], ['energy','#CAFF33'],
                ['shopping','#7DDFAA'], ['waste','#FF4F4F'],
              ].map(([k, c]) => (
                <Area key={k} type="monotone" dataKey={k} stackId="1" stroke={c} fill={`url(#grad-${k})`} strokeWidth={1.5} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* What-if calculator */}
      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-sand mb-2">What-If Calculator</h2>
        <p className="text-muted text-xs mb-5">See how switching habits could reduce your annual footprint</p>
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-muted mb-1.5">Current transport</label>
            <select
              value={whatIfSubType}
              onChange={e => setWhatIfSubType(e.target.value)}
              className="input-field"
              id="whatif-type"
            >
              {Object.values(EMISSION_FACTORS).filter(f => f.category === 'transport').map(f => (
                <option key={f.subType} value={f.subType}>{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">Daily km</label>
            <input
              type="number"
              value={whatIfKm}
              onChange={e => setWhatIfKm(Number(e.target.value))}
              min="1"
              className="input-field"
              id="whatif-km"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Switch to EV',       saving: whatIfKm * (EMISSION_FACTORS[whatIfSubType]?.co2PerUnit - EMISSION_FACTORS.car_electric.co2PerUnit) * 365 / 1000 },
            { label: 'Switch to Bus',      saving: whatIfKm * (EMISSION_FACTORS[whatIfSubType]?.co2PerUnit - EMISSION_FACTORS.bus.co2PerUnit) * 365 / 1000 },
            { label: 'Switch to Metro',    saving: whatIfKm * (EMISSION_FACTORS[whatIfSubType]?.co2PerUnit - EMISSION_FACTORS.metro.co2PerUnit) * 365 / 1000 },
          ].map(opt => (
            <div key={opt.label} className="text-center p-4 rounded-xl" style={{ background: opt.saving > 0 ? 'rgba(202,255,51,0.07)' : 'var(--card2)', border: `1px solid ${opt.saving > 0 ? 'rgba(202,255,51,0.15)' : 'var(--border)'}` }}>
              <div className="font-display text-xl font-bold" style={{ color: opt.saving > 0 ? '#CAFF33' : 'var(--muted)' }}>
                {opt.saving > 0 ? `-${opt.saving.toFixed(2)}t` : 'No saving'}
              </div>
              <div className="text-muted text-xs mt-1">{opt.label} / year</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
