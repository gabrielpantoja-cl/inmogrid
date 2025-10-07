/**
 * 🧪 Test de Integración - Sistema de Autenticación degux.cl
 *
 * Este test verifica:
 * - Configuración de NextAuth.js
 * - Callbacks de autenticación (signIn, jwt, session, redirect)
 * - Creación de usuarios en base de datos
 * - Manejo de roles (user, admin)
 * - Integración con Google OAuth
 */

import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';

// Mock de Google Provider para evitar llamadas reales a Google
jest.mock('next-auth/providers/google', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    id: 'google',
    name: 'Google',
    type: 'oauth',
    authorization: { params: { prompt: 'select_account', scope: 'openid email profile' } },
  })),
}));

describe('🔐 Sistema de Autenticación - Integración Completa', () => {

  // Test data
  const TEST_USER = {
    id: 'test-auth-user-123',
    email: 'test-auth@degux.cl',
    name: 'Test User Auth',
    image: 'https://example.com/avatar.jpg',
  };

  const TEST_ACCOUNT = {
    provider: 'google',
    type: 'oauth',
    providerAccountId: 'google-test-123',
    access_token: 'test-access-token',
    id_token: 'test-id-token',
  };

  // Cleanup: eliminar datos de prueba después de todos los tests
  afterAll(async () => {
    try {
      await prisma.account.deleteMany({
        where: { userId: TEST_USER.id },
      });
      await prisma.user.deleteMany({
        where: { email: TEST_USER.email },
      });
    } catch (error) {
      console.error('Error en cleanup:', error);
    } finally {
      await prisma.$disconnect();
    }
  });

  describe('📋 Configuración de NextAuth', () => {

    it('debe tener todas las configuraciones requeridas', () => {
      expect(authOptions).toBeDefined();
      expect(authOptions.providers).toBeDefined();
      expect(authOptions.adapter).toBeDefined();
      expect(authOptions.session).toBeDefined();
      expect(authOptions.callbacks).toBeDefined();
    });

    it('debe tener configurado Google Provider', () => {
      expect(authOptions.providers).toHaveLength(1);
      expect(authOptions.providers[0]).toBeDefined();
    });

    it('debe usar estrategia JWT para sesiones', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
      expect(authOptions.session?.maxAge).toBe(24 * 60 * 60); // 24 horas
    });

    it('debe tener páginas personalizadas configuradas', () => {
      expect(authOptions.pages).toBeDefined();
      expect(authOptions.pages?.signIn).toBe('/auth/signin');
      expect(authOptions.pages?.error).toBe('/auth/error');
    });

    it('debe tener secret configurado', () => {
      expect(authOptions.secret).toBeDefined();
      expect(process.env.NEXTAUTH_SECRET).toBeDefined();
    });
  });

  describe('🔄 Callback: signIn', () => {

    it('debe permitir login con email válido', async () => {
      const result = await authOptions.callbacks?.signIn?.({
        user: TEST_USER,
        account: TEST_ACCOUNT as any,
        profile: undefined,
      });

      expect(result).toBe(true);
    });

    it('debe crear usuario en base de datos al hacer login', async () => {
      // Primero limpiar usuario si existe
      await prisma.user.deleteMany({ where: { email: TEST_USER.email } });

      // Ejecutar callback de signIn
      await authOptions.callbacks?.signIn?.({
        user: TEST_USER,
        account: TEST_ACCOUNT as any,
        profile: undefined,
      });

      // Verificar que el usuario fue creado
      const createdUser = await prisma.user.findUnique({
        where: { email: TEST_USER.email },
      });

      expect(createdUser).toBeDefined();
      expect(createdUser?.email).toBe(TEST_USER.email);
      expect(createdUser?.name).toBe(TEST_USER.name);
      expect(createdUser?.role).toBe('user'); // Rol por defecto
    });

    it('debe mantener rol admin existente al actualizar usuario', async () => {
      // Crear usuario admin
      await prisma.user.upsert({
        where: { email: TEST_USER.email },
        update: {},
        create: {
          id: TEST_USER.id,
          email: TEST_USER.email,
          name: TEST_USER.name,
          role: 'admin',
        },
      });

      // Simular login nuevamente
      await authOptions.callbacks?.signIn?.({
        user: TEST_USER,
        account: TEST_ACCOUNT as any,
        profile: undefined,
      });

      // Verificar que el rol admin se mantuvo
      const user = await prisma.user.findUnique({
        where: { email: TEST_USER.email },
      });

      expect(user?.role).toBe('admin');
    });

    it('debe rechazar login sin email', async () => {
      const result = await authOptions.callbacks?.signIn?.({
        user: { ...TEST_USER, email: '' },
        account: TEST_ACCOUNT as any,
        profile: undefined,
      });

      expect(result).toBe(false);
    });
  });

  describe('🎫 Callback: jwt', () => {

    it('debe incluir userId (sub) en el token JWT', async () => {
      const token: JWT = {};

      const result = await authOptions.callbacks?.jwt?.({
        token,
        user: TEST_USER as any,
        account: null,
        profile: undefined,
        trigger: 'signIn',
      });

      expect(result?.sub).toBe(TEST_USER.id);
    });

    it('debe incluir role del usuario en el token JWT', async () => {
      // Crear usuario con rol específico
      await prisma.user.upsert({
        where: { email: TEST_USER.email },
        update: { role: 'admin' },
        create: {
          id: TEST_USER.id,
          email: TEST_USER.email,
          role: 'admin',
        },
      });

      const token: JWT = {};

      const result = await authOptions.callbacks?.jwt?.({
        token,
        user: { ...TEST_USER, id: TEST_USER.id } as any,
        account: null,
        profile: undefined,
        trigger: 'signIn',
      });

      expect(result?.role).toBe('admin');
    });

    it('debe usar rol "user" por defecto si no se encuentra en BD', async () => {
      // Usuario que no existe en BD
      const token: JWT = {};
      const nonExistentUser = {
        id: 'non-existent-user-999',
        email: 'non-existent@degux.cl',
      };

      const result = await authOptions.callbacks?.jwt?.({
        token,
        user: nonExistentUser as any,
        account: null,
        profile: undefined,
        trigger: 'signIn',
      });

      expect(result?.role).toBe('user');
    });
  });

  describe('📦 Callback: session', () => {

    it('debe incluir userId en la sesión', async () => {
      const session: Session = {
        user: { email: TEST_USER.email },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const token: JWT = {
        sub: TEST_USER.id,
        role: 'user',
      };

      const result = await authOptions.callbacks?.session?.({
        session,
        token,
        user: undefined as any,
      });

      expect(result?.user?.id).toBe(TEST_USER.id);
    });

    it('debe incluir role en la sesión', async () => {
      const session: Session = {
        user: { email: TEST_USER.email },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const token: JWT = {
        sub: TEST_USER.id,
        role: 'admin',
      };

      const result = await authOptions.callbacks?.session?.({
        session,
        token,
        user: undefined as any,
      });

      expect(result?.user?.role).toBe('admin');
    });
  });

  describe('🔀 Callback: redirect', () => {

    const baseUrl = 'http://localhost:3000';

    it('debe convertir URLs relativas a absolutas', async () => {
      const url = '/dashboard';

      const result = await authOptions.callbacks?.redirect?.({
        url,
        baseUrl,
      });

      expect(result).toBe(`${baseUrl}/dashboard`);
    });

    it('debe permitir URLs del mismo origen', async () => {
      const url = 'http://localhost:3000/perfil';

      const result = await authOptions.callbacks?.redirect?.({
        url,
        baseUrl,
      });

      expect(result).toBe(url);
    });

    it('debe redirigir a /dashboard por defecto para URLs de otros orígenes', async () => {
      const url = 'https://malicious-site.com';

      const result = await authOptions.callbacks?.redirect?.({
        url,
        baseUrl,
      });

      expect(result).toBe(`${baseUrl}/dashboard`);
    });

    it('debe usar /dashboard como fallback para URLs inválidas', async () => {
      const url = 'invalid-url';

      const result = await authOptions.callbacks?.redirect?.({
        url,
        baseUrl,
      });

      expect(result).toBe(`${baseUrl}/dashboard`);
    });
  });

  describe('🗄️ Integración con Base de Datos', () => {

    it('debe conectar correctamente a PostgreSQL en VPS', async () => {
      const result = await prisma.$queryRaw`SELECT 1 as connected`;
      expect(result).toBeDefined();
    });

    it('debe tener todas las tablas de NextAuth creadas', async () => {
      const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename IN ('User', 'Account', 'Session', 'VerificationToken')
      `;

      expect(tables).toHaveLength(4);
      expect(tables.map(t => t.tablename)).toContain('User');
      expect(tables.map(t => t.tablename)).toContain('Account');
      expect(tables.map(t => t.tablename)).toContain('Session');
      expect(tables.map(t => t.tablename)).toContain('VerificationToken');
    });

    it('debe tener columna de role en tabla User', async () => {
      const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'User'
        AND column_name = 'role'
      `;

      expect(columns).toHaveLength(1);
      expect(columns[0].column_name).toBe('role');
    });

    it('debe tener columnas de perfil profesional en tabla User', async () => {
      const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'User'
        AND column_name IN ('bio', 'profession', 'company', 'isPublicProfile')
      `;

      expect(columns.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('⚙️ Variables de Entorno', () => {

    it('debe tener NEXTAUTH_SECRET configurado', () => {
      expect(process.env.NEXTAUTH_SECRET).toBeDefined();
      expect(process.env.NEXTAUTH_SECRET!.length).toBeGreaterThanOrEqual(32);
    });

    it('debe tener NEXTAUTH_URL configurado', () => {
      expect(process.env.NEXTAUTH_URL).toBeDefined();
    });

    it('debe tener credenciales de Google configuradas', () => {
      expect(process.env.GOOGLE_CLIENT_ID).toBeDefined();
      expect(process.env.GOOGLE_CLIENT_SECRET).toBeDefined();
    });

    it('debe tener URL de base de datos configurada', () => {
      expect(process.env.POSTGRES_PRISMA_URL).toBeDefined();
      expect(process.env.POSTGRES_PRISMA_URL).toContain('postgresql://');
    });
  });

  describe('🔒 Seguridad', () => {

    it('debe usar httpOnly en cookies de producción', () => {
      expect(authOptions.cookies?.sessionToken?.options?.httpOnly).toBe(true);
    });

    it('debe usar sameSite lax para CSRF protection', () => {
      expect(authOptions.cookies?.sessionToken?.options?.sameSite).toBe('lax');
    });

    it('debe tener debug habilitado para diagnóstico', () => {
      expect(authOptions.debug).toBe(true);
    });
  });
});