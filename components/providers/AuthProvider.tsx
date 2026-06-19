'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from 'firebase/auth'
import { onAuthChange } from '@/lib/firebase/auth'
import { getUserProfile } from '@/lib/firebase/firestore'
import { Profile } from '@/types'

interface AuthContextValue {
  user:    User | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user:    null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (u: User) => {
    const p = await getUserProfile(u.uid)
    setProfile(p)
  }

  const refreshProfile = async () => {
    if (user) await loadProfile(user)
  }

  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      setUser(u)
      if (u) {
        await loadProfile(u)
        // Set auth cookie for middleware
        document.cookie = `earthly-auth=${u.uid}; path=/; max-age=2592000; SameSite=Strict`
      } else {
        setProfile(null)
        // Clear auth cookie
        document.cookie = 'earthly-auth=; path=/; max-age=0'
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
