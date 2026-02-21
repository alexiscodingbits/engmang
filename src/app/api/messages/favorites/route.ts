import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { targetId } = await req.json()
  if (!targetId) return NextResponse.json({ error: 'targetId required' }, { status: 400 })

  const existing = await prisma.favorite.findUnique({
    where: { userId_targetId: { userId: user.id, targetId } },
  })

  if (existing) {
    await prisma.favorite.delete({
      where: { userId_targetId: { userId: user.id, targetId } },
    })
    return NextResponse.json({ isFavorited: false })
  } else {
    await prisma.favorite.create({
      data: { userId: user.id, targetId },
    })
    return NextResponse.json({ isFavorited: true })
  }
}
