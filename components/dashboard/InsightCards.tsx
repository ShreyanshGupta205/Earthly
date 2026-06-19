'use client'

import { motion } from 'framer-motion'
import { RefreshCw, Trophy, AlertTriangle, TrendingUp, Info } from 'lucide-react'
import { InsightItem } from '@/types'
import { useState } from 'react'
import { Analytics } from '@/lib/analytics'

interface Props {
  insights:    InsightItem[]
  loading?:    boolean
  onRefresh?:  () => Promise<void>
}

const TYPE_CONFIG = {
  win:     { icon: Trophy,        color: '#CAFF33', bg: 'rgba(202,255,51,0.08)',  label: 'Win' },
  alert:   { icon: AlertTriangle, color: '#FF4F4F', bg: 'rgba(255,79,79,0.08)',   label: 'Alert' },
  pattern: { icon: TrendingUp,    color: '#5BA4FF', bg: 'rgba(91,164,255,0.08)',  label: 'Pattern' },
  info:    { icon: Info,          color: '#7DDFAA', bg: 'rgba(125,223,170,0.08)', label: 'Info' },
}

export function InsightCards({ insights, loading, onRefresh }: Props) {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (!onRefresh) return
    setRefreshing(true)
    Analytics.generateInsights()
    try { await onRefresh() } finally { setRefreshing(false) }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="glass-card p-5 h-36 shimmer rounded-xl" />
        ))}
      </div>
    )
  }

  if (!insights.length) {
    return (
      <div className="text-center py-10 text-muted">
        <div className="text-4xl mb-3">🤖</div>
        <p className="text-sm font-medium text-sand">No insights yet</p>
        <p className="text-xs mt-1">Log activities for a week to get AI insights powered by Google Gemini.</p>
        {onRefresh && (
          <button onClick={handleRefresh} className="btn-secondary mt-4 text-sm mx-auto">
            Generate Now
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">Powered by</span>
          <span className="badge badge-blue text-[11px]">🤖 Google Gemini</span>
        </div>
        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-muted hover:text-sand text-xs transition-colors"
            aria-label="Refresh insights"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {insights.map((insight, i) => {
          const cfg = TYPE_CONFIG[insight.type] || TYPE_CONFIG.info
          const Icon = cfg.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5 flex flex-col gap-3 hover:scale-[1.01] transition-transform"
              style={{ borderColor: `${cfg.color}15` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.bg }}
                  >
                    <Icon size={14} style={{ color: cfg.color }} />
                  </div>
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                </div>
                <span className="text-xs font-bold text-sand/80 shrink-0">{insight.metric}</span>
              </div>

              {/* Title */}
              <h3 className="text-sand font-display font-semibold text-sm leading-snug">{insight.title}</h3>

              {/* Text */}
              <p className="text-muted text-xs leading-relaxed">{insight.text}</p>

              {/* Action */}
              <div
                className="text-xs px-3 py-2 rounded-lg mt-auto"
                style={{ background: `${cfg.color}08`, color: cfg.color, border: `1px solid ${cfg.color}18` }}
              >
                → {insight.action}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
