// src/middleware.ts - ACTUALIZADO PARA API PÚBLICA
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log(`🛡️ [MIDDLEWARE] ${req.method} ${pathname}`);

  // ✅ PASO 1: RUTAS COMPLETAMENTE PÚBLICAS (SIN AUTENTICACIÓN)
  const publicPaths = [
    '/dashboard/',          // 🔓 ACCESO PÚBLICO AL DASHBOARD - Manejado explícitamente en REGLA 2
    '/api/auth/',           // NextAuth routes
    '/api/public/',         // 🆕 API pública (para pantojapropiedades.cl y otros)
    '/_next/',              // Next.js internals
    '/favicon.ico',         
    '/robots.txt',          
    '/sitemap.xml',         
    '/_vercel/',            
    '/auth/error',          // Página de error de auth
    '/login',               // Página de login
    '/auth/signin',         // Página de signin
    '/privacy',             // Página de privacidad
    '/terms',               // Términos y condiciones
  ];

  if (publicPaths.some(path => pathname.startsWith(path))) {
    console.log(`🛡️ [MIDDLEWARE] Public path: ${pathname}`);
    return NextResponse.next();
  }

  // ✅ PASO 2: APIS QUE PUEDEN REQUERIR AUTENTICACIÓN
  const protectedApiPaths = [
    '/api/users/',
    '/api/auth-logs/',
    '/api/chat/',
    '/api/delete-account/',
  ];

  const isProtectedApi = protectedApiPaths.some(path => pathname.startsWith(path));

  // ✅ PASO 3: OBTENER TOKEN CON MANEJO ROBUSTO DE ERRORES
  let token = null;
  try {
    token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    console.log(`🛡️ [MIDDLEWARE] Token status: ${token ? 'VALID' : 'NONE'}, Role: ${token?.role || 'none'}`);
  } catch (error) {
    console.error('🛡️ [MIDDLEWARE] Token error:', error);
    // En caso de error, permitir continuar para evitar bloqueos en APIs públicas
    if (!isProtectedApi && !pathname.startsWith('/dashboard') && !pathname.startsWith('/chatbot')) {
      return NextResponse.next();
    }
  }

  // ✅ PASO 4: LÓGICA DE AUTENTICACIÓN Y AUTORIZACIÓN
  const isHomePage = pathname === '/';
  const isProtectedPage = pathname.startsWith('/dashboard');
  const isChatbotPage = pathname.startsWith('/chatbot');

  // ✅ IDENTIFICAR RUTAS ADMIN-ONLY
  const adminOnlyPaths: string[] = [
    // Añadir rutas admin aquí según sea necesario
  ];

  const isAdminOnlyPath = adminOnlyPaths.some(path => pathname.startsWith(path));

  // ✅ REGLA 1: APIs protegidas requieren autenticación
  if (!token && isProtectedApi) {
    console.log(`🛡️ [MIDDLEWARE] Unauthenticated API access: ${pathname}`);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Authentication required',
        message: 'This API endpoint requires authentication' 
      },
      { status: 401 }
    );
  }

  // ✅ REGLA 2: PÁGINAS PROTEGIDAS - PERMITIR ACCESO ANÓNIMO AL DASHBOARD
  if (!token && isProtectedPage) {
    // Permitir acceso al dashboard si no está autenticado (modo incógnito)
    if (pathname.startsWith('/dashboard')) {
      console.log(`🛡️ [MIDDLEWARE] Unauthenticated access allowed to dashboard: ${pathname}`);
      return NextResponse.next();
    }

    console.log(`🛡️ [MIDDLEWARE] Unauthenticated access to protected page: ${pathname}`);
    const loginUrl = new URL('/auth/signin', req.url);
    loginUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ REGLA 3: Rutas admin-only requieren rol admin
  if (token && isAdminOnlyPath && token.role !== 'admin' && token.role !== 'superadmin') {
    console.log(`🛡️ [MIDDLEWARE] Unauthorized admin access: ${pathname}, Role: ${token.role}`);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Insufficient permissions',
        message: 'Admin access required for this operation' 
      },
      { status: 403 }
    );
  }

  // ✅ REGLA 4: APIs no protegidas y páginas públicas - permitir acceso
  if (pathname.startsWith('/api/') && !isProtectedApi) {
    console.log(`🛡️ [MIDDLEWARE] Public API access: ${pathname}`);
    return NextResponse.next();
  }

  // ✅ PASO 5: PERMITIR ACCESO A TODO LO DEMÁS
  console.log(`🛡️ [MIDDLEWARE] Allowing access to: ${pathname}`);
  return NextResponse.next();
}

// ✅ MATCHER ESPECÍFICO
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Include API routes and pages for selective protection
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
