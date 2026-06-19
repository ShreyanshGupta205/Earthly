'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { logActivity } from '@/lib/firebase/firestore'
import { calculateCO2, previewCO2 } from '@/lib/co2/calculator'
import { formatCO2 } from '@/lib/utils'
import { getFactorsByCategory } from '@/lib/co2/factors'
import { CATEGORY_META } from '@/types'
import { Analytics } from '@/lib/analytics'
import type { Category } from '@/types'
import { Zap, CheckCircle } from 'lucide-react'

const CATEGORIES = Object.entries(CATEGORY_META).map(([id, m]) => ({ id: id as Category, ...m }))

const QUICK_LOGS = [
  { label: 'Car 10km',       category: 'transport' as Category, subType: 'car_petrol',    quantity: 10,  emoji: '🚗' },
  { label: 'Beef meal',      category: 'food'      as Category, subType: 'beef',          quantity: 1,   emoji: '🥩' },
  { label: 'Electric 5kWh',  category: 'energy'    as Category, subType: 'electricity_grid', quantity: 5, emoji: '⚡' },
  { label: 'Bus 5km',        category: 'transport' as Category, subType: 'bus',           quantity: 5,   emoji: '🚌' },
  { label: 'Vegan meal',     category: 'food'      as Category, subType: 'vegan',         quantity: 1,   emoji: '🌱' },
  { label: 'Online order',   category: 'shopping'  as Category, subType: 'online_order',  quantity: 1,   emoji: '📦' },
]

