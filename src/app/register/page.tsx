'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [year, setYear] = useState('1')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setError('')

    // if (!email.endsWith('@tcd.ie')) {
    //   setError('You must use a @tcd.ie email address')
    //   return
    // }

    setLoading(true)
    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, year: parseInt(year) },
        emailRedirectTo: `https://www.engmang.ie/auth/callback`,
      },
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    //router.push('/auth/confirm')
    router.push('/feed')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Create your account</h1>
        <p className="text-zinc-400 text-sm mb-8">Join the EngMang community</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm text-zinc-400 mb-1.5">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-zinc-400 mb-1.5">
              TCD Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@tcd.ie"
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-zinc-400 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="year" className="block text-sm text-zinc-400 mb-1.5">
              Year
            </label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
              <option value="5">5th Year</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-zinc-500 mt-6 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
