import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bio, avatarUrl, linkedInUrl, phoneNumber, smsNotifications } = await req.json()

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      bio: bio !== undefined ? (bio?.trim() || null) : undefined,
      avatarUrl: avatarUrl !== undefined ? (avatarUrl?.trim() || null) : undefined,
      linkedInUrl: linkedInUrl !== undefined ? (linkedInUrl?.trim() || null) : undefined,
      phoneNumber: phoneNumber !== undefined ? (phoneNumber?.trim() || null) : undefined,
      smsNotifications: smsNotifications !== undefined ? Boolean(smsNotifications) : undefined,
    },
    select: { bio: true, avatarUrl: true, linkedInUrl: true, phoneNumber: true, smsNotifications: true },
  })

  return NextResponse.json(updated)
}
