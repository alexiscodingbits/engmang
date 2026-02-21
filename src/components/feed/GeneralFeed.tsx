'use client'

import { useState, useEffect, useCallback } from 'react'
import PostCard from './PostCard'
import CreatePostModal from './CreatePostModal'
import type { Post } from './types'

type Sort = 'newest' | 'popular'

export default function GeneralFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [sort, setSort] = useState<Sort>('newest')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/posts?sort=${sort}`)
    if (res.ok) setPosts(await res.json())
    setLoading(false)
  }, [sort])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  function handleNewPost(post: Post) {
    setPosts((prev) => [post, ...prev])
    setShowModal(false)
  }

  function handlePostUpdate(updated: Post) {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
  }

  const filteredPosts = searchQuery.trim()
    ? posts.filter((p) => {
        const q = searchQuery.toLowerCase()
        return (
          p.title.toLowerCase().includes(q) ||
          (p.body?.toLowerCase().includes(q) ?? false) ||
          p.author.name.toLowerCase().includes(q)
        )
      })
    : posts

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {(['newest', 'popular'] as Sort[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sort === s
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {s === 'newest' ? 'Newest' : 'Popular'}
            </button>
          ))}
        </div>
        <button
          id="tour-create-post"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
        >
          <span className="text-lg leading-none">+</span> New Post
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500 pointer-events-none">🔍</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search posts or authors…"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-300 text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 bg-zinc-900 rounded-xl animate-pulse border border-zinc-800" />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <p className="text-4xl mb-3">{searchQuery ? '🔍' : '📭'}</p>
          <p className="font-medium">{searchQuery ? 'No posts match your search' : 'No posts yet'}</p>
          {!searchQuery && <p className="text-sm mt-1">Be the first to post something!</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={handlePostUpdate} />
          ))}
        </div>
      )}

      {showModal && (
        <CreatePostModal onClose={() => setShowModal(false)} onCreated={handleNewPost} />
      )}
    </div>
  )
}
