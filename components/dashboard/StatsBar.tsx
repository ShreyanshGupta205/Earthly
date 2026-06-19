'use client'

import { motion } from 'framer-motion'
import { Flame, Leaf, Calendar, Star } from 'lucide-react'
import { formatCO2, getCO2Color } from '@/lib/utils'

interface Stat {
  label:   string
  value:   string
  sub?:    string
  icon:    React.ReactNode
  color:   string
  trend?:  number // % change
}

interface Props {
  todayCo2:     number
  monthlyCo2:   number
  streakDays:   number
  greenScore:   number
}

export function StatsBar({ todayCo2, monthlyCo2, streakDays, greenScore }: Props) {
  const stats: Stat[] = [
    {
      label: "Today's CO₂",
      value: formatCO2(todayCo2),
      sub:   `${(todayCo2 / 13 * 100).toFixed(0)}% of global avg`,
      icon:  <Calendar size={18} />,
      color: getCO2Color(todayCo2 * 365 / 1000),
    },
    {
      label: 'Monthly Total',
      value: formatCO2(monthlyCo2),
      sub:   `${(monthlyCo2 / 30).toFixed(1)} kg/day avg`,
      icon:  <Leaf size={18} />,
      color: '#7DDFAA',
    },
    {
      label: 'Day Streak',
      value: `${streakDays}d`,
      sub:   streakDays > 0 ? '🔥 Keep it up!' : 'Log today to start',
      icon:  <Flame size={18} />,
      color: streakDays >= 7 ? '#F5A523' : streakDays > 0 ? '#CAFF33' : 'var(--muted)',
    },
    {
      label: 'Green Score',
      value: `${greenScore.toFixed(0)}`,
      sub:   `out of 100`,
      icon:  <Star size={18} />,
      color: greenScore >= 60 ? '#CAFF33' : greenScore >= 30 ? '#7DDFAA' : 'var(--muted)',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="stat-card"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="text-muted text-xs font-medium uppercase tracking-wide">{stat.label}</div>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${stat.color}15`, color: stat.color }}
            >
              {stat.icon}
            </div>
          </div>
          <div
            className="font-display text-2xl font-bold mb-1"
            style={{ color: stat.color }}
          >
            {stat.value}
          </div>
          <div className="text-muted text-xs">{stat.sub}</div>
        </motion.div>
      ))}
    </div>
  )
}
