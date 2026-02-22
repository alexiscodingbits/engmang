import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ userId: string }>
}

const YEAR_LABELS = ['', '1st', '2nd', '3rd', '4th', '5th']
const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  TEXT: { label: 'Text', color: 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300' },
  IMAGE: { label: 'Image', color: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' },
  LINK: { label: 'Link', color: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' },
  QUESTION: { label: 'Question', color: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300' },
}

export default async function ProfilePage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { userId } = await params

  const [profileUser, posts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, year: true, bio: true, avatarUrl: true, linkedInUrl: true },
    }),
    prisma.post.findMany({
      where: { authorId: userId, isAnonymous: false, moduleCode: null },
      select: {
        id: true, title: true, body: true, type: true, createdAt: true, noteTag: true,
        _count: { select: { comments: true } },
        votes: { select: { value: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  if (!profileUser) notFound()

  const isOwnProfile = user.id === userId

  return (
    <main className="min-h-screen pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Profile card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="shrink-0">
              {profileUser.avatarUrl ? (
                <img
                  src={profileUser.avatarUrl}
                  alt={profileUser.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 dark:border-zinc-700"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-white text-3xl font-bold">
                  {profileUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{profileUser.name}</h1>
                <span className="text-slate-400 dark:text-zinc-500 text-sm">
                  {YEAR_LABELS[profileUser.year] ?? profileUser.year} year
                </span>
              </div>

              {profileUser.bio && (
                <p className="text-slate-500 dark:text-zinc-400 text-sm mt-2 leading-relaxed">{profileUser.bio}</p>
              )}

              <div className="flex items-center gap-3 mt-4 flex-wrap">
                {profileUser.linkedInUrl && (
                  <a
                    href={profileUser.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[#0A66C2] hover:bg-[#0958a8] text-white transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </a>
                )}

                {!isOwnProfile && (
                  <Link
                    href={`/messages?with=${profileUser.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  >
                    <span>💬</span>
                    Message
                  </Link>
                )}

                {isOwnProfile && (
                  <Link
                    href="/profile/edit"
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 text-slate-700 dark:text-zinc-200 transition-colors"
                  >
                    Edit Profile
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <h2 className="text-slate-400 dark:text-zinc-400 text-xs uppercase tracking-wider mb-4">
          Posts · {posts.length}
        </h2>

        {posts.length === 0 ? (
          <p className="text-slate-400 dark:text-zinc-600 text-sm">No public posts yet.</p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => {
              const voteScore = post.votes.reduce((s, v) => s + v.value, 0)
              const badge = TYPE_BADGE[post.type] ?? TYPE_BADGE.TEXT
              return (
                <div
                  key={post.id}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {post.noteTag ? (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 mb-2 inline-block">
                          {post.noteTag}
                        </span>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium mb-2 inline-block ${badge.color}`}>
                          {badge.label}
                        </span>
                      )}
                      <p className="text-slate-800 dark:text-zinc-200 text-sm font-medium leading-snug">{post.title}</p>
                      {post.body && (
                        <p className="text-slate-500 dark:text-zinc-500 text-xs mt-1 line-clamp-2">{post.body}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 dark:text-zinc-600">
                    <span>▲ {voteScore}</span>
                    <span>💬 {post._count.comments}</span>
                    <span>
                      {new Date(post.createdAt).toLocaleDateString('en-IE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
