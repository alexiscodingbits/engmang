'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(true)

  // Sync isDark with the actual HTML class (set by inline script before hydration)
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggleTheme() {
    const html = document.documentElement
    if (html.classList.contains('dark')) {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDark(false)
    } else {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDark(true)
    }
  }

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        fetch('/api/user/me')
          .then((r) => r.json())
          .then((d) => {
            setRole(d.role ?? null)
            setUserName(d.name ?? null)
            setAvatarUrl(d.avatarUrl ?? null)
          })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetch('/api/user/me')
          .then((r) => r.json())
          .then((d) => {
            setRole(d.role ?? null)
            setUserName(d.name ?? null)
            setAvatarUrl(d.avatarUrl ?? null)
          })
      } else {
        setRole(null)
        setUserName(null)
        setAvatarUrl(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isFeed = pathname?.startsWith('/feed') ?? false
  const isMessages = pathname?.startsWith('/messages') ?? false
  const isAdmin = pathname?.startsWith('/admin') ?? false
  const isManageUsers = pathname?.startsWith('/manage-users') ?? false

  return (
    <nav id="tour-navbar" className="border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        {/* Left: logo + avatar */}
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            eng<span className="text-emerald-500 dark:text-emerald-400">mang</span>
          </Link>

          {user && (
            <Link
              href="/profile/edit"
              title="Edit your profile"
              className="group flex-shrink-0"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={userName ?? 'Profile'}
                  className="w-8 h-8 rounded-full object-cover border-2 border-slate-300 dark:border-zinc-700 group-hover:border-emerald-500 transition-colors"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold border-2 border-transparent group-hover:border-emerald-400 transition-colors">
                  {userName ? userName.charAt(0).toUpperCase() : '?'}
                </div>
              )}
            </Link>
          )}
        </div>

        {/* Right: nav links */}
        <div className="flex items-center gap-6">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors text-lg leading-none"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {user ? (
            <>
              <Link
                href="/feed"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isFeed
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                Feed
              </Link>
              <Link
                id="tour-messages"
                href="/messages"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isMessages
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                Messages
              </Link>

              {role === 'MASTER' && (
                <Link
                  href="/admin"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isAdmin
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Admin
                </Link>
              )}

              {(role === 'CLASS_REP' || role === 'MASTER') && (
                <Link
                  href="/manage-users"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isManageUsers
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Users
                </Link>
              )}

              <Link
                href="https://buymeacoffee.com/alexmcconnell"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-[#FFDD00] hover:bg-yellow-300 text-zinc-900 transition-colors"
              >
                <span>☕</span>
                <span>Buy me a coffee</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-slate-400 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                Log in
              </Link>
              <Link
                href="/register"
                className="text-sm bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-400 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
