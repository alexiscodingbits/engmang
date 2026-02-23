'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { DotPattern } from '@/components/DotPattern'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    router.push('/feed')
    router.refresh()
  }

  async function handleForgot(e: { preventDefault(): void }) {
    e.preventDefault()
    setForgotError('')
    setForgotLoading(true)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: 'https://www.engmang.ie/auth/callback?next=/auth/reset-password',
    })

    setForgotLoading(false)

    if (resetError) {
      setForgotError(resetError.message)
      return
    }

    setForgotSent(true)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <DotPattern className="-z-10" />
      <div className="w-full max-w-sm">

        {!showForgot ? (
          <>
            <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mb-8">Sign in to your EngMang account</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm text-slate-500 dark:text-zinc-400 mb-1.5">
                  TCD Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@tcd.ie"
                  required
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm text-slate-500 dark:text-zinc-400 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-sm text-slate-400 dark:text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <p className="text-sm text-slate-400 dark:text-zinc-500 mt-4 text-center">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300">
                Sign up
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-1">Reset password</h1>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mb-8">
              Enter your TCD email and we&apos;ll send you a reset link.
            </p>

            {!forgotSent ? (
              <>
                {forgotError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
                    {forgotError}
                  </div>
                )}

                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <label htmlFor="forgot-email" className="block text-sm text-slate-500 dark:text-zinc-400 mb-1.5">
                      TCD Email
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@tcd.ie"
                      required
                      className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-emerald-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {forgotLoading ? 'Sending…' : 'Send reset link'}
                  </button>
                </form>
              </>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm px-4 py-3 rounded-lg">
                Check your email for a password reset link.
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => { setShowForgot(false); setForgotSent(false); setForgotError('') }}
                className="text-sm text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
              >
                ← Back to sign in
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
