'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UserRow {
  id: string
  name: string
  email: string
  year: number
  role?: string
}

interface Props {
  pending: UserRow[]
  classReps: UserRow[]
  allUsers: (UserRow & { role: string })[]
}

type Tab = 'pending' | 'classreps' | 'allusers'

const YEAR_LABELS = ['', '1st', '2nd', '3rd', '4th', '5th']

export default function AdminClient({ pending, classReps, allUsers }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('pending')
  const [search, setSearch] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function action(endpoint: string, userId: string) {
    setLoadingId(userId)
    await fetch(`/api/admin/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    setLoadingId(null)
    router.refresh()
  }

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'pending', label: 'Pending Class Reps', count: pending.length },
    { key: 'classreps', label: 'Class Reps', count: classReps.length },
    { key: 'allusers', label: 'All Users' },
  ]

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-zinc-900 rounded-xl p-1 border border-slate-200 dark:border-zinc-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-emerald-500 text-zinc-950'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-zinc-950/30' : 'bg-slate-200 dark:bg-zinc-800'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pending Class Reps */}
      {tab === 'pending' && (
        <div className="space-y-3">
          {pending.length === 0 && (
            <p className="text-slate-400 dark:text-zinc-500 text-sm">No pending requests.</p>
          )}
          {pending.map((u) => (
            <div key={u.id} className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3">
              <div>
                <p className="text-slate-800 dark:text-zinc-200 text-sm font-medium">{u.name}</p>
                <p className="text-slate-400 dark:text-zinc-500 text-xs">{u.email} · {YEAR_LABELS[u.year] ?? u.year} year</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => action('approve-class-rep', u.id)}
                  disabled={loadingId === u.id}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => action('reject-class-rep', u.id)}
                  disabled={loadingId === u.id}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 text-slate-600 dark:text-zinc-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Class Reps */}
      {tab === 'classreps' && (
        <div className="space-y-3">
          {classReps.length === 0 && (
            <p className="text-slate-400 dark:text-zinc-500 text-sm">No class reps yet.</p>
          )}
          {classReps.map((u) => (
            <div key={u.id} className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3">
              <div>
                <p className="text-slate-800 dark:text-zinc-200 text-sm font-medium">{u.name}</p>
                <p className="text-slate-400 dark:text-zinc-500 text-xs">{u.email} · {YEAR_LABELS[u.year] ?? u.year} year</p>
              </div>
              <button
                onClick={() => action('revoke-class-rep', u.id)}
                disabled={loadingId === u.id}
                className="px-3 py-1.5 bg-slate-200 dark:bg-zinc-700 hover:bg-red-100 dark:hover:bg-red-800 text-slate-600 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      )}

      {/* All Users */}
      {tab === 'allusers' && (
        <div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors mb-4"
          />
          <div className="space-y-3">
            {filteredUsers.length === 0 && (
              <p className="text-slate-400 dark:text-zinc-500 text-sm">No users found.</p>
            )}
            {filteredUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3">
                <div>
                  <p className="text-zinc-200 text-sm font-medium">
                    {u.name}
                    <span className="ml-2 text-xs text-slate-400 dark:text-zinc-500 font-normal capitalize">{u.role?.toLowerCase().replace('_', ' ')}</span>
                  </p>
                  <p className="text-zinc-500 text-xs">{u.email} · {YEAR_LABELS[u.year] ?? u.year} year</p>
                </div>
                <button
                  onClick={() => action('remove-user', u.id)}
                  disabled={loadingId === u.id}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-zinc-700 hover:bg-red-100 dark:hover:bg-red-900 text-slate-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
