import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ensureUser } from '@/lib/supabase/ensure-user'
import WelcomeClient from './WelcomeClient'

export default async function WelcomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ensureUser upserts — creates the Prisma row if it doesn't exist yet,
  // so the welcome API route and feed page can safely read/update it.
  const dbUser = await ensureUser(user)

  // Already dismissed — skip straight to feed
  if (dbUser.hasSeenWelcome) redirect('/feed')

  return <WelcomeClient name={dbUser.name} />
}
