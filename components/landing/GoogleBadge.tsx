'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'

const GOOGLE_PRODUCTS = [
  { name: 'Gemini AI',   desc: 'Weekly coaching insights',   icon: '🤖', color: '#4285F4' },
  { name: 'Firebase',    desc: 'Real-time database & auth',  icon: '🔥', color: '#FF6D00' },
  { name: 'Google Auth', desc: 'One-click Google Sign-In',   icon: '🔐', color: '#34A853' },
  { name: 'GA4',         desc: 'Usage analytics',            icon: '📊', color: '#FBBC05' },
  { name: 'Cloud Run',   desc: 'Scalable deployment',        icon: '☁️', color: '#4285F4' },
  { name: 'Fonts',       desc: 'Beautiful typography',       icon: '🔤', color: '#EA4335' },
]

export default function GoogleBadge() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="google" ref={ref} className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-14"
        >
          <span className="badge badge-blue mb-4">Built on Google</span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-sand mt-3">
            Powered end-to-end by{' '}
            <span style={{ background: 'linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Google
            </span>
          </h2>
          <p className="text-muted mt-3 max-w-xl mx-auto">
            Every layer of Earthly uses free Google products — 100% free to run, infinitely scalable.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-14">
          {GOOGLE_PRODUCTS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-5 flex items-center gap-4 hover:border-blue/15 transition-all"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: `${p.color}15`, border: `1px solid ${p.color}30` }}
              >
                {p.icon}
              </div>
              <div>
                <div className="font-semibold text-sand text-sm">{p.name}</div>
                <div className="text-muted text-xs">{p.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="text-center p-10 rounded-2xl neon-border relative overflow-hidden"
          style={{ background: 'radial-gradient(ellipse at center, rgba(202,255,51,0.05) 0%, transparent 70%)' }}
        >
          <div className="text-5xl mb-4">🌍</div>
          <h3 className="font-display text-3xl font-bold text-sand mb-3">
            Ready to reduce your footprint?
          </h3>
          <p className="text-muted mb-8 max-w-md mx-auto">
            Free forever. No credit card. Sign in with Google and start tracking in 30 seconds.
          </p>
          <Link href="/signup" className="btn-primary text-base px-10 py-4" id="cta-final-signup">
            Start Free with Google →
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
