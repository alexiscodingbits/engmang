'use client'

import { useState } from 'react'

interface Props {
  postId: string
  isBookmarked: boolean
  onChange: (isBookmarked: boolean) => void
}

export default function BookmarkButton({ postId, isBookmarked, onChange }: Props) {
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (loading) return
    setLoading(true)
    onChange(!isBookmarked)

    try {
      await fetch(`/api/posts/${postId}/bookmark`, { method: 'POST' })
    } catch {
      onChange(isBookmarked)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
      className={`text-xl transition-colors ${
        isBookmarked ? 'text-emerald-400' : 'text-zinc-600 hover:text-zinc-300'
      }`}
    >
      {isBookmarked ? '★' : '☆'}
      <span className="sr-only">{isBookmarked ? 'Saved' : 'Save'}</span>
    </button>
  )
}
