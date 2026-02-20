'use client'

import { useState } from 'react'
import type { Post, PostType } from './types'

type ModuleContext = {
  moduleCode: string
  moduleYear: number
  section: string
} | null

interface Props {
  onClose: () => void
  onCreated: (post: Post) => void
  moduleContext?: ModuleContext
}

const POST_TYPES: { value: PostType; label: string; icon: string }[] = [
  { value: 'TEXT', label: 'Text', icon: '📝' },
  { value: 'QUESTION', label: 'Question', icon: '❓' },
  { value: 'LINK', label: 'Link', icon: '🔗' },
  { value: 'IMAGE', label: 'Image', icon: '🖼️' },
]

export default function CreatePostModal({ onClose, onCreated, moduleContext }: Props) {
  const [type, setType] = useState<PostType>('TEXT')
  const [title, setTitle] = useState('')
  const [postBody, setPostBody] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    setSubmitting(true)
    setError('')

    const payload: any = {
      title,
      postBody,
      type,
      imageUrl: type === 'IMAGE' ? imageUrl : undefined,
      linkUrl: type === 'LINK' ? linkUrl : undefined,
    }
    if (moduleContext) {
      payload.moduleCode = moduleContext.moduleCode
      payload.moduleYear = moduleContext.moduleYear
      payload.section = moduleContext.section
    }

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const post: Post = await res.json()
      onCreated(post)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
    }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800">
          <h2 className="text-zinc-100 font-semibold text-base">
            {moduleContext ? 'Post to Module' : 'Create Post'}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Type selector */}
          <div className="flex gap-2">
            {POST_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg border text-xs font-medium transition-colors ${
                  type === t.value
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                }`}
              >
                <span className="text-lg">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'QUESTION' ? "What's your question?" : 'Title'}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Body (for TEXT and QUESTION) */}
          {(type === 'TEXT' || type === 'QUESTION') && (
            <textarea
              value={postBody}
              onChange={(e) => setPostBody(e.target.value)}
              placeholder={type === 'QUESTION' ? 'Add more details (optional)…' : 'Write something…'}
              rows={4}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
            />
          )}

          {/* Image URL */}
          {type === 'IMAGE' && (
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Image URL (https://…)"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
            />
          )}

          {/* Link URL */}
          {type === 'LINK' && (
            <>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="URL (https://…)"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
              <textarea
                value={postBody}
                onChange={(e) => setPostBody(e.target.value)}
                placeholder="Description (optional)…"
                rows={2}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 text-sm font-semibold transition-colors"
            >
              {submitting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
