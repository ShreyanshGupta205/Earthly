'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const STEPS = [
  {
    step: '01',
    emoji: '📝',
    title: 'Log Your Activities',
    desc: 'Track transport, food, energy, shopping, waste and travel in seconds. Quick-log presets make it effortless.',
    color: '#CAFF33',
  },
  {
    step: '02',
    emoji: '🤖',
    title: 'Get Gemini AI Insights',
    desc: 'Google Gemini analyzes your weekly data and delivers 4 personalized insights — wins, alerts, and patterns unique to you.',
    color: '#7DDFAA',
  },
  {
    step: '03',
    emoji: '✅',
    title: 'Take Daily Actions',
    desc: 'Your personalized action checklist adapts to your biggest emission sources. Complete actions, build streaks, raise your Green Score.',
    color: '#5BA4FF',
  },
]

export default function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="how-it-works" ref={ref} className="py-32 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="badge badge-lime mb-4">How It Works</span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-sand mt-3">
            Three steps to a{' '}
            <span className="gradient-text-lime">greener life</span>
          </h2>
          <p className="text-muted text-lg mt-4 max-w-2xl mx-auto">
            From logging your first activity to hitting your carbon targets — Earthly guides you every step of the way.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-lime/20 to-transparent" />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative group"
            >
              <div className="glass-card p-8 h-full hover:border-lime/15 transition-all duration-300 group-hover:transform group-hover:-translate-y-1">
                {/* Step number */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: `${step.color}15`, border: `1px solid ${step.color}25` }}
                  >
                    {step.emoji}
                  </div>
                  <span
                    className="font-display text-5xl font-bold opacity-10"
                    style={{ color: step.color }}
                  >
                    {step.step}
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-sand mb-3">{step.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{step.desc}</p>

                {/* Bottom accent */}
                <div
                  className="mt-6 h-0.5 rounded-full w-0 group-hover:w-full transition-all duration-500"
                  style={{ background: `linear-gradient(to right, ${step.color}, transparent)` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
