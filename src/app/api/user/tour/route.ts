import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.user.upsert({
    where: { id: user.id },
    update: { hasSeenTour: true },
    create: {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name ?? user.email!.split('@')[0],
      year: Number(user.user_metadata?.year ?? 1),
      hasSeenTour: true,
    },
  })

  return NextResponse.json({ ok: true })
}
