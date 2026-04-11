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
      // Upsert the INMOGRID profile row on first login
      const { data: existingProfile } = await supabase
        .from('inmogrid_profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        const { error: insertError } = await supabase
          .from('inmogrid_profiles')
          .insert({
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name ?? null,
            avatar_url: data.user.user_metadata?.avatar_url ?? null,
          })

        if (insertError) {
          console.error('[AUTH-CALLBACK] Failed to create inmogrid_profile:', insertError.message)
          // Non-fatal: the user is authenticated; continue to dashboard
        }
      }

      // Notify login via n8n webhook (fire-and-forget — must not block the redirect).
      // The callback only runs on real OAuth exchanges, so this fires once per login,
      // not on cookie-based session rehydration.
      const webhookUrl = process.env.N8N_LOGIN_WEBHOOK_URL
      if (webhookUrl) {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName: data.user.user_metadata?.full_name ?? data.user.email,
            userEmail: data.user.email,
            userImage: data.user.user_metadata?.avatar_url ?? '',
            userId: data.user.id,
            provider: data.user.app_metadata?.provider ?? 'unknown',
            timestamp: new Date().toISOString(),
          }),
        }).catch((err) => {
          console.error('[AUTH-CALLBACK] n8n login webhook failed:', err)
        })
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Code missing or exchange failed — send the user back with a descriptive error param
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
