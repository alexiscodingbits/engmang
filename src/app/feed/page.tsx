import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FeedClient from '@/components/feed/FeedClient'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
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
