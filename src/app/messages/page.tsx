import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import MessagesClient from '@/components/messages/MessagesClient'
import type { Contact } from '@/components/messages/MessagesClient'
import { DotPattern } from '@/components/DotPattern'

interface Props {
  searchParams: Promise<{ with?: string }>
}

export default async function MessagesPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { with: withUserId } = await searchParams

  const [dbUser, initialContact] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { year: true } }),
    withUserId && withUserId !== user.id
      ? prisma.user.findUnique({
          where: { id: withUserId },
          select: { id: true, name: true, year: true, linkedInUrl: true },
        })
      : null,
  ])

  return (
    <>
      <DotPattern className="-z-10" />
    <div className="flex h-[75vh] min-h-[500px] bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800">
      <MessagesClient
        currentUserId={user.id}
        currentUserYear={dbUser?.year ?? 1}
        initialContact={initialContact as Contact | null}
      />
    </div>
    </>
  )
}
