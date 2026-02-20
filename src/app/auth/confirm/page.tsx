import Link from 'next/link'

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function ConfirmPage({ searchParams }: Props) {
  const { error } = await searchParams
  const hasError = error === 'true'

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      {hasError ? (
        <>
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Confirmation failed</h1>
          <p className="text-zinc-400 text-sm mb-6 max-w-sm">
            The confirmation link may have expired or already been used. Try registering again.
          </p>
          <Link
            href="/register"
            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
          >
            Back to sign up
          </Link>
        </>
      ) : (
        <>
          <div className="text-5xl mb-4">📬</div>
          <h1 className="text-2xl font-bold mb-2">Check your email</h1>
          <p className="text-zinc-400 text-sm mb-6 max-w-sm">
            We sent a confirmation link to your TCD email. Click it to activate your account
            and get started.
          </p>
          <p className="text-zinc-600 text-xs">
            Already confirmed?{' '}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300">
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
  )
}
