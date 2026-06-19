'use client'

import { useState } from 'react'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { getLogsByDateRange, deleteLog } from '@/lib/firebase/firestore'
import { CATEGORY_META, ActivityLog } from '@/types'
import { formatCO2, formatDate } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { Download, Trash2, Filter } from 'lucide-react'

const PAGE_SIZE = 50

export default function HistoryPage() {
  const { user } = useAuthContext()
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [toDate,    setToDate]    = useState(new Date().toISOString().split('T')[0])
  const [category,  setCategory]  = useState('')
  const [page,      setPage]      = useState(0)
  const [deleting,  setDeleting]  = useState<string | null>(null)

  const { data: logs = [], refetch, isLoading } = useQuery({
    queryKey: ['logs', user?.uid, fromDate, toDate],
    queryFn:  () => getLogsByDateRange(user!.uid, fromDate, toDate),
    enabled:  !!user,
  })

  const filtered = category ? logs.filter(l => l.category === category) : logs
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  const handleDelete = async (logId: string) => {
    if (!user) return
    setDeleting(logId)
    try { await deleteLog(user.uid, logId); refetch() }
    finally { setDeleting(null) }
  }

  const exportCSV = () => {
    const header = 'Date,Category,Activity,Quantity,Unit,CO2 (kg),Notes'
    const rows = filtered.map(l =>
      `${l.date},${l.category},${l.subType},${l.quantity},${l.unit},${l.co2Kg},${l.notes || ''}`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `earthly-history-${fromDate}-${toDate}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-sand">Activity History</h1>
          <p className="text-muted text-sm mt-1">{filtered.length} activities found</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary text-sm" id="export-csv" aria-label="Export CSV">
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4 text-sm text-muted">
          <Filter size={14} /> Filters
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="from-date" className="block text-xs text-muted mb-1">From</label>
            <input id="from-date" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="input-field text-sm" />
          </div>
          <div>
            <label htmlFor="to-date" className="block text-xs text-muted mb-1">To</label>
            <input id="to-date" type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="input-field text-sm" />
          </div>
          <div>
            <label htmlFor="cat-filter" className="block text-xs text-muted mb-1">Category</label>
            <select id="cat-filter" value={category} onChange={e => setCategory(e.target.value)} className="input-field text-sm">
              <option value="">All categories</option>
              {Object.entries(CATEGORY_META).map(([id, m]) => (
                <option key={id} value={id}>{m.emoji} {m.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted">Loading history...</div>
        ) : paginated.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <div className="text-4xl mb-3">📭</div>
            <p>No activities found for this period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Activity</th>
                  <th>Amount</th>
                  <th className="text-right">CO₂</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(log => {
                  const meta = CATEGORY_META[log.category]
                  return (
                    <tr key={log.id}>
                      <td className="text-muted text-sm">{formatDate(log.date)}</td>
                      <td>
                        <span className="badge badge-mint text-[11px]">
                          {meta.emoji} {meta.label}
                        </span>
                      </td>
                      <td className="text-sand capitalize">{log.subType.replace(/_/g, ' ')}</td>
                      <td className="text-muted">{log.quantity} {log.unit}</td>
                      <td className="text-right font-semibold" style={{ color: log.co2Kg === 0 ? 'var(--mint)' : log.co2Kg > 5 ? 'var(--red)' : 'var(--sand)' }}>
                        {log.co2Kg === 0 ? '0 🌿' : `${formatCO2(log.co2Kg)}`}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(log.id)}
                          disabled={deleting === log.id}
                          className="p-1.5 rounded hover:text-red transition-colors"
                          aria-label={`Delete ${log.subType} activity`}
                        >
                          {deleting === log.id
                            ? <div className="w-3.5 h-3.5 rounded-full border-2 border-muted/30 border-t-muted animate-spin" />
                            : <Trash2 size={14} className="text-muted" />
                          }
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t" style={{ borderColor: 'rgba(125,223,170,0.07)' }}>
            <span className="text-muted text-xs">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary text-xs py-1.5 px-3" id="prev-page">← Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="btn-secondary text-xs py-1.5 px-3" id="next-page">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
