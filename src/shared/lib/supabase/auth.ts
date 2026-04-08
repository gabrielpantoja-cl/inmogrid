/**
 * Server-side Supabase Auth helpers for Server Components and Route Handlers.
 *
 * Usage:
 *   import { requireAuth, getUser, getProfile } from '@/shared/lib/supabase/auth'
 *
 * - getUser()            → returns the authenticated User or null (no redirect)
 * - getProfile(userId)   → fetches the degux_profiles row for a given user id
 * - requireAuth()        → returns the User or redirects to /auth/login
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/server'
import { type User } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DeguxProfile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  role: string
  bio: string | null
  website: string | null
  linkedin: string | null
  profession: string | null
  company: string | null
  phone: string | null
  region: string | null
  commune: string | null
  is_public_profile: boolean
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the currently authenticated Supabase user, or null if there is no
 * active session. Safe to call from Server Components and Route Handlers.
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

/**
 * Fetches a single degux_profiles row by user id.
 * Returns null if the profile does not exist.
 */
export async function getProfile(userId: string): Promise<DeguxProfile | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('degux_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data ?? null
}

/**
 * Enforces authentication for a Server Component or Route Handler.
 * Redirects the user to /auth/login if there is no active session,
 * otherwise returns the authenticated User object.
 */
export async function requireAuth(): Promise<User> {
  const user = await getUser()
  if (!user) {
    redirect('/auth/login')
  }
  return user
}
