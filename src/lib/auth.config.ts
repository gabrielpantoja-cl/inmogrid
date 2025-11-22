import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

// ✅ CONFIGURACIÓN CORREGIDA PARA NEXTAUTH V4 - RESUELVE BUCLE INFINITO OAUTH

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
    
    // ✅ JWT CALLBACK - INCLUYE ROLE DEL USUARIO
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        // Obtener el role del usuario desde la base de datos
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true }
          });
          token.role = dbUser?.role || 'user';
        } catch (error) {
          console.error('Error fetching user role:', error);
          token.role = 'user';
        }
      }
      return token;
    },
    
    // ✅ SIGNIN CALLBACK - SOLO VALIDACIÓN (PrismaAdapter maneja User + Account)
    async signIn({ user, account, profile }) {
      console.log('✅ [AUTH-SIGNIN]', {
        userId: user.id,
        email: user.email,
        provider: account?.provider,
        accountId: account?.providerAccountId,
        timestamp: new Date().toISOString()
      });

      // Validar que tenemos los datos mínimos necesarios
      if (!user.email) {
        console.error('❌ [AUTH-SIGNIN] No email provided');
        return false;
      }

      if (!account) {
        console.error('❌ [AUTH-SIGNIN] No account information provided');
        return false;
      }

      // ✅ IMPORTANTE: NO hacer upsert manual aquí
      // PrismaAdapter se encarga de crear User + Account automáticamente
      // Si hacemos upsert manual, interferimos con el adapter y Account no se crea

      console.log(`✅ [AUTH-SIGNIN] Allowing sign in for: ${user.email}`);
      return true;
    }
  },
  
  // ✅ CONFIGURACIÓN DE PÁGINAS CORREGIDA
  pages: {
    signIn: "/auth/signin",
    signOut: "/",
    error: "/auth/error",
  },

  // ✅ EVENTOS SIMPLIFICADOS
  events: {
    async signOut({ token }) {
      console.log('📤 [AUTH-SIGNOUT]', {
        tokenId: token?.sub,
        timestamp: new Date().toISOString()
      });
    },
    async signIn({ user, account }) {
      console.log('📥 [AUTH-SIGNIN-EVENT]', {
        userId: user.id,
        provider: account?.provider,
        timestamp: new Date().toISOString()
      });
    }
  },

  // ✅ DEBUG MODE - Habilitado cuando NEXTAUTH_DEBUG=true
  debug: process.env.NEXTAUTH_DEBUG === 'true'
}
