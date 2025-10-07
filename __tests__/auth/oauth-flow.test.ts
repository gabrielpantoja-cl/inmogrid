/**
 * 🧪 Test E2E - Flujo Completo de Google OAuth
 *
 * Este test simula el flujo completo de autenticación:
 * 1. Usuario visita /auth/signin
 * 2. Hace clic en "Iniciar sesión con Google"
 * 3. Google redirige de vuelta con código
 * 4. NextAuth crea/actualiza usuario
 * 5. Usuario es redirigido a /dashboard
 *
 * Nota: No hace llamadas reales a Google, usa mocks
 */

import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';

describe('🌐 Flujo E2E - Google OAuth', () => {

  const TEST_USER_DATA = {
    id: 'oauth-test-user-456',
    email: 'oauth-test@degux.cl',
    name: 'OAuth Test User',
    image: 'https://lh3.googleusercontent.com/test-avatar',
  };

  const MOCK_GOOGLE_ACCOUNT = {
    provider: 'google',
    type: 'oauth' as const,
    providerAccountId: 'google-oauth-test-456',
    access_token: 'ya29.test-access-token',
    refresh_token: 'test-refresh-token',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'Bearer',
    scope: 'openid email profile',
    id_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  };

  // Cleanup después de cada test
  afterEach(async () => {
    try {
      await prisma.account.deleteMany({
        where: { userId: TEST_USER_DATA.id },
      });
      await prisma.user.deleteMany({
        where: { email: TEST_USER_DATA.email },
      });
    } catch (error) {
      console.error('Error en cleanup:', error);
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('✅ Flujo Exitoso - Primer Login', () => {

    it('debe crear usuario nuevo al hacer primer login', async () => {
      // 1. Verificar que el usuario no existe
      const existingUser = await prisma.user.findUnique({
        where: { email: TEST_USER_DATA.email },
      });
      expect(existingUser).toBeNull();

      // 2. Simular callback de signIn (NextAuth lo ejecuta automáticamente)
      const signInResult = await authOptions.callbacks?.signIn?.({
        user: TEST_USER_DATA,
        account: MOCK_GOOGLE_ACCOUNT as any,
        profile: undefined,
      });
      expect(signInResult).toBe(true);

      // 3. Verificar que el usuario fue creado en BD
      const createdUser = await prisma.user.findUnique({
        where: { email: TEST_USER_DATA.email },
      });

      expect(createdUser).toBeDefined();
      expect(createdUser?.email).toBe(TEST_USER_DATA.email);
      expect(createdUser?.name).toBe(TEST_USER_DATA.name);
      expect(createdUser?.image).toBe(TEST_USER_DATA.image);
      expect(createdUser?.role).toBe('user');
      expect(createdUser?.createdAt).toBeDefined();
    });

    it('debe generar token JWT con información correcta', async () => {
      // 1. Crear usuario en BD
      await prisma.user.create({
        data: {
          id: TEST_USER_DATA.id,
          email: TEST_USER_DATA.email,
          name: TEST_USER_DATA.name,
          role: 'user',
        },
      });

      // 2. Simular callback JWT
      const jwtResult = await authOptions.callbacks?.jwt?.({
        token: {},
        user: { ...TEST_USER_DATA, id: TEST_USER_DATA.id } as any,
        account: MOCK_GOOGLE_ACCOUNT,
        profile: undefined,
        trigger: 'signIn',
      });

      expect(jwtResult).toBeDefined();
      expect(jwtResult?.sub).toBe(TEST_USER_DATA.id);
      expect(jwtResult?.role).toBe('user');
    });

    it('debe crear sesión con datos completos', async () => {
      // 1. Crear usuario en BD
      await prisma.user.create({
        data: {
          id: TEST_USER_DATA.id,
          email: TEST_USER_DATA.email,
          name: TEST_USER_DATA.name,
          role: 'user',
        },
      });

      // 2. Simular callback de sesión
      const sessionResult = await authOptions.callbacks?.session?.({
        session: {
          user: { email: TEST_USER_DATA.email },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        token: {
          sub: TEST_USER_DATA.id,
          role: 'user',
        },
        user: undefined as any,
      });

      expect(sessionResult).toBeDefined();
      expect(sessionResult?.user?.id).toBe(TEST_USER_DATA.id);
      expect(sessionResult?.user?.email).toBe(TEST_USER_DATA.email);
      expect(sessionResult?.user?.role).toBe('user');
    });

    it('debe redirigir a /dashboard después de login exitoso', async () => {
      const redirectResult = await authOptions.callbacks?.redirect?.({
        url: '/dashboard',
        baseUrl: 'http://localhost:3000',
      });

      expect(redirectResult).toBe('http://localhost:3000/dashboard');
    });
  });

  describe('🔄 Flujo Exitoso - Login Subsecuente', () => {

    it('debe actualizar información del usuario existente', async () => {
      // 1. Crear usuario con información antigua
      await prisma.user.create({
        data: {
          id: TEST_USER_DATA.id,
          email: TEST_USER_DATA.email,
          name: 'Old Name',
          image: 'https://old-avatar.com/image.jpg',
          role: 'user',
        },
      });

      // 2. Simular nuevo login con información actualizada
      await authOptions.callbacks?.signIn?.({
        user: TEST_USER_DATA, // Nueva información
        account: MOCK_GOOGLE_ACCOUNT as any,
        profile: undefined,
      });

      // 3. Verificar que la información fue actualizada
      const updatedUser = await prisma.user.findUnique({
        where: { email: TEST_USER_DATA.email },
      });

      expect(updatedUser?.name).toBe(TEST_USER_DATA.name);
      expect(updatedUser?.image).toBe(TEST_USER_DATA.image);
    });

    it('debe mantener rol admin al actualizar usuario', async () => {
      // 1. Crear usuario admin
      await prisma.user.create({
        data: {
          id: TEST_USER_DATA.id,
          email: TEST_USER_DATA.email,
          name: TEST_USER_DATA.name,
          role: 'admin', // Usuario es admin
        },
      });

      // 2. Simular nuevo login
      await authOptions.callbacks?.signIn?.({
        user: TEST_USER_DATA,
        account: MOCK_GOOGLE_ACCOUNT as any,
        profile: undefined,
      });

      // 3. Verificar que el rol admin se mantuvo
      const user = await prisma.user.findUnique({
        where: { email: TEST_USER_DATA.email },
      });

      expect(user?.role).toBe('admin'); // Debe mantener el rol
    });

    it('debe mantener perfil profesional al actualizar usuario', async () => {
      // 1. Crear usuario con perfil profesional completo
      await prisma.user.create({
        data: {
          id: TEST_USER_DATA.id,
          email: TEST_USER_DATA.email,
          name: TEST_USER_DATA.name,
          role: 'user',
          bio: 'Experto en bienes raíces',
          profession: 'CORREDOR',
          company: 'Mi Empresa Inmobiliaria',
          isPublicProfile: true,
        },
      });

      // 2. Simular nuevo login (solo actualiza nombre e imagen)
      await authOptions.callbacks?.signIn?.({
        user: { ...TEST_USER_DATA, name: 'Updated Name' },
        account: MOCK_GOOGLE_ACCOUNT as any,
        profile: undefined,
      });

      // 3. Verificar que el perfil profesional se mantuvo
      const user = await prisma.user.findUnique({
        where: { email: TEST_USER_DATA.email },
      });

      expect(user?.bio).toBe('Experto en bienes raíces');
      expect(user?.profession).toBe('CORREDOR');
      expect(user?.company).toBe('Mi Empresa Inmobiliaria');
      expect(user?.isPublicProfile).toBe(true);
    });
  });

  describe('❌ Flujos de Error', () => {

    it('debe rechazar login sin email', async () => {
      const result = await authOptions.callbacks?.signIn?.({
        user: { ...TEST_USER_DATA, email: '' },
        account: MOCK_GOOGLE_ACCOUNT as any,
        profile: undefined,
      });

      expect(result).toBe(false);
    });

    it('debe rechazar login con email null', async () => {
      const result = await authOptions.callbacks?.signIn?.({
        user: { ...TEST_USER_DATA, email: null as any },
        account: MOCK_GOOGLE_ACCOUNT as any,
        profile: undefined,
      });

      expect(result).toBe(false);
    });

    it('debe usar rol "user" si no puede obtener role de BD', async () => {
      // Simular error al obtener usuario (usuario no existe)
      const jwtResult = await authOptions.callbacks?.jwt?.({
        token: {},
        user: { id: 'non-existent-999', email: 'ghost@degux.cl' } as any,
        account: null,
        profile: undefined,
        trigger: 'signIn',
      });

      expect(jwtResult?.role).toBe('user'); // Fallback a rol user
    });
  });

  describe('🔐 Seguridad del Flujo OAuth', () => {

    it('debe prevenir redirecciones a dominios externos', async () => {
      const maliciousUrl = 'https://malicious-site.com/steal-session';
      const baseUrl = 'http://localhost:3000';

      const result = await authOptions.callbacks?.redirect?.({
        url: maliciousUrl,
        baseUrl,
      });

      expect(result).not.toBe(maliciousUrl);
      expect(result).toBe(`${baseUrl}/dashboard`); // Redirige a dashboard seguro
    });

    it('debe permitir solo redirecciones del mismo origen', async () => {
      const baseUrl = 'http://localhost:3000';
      const safeUrl = 'http://localhost:3000/perfil';

      const result = await authOptions.callbacks?.redirect?.({
        url: safeUrl,
        baseUrl,
      });

      expect(result).toBe(safeUrl);
    });

    it('debe manejar URLs relativas de forma segura', async () => {
      const baseUrl = 'http://localhost:3000';
      const relativeUrl = '/dashboard/propiedades';

      const result = await authOptions.callbacks?.redirect?.({
        url: relativeUrl,
        baseUrl,
      });

      expect(result).toBe(`${baseUrl}${relativeUrl}`);
    });
  });

  describe('📊 Datos Persistidos', () => {

    it('debe persistir usuario con timestamps correctos', async () => {
      const beforeCreate = new Date();

      await authOptions.callbacks?.signIn?.({
        user: TEST_USER_DATA,
        account: MOCK_GOOGLE_ACCOUNT as any,
        profile: undefined,
      });

      const user = await prisma.user.findUnique({
        where: { email: TEST_USER_DATA.email },
      });

      const afterCreate = new Date();

      expect(user?.createdAt).toBeDefined();
      expect(user?.updatedAt).toBeDefined();
      expect(user?.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(user?.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('debe tener valores por defecto correctos para nuevo usuario', async () => {
      await authOptions.callbacks?.signIn?.({
        user: TEST_USER_DATA,
        account: MOCK_GOOGLE_ACCOUNT as any,
        profile: undefined,
      });

      const user = await prisma.user.findUnique({
        where: { email: TEST_USER_DATA.email },
      });

      expect(user?.role).toBe('user'); // Rol por defecto
      expect(user?.isPublicProfile).toBe(false); // Perfil privado por defecto
      expect(user?.bio).toBeNull(); // Sin bio inicialmente
      expect(user?.profession).toBeNull(); // Sin profesión inicialmente
      expect(user?.company).toBeNull(); // Sin empresa inicialmente
    });
  });

  describe('⏱️ Expiración de Sesión', () => {

    it('debe configurar sesión con expiración de 24 horas', () => {
      expect(authOptions.session?.maxAge).toBe(24 * 60 * 60);
    });

    it('debe usar estrategia JWT (no database sessions)', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
    });
  });
});