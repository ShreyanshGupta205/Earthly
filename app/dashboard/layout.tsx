'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import { LayoutDashboard, PlusCircle, Lightbulb, History, Settings, LogOut, Flame, Leaf } from 'lucide-react'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { signOut } from '@/lib/firebase/auth'
import { getLevel } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard',          label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/dashboard/log',      label: 'Log Activity', icon: PlusCircle },
  { href: '/dashboard/insights', label: 'AI Insights',  icon: Lightbulb },
  { href: '/dashboard/history',  label: 'History',      icon: History },
  { href: '/dashboard/settings', label: 'Settings',     icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const nav = useRouter()
  const { user, profile, loading } = useAuthContext()

  useEffect(() => {
    if (!loading && !user) nav.push('/login')
  }, [user, loading, nav])

  const handleSignOut = async () => {
    await signOut()
    nav.push('/')
  }

  if (loading) return <LoadingScreen />
  if (!user) return null

  const level = getLevel(profile?.greenScore || 0)

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Skip to main content — accessibility for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-lime focus:text-black focus:rounded-lg focus:font-bold"
      >
        Skip to main content
      </a>

      {/* ── Sidebar (desktop) ────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 border-r fixed top-0 bottom-0 left-0 z-30" style={{ borderColor: 'rgba(125,223,170,0.07)', background: 'var(--bg1)' }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(125,223,170,0.07)' }}>
          <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-xl text-sand" id="sidebar-logo">
            <span className="text-2xl">🌍</span> Earthly
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Dashboard navigation">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                className={`sidebar-link ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User profile */}
        <div className="px-3 py-4 border-t space-y-3" style={{ borderColor: 'rgba(125,223,170,0.07)' }}>
          {/* Streak + Score */}
          <div className="flex gap-2">
            <div className="flex-1 glass-card p-2.5 text-center">
              <div className="flex items-center justify-center gap-1 text-amber">
                <Flame size={14} />
                <span className="font-bold text-sm">{profile?.streakDays || 0}</span>
              </div>
              <div className="text-muted text-[10px]">day streak</div>
            </div>
            <div className="flex-1 glass-card p-2.5 text-center">
              <div className="flex items-center justify-center gap-1" style={{ color: level.color }}>
                <Leaf size={14} />
                <span className="font-bold text-sm">{profile?.greenScore?.toFixed(0) || 0}</span>
              </div>
              <div className="text-muted text-[10px]">green score</div>
            </div>
          </div>

          {/* Level badge */}
          <div className="px-3 py-2 rounded-lg text-center text-xs font-medium" style={{ background: `${level.color}12`, color: level.color, border: `1px solid ${level.color}25` }}>
            {level.emoji} {level.label}
          </div>

          {/* Avatar + name */}
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-card2 border border-border flex items-center justify-center text-lg overflow-hidden flex-shrink-0">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
              ) : (
                user.email?.[0]?.toUpperCase() || '?'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sand text-sm font-medium truncate">{profile?.fullName || user.email}</div>
              <div className="text-muted text-xs truncate">@{profile?.username || 'user'}</div>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="sidebar-link w-full text-left hover:text-red"
            id="sidebar-signout"
            aria-label="Sign out"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────── */}
      <main id="main-content" className="flex-1 lg:ml-60 flex flex-col min-h-screen" tabIndex={-1}>
        <div className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
          {children}
        </div>
      </main>

      {/* ── Bottom tab bar (mobile) ───────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex border-t"
        style={{ background: 'var(--bg1)', borderColor: 'rgba(125,223,170,0.1)' }}
        aria-label="Mobile navigation"
      >
        {NAV_ITEMS.slice(0, 4).map(item => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors"
              style={{ color: active ? 'var(--lime)' : 'var(--muted)' }}
              id={`mobile-nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-float">🌍</div>
        <div className="text-muted text-sm">Loading Earthly...</div>
      </div>
    </div>
  )
}
