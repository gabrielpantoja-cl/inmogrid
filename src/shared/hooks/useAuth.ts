'use client'

import { createClient } from '@/shared/lib/supabase/client'
import { type User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

interface Profile {
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
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to auth state changes (covers initial load + login/logout events)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const { data } = await supabase
          .from('inmogrid_profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()
        setProfile(data ?? null)
      } else {
        setProfile(null)
      }

      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signOut = async () => {
    // `scope: 'local'` limpia las cookies de sesión del browser sin hacer
    // una request HTTP bloqueante a /auth/v1/logout — crítico porque el
    // scope 'global' (default) puede colgar indefinidamente si la API de
    // Supabase está lenta o si la sesión ya está inválida, dejando al
    // usuario atascado en "Cerrando..." para siempre.
    //
    // `window.location.href` fuerza un full page reload — a diferencia
    // de router.push (soft nav), garantiza que el middleware corre con
    // el estado de cookies limpio y que ningún componente del dashboard
    // queda montado con sesión stale.
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (error) {
      console.error('[useAuth.signOut] Error signing out:', error)
    }
    window.location.href = '/auth/login'
  }

  // Derived permission helpers based on the profile role
  const role = profile?.role ?? 'user'
  const isAdmin = role === 'admin' || role === 'superadmin'
  const isSuperAdmin = role === 'superadmin'
  const isAuthenticated = user !== null

  return {
    user,
    profile,
    isLoading,
    isAuthenticated,
    role,
    isAdmin,
    isSuperAdmin,
    signOut,
  }
}
