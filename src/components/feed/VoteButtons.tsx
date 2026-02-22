'use client'

import { useState } from 'react'

interface Props {
  postId: string
  voteScore: number
  userVote: 1 | -1 | null
  onChange: (voteScore: number, userVote: 1 | -1 | null) => void
}

export default function VoteButtons({ postId, voteScore, userVote, onChange }: Props) {
  const [loading, setLoading] = useState(false)

  async function vote(value: 1 | -1) {
    if (loading) return
    setLoading(true)

    // Optimistic update
    let newUserVote: 1 | -1 | null
    let delta: number
    if (userVote === value) {
      newUserVote = null
      delta = -value
    } else {
      delta = userVote ? value * 2 : value
      newUserVote = value
    }
    onChange(voteScore + delta, newUserVote)

    try {
      await fetch(`/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      })
    } catch {
      // Revert on error
      onChange(voteScore, userVote)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => vote(1)}
        disabled={loading}
        className={`p-1 rounded transition-colors ${
          userVote === 1
            ? 'text-emerald-500 dark:text-emerald-400'
            : 'text-slate-400 dark:text-zinc-500 hover:text-emerald-500 dark:hover:text-emerald-400'
        }`}
        aria-label="Upvote"
      >
        ▲
      </button>
      <span
        className={`text-sm font-semibold min-w-[1.5rem] text-center tabular-nums ${
          voteScore > 0
            ? 'text-emerald-500 dark:text-emerald-400'
            : voteScore < 0
            ? 'text-red-500 dark:text-red-400'
            : 'text-slate-400 dark:text-zinc-500'
        }`}
      >
        {voteScore}
      </span>
      <button
        onClick={() => vote(-1)}
        disabled={loading}
        className={`p-1 rounded transition-colors ${
          userVote === -1
            ? 'text-red-500 dark:text-red-400'
            : 'text-slate-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400'
        }`}
        aria-label="Downvote"
      >
        ▼
      </button>
    </div>
  )
}
