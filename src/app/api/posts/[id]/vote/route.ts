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

  const { value } = await req.json()
  if (value !== 1 && value !== -1) {
    return NextResponse.json({ error: 'value must be 1 or -1' }, { status: 400 })
  }

  const existing = await prisma.vote.findUnique({
    where: { userId_postId: { userId, postId } },
  })

  if (existing) {
    if (existing.value === value) {
      // Same vote → remove it
      await prisma.vote.delete({ where: { userId_postId: { userId, postId } } })
      return NextResponse.json({ userVote: null })
    } else {
      // Different vote → update
      await prisma.vote.update({
        where: { userId_postId: { userId, postId } },
        data: { value },
      })
      return NextResponse.json({ userVote: value })
    }
  } else {
    await prisma.vote.create({ data: { userId, postId, value } })
    return NextResponse.json({ userVote: value })
  }
}
