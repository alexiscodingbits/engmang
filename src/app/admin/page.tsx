import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } })
  if (dbUser?.role !== 'MASTER') redirect('/feed')

  const [pending, classReps, allUsers] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'PENDING_CLASS_REP' },
      select: { id: true, name: true, email: true, year: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.user.findMany({
      where: { role: 'CLASS_REP' },
      select: { id: true, name: true, email: true, year: true },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: { role: { not: 'MASTER' } },
      select: { id: true, name: true, email: true, year: true, role: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <main className="min-h-screen bg-zinc-950 pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
        <p className="text-zinc-400 text-sm mb-8">Manage users and class rep requests.</p>
        <AdminClient pending={pending} classReps={classReps} allUsers={allUsers} />
      </div>
    </main>
  )
}
