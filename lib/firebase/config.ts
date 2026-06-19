import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Only initialize if Firebase credentials are present
const isConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId &&
  firebaseConfig.apiKey !== 'your_api_key_here'
)

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

if (isConfigured) {
  try {
    app     = getApps().length ? getApp() : initializeApp(firebaseConfig as any)
    auth    = getAuth(app)
    db      = getFirestore(app)
    storage = getStorage(app)
  } catch (e) {
    console.warn('Firebase initialization failed — add your credentials to .env.local', e)
  }
}

export { app, auth, db, storage, isConfigured }

// Analytics — only in browser (not SSR)
export const getAnalyticsInstance = async () => {
  if (!app || typeof window === 'undefined') return null
  if (await isSupported()) return getAnalytics(app)
  return null
}

export default app
