'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const FEATURES = [
  { emoji: '📊', title: 'Real-time Dashboard',   desc: 'Live CO₂ ring gauge, weekly bar charts, and activity feed updated as you log.' },
  { emoji: '🤖', title: 'Gemini AI Insights',    desc: 'Google Gemini 1.5 Flash analyzes your patterns and coaches you weekly — for free.' },
  { emoji: '🔥', title: 'Streak & Green Score',  desc: 'Stay motivated with daily streaks and a gamified Green Score from 0–100.' },
  { emoji: '📈', title: 'Trend Analysis',         desc: 'Monthly breakdowns, category comparisons, and what-if calculators.' },
  { emoji: '⚡', title: 'Quick Logging',          desc: 'Pre-set quick-log buttons for your most common activities. Log in under 5 seconds.' },
  { emoji: '🔐', title: 'Secure with Firebase',  desc: 'Your data lives in your account. Google Firebase with row-level security.' },
  { emoji: '📤', title: 'CSV Export',             desc: 'Export your complete activity history as CSV — your data, always.' },
  { emoji: '🌍', title: 'Compare Globally',       desc: 'See how you stack against India, global, and 1.5°C climate targets.' },
]

export default function FeaturesGrid() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="features" ref={ref} className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <span className="badge badge-mint mb-4">Features</span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-sand mt-3">
            Everything you need to{' '}
            <span className="gradient-text-lime">go green</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="glass-card p-5 hover:border-lime/12 transition-all duration-300 hover:-translate-y-0.5 group cursor-default"
            >
              <div className="text-2xl mb-3">{f.emoji}</div>
              <h3 className="font-display font-semibold text-sand text-sm mb-2">{f.title}</h3>
              <p className="text-muted text-xs leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
