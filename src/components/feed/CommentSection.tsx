'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Comment } from './types'
import { createClient } from '@/lib/supabase/client'
import { useUserRole } from '@/lib/user-role-context'

interface Props {
  postId: string
  onCountChange: (delta: number) => void
}

export default function CommentSection({ postId, onCountChange }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const userRole = useUserRole()

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null))
  }, [])

  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then((r) => r.json())
      .then((data) => { setComments(data); setLoading(false) })
  }, [postId])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim() || submitting) return
    setSubmitting(true)

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    })

    if (res.ok) {
      const comment: Comment = await res.json()
      setComments((prev) => [...prev, comment])
      onCountChange(1)
      setBody('')
    }
    setSubmitting(false)
  }

  async function handleDeleteComment(commentId: string) {
    const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
    if (res.ok) {
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, isDeleted: true } : c))
      )
      setConfirmDeleteId(null)
    }
  }

  const yearLabel = (y: number) =>
    ['', '1st', '2nd', '3rd', '4th', '5th'][y] ?? `${y}th`

  return (
    <div className="mt-4 pt-4 border-t border-zinc-800">
      {loading ? (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-10 bg-zinc-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {comments.length === 0 && (
            <p className="text-zinc-600 text-sm">No comments yet.</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-300 font-bold text-xs shrink-0 mt-0.5">
                {c.isDeleted ? '?' : c.author.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                {c.isDeleted ? (
                  <p className="text-zinc-600 text-sm italic">This message was deleted.</p>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Link
                        href={`/profile/${c.authorId}`}
                        className="text-zinc-300 text-xs font-medium hover:text-emerald-400 transition-colors"
                      >
                        {c.author.name}
                      </Link>
                      <span className="text-zinc-600 text-xs">
                        {yearLabel(c.author.year)} year ·{' '}
                        {new Date(c.createdAt).toLocaleDateString('en-IE', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <p className="flex-1 text-zinc-400 text-sm">{c.body}</p>
                      {(currentUserId === c.authorId || userRole === 'MASTER') && (
                        confirmDeleteId === c.id ? (
                          <span className="flex items-center gap-1.5 text-xs shrink-0 mt-0.5">
                            <span className="text-zinc-500">Delete?</span>
                            <button
                              onClick={() => handleDeleteComment(c.id)}
                              className="text-red-400 hover:text-red-300 font-medium transition-colors"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                              No
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(c.id)}
                            className="shrink-0 mt-0.5 text-zinc-600 hover:text-red-400 transition-colors"
                            title="Delete comment"
                          >
                            🗑️
                          </button>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      <form onSubmit={submit} className="flex gap-2">
        <textarea
          ref={inputRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a comment…"
          rows={1}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
        />
        <button
          type="submit"
          disabled={!body.trim() || submitting}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-semibold text-sm rounded-lg transition-colors shrink-0"
        >
          Send
        </button>
      </form>
    </div>
  )
}
