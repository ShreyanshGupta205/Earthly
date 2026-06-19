'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Leaf } from 'lucide-react'
import { Action, CATEGORY_META } from '@/types'
import { toggleAction } from '@/lib/firebase/firestore'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { Analytics } from '@/lib/analytics'

interface Props {
  actions: Action[]
  onUpdate?: () => void
}

export function ActionChecklist({ actions, onUpdate }: Props) {
  const { user } = useAuthContext()
  const [toggling, setToggling] = useState<string | null>(null)

  const handleToggle = async (action: Action) => {
    if (!user) return
    setToggling(action.id)
    try {
      await toggleAction(user.uid, action.id, !action.isCompleted)
      if (!action.isCompleted) {
        Analytics.completeAction(action.title, action.savingKg)
      }
      onUpdate?.()
    } finally {
      setToggling(null)
    }
  }

  const completed = actions.filter(a => a.isCompleted).length
  const totalSaving = actions.filter(a => a.isCompleted).reduce((s, a) => s + a.savingKg, 0)

  if (!actions.length) {
    return (
      <div className="text-center py-8 text-muted">
        <div className="text-3xl mb-2">✅</div>
        <p className="text-sm">Actions will appear after you log activities.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Progress */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-muted">{completed}/{actions.length} completed</div>
        {totalSaving > 0 && (
          <div className="flex items-center gap-1 text-mint text-xs">
            <Leaf size={12} />
            <span>{totalSaving.toFixed(2)} kg saved</span>
          </div>
        )}
      </div>
      <div className="h-1.5 bg-card2 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'var(--lime)' }}
          initial={{ width: 0 }}
          animate={{ width: `${actions.length ? (completed / actions.length) * 100 : 0}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Action items */}
      <div className="space-y-2 mt-3">
        {actions.map((action, i) => {
          const meta = CATEGORY_META[action.category]
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                action.isCompleted
                  ? 'border-lime/15 bg-lime/5'
                  : 'border-border hover:border-border/80 bg-card2/50'
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggle(action)}
                disabled={toggling === action.id}
                className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                style={{
                  borderColor: action.isCompleted ? 'var(--lime)' : 'var(--dim)',
                  background:  action.isCompleted ? 'var(--lime)' : 'transparent',
                }}
                aria-label={`${action.isCompleted ? 'Uncheck' : 'Complete'}: ${action.title}`}
                aria-checked={action.isCompleted}
                role="checkbox"
              >
                <AnimatePresence>
                  {action.isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check size={11} color="var(--bg)" strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium transition-colors ${action.isCompleted ? 'text-muted line-through' : 'text-sand'}`}
                >
                  {action.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs" style={{ color: meta.color }}>{meta.emoji} {action.category}</span>
                  {action.savingKg > 0 && (
                    <span className="text-xs text-mint">saves {action.savingKg.toFixed(2)} kg CO₂</span>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
