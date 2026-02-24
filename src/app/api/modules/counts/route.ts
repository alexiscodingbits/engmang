import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const year = req.nextUrl.searchParams.get('year')
  if (!year) return NextResponse.json({})

  const rows = await prisma.post.groupBy({
    by: ['moduleCode'],
    where: { moduleYear: parseInt(year), moduleCode: { not: null } },
    _count: { id: true },
  })

  const counts: Record<string, number> = {}
  for (const row of rows) {
    if (row.moduleCode) counts[row.moduleCode] = row._count.id
  }

  return NextResponse.json(counts)
}
