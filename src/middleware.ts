import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/shared/lib/supabase/middleware'

// Rutas completamente públicas — no requieren sesión
const PUBLIC_PATHS = [
  '/auth/',
  '/api/auth/',
  '/api/public/',
  '/api/v1/',
  '/api/sofia/',
  '/_next/',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/privacy',
  '/terms',
]

// Rutas que requieren sesión activa.
// Nota: `/dashboard` (overview) es PÚBLICO para que usuarios no autenticados
// puedan ver el feed de la comunidad (estilo Reddit). Las sub-rutas que
// necesitan autenticación (ej. /dashboard/notas, /dashboard/perfil) se
// protegen individualmente en la página con `requireAuth()`.
const PROTECTED_PATHS: string[] = []

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Pasar Supabase SSR (refresca sesión en cada request)
  const { supabaseResponse, user } = await updateSession(request)

  // Rutas públicas: pasar directo
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return supabaseResponse
  }

  // Rutas protegidas: redirigir a login si no hay sesión
  if (PROTECTED_PATHS.some(path => pathname.startsWith(path)) && !user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
