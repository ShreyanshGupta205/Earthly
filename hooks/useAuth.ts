'use client'

import { useEffect, useState } from 'react'
import { User } from 'firebase/auth'
import { onAuthChange } from '@/lib/firebase/auth'
import { getUserProfile } from '@/lib/firebase/firestore'
import { Profile } from '@/types'

interface AuthState {
  user:    User | null
  profile: Profile | null
  loading: boolean
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user:    null,
    profile: null,
    loading: true,
  })

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid)
        setState({ user, profile, loading: false })
      } else {
        setState({ user: null, profile: null, loading: false })
      }
    })

    return () => unsubscribe()
  }, [])

  return state
}
