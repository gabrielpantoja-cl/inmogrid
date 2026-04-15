import { createClient } from '@/shared/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Genera un username único a partir del nombre completo o email del usuario.
 * Intenta hasta maxAttempts veces añadiendo sufijos aleatorios si hay colisión.
 */
async function generateUniqueUsername(
  supabase: Awaited<ReturnType<typeof createClient>>,
  fullName: string | null,
  email: string,
  maxAttempts = 5
): Promise<string> {
  const base = (fullName ?? email.split('@')[0])
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar tildes
    .replace(/[^a-z0-9]/g, '')       // solo alfanumérico
    .slice(0, 18) || 'usuario';

  for (let i = 0; i < maxAttempts; i++) {
    const suffix = Math.random().toString(36).slice(2, 6); // 4 chars aleatorios
    const candidate = i === 0 ? base : `${base}${suffix}`;
    if (candidate.length < 3) continue;

    const { data } = await supabase
      .from('inmogrid_profiles')
      .select('id')
      .eq('username', candidate)
      .maybeSingle();

    if (!data) return candidate; // libre
  }

  // Fallback garantizado con timestamp
  return `user${Date.now().toString(36).slice(-6)}`;
}

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
        const username = await generateUniqueUsername(
          supabase,
          data.user.user_metadata?.full_name ?? null,
          data.user.email ?? 'usuario'
        )

        const { error: insertError } = await supabase
          .from('inmogrid_profiles')
          .insert({
            id: data.user.id,
            username,
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
