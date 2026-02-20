'use client'

import { useState, useEffect, useCallback } from 'react'
import { getModulesForYear } from '@/lib/modules'
import PostCard from './PostCard'
import CreatePostModal from './CreatePostModal'
import type { Post, ModuleSection } from './types'

const SECTIONS: { value: ModuleSection; label: string }[] = [
  { value: 'NOTES', label: 'Notes' },
  { value: 'QUESTIONS', label: 'Questions' },
  { value: 'UPLOADED_WORK', label: 'Uploaded Work' },
]

type Sort = 'newest' | 'popular'

export default function ModulesSection() {
  const [year, setYear] = useState<number>(1)
  const [moduleCode, setModuleCode] = useState<string>('')
  const [section, setSection] = useState<ModuleSection>('NOTES')
  const [sort, setSort] = useState<Sort>('newest')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const modules = getModulesForYear(year)
  const selectedModule = modules.find((m) => m.code === moduleCode)

  // Reset module when year changes
  useEffect(() => {
    setModuleCode('')
    setPosts([])
  }, [year])

  const fetchPosts = useCallback(async () => {
    if (!moduleCode) return
    setLoading(true)
    const res = await fetch(
      `/api/posts?moduleCode=${moduleCode}&moduleYear=${year}&section=${section}&sort=${sort}`
    )
    if (res.ok) setPosts(await res.json())
    setLoading(false)
  }, [moduleCode, year, section, sort])

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
      {/* Year selector */}
      <div className="mb-4">
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Year</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                year === y
                  ? 'bg-emerald-500 border-emerald-500 text-zinc-950'
                  : 'border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Module selector */}
      <div className="mb-5">
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Module</p>
        <div className="grid grid-cols-2 gap-2">
          {modules.map((m) => (
            <button
              key={m.code}
              onClick={() => setModuleCode(m.code)}
              className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                moduleCode === m.code
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                  : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <span className="block text-xs text-zinc-600 font-mono mb-0.5">{m.code}</span>
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Section tabs + posts */}
      {moduleCode ? (
        <>
          <div className="flex gap-1 mb-4 bg-zinc-900 rounded-xl p-1 border border-zinc-800">
            {SECTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => setSection(s.value)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                  section === s.value
                    ? 'bg-zinc-700 text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Sort + Post button */}
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
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              <span className="text-lg leading-none">+</span> Post
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-36 bg-zinc-900 rounded-xl animate-pulse border border-zinc-800" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-14 text-zinc-500">
              <p className="text-3xl mb-3">
                {section === 'NOTES' ? '📄' : section === 'QUESTIONS' ? '❓' : '📁'}
              </p>
              <p className="font-medium">No {SECTIONS.find((s) => s.value === section)?.label.toLowerCase()} yet</p>
              <p className="text-sm mt-1">Be the first to contribute!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onUpdate={handlePostUpdate} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-14 text-zinc-600">
          <p className="text-3xl mb-3">📚</p>
          <p className="font-medium text-zinc-500">Select a module to get started</p>
        </div>
      )}

      {showModal && moduleCode && selectedModule && (
        <CreatePostModal
          onClose={() => setShowModal(false)}
          onCreated={handleNewPost}
          moduleContext={{
            moduleCode,
            moduleYear: year,
            section,
          }}
        />
      )}
    </div>
  )
}
