import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — DO NOT remove this
  const { data: { user }, error } = await supabase.auth.getUser()

  // Detectar cookies huérfanas: hay un JWT válido en el browser pero
  // Supabase reporta que ese user ya no existe (típicamente porque fue
  // borrado en auth.users). Sin este branch, el cliente seguiría viendo
  // el email cacheado en el JWT vía `useAuth()` mientras el server sabe
  // que está deslogueado → UI desincronizada.
  //
  // `signOut({ scope: 'local' })` no hace HTTP a /auth/v1/logout: solo
  // emite Set-Cookie de expiración para los tokens de Supabase. El
  // adaptador de cookies de arriba se encarga de propagarlo a
  // `supabaseResponse`.
  const hasSupabaseAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))

  if (!user && error && hasSupabaseAuthCookie) {
    await supabase.auth.signOut({ scope: 'local' })
  }

  return { supabaseResponse, user }
}
