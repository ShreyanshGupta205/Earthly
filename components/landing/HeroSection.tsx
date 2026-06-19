'use client'

import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import EarthOrbit from './EarthOrbit'

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Particle system */}
      <ParticleField />

      {/* Background mesh gradient */}
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-lime/3 blur-[120px] pointer-events-none" />

      <motion.div style={{ y }} className="relative z-10 container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — Text */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-lime/20 bg-lime/5 text-lime text-sm font-medium mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
              Powered by Google Gemini AI
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
            >
              Know Your{' '}
              <span className="gradient-text-lime">Carbon</span>
              <br />
              <span className="gradient-text-lime">Footprint.</span>
              <br />
              <span className="text-sand/80">Own Your</span>{' '}
              <span className="text-mint">Impact.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-muted text-lg lg:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10"
            >
              Log your daily activities, get AI-powered insights from Google Gemini, and take
              climate action — one day at a time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/signup" className="btn-primary text-base px-8 py-4" id="hero-cta-signup">
                Start Tracking Free →
              </Link>
              <Link href="/login" className="btn-secondary text-base px-8 py-4" id="hero-cta-login">
                Sign In
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-4 mt-10 justify-center lg:justify-start"
            >
              <div className="flex -space-x-2">
                {['🧑', '👩', '👨', '🧕', '👦'].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-card2 border-2 border-bg flex items-center justify-center text-sm">
                    {e}
                  </div>
                ))}
              </div>
              <p className="text-muted text-sm">
                <span className="text-sand font-semibold">2,400+ users</span> tracking their footprint
              </p>
            </motion.div>
          </div>

          {/* Right — Earth */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="flex justify-center"
          >
            <EarthOrbit />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted text-xs"
        >
          <span>Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-0.5 h-8 bg-gradient-to-b from-muted to-transparent rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

// Particle Field Component
function ParticleField() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size:  Math.random() * 3 + 1,
    left:  Math.random() * 100,
    delay: Math.random() * 8,
    duration: Math.random() * 6 + 6,
    opacity: Math.random() * 0.4 + 0.1,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            width:           `${p.size}px`,
            height:          `${p.size}px`,
            left:            `${p.left}%`,
            bottom:          '-20px',
            opacity:         p.opacity,
            animationDelay:  `${p.delay}s`,
            animationDuration:`${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
