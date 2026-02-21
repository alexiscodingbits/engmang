import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { pusherServer } from '@/lib/pusher/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const contactId = req.nextUrl.searchParams.get('with')
  if (!contactId) return NextResponse.json({ error: 'Missing contact id' }, { status: 400 })

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user.id, receiverId: contactId },
        { senderId: contactId, receiverId: user.id },
      ],
    },
    orderBy: { createdAt: 'asc' },
    include: { sender: { select: { name: true } } },
  })

  return NextResponse.json(messages)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { receiverId, body, fileUrl } = await req.json()
  if (!receiverId) return NextResponse.json({ error: 'Receiver required' }, { status: 400 })
  if (!body?.trim() && !fileUrl) {
    return NextResponse.json({ error: 'Message body or file required' }, { status: 400 })
  }

  const message = await prisma.message.create({
    data: {
      body: body?.trim() || null,
      fileUrl: fileUrl || null,
      senderId: user.id,
      receiverId,
    },
    include: { sender: { select: { name: true } } },
  })

  // Trigger real-time event — payload includes fileUrl for instant rendering
  await pusherServer.trigger(`user-${receiverId}`, 'message-received', message)

  return NextResponse.json(message, { status: 201 })
}
