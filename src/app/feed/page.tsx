import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import FeedClient from '@/components/feed/FeedClient'

export default async function FeedPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-zinc-950 pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <FeedClient />
      </div>
    </main>
  )
}
