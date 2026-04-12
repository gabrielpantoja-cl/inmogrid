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

      // Notify login via n8n webhook. We must `await` this (with a short timeout)
      // instead of fire-and-forget, because Vercel serverless functions terminate
      // immediately after the response is sent — any pending I/O is cancelled.
      // The workflow typically completes in ~600ms, so the added login latency is
      // negligible; the 3s timeout ensures login never hangs if n8n is unreachable.
      const webhookUrl = process.env.N8N_LOGIN_WEBHOOK_URL
      if (webhookUrl) {
        const ac = new AbortController()
        const timeoutId = setTimeout(() => ac.abort(), 3000)
        try {
          const res = await fetch(webhookUrl, {
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
            signal: ac.signal,
          })
          console.log('[AUTH-CALLBACK] n8n login webhook status:', res.status, 'user:', data.user.email)
        } catch (err) {
          console.error('[AUTH-CALLBACK] n8n login webhook failed:', err)
        } finally {
          clearTimeout(timeoutId)
        }
      } else {
        console.warn('[AUTH-CALLBACK] N8N_LOGIN_WEBHOOK_URL not set — skipping notification')
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Code missing or exchange failed — send the user back with a descriptive error param
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
