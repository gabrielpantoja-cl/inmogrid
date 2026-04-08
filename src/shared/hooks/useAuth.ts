'use client'

import { createClient } from '@/shared/lib/supabase/client'
import { type User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
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
          .from('degux_profiles')
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
    await supabase.auth.signOut()
    router.push('/auth/login')
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
