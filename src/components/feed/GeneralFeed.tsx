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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
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
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
        >
          <span className="text-lg leading-none">+</span> New Post
        </button>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 bg-zinc-900 rounded-xl animate-pulse border border-zinc-800" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium">No posts yet</p>
          <p className="text-sm mt-1">Be the first to post something!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
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
