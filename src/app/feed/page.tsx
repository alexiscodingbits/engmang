import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import FeedClient from '@/components/feed/FeedClient'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { hasSeenTour: true },
  })

  return (
    <main className="min-h-screen bg-zinc-950 pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <FeedClient showTour={!dbUser?.hasSeenTour} />
      </div>
    </main>
  )
}
