import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { withRetry } from "@/lib/retry"

/**
 * ✅ CONFIGURACIÓN ROBUSTA PARA NEXTAUTH V4 + GOOGLE OAUTH
 *
 * PROBLEMAS RESUELTOS:
 * - ❌ Bucle infinito OAuth (redirect callback)
 * - ❌ PrismaClientValidationError (relaciones User/Account en mayúscula)
 * - ❌ OAuthAccountNotLinked (usuarios huérfanos sin Account)
 *
 * MEJORAS IMPLEMENTADAS:
 * - ✅ Retry logic para operaciones de BD (withRetry)
 * - ✅ Validaciones robustas en signIn callback
 * - ✅ Logging detallado para debugging en producción
 * - ✅ Eventos extendidos (createUser, linkAccount, session)
 * - ✅ Manejo de errores con fallbacks seguros
 *
 * REFERENCIAS:
 * - docs/03-arquitectura/GOOGLE_OAUTH_DIAGNOSTICS_RESOLVED.md
 * - CLAUDE.md: "CRITICAL: Maintain lowercase relation names"
 */

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // ✅ CONFIGURACIÓN SIMPLIFICADA - Sin parámetros extra que pueden causar conflictos
      authorization: {
        params: {
          prompt: "select_account", // Permite al usuario elegir cuenta
          scope: "openid email profile" // Explícito para evitar problemas
        }
      }
    }),
  ],
  
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },

  // ✅ COOKIES COMPLETAS - INCLUYE STATE Y PKCE PARA OAUTH
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      }
    },
    callbackUrl: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.callback-url"
        : "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      }
    },
    csrfToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Host-next-auth.csrf-token"
        : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      }
    },
    pkceCodeVerifier: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.pkce.code_verifier"
        : "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 900, // 15 minutos
      }
    },
    state: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.state"
        : "next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 900, // 15 minutos
      }
    },
    nonce: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.nonce"
        : "next-auth.nonce",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      }
    }
  },

  callbacks: {
    // ✅ REDIRECT CALLBACK CORREGIDO - ELIMINA BUCLES INFINITOS Y PREVIENE REDIRECCIONES EXTERNAS
    async redirect({ url, baseUrl }) {
      console.log('🔄 [AUTH-REDIRECT]', { url, baseUrl, NODE_ENV: process.env.NODE_ENV });

      // Si la URL es relativa, construir URL completa
      if (url.startsWith("/")) {
        const fullUrl = `${baseUrl}${url}`;
        console.log('🔄 [AUTH-REDIRECT] Relative URL converted:', fullUrl);
        return fullUrl;
      }

      // Si es del mismo origen, permitir
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(baseUrl);

        if (urlObj.origin === baseUrlObj.origin) {
          console.log('🔄 [AUTH-REDIRECT] Same origin allowed:', url);
          return url;
        }
      } catch (error) {
        console.error('🔄 [AUTH-REDIRECT] URL parsing error:', error);
      }

      // 🔒 SEGURIDAD: Redirigir a /dashboard para URLs externas o inválidas
      console.log('🔄 [AUTH-REDIRECT] External URL detected, redirecting to dashboard:', url);
      return `${baseUrl}/dashboard`;
    },
    
    // ✅ SESSION CALLBACK - INCLUYE ROLE
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as 'user' | 'admin' | 'superadmin';
      }
      return session;
    },
    
    // ✅ JWT CALLBACK - INCLUYE ROLE DEL USUARIO CON RETRY
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        // Obtener el role del usuario desde la base de datos con retry
        try {
          const dbUser = await withRetry(
            async () => prisma.user.findUnique({
              where: { id: user.id },
              select: { role: true }
            }),
            {
              maxAttempts: 3,
              delayMs: 500,
              shouldRetry: (error: unknown) => {
                // Retry solo en errores de conexión, no en errores de datos
                const errorMessage = error instanceof Error ? error.message : String(error);
                return errorMessage.includes('connection') ||
                       errorMessage.includes('timeout') ||
                       errorMessage.includes('ECONNREFUSED');
              }
            }
          );
          token.role = dbUser?.role || 'user';
        } catch (error) {
          console.error('[AUTH-JWT] Error fetching user role (all retries failed):', error);
          // Fallback seguro: asignar role por defecto
          token.role = 'user';
        }
      }
      return token;
    },
    
    // ✅ SIGNIN CALLBACK - VALIDACIÓN ROBUSTA (PrismaAdapter maneja User + Account)
    async signIn({ user, account, profile }) {
      const logContext = {
        userId: user?.id,
        email: user?.email,
        provider: account?.provider,
        accountId: account?.providerAccountId,
        timestamp: new Date().toISOString()
      };

      console.log('✅ [AUTH-SIGNIN] Inicio de validación', logContext);

      // Validar que tenemos los datos mínimos necesarios
      if (!user?.email) {
        console.error('❌ [AUTH-SIGNIN] BLOCKED: No email provided', logContext);
        return false;
      }

      if (!account) {
        console.error('❌ [AUTH-SIGNIN] BLOCKED: No account information provided', logContext);
        return false;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        console.error('❌ [AUTH-SIGNIN] BLOCKED: Invalid email format', { ...logContext, email: user.email });
        return false;
      }

      // Validar provider
      if (account.provider !== 'google') {
        console.error('❌ [AUTH-SIGNIN] BLOCKED: Unsupported provider', { ...logContext, provider: account.provider });
        return false;
      }

      // Validar providerAccountId
      if (!account.providerAccountId) {
        console.error('❌ [AUTH-SIGNIN] BLOCKED: No providerAccountId', logContext);
        return false;
      }

      // ✅ IMPORTANTE: NO hacer upsert manual aquí
      // PrismaAdapter se encarga de crear User + Account automáticamente
      // Si hacemos upsert manual, interferimos con el adapter y Account no se crea

      console.log(`✅ [AUTH-SIGNIN] ALLOWED: Sign in authorized for ${user.email}`, logContext);
      return true;
    }
  },
  
  // ✅ CONFIGURACIÓN DE PÁGINAS CORREGIDA
  pages: {
    signIn: "/auth/signin",
    signOut: "/",
    error: "/auth/error",
  },

  // ✅ EVENTOS CON LOGGING DETALLADO
  events: {
    async signOut({ token, session }) {
      console.log('📤 [AUTH-SIGNOUT] User signed out', {
        tokenId: token?.sub,
        email: token?.email,
        timestamp: new Date().toISOString()
      });
    },
    async signIn({ user, account, profile, isNewUser }) {
      console.log('📥 [AUTH-SIGNIN-EVENT] User signed in', {
        userId: user.id,
        email: user.email,
        provider: account?.provider,
        providerAccountId: account?.providerAccountId,
        isNewUser: isNewUser,
        timestamp: new Date().toISOString()
      });

      // Log adicional para nuevos usuarios
      if (isNewUser) {
        console.log('🆕 [AUTH-NEW-USER] New user registered via OAuth', {
          userId: user.id,
          email: user.email,
          provider: account?.provider,
          timestamp: new Date().toISOString()
        });
      }
    },
    async createUser({ user }) {
      console.log('👤 [AUTH-CREATE-USER] New user created by PrismaAdapter', {
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString()
      });
    },
    async linkAccount({ user, account, profile }) {
      console.log('🔗 [AUTH-LINK-ACCOUNT] Account linked to user', {
        userId: user.id,
        email: user.email,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        timestamp: new Date().toISOString()
      });
    },
    async session({ session, token }) {
      console.log('🔑 [AUTH-SESSION] Session retrieved', {
        userId: session.user?.id || token?.sub,
        email: session.user?.email || token?.email,
        timestamp: new Date().toISOString()
      });
    }
  },

  // ✅ DEBUG MODE - Habilitado cuando NEXTAUTH_DEBUG=true
  debug: process.env.NEXTAUTH_DEBUG === 'true'
}
