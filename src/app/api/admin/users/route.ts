import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const caller = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } })
  if (caller?.role !== 'MASTER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const role = req.nextUrl.searchParams.get('role')
  const users = await prisma.user.findMany({
    where: role ? { role: role as never } : undefined,
    select: { id: true, name: true, email: true, year: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(users)
}
