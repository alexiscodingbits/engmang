'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav id="tour-navbar" className="border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          eng<span className="text-emerald-400">mang</span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link href="/feed" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Feed
              </Link>
              <Link id="tour-messages" href="/messages" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Messages
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-zinc-500 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
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
