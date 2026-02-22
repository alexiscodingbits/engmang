import type { User } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

/**
 * Upserts a Prisma User record from a Supabase Auth user.
 * Called during email confirmation and on first login to ensure
 * the Prisma User (used for relations) always exists.
 */
export async function ensureUser(supabaseUser: User) {
  return prisma.user.upsert({
    where: { id: supabaseUser.id },
    create: {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      name: supabaseUser.user_metadata?.name ?? supabaseUser.email!.split('@')[0],
      year: Number(supabaseUser.user_metadata?.year ?? 1),
      role: supabaseUser.user_metadata?.isClassRep ? 'PENDING_CLASS_REP' : 'USER',
    },
    update: {},
  })
}
