import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import ManageUsersClient from './ManageUsersClient'

export default async function ManageUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } })
  if (dbUser?.role !== 'CLASS_REP' && dbUser?.role !== 'MASTER') redirect('/feed')

  const users = await prisma.user.findMany({
    where: { role: { notIn: ['MASTER', 'CLASS_REP'] } },
    select: { id: true, name: true, email: true, year: true, role: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="min-h-screen pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Manage Users</h1>
        <p className="text-slate-500 dark:text-zinc-400 text-sm mb-8">Remove users from the platform.</p>
        <ManageUsersClient users={users} />
      </div>
    </main>
  )
}
