import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = (session.user as any).id as string
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
