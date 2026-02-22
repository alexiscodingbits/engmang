'use client'

import { createContext, useContext } from 'react'

export type UserRole = 'MASTER' | 'CLASS_REP' | 'PENDING_CLASS_REP' | 'USER'

export const UserRoleContext = createContext<UserRole>('USER')

export function useUserRole(): UserRole {
  return useContext(UserRoleContext)
}
