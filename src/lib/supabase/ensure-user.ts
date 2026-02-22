import type { User } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

/**
 * Upserts a Prisma User record from a Supabase Auth user.
 * Called during email confirmation and on first login to ensure
 * the Prisma User (used for relations) always exists.
 */
export async function ensureUser(supabaseUser: User) {
  const meta = supabaseUser.user_metadata ?? {}
  const phoneNumber = typeof meta.phoneNumber === 'string' && meta.phoneNumber.trim()
    ? meta.phoneNumber.trim()
    : null

  return prisma.user.upsert({
    where: { id: supabaseUser.id },
    create: {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      name: meta.name ?? supabaseUser.email!.split('@')[0],
      year: Number(meta.year ?? 1),
      role: meta.isClassRep ? 'PENDING_CLASS_REP' : 'USER',
      phoneNumber,
    },
    update: {},
  })
}
