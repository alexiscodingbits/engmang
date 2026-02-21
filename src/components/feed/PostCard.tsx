'use client'

import { useState, useEffect } from 'react'
import type { Post } from './types'
import VoteButtons from './VoteButtons'
import BookmarkButton from './BookmarkButton'
import CommentSection from './CommentSection'
import { createClient } from '@/lib/supabase/client'

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  TEXT: { label: 'Text', color: 'bg-zinc-700 text-zinc-300' },
  IMAGE: { label: 'Image', color: 'bg-blue-900 text-blue-300' },
  LINK: { label: 'Link', color: 'bg-purple-900 text-purple-300' },
  QUESTION: { label: 'Question', color: 'bg-amber-900 text-amber-300' },
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

  const yearLabel = (y: number) =>
    ['', '1st', '2nd', '3rd', '4th', '5th'][y] ?? `${y}th`

  const isAuthor = currentUserId === post.authorId

  return (
    <article className="tour-post-card bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
      {/* Author + meta */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-zinc-950 font-bold text-xs shrink-0">
          {post.author.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-zinc-200 text-sm font-medium">{post.author.name}</span>
          <span className="text-zinc-500 text-xs ml-2">
            {yearLabel(post.author.year)} year ·{' '}
            {new Date(post.createdAt).toLocaleDateString('en-IE', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </div>
        {post.noteTag ? (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-teal-900 text-teal-300">
            {post.noteTag}
          </span>
        ) : (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
            {badge.label}
          </span>
        )}
      </div>

      {/* Title */}
      <h2 className="text-zinc-100 font-semibold text-base mb-1 leading-snug">
        {post.title}
      </h2>

      {/* Body */}
      {post.body && (
        <p className="text-zinc-400 text-sm leading-relaxed mb-3 line-clamp-3">{post.body}</p>
      )}

      {/* Image */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full rounded-lg mb-3 max-h-80 object-cover border border-zinc-800"
        />
      )}

      {/* Link */}
      {post.linkUrl && (
        <a
          href={post.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-emerald-400 text-sm hover:text-emerald-300 mb-3 truncate"
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
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mb-3 transition-colors"
        >
          <span>{post.fileUrl.match(/\.pdf$/i) ? '📄' : '📎'}</span>
          <span>View attachment</span>
        </a>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-zinc-800 mt-2">
        <VoteButtons
          postId={post.id}
          voteScore={post.voteScore}
          userVote={post.userVote}
          onChange={handleVoteChange}
        />

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
        >
          <span>💬</span>
          <span>{post.commentCount}</span>
        </button>

        <div className="ml-auto flex items-center gap-3">
          {isAuthor && (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-xs">Delete post?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs text-red-400 hover:text-red-300 font-medium disabled:opacity-50 transition-colors"
                >
                  {deleting ? 'Deleting…' : 'Yes'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-zinc-400 hover:text-red-400 transition-colors"
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
