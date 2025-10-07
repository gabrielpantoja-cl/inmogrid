/**
 * 🔐 Playwright Setup - Autenticación Google OAuth 2.0
 *
 * Este script se ejecuta ANTES de todos los tests E2E.
 * Realiza el login con Google OAuth y guarda el estado de autenticación.
 *
 * IMPORTANTE: Requiere variables de entorno:
 * - GOOGLE_TEST_EMAIL: Email de Google para testing
 * - GOOGLE_TEST_PASSWORD: Contraseña de Google para testing
 */

import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../../playwright/.auth/user.json');

setup('authenticate with Google OAuth', async ({ page, context }) => {
  // Validar variables de entorno
  const testEmail = process.env.GOOGLE_TEST_EMAIL;
  const testPassword = process.env.GOOGLE_TEST_PASSWORD;

  if (!testEmail || !testPassword) {
    throw new Error(
      'Missing GOOGLE_TEST_EMAIL or GOOGLE_TEST_PASSWORD environment variables.\n' +
      'Please set them in .env.test.local or your CI environment.'
    );
  }

  console.log('🔐 Starting Google OAuth authentication flow...');

  // 1. Navegar a la página de signin
  await page.goto('/auth/signin');
  console.log('✅ Navigated to /auth/signin');

  // 2. Hacer clic en el botón de Google
  const googleButton = page.locator('button:has-text("Iniciar sesión con Google")');
  await expect(googleButton).toBeVisible({ timeout: 10000 });

  console.log('🖱️  Clicking Google sign-in button...');

  // Esperar el popup de Google OAuth
  const [popup] = await Promise.all([
    context.waitForEvent('page'),
    googleButton.click(),
  ]);

  console.log('🌐 Google OAuth popup opened');

  // 3. Completar el formulario de Google
  try {
    // Esperar a que cargue la página de Google
    await popup.waitForLoadState('networkidle');

    console.log('📧 Filling email field...');

    // Ingresar email
    const emailField = popup.locator('input[type="email"]');
    await emailField.waitFor({ state: 'visible', timeout: 10000 });
    await emailField.fill(testEmail);
    await popup.locator('button:has-text("Next"), button:has-text("Siguiente")').click();

    console.log('🔑 Filling password field...');

    // Ingresar contraseña
    const passwordField = popup.locator('input[type="password"]');
    await passwordField.waitFor({ state: 'visible', timeout: 15000 });
    await passwordField.fill(testPassword);
    await popup.locator('button:has-text("Next"), button:has-text("Siguiente")').click();

    console.log('⏳ Waiting for OAuth redirect...');

    // Esperar a que Google redirija de vuelta a degux.cl
    await page.waitForURL('**/dashboard', { timeout: 30000 });

    console.log('✅ Successfully authenticated!');

  } catch (error) {
    console.error('❌ Error during Google OAuth flow:', error);

    // Tomar screenshot para debugging
    await popup.screenshot({ path: 'playwright-report/oauth-error.png' });
    await page.screenshot({ path: 'playwright-report/main-page-error.png' });

    throw error;
  } finally {
    await popup.close();
  }

  // 4. Verificar que estamos autenticados
  await expect(page).toHaveURL(/.*dashboard/);

  // Verificar que aparece el nombre del usuario o algún elemento de usuario autenticado
  const userElement = page.locator('[data-testid="user-menu"], [aria-label="User menu"], button:has-text("Sign out")');
  await expect(userElement).toBeVisible({ timeout: 10000 });

  console.log('💾 Saving authentication state...');

  // 5. Guardar el estado de autenticación
  await page.context().storageState({ path: authFile });

  console.log(`✅ Authentication state saved to ${authFile}`);
  console.log('🎉 Setup completed successfully!');
});