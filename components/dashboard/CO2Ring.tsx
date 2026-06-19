'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { getCO2Color } from '@/lib/utils'

interface Props {
  value: number    // annual CO₂ in tonnes
  target?: number  // 1.5°C target default 2t
  size?: number
}

export function CO2Ring({ value, target = 2, size = 220 }: Props) {
  const prefersReduced = useReducedMotion()
  const maxDisplay = 14
  const pct = Math.min(value / maxDisplay, 1)
  const r = size * 0.43
  const circumference = 2 * Math.PI * r
  const dashOffset = circumference * (1 - pct)
  const color = getCO2Color(value)
  const overPct = value > target ? ((value - target) / target * 100).toFixed(0) : null

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Your carbon footprint: ${value.toFixed(1)} tonnes CO₂ per year. ${overPct ? `${overPct}% over the 1.5°C target` : 'On target'}`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="rgba(125,223,170,0.07)"
          strokeWidth={size * 0.055}
        />
        {/* Target marker */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="rgba(202,255,51,0.15)"
          strokeWidth={size * 0.055}
          strokeDasharray={`${circumference * (target / maxDisplay)} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Value arc */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={size * 0.055}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: prefersReduced ? dashOffset : circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.4, ease: [0.23, 1, 0.32, 1] }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Glow filter */}
        <defs>
          <filter id="ring-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-display font-bold tracking-tight leading-none"
          style={{ fontSize: size * 0.155, color }}
          initial={prefersReduced ? {} : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {value.toFixed(1)}t
        </motion.span>
        <span className="text-muted text-xs mt-1.5">CO₂ per year</span>
        <span className="text-xs mt-1" style={{ color: value <= target ? 'var(--mint)' : 'var(--amber)' }}>
          {value <= target ? '✓ On target' : `${overPct}% over target`}
        </span>
        <span className="text-muted/50 text-[10px] mt-0.5">1.5°C goal: 2t</span>
      </div>
    </div>
  )
}
