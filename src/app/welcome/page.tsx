import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import WelcomeClient from './WelcomeClient'

export default async function WelcomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { hasSeenWelcome: true, name: true },
  })

  // Already dismissed — skip straight to feed
  if (dbUser?.hasSeenWelcome) redirect('/feed')

  return <WelcomeClient name={dbUser?.name ?? 'there'} />
}
