'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          eng<span className="text-emerald-400">mang</span>
        </Link>

        <div className="flex items-center gap-6">
          {session ? (
            <>
              <Link href="/feed" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Feed
              </Link>
              <Link href="/messages" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Messages
              </Link>
              <Link href="/faq" className="text-sm text-zinc-400 hover:text-white transition-colors">
                FAQ
              </Link>
              <button
                onClick={() => signOut()}
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
