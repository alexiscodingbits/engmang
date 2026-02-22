import type { User } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

/**
 * Ensures a Prisma User record exists for a Supabase Auth user.
 * Called during email confirmation and on first login.
 *
 * Handles the edge case where a user re-registers with the same email
 * and gets a new Supabase Auth ID — in that case we locate the existing
 * row by email and update it rather than trying to insert a duplicate.
 */
export async function ensureUser(supabaseUser: User) {
  const meta = supabaseUser.user_metadata ?? {}
  const phoneNumber = typeof meta.phoneNumber === 'string' && meta.phoneNumber.trim()
    ? meta.phoneNumber.trim()
    : null

  // 1. Check if a row already exists for this exact Auth ID.
  const byId = await prisma.user.findUnique({ where: { id: supabaseUser.id } })
  if (byId) return byId

  // 2. Check if a row exists for the same email (different Auth ID).
  const byEmail = await prisma.user.findUnique({ where: { email: supabaseUser.email! } })
  if (byEmail) {
    // Update the existing record with the current Auth ID and latest metadata.
    return prisma.user.update({
      where: { email: supabaseUser.email! },
      data: {
        id: supabaseUser.id,
        name: meta.name ?? byEmail.name,
        year: meta.year ? Number(meta.year) : byEmail.year,
        phoneNumber: phoneNumber ?? byEmail.phoneNumber,
      },
    })
  }

  // 3. No existing record — create fresh.
  return prisma.user.create({
    data: {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      name: meta.name ?? supabaseUser.email!.split('@')[0],
      year: Number(meta.year ?? 1),
      role: meta.isClassRep ? 'PENDING_CLASS_REP' : 'USER',
      phoneNumber,
    },
  })
}
