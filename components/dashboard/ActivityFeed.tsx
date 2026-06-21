'use client'

import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import type { ActivityLog } from '@/types'
import { CATEGORY_META } from '@/types'
import { formatCO2, getRelativeDate } from '@/lib/utils'
import { deleteLog } from '@/lib/firebase/firestore'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { useState } from 'react'

interface Props {
  logs: ActivityLog[]
  onDelete?: () => void
}

export function ActivityFeed({ logs, onDelete }: Props) {
  const { user } = useAuthContext()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (logId: string) => {
    if (!user) return
    setDeletingId(logId)
    try {
      await deleteLog(user.uid, logId)
      onDelete?.()
    } finally {
      setDeletingId(null)
    }
  }

  if (!logs.length) {
    return (
      <div role="status" className="text-center py-12 text-muted" aria-label="No activities logged yet">
        <div className="text-4xl mb-3" aria-hidden="true">📋</div>
        <p className="text-sm">No activities logged yet.</p>
        <p className="text-xs mt-1">Start logging to see your feed!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2" role="feed" aria-label="Recent activities">
      {logs.map((log, i) => {
        const meta = CATEGORY_META[log.category]
        return (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-card2 transition-colors group"
          >
            {/* Category icon */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}25` }}
            >
              {meta.emoji}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sand text-sm font-medium truncate">{log.subType.replace(/_/g, ' ')}</span>
                <span className="text-muted text-xs flex-shrink-0">{log.quantity} {log.unit}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-muted text-xs">{getRelativeDate(log.date)}</span>
                <span className="text-muted/40 text-xs">·</span>
                <span className="text-xs capitalize" style={{ color: meta.color }}>{log.category}</span>
              </div>
            </div>

            {/* CO₂ + delete */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className="text-sm font-semibold font-display"
                style={{ color: log.co2Kg === 0 ? 'var(--mint)' : log.co2Kg > 5 ? 'var(--red)' : 'var(--sand)' }}
              >
                {log.co2Kg === 0 ? '0 🌿' : `+${formatCO2(log.co2Kg)}`}
              </span>
              <button
                onClick={() => handleDelete(log.id)}
                disabled={deletingId === log.id}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:text-red"
                aria-label={`Delete ${log.subType} activity`}
              >
                {deletingId === log.id ? (
                  <div className="w-4 h-4 rounded-full border-2 border-muted/30 border-t-muted animate-spin" />
                ) : (
                  <Trash2 size={14} className="text-muted" />
                )}
              </button>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
