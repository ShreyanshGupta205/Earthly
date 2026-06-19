'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuthContext } from '@/components/providers/AuthProvider'

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const { user } = useAuthContext()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(6,12,8,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(125,223,170,0.07)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-xl text-sand" id="nav-logo">
          <span className="text-2xl">🌍</span>
          <span>Earthly</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-muted">
          <a href="#how-it-works" className="hover:text-sand transition-colors">How It Works</a>
          <a href="#features" className="hover:text-sand transition-colors">Features</a>
          <a href="#google" className="hover:text-sand transition-colors">Built on Google</a>
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="btn-primary py-2 px-5 text-sm" id="nav-dashboard">
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-muted hover:text-sand text-sm transition-colors" id="nav-login">
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary py-2 px-5 text-sm" id="nav-signup">
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
