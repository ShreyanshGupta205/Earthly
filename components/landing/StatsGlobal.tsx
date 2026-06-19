'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const STATS = [
  { value: '37 Gt',  label: 'Global CO₂/year', color: '#FF4F4F' },
  { value: '13 kg',  label: 'Global daily avg per person', color: '#F5A523' },
  { value: '4.7 kg', label: 'India daily avg per person',  color: '#7DDFAA' },
  { value: '5.5 kg', label: '1.5°C climate target/day',    color: '#CAFF33' },
]

export default function StatsGlobal() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="py-16 px-6 border-y" style={{ borderColor: 'rgba(125,223,170,0.07)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="text-center text-muted text-sm mb-10 uppercase tracking-widest"
        >
          The Climate Reality
        </motion.p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
            >
              <div
                className="font-display text-3xl lg:text-4xl font-bold mb-1"
                style={{ color: s.color }}
              >
                {s.value}
              </div>
              <div className="text-muted text-xs leading-snug">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
