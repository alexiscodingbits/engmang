import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id: postId } = await params

  const comments = await prisma.comment.findMany({
    where: { postId },
    select: {
      id: true,
      body: true,
      isDeleted: true,
      createdAt: true,
      authorId: true,
      author: { select: { name: true, year: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(comments)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id
  const { id: postId } = await params

  const { body } = await req.json()
  if (!body?.trim()) {
    return NextResponse.json({ error: 'Comment body is required' }, { status: 400 })
  }

  const comment = await prisma.comment.create({
    data: { body: body.trim(), authorId: userId, postId },
    select: {
      id: true,
      body: true,
      isDeleted: true,
      createdAt: true,
      authorId: true,
      author: { select: { name: true, year: true } },
    },
  })

  return NextResponse.json(comment, { status: 201 })
}
