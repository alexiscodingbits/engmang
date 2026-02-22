import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ensureUser } from '@/lib/supabase/ensure-user'
import FeedClient from '@/components/feed/FeedClient'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // ensureUser upserts — safe even if the Prisma row doesn't exist yet.
  const dbUser = await ensureUser(user)

  if (!dbUser.hasSeenWelcome) {
    redirect('/welcome')
  }

  return (
    <main className="min-h-screen bg-zinc-950 pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <FeedClient showTour={!dbUser?.hasSeenTour} userRole={dbUser.role} />
      </div>
    </main>
  )
}
