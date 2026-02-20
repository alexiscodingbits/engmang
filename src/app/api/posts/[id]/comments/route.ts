import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id: postId } = await params

  const comments = await prisma.comment.findMany({
    where: { postId },
    include: { author: { select: { name: true, year: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(comments)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = (session.user as any).id as string
  const { id: postId } = await params

  const { body } = await req.json()
  if (!body?.trim()) {
    return NextResponse.json({ error: 'Comment body is required' }, { status: 400 })
  }

  const comment = await prisma.comment.create({
    data: { body: body.trim(), authorId: userId, postId },
    include: { author: { select: { name: true, year: true } } },
  })

  return NextResponse.json(comment, { status: 201 })
}
