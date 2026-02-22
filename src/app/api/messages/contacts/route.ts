import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const yearParam = req.nextUrl.searchParams.get('year')

  let targetYear: number
  if (yearParam) {
    targetYear = parseInt(yearParam)
  } else {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { year: true },
    })
    targetYear = dbUser?.year ?? 1
  }

  const [contacts, favorites] = await Promise.all([
    prisma.user.findMany({
      where: { year: targetYear, id: { not: user.id } },
      select: { id: true, name: true, year: true, linkedInUrl: true },
      orderBy: { name: 'asc' },
    }),
    prisma.favorite.findMany({
      where: { userId: user.id },
      select: { targetId: true },
    }),
  ])

  return NextResponse.json({
    contacts,
    favoriteIds: favorites.map((f) => f.targetId),
    year: targetYear,
  })
}
