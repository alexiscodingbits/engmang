'use client'

import { useState, useEffect, useCallback } from 'react'
import { getModulesForYear, NOTE_TAGS } from '@/lib/modules'
import PostCard from './PostCard'
import CreatePostModal from './CreatePostModal'
import type { Post, ModuleSection } from './types'

const SECTIONS: { value: ModuleSection; label: string }[] = [
  { value: 'NOTES', label: 'Notes' },
  { value: 'QUESTIONS', label: 'Questions' },
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
  const [tagFilter, setTagFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const modules = getModulesForYear(year)
  const selectedModule = modules.find((m) => m.code === moduleCode)

  // Reset module when year changes
  useEffect(() => {
    setModuleCode('')
    setPosts([])
    setTagFilter('All')
    setSearchQuery('')
  }, [year])

  // Reset filters when section or module changes
  useEffect(() => {
    setTagFilter('All')
    setSearchQuery('')
  }, [section, moduleCode])

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

  function handlePostDelete(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  // Client-side filtering
  const filteredPosts = posts.filter((p) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch = !q || (
      section === 'NOTES'
        ? (p.title.toLowerCase().includes(q) ||
           (p.body?.toLowerCase().includes(q) ?? false) ||
           (p.noteTag?.toLowerCase().includes(q) ?? false))
        : (p.title.toLowerCase().includes(q) ||
           (p.body?.toLowerCase().includes(q) ?? false) ||
           p.author.name.toLowerCase().includes(q))
    )
    const matchesTag = section !== 'NOTES' || tagFilter === 'All' || p.noteTag === tagFilter
    return matchesSearch && matchesTag
  })

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

      {/* Module selector — name only, no code shown */}
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
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Module content */}
      {moduleCode ? (
        <>
          {/* Module name + subtle code header */}
          <div className="mb-4 pb-3 border-b border-zinc-800">
            <h2 className="text-zinc-100 font-semibold text-base leading-snug">
              {selectedModule?.name}
            </h2>
            <span className="text-zinc-600 text-xs font-mono">{moduleCode}</span>
          </div>

          {/* Section tabs */}
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

          {/* Tag filter (Notes only) */}
          {section === 'NOTES' && (
            <div className="mb-3">
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="All">All tags</option>
                {NOTE_TAGS.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          )}

          {/* Search bar */}
          <div className="relative mb-4">
            <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500 pointer-events-none">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                section === 'NOTES'
                  ? 'Search notes or tags…'
                  : 'Search questions or authors…'
              }
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
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-14 text-zinc-500">
              <p className="text-3xl mb-3">
                {searchQuery || tagFilter !== 'All' ? '🔍' : section === 'NOTES' ? '📄' : '❓'}
              </p>
              <p className="font-medium">
                {searchQuery || tagFilter !== 'All'
                  ? 'No posts match your filters'
                  : `No ${SECTIONS.find((s) => s.value === section)?.label.toLowerCase()} yet`}
              </p>
              {!searchQuery && tagFilter === 'All' && (
                <p className="text-sm mt-1">Be the first to contribute!</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} onUpdate={handlePostUpdate} onDelete={handlePostDelete} />
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
