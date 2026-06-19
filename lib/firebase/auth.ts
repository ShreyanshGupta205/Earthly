import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { auth } from './config'
import { createUserProfile } from './firestore'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

function requireAuth() {
  if (!auth) throw new Error('Firebase not configured — add credentials to .env.local')
  return auth
}


// ── Google Sign-In ─────────────────────────────────────────
export async function signInWithGoogle() {
  const result = await signInWithPopup(requireAuth(), googleProvider)
  const user = result.user

  await createUserProfile(user.uid, {
    username:   user.email?.split('@')[0] || user.uid.slice(0, 8),
    fullName:   user.displayName || '',
    avatarUrl:  user.photoURL || '',
    country:    'IN',
    createdAt:  new Date().toISOString(),
    streakDays: 0,
    lastActive: new Date().toISOString().split('T')[0],
    greenScore: 0,
    totalSaved: 0,
  })

  return result
}

// ── Email Sign-Up ──────────────────────────────────────────
export async function signUpWithEmail(email: string, password: string, fullName: string, username: string) {
  const result = await createUserWithEmailAndPassword(requireAuth(), email, password)
  const user = result.user

  await updateProfile(user, { displayName: fullName })

  await createUserProfile(user.uid, {
    username,
    fullName,
    avatarUrl:  '',
    country:    'IN',
    createdAt:  new Date().toISOString(),
    streakDays: 0,
    lastActive: new Date().toISOString().split('T')[0],
    greenScore: 0,
    totalSaved: 0,
  })

  return result
}

// ── Email Sign-In ──────────────────────────────────────────
export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(requireAuth(), email, password)
}

// ── Sign Out ───────────────────────────────────────────────
export async function signOut() {
  return firebaseSignOut(requireAuth())
}

// ── Auth State Observer ────────────────────────────────────
export function onAuthChange(callback: (user: User | null) => void) {
  const a = auth
  if (!a) {
    // Firebase not configured — call with null immediately
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(a, callback)
}

// ── Get current user ───────────────────────────────────────
export function getCurrentUser(): User | null {
  return auth?.currentUser || null
}
