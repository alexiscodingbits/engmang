import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const caller = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } })
  if (!caller || (caller.role !== 'MASTER' && caller.role !== 'CLASS_REP')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id: postId } = await params
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { isPinned: true } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.post.update({
    where: { id: postId },
    data: { isPinned: !post.isPinned },
    select: { isPinned: true },
  })

  return NextResponse.json({ isPinned: updated.isPinned })
}
