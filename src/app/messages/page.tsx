import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import MessagesClient from '@/components/messages/MessagesClient'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { year: true },
  })

  return (
    <div className="flex h-[75vh] min-h-[500px] bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
      <MessagesClient
        currentUserId={user.id}
        currentUserYear={dbUser?.year ?? 1}
      />
    </div>
  )
}
