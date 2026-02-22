import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: commentId } = await params

  const [comment, caller] = await Promise.all([
    prisma.comment.findUnique({ where: { id: commentId }, select: { authorId: true } }),
    prisma.user.findUnique({ where: { id: user.id }, select: { role: true } }),
  ])
  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (comment.authorId !== user.id && caller?.role !== 'MASTER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Soft delete — preserves the row but hides content in the UI
  await prisma.comment.update({
    where: { id: commentId },
    data: { isDeleted: true },
  })

  return NextResponse.json({ ok: true })
}
