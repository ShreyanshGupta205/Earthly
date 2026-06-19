'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { signInWithGoogle, signUpWithEmail } from '@/lib/firebase/auth'
import { Analytics } from '@/lib/analytics'

export default function SignupPage() {
  const nav = useRouter()
  const [step,      setStep]      = useState<1 | 2>(1)
  const [fullName,  setFullName]  = useState('')
  const [username,  setUsername]  = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [loading,   setLoading]   = useState<'google' | 'email' | null>(null)
  const [error,     setError]     = useState('')

  const handleGoogle = async () => {
    setError(''); setLoading('google')
    try {
      await signInWithGoogle()
      Analytics.signup('google')
      nav.push('/dashboard')
    } catch (e: any) {
      setError(e.message || 'Google sign-in failed')
    } finally {
      setLoading(null)
    }
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) { setStep(2); return }
    setError(''); setLoading('email')
    try {
      await signUpWithEmail(email, password, fullName, username)
      Analytics.signup('email')
      nav.push('/dashboard')
    } catch (e: any) {
      const msg: Record<string, string> = {
        'auth/email-already-in-use': 'Email already registered. Try signing in.',
        'auth/weak-password':        'Password must be at least 6 characters.',
        'auth/invalid-email':        'Please enter a valid email address.',
      }
      setError(msg[e.code] || e.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-lime/4 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl text-sand" id="signup-logo">
            <span className="text-3xl">🌍</span> Earthly
          </Link>
          <h1 className="font-display text-3xl font-bold text-sand mt-6 mb-2">
            {step === 1 ? 'Create account' : 'Almost there!'}
          </h1>
          <p className="text-muted text-sm">
            {step === 1 ? 'Free forever · Powered by Google' : 'Set up your profile'}
          </p>
        </div>

        <div className="glass-card p-8 space-y-5">
          {step === 1 && (
            <>
              <button
                id="signup-google"
                onClick={handleGoogle}
                disabled={!!loading}
                className="btn-google"
                aria-label="Sign up with Google"
              >
                {loading === 'google' ? <Spinner /> : <GoogleIcon />}
                Continue with Google
              </button>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-muted text-xs">or create with email</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </>
          )}

          <form onSubmit={handleEmailSignup} className="space-y-4" id="signup-email-form">
            {step === 1 ? (
              <>
                <div>
                  <label htmlFor="signup-name" className="block text-sm text-muted mb-1.5">Full Name</label>
                  <input
                    id="signup-name"
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Arjun Sharma"
                    required
                    minLength={2}
                    className="input-field"
                  />
                </div>
                <div>
                  <label htmlFor="signup-username" className="block text-sm text-muted mb-1.5">Username</label>
                  <input
                    id="signup-username"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    placeholder="arjun_green"
                    required
                    minLength={3}
                    className="input-field"
                  />
                </div>
                <button id="signup-next" type="submit" className="btn-primary w-full justify-center">
                  Continue →
                </button>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="signup-email" className="block text-sm text-muted mb-1.5">Email</label>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label htmlFor="signup-password" className="block text-sm text-muted mb-1.5">Password</label>
                  <input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    className="input-field"
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red text-sm bg-red/8 border border-red/15 rounded-lg px-3 py-2"
                    role="alert"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary flex-shrink-0"
                    id="signup-back"
                  >
                    ← Back
                  </button>
                  <button
                    id="signup-submit"
                    type="submit"
                    disabled={!!loading}
                    className="btn-primary flex-1 justify-center"
                  >
                    {loading === 'email' ? <Spinner /> : 'Create Account 🌍'}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="text-center text-sm text-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-lime hover:text-lime/80 font-medium" id="signup-login-link">
              Sign in
            </Link>
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {[1, 2].map(s => (
            <div
              key={s}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: step === s ? '24px' : '8px',
                background: step === s ? 'var(--lime)' : 'var(--dim)',
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  )
}
