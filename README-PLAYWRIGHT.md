# 🎭 Playwright E2E Testing - Google OAuth 2.0

Esta guía explica cómo ejecutar tests E2E para la autenticación con Google OAuth en degux.cl usando Playwright.

## 📋 Requisitos Previos

1. **Cuenta de Google para Testing**: Crea una cuenta de Google dedicada para testing (NO uses tu cuenta personal)
2. **Node.js 18+**: Asegúrate de tener Node.js instalado
3. **Credenciales de prueba**: Email y contraseña de Google para testing

## 🚀 Instalación

### 1. Instalar Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

Esto instalará:
- Playwright test runner
- Chromium, Firefox, y WebKit browsers

### 2. Configurar Variables de Entorno

Crea un archivo `.env.test.local` con tus credenciales de testing:

```bash
cp .env.test.local.example .env.test.local
```

Edita `.env.test.local` con tus credenciales reales:

```env
GOOGLE_TEST_EMAIL=tu-email-test@gmail.com
GOOGLE_TEST_PASSWORD=tu-password-seguro
PLAYWRIGHT_BASE_URL=https://degux.cl
```

⚠️ **IMPORTANTE**: Nunca commitees `.env.test.local` al repositorio. Ya está incluido en `.gitignore`.

## 🧪 Ejecutar Tests

### Tests contra el VPS (Producción)

```bash
# Ejecutar todos los tests E2E
npx playwright test

# Ejecutar solo el test de autenticación
npx playwright test google-oauth

# Ejecutar en modo UI (interactivo)
npx playwright test --ui

# Ejecutar con debugging
npx playwright test --debug
```

### Tests contra Localhost (Desarrollo)

1. Modifica `.env.test.local`:
```env
PLAYWRIGHT_BASE_URL=http://localhost:3000
```

2. Ejecuta el servidor local:
```bash
npm run dev
```

3. En otra terminal, ejecuta los tests:
```bash
npx playwright test
```

## 📊 Ver Reportes

Después de ejecutar los tests, puedes ver el reporte HTML:

```bash
npx playwright show-report
```

Esto abrirá un navegador con:
- Resultados de todos los tests
- Screenshots de fallos
- Videos de ejecución
- Traces para debugging

## 🔍 Debugging

### Ver screenshots de errores

Los screenshots se guardan automáticamente en `playwright-report/` cuando un test falla.

### Ver traces

Los traces contienen una grabación completa de la ejecución del test:

```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```

### Modo debug interactivo

```bash
npx playwright test --debug
```

Esto abre Playwright Inspector que te permite:
- Ejecutar tests paso a paso
- Inspeccionar elementos
- Ver logs en tiempo real

## 📁 Estructura de Archivos

```
__tests__/
  └── e2e/
      ├── auth.setup.ts          # Setup de autenticación (ejecuta primero)
      └── google-oauth.test.ts   # Tests E2E de OAuth

playwright.config.ts              # Configuración de Playwright
playwright/.auth/user.json        # Estado de autenticación guardado (git-ignored)
playwright-report/                # Reportes HTML (git-ignored)
.env.test.local                   # Variables de entorno (git-ignored)
```

## 🔐 Cómo Funciona

### 1. Setup (auth.setup.ts)

El archivo `auth.setup.ts` se ejecuta **antes** de todos los tests y:

1. Navega a `/auth/signin`
2. Hace clic en "Iniciar sesión con Google"
3. Completa el formulario de Google OAuth
4. Espera la redirección exitosa
5. Guarda el estado de autenticación en `playwright/.auth/user.json`

### 2. Tests (google-oauth.test.ts)

Los tests usan el estado de autenticación guardado, por lo que:

- **NO necesitan loguearse** en cada test
- El navegador ya viene autenticado
- Pueden probar funcionalidades protegidas directamente

### 3. Proyectos en Playwright

Configuramos dos proyectos:
- **setup**: Ejecuta `auth.setup.ts` primero
- **chromium**: Ejecuta tests con Chrome, dependiente de setup
- **firefox**: Ejecuta tests con Firefox, dependiente de setup

## 🛠️ Scripts Disponibles

Agrega estos scripts a `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report",
    "test:e2e:vps": "PLAYWRIGHT_BASE_URL=https://degux.cl playwright test",
    "test:e2e:local": "PLAYWRIGHT_BASE_URL=http://localhost:3000 playwright test"
  }
}
```

## ⚠️ Consideraciones de Seguridad

1. **Cuenta de Testing Dedicada**: Usa una cuenta de Google específica para testing
2. **Credenciales Seguras**: Nunca commitees credenciales al repositorio
3. **2FA Deshabilitado**: La cuenta de testing NO debe tener 2FA activado (o usa App Passwords)
4. **Rate Limiting**: Google puede bloquear logins automatizados frecuentes
5. **CI/CD**: En CI, usa GitHub Secrets para las credenciales

## 🔄 Integración con CI/CD (GitHub Actions)

Ejemplo de workflow:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        env:
          GOOGLE_TEST_EMAIL: ${{ secrets.GOOGLE_TEST_EMAIL }}
          GOOGLE_TEST_PASSWORD: ${{ secrets.GOOGLE_TEST_PASSWORD }}
          PLAYWRIGHT_BASE_URL: https://degux.cl
        run: npx playwright test

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 📚 Recursos

- [Playwright Documentation](https://playwright.dev)
- [NextAuth Testing Guide](https://next-auth.js.org/configuration/pages#test)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

## 🐛 Troubleshooting

### Error: "GOOGLE_TEST_EMAIL is not defined"

Asegúrate de crear `.env.test.local` con las credenciales.

### Error: "Timeout waiting for Google popup"

Aumenta el timeout en `auth.setup.ts` o verifica tu conexión a internet.

### Error: "Google blocked suspicious activity"

Google puede bloquear logins automatizados. Soluciones:
1. Usa una cuenta diferente
2. Completa el captcha manualmente una vez
3. Espera 24-48 horas antes de reintentar

### Tests fallan localmente pero pasan en CI

Verifica que:
- Las variables de entorno estén configuradas
- El servidor esté corriendo (para tests locales)
- Playwright browsers estén instalados: `npx playwright install`

## 📝 Notas Adicionales

- Los tests están diseñados para ejecutarse contra el **VPS en producción**
- El estado de autenticación se guarda en `playwright/.auth/user.json`
- Cada proyecto (chromium, firefox) reutiliza el mismo estado de autenticación
- Los tests son **idempotentes**: pueden ejecutarse múltiples veces sin problemas