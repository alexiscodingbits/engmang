'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Post } from './types'
import VoteButtons from './VoteButtons'
import BookmarkButton from './BookmarkButton'
import CommentSection from './CommentSection'
import { createClient } from '@/lib/supabase/client'
import { useUserRole } from '@/lib/user-role-context'

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  TEXT: { label: 'Text', color: 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300' },
  IMAGE: { label: 'Image', color: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' },
  LINK: { label: 'Link', color: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' },
  QUESTION: { label: 'Question', color: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300' },
}

interface Props {
  post: Post
  onUpdate: (post: Post) => void
  onDelete: (postId: string) => void
}

export default function PostCard({ post, onUpdate, onDelete }: Props) {
  const [showComments, setShowComments] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const badge = TYPE_BADGE[post.type] ?? TYPE_BADGE.TEXT
  const userRole = useUserRole()

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null))
  }, [])

  function handleVoteChange(voteScore: number, userVote: 1 | -1 | null) {
    onUpdate({ ...post, voteScore, userVote })
  }

  function handleBookmarkChange(isBookmarked: boolean) {
    onUpdate({ ...post, isBookmarked })
  }

  function handleCommentCountChange(delta: number) {
    onUpdate({ ...post, commentCount: post.commentCount + delta })
  }

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' })
    if (res.ok) {
      onDelete(post.id)
    } else {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  async function handlePinToggle() {
    const res = await fetch(`/api/posts/${post.id}/pin`, { method: 'PATCH' })
    if (res.ok) {
      const { isPinned } = await res.json()
      onUpdate({ ...post, isPinned })
    }
  }

  const yearLabel = (y: number) =>
    ['', '1st', '2nd', '3rd', '4th', '5th'][y] ?? `${y}th`

  const isAuthor = currentUserId === post.authorId
  const canDelete = isAuthor || userRole === 'MASTER'
  const isMaster = userRole === 'MASTER'
  const canPin = userRole === 'MASTER' || userRole === 'CLASS_REP'

  const displayName = post.isAnonymous ? 'Anonymous' : post.author.name
  const displayInitial = post.isAnonymous ? '?' : post.author.name.charAt(0).toUpperCase()

  return (
    <article className={`tour-post-card bg-white dark:bg-zinc-900 border rounded-xl p-5 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors ${post.isPinned ? 'border-emerald-400 dark:border-emerald-700' : 'border-slate-200 dark:border-zinc-800'}`}>
      {/* Pinned indicator */}
      {post.isPinned && (
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-2">
          <span>📌</span>
          <span>Pinned</span>
        </div>
      )}

      {/* Author + meta */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-zinc-950 font-bold text-xs shrink-0">
          {displayInitial}
        </div>
        <div className="flex-1 min-w-0">
          {post.isAnonymous ? (
            <span className="text-slate-600 dark:text-zinc-400 text-sm font-medium">
              Anonymous
              {isMaster && (
                <span className="ml-2 text-slate-400 dark:text-zinc-600 text-xs font-normal italic">
                  (visible to admin: {post.author.name})
                </span>
              )}
            </span>
          ) : (
            <Link
              href={`/profile/${post.authorId}`}
              className="text-slate-800 dark:text-zinc-200 text-sm font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {displayName}
            </Link>
          )}
          <span className="text-slate-400 dark:text-zinc-500 text-xs ml-2">
            {yearLabel(post.author.year)} year ·{' '}
            {new Date(post.createdAt).toLocaleDateString('en-IE', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </div>
        {post.noteTag ? (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">
            {post.noteTag}
          </span>
        ) : (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
            {badge.label}
          </span>
        )}
      </div>

      {/* Title */}
      <h2 className="text-slate-900 dark:text-zinc-100 font-semibold text-base mb-1 leading-snug">
        {post.title}
      </h2>

      {/* Body */}
      {post.body && (
        <p className="text-slate-500 dark:text-zinc-400 text-sm leading-relaxed mb-3 line-clamp-3">{post.body}</p>
      )}

      {/* Image */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full rounded-lg mb-3 max-h-80 object-cover border border-slate-200 dark:border-zinc-800"
        />
      )}

      {/* Link */}
      {post.linkUrl && (
        <a
          href={post.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm hover:text-emerald-500 dark:hover:text-emerald-300 mb-3 truncate"
        >
          <span>🔗</span>
          <span className="truncate">{post.linkUrl}</span>
        </a>
      )}

      {/* File attachment */}
      {post.fileUrl && (
        <a
          href={post.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm mb-3 transition-colors"
        >
          <span>{post.fileUrl.match(/\.pdf$/i) ? '📄' : '📎'}</span>
          <span>View attachment</span>
        </a>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-slate-100 dark:border-zinc-800 mt-2">
        <VoteButtons
          postId={post.id}
          voteScore={post.voteScore}
          userVote={post.userVote}
          onChange={handleVoteChange}
        />

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 text-sm transition-colors"
        >
          <span>💬</span>
          <span>{post.commentCount}</span>
        </button>

        <div className="ml-auto flex items-center gap-3">
          {canPin && (
            <button
              onClick={handlePinToggle}
              title={post.isPinned ? 'Unpin post' : 'Pin post'}
              className={`text-sm transition-colors ${post.isPinned ? 'text-emerald-500 dark:text-emerald-400 hover:text-emerald-400 dark:hover:text-emerald-300' : 'text-slate-300 dark:text-zinc-600 hover:text-emerald-500 dark:hover:text-emerald-400'}`}
            >
              📌
            </button>
          )}
          {canDelete && (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-400 dark:text-zinc-500 text-xs">Delete post?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300 font-medium disabled:opacity-50 transition-colors"
                >
                  {deleting ? 'Deleting…' : 'Yes'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-slate-400 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                Delete
              </button>
            )
          )}
          <BookmarkButton
            postId={post.id}
            isBookmarked={post.isBookmarked}
            onChange={handleBookmarkChange}
          />
        </div>
      </div>

      {showComments && (
        <CommentSection postId={post.id} onCountChange={handleCommentCountChange} />
      )}
    </article>
  )
}
