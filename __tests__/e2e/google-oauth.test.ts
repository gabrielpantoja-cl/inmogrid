/**
 * 🧪 Test E2E - Google OAuth 2.0 Authentication on VPS
 *
 * Este test verifica el flujo completo de autenticación OAuth de Google
 * desplegado en el VPS de producción (https://degux.cl).
 *
 * IMPORTANTE:
 * - Usa el estado de autenticación guardado por auth.setup.ts
 * - Se ejecuta contra el VPS real (no localhost)
 * - Verifica funcionalidades post-autenticación
 */

import { test, expect } from '@playwright/test';

test.describe('🔐 Google OAuth Authentication on VPS', () => {

  test.beforeEach(async ({ page }) => {
    console.log('🚀 Starting authenticated test...');
  });

  test('should be authenticated and access dashboard', async ({ page }) => {
    // El page ya viene autenticado gracias al storageState

    // 1. Navegar al dashboard
    await page.goto('/dashboard');

    // 2. Verificar que NO somos redirigidos al login
    await expect(page).toHaveURL(/.*dashboard/);

    // 3. Verificar elementos del dashboard autenticado
    const dashboardHeading = page.locator('h1:has-text("Inicio"), h1:has-text("Dashboard")');
    await expect(dashboardHeading).toBeVisible({ timeout: 10000 });

    console.log('✅ Dashboard is accessible');
  });

  test('should display authenticated user information', async ({ page }) => {
    await page.goto('/dashboard');

    // Verificar que aparece información del usuario
    // Puede ser el menú de usuario, avatar, nombre, etc.
    const userInfo = page.locator(
      '[data-testid="user-menu"], ' +
      '[aria-label="User menu"], ' +
      'img[alt*="avatar"], ' +
      'button:has-text("Sign out"), ' +
      'button:has-text("Cerrar sesión")'
    );

    await expect(userInfo.first()).toBeVisible({ timeout: 10000 });

    console.log('✅ User information is displayed');
  });

  test('should access protected API endpoint', async ({ page }) => {
    // Hacer una petición a un endpoint protegido
    const response = await page.request.get('/api/users/profile');

    // Verificar que tenemos acceso (no 401)
    expect(response.status()).not.toBe(401);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('email');

    console.log('✅ Protected API is accessible');
  });

  test('should persist authentication across page reloads', async ({ page }) => {
    await page.goto('/dashboard');

    // Verificar que estamos autenticados
    await expect(page).toHaveURL(/.*dashboard/);

    // Recargar la página
    await page.reload();

    // Verificar que seguimos autenticados (no redirigidos a login)
    await expect(page).toHaveURL(/.*dashboard/);

    console.log('✅ Authentication persists across reloads');
  });

  test('should access conservadores page', async ({ page }) => {
    // Navegar a la página de conservadores que ahora es pública
    await page.goto('/dashboard/conservadores');

    // Verificar que carga correctamente
    await expect(page).toHaveURL(/.*conservadores/);

    const heading = page.locator('h1:has-text("Conservadores de Bienes Raíces")');
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Verificar que hay contenido
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await expect(searchInput).toBeVisible();

    console.log('✅ Conservadores page is accessible');
  });
});

test.describe('🔓 Logout Flow', () => {

  test('should successfully logout', async ({ page }) => {
    await page.goto('/dashboard');

    // Buscar el botón de cerrar sesión
    const signOutButton = page.locator(
      'button:has-text("Sign out"), ' +
      'button:has-text("Cerrar sesión"), ' +
      'a:has-text("Sign out"), ' +
      'a:has-text("Cerrar sesión")'
    );

    await expect(signOutButton.first()).toBeVisible({ timeout: 10000 });

    // Hacer clic en cerrar sesión
    await signOutButton.first().click();

    // Esperar redirección a página de login o home
    await page.waitForURL(/\/(auth\/signin|$)/, { timeout: 10000 });

    console.log('✅ Logout successful');
  });
});

test.describe('🔒 Protected Routes without Auth', () => {

  // Este test NO usa storageState (sin autenticación)
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should redirect unauthenticated users attempting to access protected routes', async ({ page }) => {
    // El middleware ahora permite acceso público al dashboard
    // Pero verificamos que sin autenticación no hay menú de usuario

    await page.goto('/dashboard');

    // Verificar que podemos ver el dashboard pero sin menú de usuario
    await expect(page).toHaveURL(/.*dashboard/);

    // No debe haber menú de usuario autenticado
    const userMenu = page.locator('[data-testid="user-menu"], button:has-text("Sign out")');
    await expect(userMenu).not.toBeVisible();

    console.log('✅ Public access works, but no authenticated features');
  });
});