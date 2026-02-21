'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  name: string
}

export default function WelcomeClient({ name }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleGetStarted() {
    setLoading(true)
    await fetch('/api/user/welcome', { method: 'POST' })
    router.push('/feed')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-3xl font-bold tracking-tight text-white">
            eng<span className="text-emerald-400">mang</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-2xl font-bold text-emerald-400 select-none">
              AM
            </div>
          </div>

          <h1 className="text-xl font-bold text-white text-center mb-1">
            Hey {name}! Welcome to EngMang 👋
          </h1>
          <p className="text-zinc-500 text-sm text-center mb-6">
            A note from the creator
          </p>

          {/* Personal message */}
          <div className="bg-zinc-800/60 rounded-xl p-5 mb-6 border border-zinc-700/50">
            <p className="text-zinc-300 text-sm leading-relaxed">
              I built EngMang because I wanted a better way for Engineering Management
              students to share notes, ask questions, and connect with each other.
            </p>
            <p className="text-zinc-300 text-sm leading-relaxed mt-3">
              No Instagram chaos, no WhatsApp group spam — just a clean space built
              specifically for your course. I hope it makes your year a little easier.
            </p>
            <p className="text-zinc-400 text-sm mt-4 font-medium">
              — Alex McConnell, EngMan Final Year
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleGetStarted}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-950 font-semibold text-sm transition-colors"
            >
              {loading ? 'Loading…' : "Let's get started →"}
            </button>

            <Link
              href="https://buymeacoffee.com/alexmcconnell"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#FFDD00] hover:bg-yellow-300 text-zinc-900 font-semibold text-sm transition-colors"
            >
              <span>☕</span>
              <span>Buy me a coffee</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
