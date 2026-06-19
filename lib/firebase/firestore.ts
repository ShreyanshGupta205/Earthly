import {
  doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc,
  collection, query, where, orderBy, limit,
  getDocs, Timestamp, serverTimestamp, writeBatch,
  onSnapshot, DocumentData,
} from 'firebase/firestore'
import { db } from './config'
import { Profile, ActivityLog, DailySummary, Action, InsightItem, Category } from '@/types'

function requireDb() {
  if (!db) throw new Error('Firebase DB not configured')
  return db
}

// ── USER PROFILE ───────────────────────────────────────────
export async function createUserProfile(uid: string, data: Omit<Profile, 'id'>) {
  const ref = doc(requireDb(), 'users', uid)
  const existing = await getDoc(ref)
  if (!existing.exists()) {
    await setDoc(ref, { ...data, id: uid })
  }
}

export async function getUserProfile(uid: string): Promise<Profile | null> {
  const snap = await getDoc(doc(requireDb(), 'users', uid))
  return snap.exists() ? (snap.data() as Profile) : null
}

export async function updateUserProfile(uid: string, data: Partial<Profile>) {
  await updateDoc(doc(requireDb(), 'users', uid), data)
}

// ── ACTIVITY LOGS ──────────────────────────────────────────
export async function logActivity(uid: string, data: Omit<ActivityLog, 'id' | 'userId' | 'loggedAt'>): Promise<string> {
  const ref = collection(requireDb(), 'users', uid, 'activityLogs')
  const docRef = await addDoc(ref, {
    ...data,
    userId: uid,
    loggedAt: serverTimestamp(),
  })

  // Update daily summary atomically
  await upsertDailySummary(uid, data.date, data.category, data.co2Kg)

  // Update profile totals
  const profile = await getUserProfile(uid)
  if (profile) {
    await updateUserProfile(uid, {
      totalSaved: profile.totalSaved,
      lastActive: data.date,
    })
  }

  return docRef.id
}

export async function getRecentLogs(uid: string, n = 10): Promise<ActivityLog[]> {
  const q = query(
    collection(requireDb(), 'users', uid, 'activityLogs'),
    orderBy('loggedAt', 'desc'),
    limit(n)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ActivityLog))
}

export async function getLogsByDateRange(uid: string, from: string, to: string): Promise<ActivityLog[]> {
  const q = query(
    collection(requireDb(), 'users', uid, 'activityLogs'),
    where('date', '>=', from),
    where('date', '<=', to),
    orderBy('date', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ActivityLog))
}

export async function deleteLog(uid: string, logId: string) {
  await deleteDoc(doc(requireDb(), 'users', uid, 'activityLogs', logId))
}

// ── DAILY SUMMARIES ────────────────────────────────────────
export async function upsertDailySummary(uid: string, date: string, category: Category, co2Kg: number) {
  const ref = doc(requireDb(), 'users', uid, 'dailySummaries', date)
  const snap = await getDoc(ref)

  const categoryKey = `${category}Co2` as keyof DailySummary

  if (snap.exists()) {
    const current = snap.data() as DailySummary
    await updateDoc(ref, {
      totalCo2: (current.totalCo2 || 0) + co2Kg,
      [categoryKey]: ((current[categoryKey] as number) || 0) + co2Kg,
    })
  } else {
    await setDoc(ref, {
      date,
      totalCo2: co2Kg,
      transportCo2: 0,
      foodCo2: 0,
      energyCo2: 0,
      shoppingCo2: 0,
      wasteCo2: 0,
      travelCo2: 0,
      homeCo2: 0,
      [categoryKey]: co2Kg,
    })
  }
}

export async function getDailySummary(uid: string, date: string): Promise<DailySummary | null> {
  const snap = await getDoc(doc(requireDb(), 'users', uid, 'dailySummaries', date))
  return snap.exists() ? (snap.data() as DailySummary) : null
}

export async function getWeeklySummaries(uid: string, days = 7): Promise<DailySummary[]> {
  const dates: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }

  const summaries: DailySummary[] = []
  for (const date of dates) {
    const s = await getDailySummary(uid, date)
    summaries.push(s || { date, totalCo2: 0, transportCo2: 0, foodCo2: 0, energyCo2: 0, shoppingCo2: 0, wasteCo2: 0, travelCo2: 0, homeCo2: 0 })
  }
  return summaries
}

// ── ACTIONS ────────────────────────────────────────────────
export async function getTodayActions(uid: string): Promise<Action[]> {
  const today = new Date().toISOString().split('T')[0]
  const q = query(
    collection(requireDb(), 'users', uid, 'actions'),
    where('date', '==', today),
    orderBy('isCompleted', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Action))
}

export async function setTodayActions(uid: string, actions: Omit<Action, 'id' | 'userId'>[]) {
  const today = new Date().toISOString().split('T')[0]
  const batch = writeBatch(requireDb())
  for (const action of actions) {
    const ref = doc(collection(requireDb(), 'users', uid, 'actions'))
    batch.set(ref, { ...action, userId: uid, date: today, isCompleted: false })
  }
  await batch.commit()
}

export async function toggleAction(uid: string, actionId: string, isCompleted: boolean) {
  await updateDoc(doc(requireDb(), 'users', uid, 'actions', actionId), {
    isCompleted,
    completedAt: isCompleted ? new Date().toISOString() : null,
  })
}

// ── INSIGHTS ───────────────────────────────────────────────
export async function getCachedInsights(uid: string, weekStart: string): Promise<InsightItem[] | null> {
  const snap = await getDoc(doc(requireDb(), 'users', uid, 'insights', weekStart))
  if (!snap.exists()) return null
  const data = snap.data()
  // Cache valid for 7 days
  const created = new Date(data.createdAt)
  const now = new Date()
  if ((now.getTime() - created.getTime()) > 7 * 24 * 60 * 60 * 1000) return null
  return data.insightsJson as InsightItem[]
}

export async function saveInsights(uid: string, weekStart: string, insights: InsightItem[]) {
  await setDoc(doc(requireDb(), 'users', uid, 'insights', weekStart), {
    insightsJson: insights,
    createdAt: new Date().toISOString(),
    weekStart,
  })
}

// ── STREAK CALCULATION ─────────────────────────────────────
export async function calculateAndUpdateStreak(uid: string): Promise<number> {
  let streak = 0
  const today = new Date()

  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const summary = await getDailySummary(uid, dateStr)
    if (summary && summary.totalCo2 > 0) {
      streak++
    } else if (i > 0) {
      break
    }
  }

  await updateUserProfile(uid, { streakDays: streak })
  return streak
}
