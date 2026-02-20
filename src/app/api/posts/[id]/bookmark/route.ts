import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id
  const { id: postId } = await params

  const existing = await prisma.bookmark.findUnique({
    where: { userId_postId: { userId, postId } },
  })

  if (existing) {
    await prisma.bookmark.delete({ where: { userId_postId: { userId, postId } } })
    return NextResponse.json({ isBookmarked: false })
  } else {
    await prisma.bookmark.create({ data: { userId, postId } })
    return NextResponse.json({ isBookmarked: true })
  }
}
