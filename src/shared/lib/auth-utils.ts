"use client"

import { createClient } from '@/lib/supabase/client'

interface SignOutOptions {
  callbackUrl?: string
  redirect?: boolean
  source?: string
}

/**
 * Robust sign-out using Supabase Auth.
 * Clears session and redirects to callbackUrl.
 */
export async function robustSignOut(options: SignOutOptions = {}) {
  const { callbackUrl = '/', redirect = true } = options

  try {
    const supabase = createClient()
    await supabase.auth.signOut()
  } catch (error) {
    console.error('[robustSignOut] Error signing out:', error)
  }

  if (redirect && typeof window !== 'undefined') {
    window.location.href = callbackUrl
  }
}
