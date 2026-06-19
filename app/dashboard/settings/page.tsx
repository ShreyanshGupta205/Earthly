'use client'

import { useState } from 'react'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { updateUserProfile } from '@/lib/firebase/firestore'
import { signOut } from '@/lib/firebase/auth'
import { useRouter } from 'next/navigation'
import { User, Globe, Save, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const COUNTRIES = [
  { code: 'IN', name: 'India' }, { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' }, { code: 'DE', name: 'Germany' },
  { code: 'CN', name: 'China' }, { code: 'BR', name: 'Brazil' },
  { code: 'AU', name: 'Australia' }, { code: 'CA', name: 'Canada' },
  { code: 'JP', name: 'Japan' }, { code: 'FR', name: 'France' },
]

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuthContext()
  const nav = useRouter()
  const [fullName, setFullName] = useState(profile?.fullName || '')
  const [username, setUsername] = useState(profile?.username || '')
  const [country,  setCountry]  = useState(profile?.country  || 'IN')
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      await updateUserProfile(user.uid, { fullName, username, country })
      await refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    nav.push('/')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-sand">Settings</h1>
        <p className="text-muted text-sm mt-1">Manage your profile and account</p>
      </div>

      {/* Profile */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <User size={18} className="text-lime" />
          <h2 className="font-display font-semibold text-sand">Profile</h2>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b" style={{ borderColor: 'rgba(125,223,170,0.07)' }}>
          <div className="w-16 h-16 rounded-full bg-card2 border-2 border-border flex items-center justify-center text-3xl overflow-hidden">
            {profile?.avatarUrl
              ? <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              : user?.email?.[0]?.toUpperCase() || '?'
            }
          </div>
          <div>
            <div className="text-sand font-medium">{profile?.fullName || 'User'}</div>
            <div className="text-muted text-sm">{user?.email}</div>
            <div className="text-muted text-xs mt-1">
              {user?.providerData[0]?.providerId === 'google.com' ? '🔐 Google account' : '📧 Email account'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4" id="settings-form">
          <div>
            <label htmlFor="settings-name" className="block text-sm text-muted mb-1.5">Full Name</label>
            <input id="settings-name" type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label htmlFor="settings-username" className="block text-sm text-muted mb-1.5">Username</label>
            <input id="settings-username" type="text" value={username} onChange={e => setUsername(e.target.value.toLowerCase())} className="input-field" />
          </div>
          <div>
            <label htmlFor="settings-country" className="block text-sm text-muted mb-1.5">
              <div className="flex items-center gap-1"><Globe size={12} /> Country</div>
            </label>
            <select id="settings-country" value={country} onChange={e => setCountry(e.target.value)} className="input-field">
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>

          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-lime text-sm flex items-center gap-2"
                role="status"
              >
                ✓ Profile saved successfully
              </motion.div>
            )}
          </AnimatePresence>

          <button id="settings-save" type="submit" disabled={saving} className="btn-primary" aria-label="Save settings">
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Account */}
      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-sand mb-4">Account</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'rgba(125,223,170,0.07)' }}>
            <div>
              <div className="text-sand text-sm font-medium">Email</div>
              <div className="text-muted text-xs">{user?.email}</div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-muted hover:text-red transition-colors py-2"
            id="settings-signout"
            aria-label="Sign out"
          >
            <LogOut size={16} />
            Sign out of Earthly
          </button>
        </div>
      </div>

      {/* Data info */}
      <div className="glass-card p-5 text-xs text-muted space-y-1.5">
        <p className="font-semibold text-sand/60">About Your Data</p>
        <p>All data is stored in Firebase Firestore under your account. Emission factors sourced from IPCC 2023 and CEA India 2023.</p>
        <p>AI insights are generated by Google Gemini 1.5 Flash and cached weekly — no data is stored by Google AI Studio.</p>
      </div>
    </div>
  )
}
