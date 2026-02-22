import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const caller = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } })
  if (caller?.role !== 'MASTER' && caller?.role !== 'CLASS_REP') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
  if (userId === user.id) return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 })

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  if (target?.role === 'MASTER') {
    return NextResponse.json({ error: 'Cannot remove a MASTER user' }, { status: 403 })
  }
  // CLASS_REP cannot remove other CLASS_REPs
  if (caller?.role === 'CLASS_REP' && target?.role === 'CLASS_REP') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Delete from Prisma first (cascades all related records)
  await prisma.user.delete({ where: { id: userId } })
  // Delete from Supabase Auth
  await supabaseAdmin.auth.admin.deleteUser(userId)

  return NextResponse.json({ ok: true })
}
