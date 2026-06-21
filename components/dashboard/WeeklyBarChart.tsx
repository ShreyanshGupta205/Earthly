'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { DailySummary } from '@/types'
import { getShortDay } from '@/lib/utils'

interface Props {
  data: DailySummary[]
}

const CATEGORY_COLORS: Record<string, string> = {
  transportCo2: '#5BA4FF',
  foodCo2:      '#F5A523',
  energyCo2:    '#CAFF33',
  shoppingCo2:  '#7DDFAA',
  wasteCo2:     '#FF4F4F',
  travelCo2:    '#b47fff',
  homeCo2:      '#FF9B4F',
}

interface TooltipPayloadEntry {
  name: string
  value: number
  fill: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + (p.value || 0), 0)
  return (
    <div className="glass-card p-3 text-xs min-w-[140px]">
      <p className="text-sand font-semibold mb-2">{label} — {total.toFixed(2)} kg</p>
      {payload.map((p) => p.value > 0 && (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-muted capitalize">{p.name.replace('Co2', '')}</span>
          <span className="ml-auto text-sand">{p.value.toFixed(2)}</span>
        </div>
      ))}
    </div>
  )
}

export function WeeklyBarChart({ data }: Props) {
  const chartData = data.map(d => ({
    day:         getShortDay(d.date),
    transport:   d.transportCo2,
    food:        d.foodCo2,
    energy:      d.energyCo2,
    shopping:    d.shoppingCo2,
    waste:       d.wasteCo2,
    travel:      d.travelCo2,
    home:        d.homeCo2,
    total:       d.totalCo2,
  }))

  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barSize={28} barGap={2}>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--muted)', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--muted)', fontSize: 11 }}
            width={32}
            tickFormatter={v => `${v}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(125,223,170,0.04)' }} />
          {Object.entries(CATEGORY_COLORS).map(([key, color]) => (
            <Bar key={key} dataKey={key.replace('Co2', '')} stackId="a" fill={color} radius={key === 'homeCo2' ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