const schema = z.object({
  subType:  z.string().min(1, 'Select an activity'),
  quantity: z.string().min(1).refine(v => !isNaN(Number(v)) && Number(v) > 0, { message: 'Must be > 0' }),
  notes:    z.string().optional(),
  date:     z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function LogPage() {
  const { user } = useAuthContext()
  const [activeCategory, setActiveCategory] = useState<Category>('transport')
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState<number | null>(null)
  const [error,    setError]    = useState('')

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().split('T')[0] },
  })

  const subType  = watch('subType')
  const quantity = watch('quantity')
  const qtyNum   = Number(quantity) || 0
  const livePreview = subType && qtyNum > 0 ? previewCO2(subType, qtyNum) : null

  // Reset subType when category changes
  useEffect(() => { setValue('subType', '') }, [activeCategory, setValue])

  const factors = getFactorsByCategory(activeCategory)

  const onSubmit = async (data: FormData) => {
    if (!user) return
    setLoading(true); setError('')
    try {
      const qty = Number(data.quantity)
      const co2Kg = calculateCO2({ subType: data.subType, quantity: qty })
      await logActivity(user.uid, {
        category: activeCategory,
        subType:  data.subType,
        quantity: qty,
        unit:     factors.find(f => f.subType === data.subType)?.unit || '',
        co2Kg,
        date:     data.date || new Date().toISOString().split('T')[0],
        notes:    data.notes,
      })
      Analytics.logActivity(activeCategory, co2Kg)
      setSuccess(co2Kg)
      reset({ date: new Date().toISOString().split('T')[0] })
      setTimeout(() => setSuccess(null), 4000)
    } catch (e: any) {
      setError(e.message || 'Failed to log activity')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLog = async (q: typeof QUICK_LOGS[0]) => {
    if (!user) return
    setLoading(true); setError('')
    try {
      const co2Kg = calculateCO2({ subType: q.subType, quantity: q.quantity })
      const factor = getFactorsByCategory(q.category).find(f => f.subType === q.subType)
      await logActivity(user.uid, {
        category: q.category,
        subType:  q.subType,
        quantity: q.quantity,
        unit:     factor?.unit || '',
        co2Kg,
        date:     new Date().toISOString().split('T')[0],
      })
      Analytics.logActivity(q.category, co2Kg)
      setSuccess(co2Kg)
      setTimeout(() => setSuccess(null), 4000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-sand">Log Activity</h1>
        <p className="text-muted text-sm mt-1">Track your carbon emissions — every log counts</p>
      </div>

      {/* Quick log */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-lime" />
          <h2 className="font-display font-semibold text-sand text-sm">Quick Log</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_LOGS.map(q => (
            <button
              key={q.label}
              onClick={() => handleQuickLog(q)}
              disabled={loading}
              className="flex flex-col items-center gap-1 p-3 rounded-xl border border-border hover:border-lime/20 hover:bg-lime/5 transition-all text-center disabled:opacity-50"
            >
              <span className="text-xl">{q.emoji}</span>
              <span className="text-xs text-sand font-medium">{q.label}</span>
              <span className="text-[10px] text-muted">{previewCO2(q.subType, q.quantity)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main form */}
      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-sand mb-6">Custom Activity</h2>

        {/* Category picker */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`category-chip ${activeCategory === cat.id ? 'active' : ''}`}
              aria-pressed={activeCategory === cat.id}
              id={`cat-${cat.id}`}
            >
              <span className="text-xl">{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Activity type */}
          <div>
            <label htmlFor="log-subtype" className="block text-sm text-muted mb-1.5">Activity Type</label>
            <select
              id="log-subtype"
              {...register('subType')}
              className="input-field appearance-none cursor-pointer"
            >
              <option value="">Select activity...</option>
              {factors.map(f => (
                <option key={f.subType} value={f.subType}>
                  {f.label} ({f.co2PerUnit} kg CO₂/{f.unit})
                </option>
              ))}
            </select>
            {errors.subType && <p className="text-red text-xs mt-1" role="alert">{errors.subType.message}</p>}
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label htmlFor="log-quantity" className="block text-sm text-muted mb-1.5">Quantity</label>
              <input
                id="log-quantity"
                type="number"
                step="0.1"
                min="0.01"
                placeholder="Enter amount"
                {...register('quantity')}
                className="input-field"
              />
              {errors.quantity && <p className="text-red text-xs mt-1" role="alert">{errors.quantity.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-muted mb-1.5">Unit</label>
              <div className="input-field text-center text-muted cursor-default">
                {factors.find(f => f.subType === subType)?.unit || CATEGORY_META[activeCategory].unit}
              </div>
            </div>
          </div>

          {/* Live CO₂ preview */}
          <AnimatePresence>
            {livePreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: 'rgba(202,255,51,0.06)', border: '1px solid rgba(202,255,51,0.15)' }}
              >
                <span className="text-muted text-sm">Estimated CO₂</span>
                <span className="font-display font-bold text-lime text-lg">{livePreview}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Date */}
          <div>
            <label htmlFor="log-date" className="block text-sm text-muted mb-1.5">Date</label>
            <input
              id="log-date"
              type="date"
              {...register('date')}
              max={new Date().toISOString().split('T')[0]}
              className="input-field"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="log-notes" className="block text-sm text-muted mb-1.5">Notes (optional)</label>
            <input
              id="log-notes"
              type="text"
              placeholder="Add a note..."
              {...register('notes')}
              className="input-field"
            />
          </div>

          {error && (
            <p className="text-red text-sm bg-red/8 border border-red/15 rounded-lg px-3 py-2" role="alert">{error}</p>
          )}

          <button
            id="log-submit"
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center text-base py-4"
            aria-label="Log activity"
          >
            {loading ? (
              <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : 'Log Activity →'}
          </button>
        </form>
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {success !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div
              className="flex items-center gap-3 px-5 py-4 rounded-2xl shadow-lime"
              style={{ background: 'var(--card2)', border: '1px solid rgba(202,255,51,0.2)' }}
            >
              <CheckCircle size={20} className="text-lime flex-shrink-0" />
              <div>
                <p className="text-sand text-sm font-semibold">Activity logged!</p>
                <p className="text-muted text-xs">+{formatCO2(success)} CO₂ logged</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
