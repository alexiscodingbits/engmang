import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import EditProfileClient from './EditProfileClient'

export default async function EditProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { bio: true, avatarUrl: true, linkedInUrl: true },
  })

  return (
    <main className="min-h-screen pt-20 pb-12">
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Edit Profile</h1>
        <p className="text-slate-500 dark:text-zinc-400 text-sm mb-8">Update your bio, avatar, and LinkedIn.</p>
        <EditProfileClient
          userId={user.id}
          initialBio={dbUser?.bio ?? ''}
          initialAvatarUrl={dbUser?.avatarUrl ?? ''}
          initialLinkedInUrl={dbUser?.linkedInUrl ?? ''}
        />
      </div>
    </main>
  )
}
