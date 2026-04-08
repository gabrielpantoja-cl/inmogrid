import { createClient } from '@/shared/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Upsert the DEGUX profile row on first login
      const { data: existingProfile } = await supabase
        .from('degux_profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        const { error: insertError } = await supabase
          .from('degux_profiles')
          .insert({
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name ?? null,
            avatar_url: data.user.user_metadata?.avatar_url ?? null,
          })

        if (insertError) {
          console.error('[AUTH-CALLBACK] Failed to create degux_profile:', insertError.message)
          // Non-fatal: the user is authenticated; continue to dashboard
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Code missing or exchange failed — send the user back with a descriptive error param
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
