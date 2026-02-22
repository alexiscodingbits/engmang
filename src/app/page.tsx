import Link from 'next/link'
import UnicornBackground from '@/components/UnicornBackground'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <UnicornBackground />
      <div className="mb-2 text-sm font-medium tracking-widest uppercase text-emerald-400">
        TCD Engineering with Management
      </div>
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
        eng<span className="text-emerald-400">mang</span>
      </h1>
      <p className="text-lg text-zinc-400 max-w-md mb-10 leading-relaxed">
        The community platform for EngMang students. Share notes, ask questions, 
        connect with students across all years.
      </p>
      <div className="flex gap-4">
        <Link
          href="/register"
          className="bg-emerald-500 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-emerald-400 transition-colors"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="border border-zinc-700 text-zinc-300 px-8 py-3 rounded-lg text-sm font-medium hover:border-zinc-500 hover:text-white transition-colors"
        >
          Log in
        </Link>
      </div>
    </div>
  )
}
