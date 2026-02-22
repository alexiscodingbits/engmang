'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UserRow {
  id: string
  name: string
  email: string
  year: number
  role: string
}

interface Props {
  users: UserRow[]
}

const YEAR_LABELS = ['', '1st', '2nd', '3rd', '4th', '5th']

export default function ManageUsersClient({ users }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function removeUser(userId: string) {
    setLoadingId(userId)
    setError('')
    const res = await fetch('/api/admin/remove-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to remove user')
    }
    setLoadingId(null)
    router.refresh()
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or email…"
        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors mb-4"
      />
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-zinc-500 text-sm">No users found.</p>
        )}
        {filtered.map((u) => (
          <div key={u.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
            <div>
              <p className="text-zinc-200 text-sm font-medium">{u.name}</p>
              <p className="text-zinc-500 text-xs">{u.email} · {YEAR_LABELS[u.year] ?? u.year} year</p>
            </div>
            <button
              onClick={() => removeUser(u.id)}
              disabled={loadingId === u.id}
              className="px-3 py-1.5 bg-zinc-700 hover:bg-red-900 text-zinc-400 hover:text-red-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loadingId === u.id ? 'Removing…' : 'Remove'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
