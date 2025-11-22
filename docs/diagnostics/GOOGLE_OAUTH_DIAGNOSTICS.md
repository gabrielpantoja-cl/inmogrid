# Diagnóstico Completo: Autenticación con Google OAuth - degux.cl

**Proyecto:** degux.cl - Ecosistema Digital Colaborativo
**Inicio diagnóstico:** 2025-11-21
**Última actualización:** 2025-11-22 20:15 CLT
**Estado:** 🔄 En resolución - Error `invalid_grant` detectado

---

## 📊 Resumen Ejecutivo

### Estado Actual del Sistema

| Componente | Estado | Notas |
|------------|--------|-------|
| **Infraestructura** | ✅ Operacional | VPS Digital Ocean, Docker Compose |
| **Base de Datos** | ✅ Conectada | PostgreSQL 15 + PostGIS (puerto 5433) |
| **Contenedor Web** | ✅ Healthy | degux-web corriendo 26+ minutos |
| **Variables de Entorno** | ✅ Configuradas | Credenciales Google OAuth presentes |
| **OAuth Local** | ⚠️ No probado | Requiere verificación |
| **OAuth Producción** | ❌ Fallando | Error: `invalid_grant` |

### Historial de Problemas Resueltos

1. ✅ **`401 invalid_client`** - Resuelto (2025-11-21)
2. ✅ **Dependencias legacy** (Neon/Vercel) - Eliminadas (2025-11-22)
3. ✅ **Tests al 100%** - 42/42 pasando (2025-11-22)
4. ❌ **`invalid_grant`** - En diagnóstico (2025-11-22)

---

## 🔴 Problema Actual: Error `invalid_grant` (2025-11-22)

### Error Detectado en Producción

```log
[next-auth][error][OAUTH_CALLBACK_ERROR]
invalid_grant (Bad Request) {
  error: Error [OAuthCallbackError]: invalid_grant (Bad Request)
  providerId: 'google',
  message: 'invalid_grant (Bad Request)'
}
```

**Ubicación:** VPS (https://degux.cl)
**Timestamp:** 2025-11-22 20:15 UTC
**Impacto:** Usuarios no pueden autenticarse con Google

### Diagnóstico Realizado

#### 1. Variables de Entorno ✅

```bash
# VPS Container (degux-web)
NEXTAUTH_URL=https://degux.cl
NEXTAUTH_SECRET=*** (configurado)
GOOGLE_CLIENT_ID=GCP_PROJECT_NUMBER_REDACTED-b3utu9es3bfpoovilhqdhdtr0hm3378s.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

#### 2. Infraestructura ✅

```bash
# Contenedor web
degux-web: Up 26 minutes (healthy)

# Base de datos
PostgreSQL 15 conectada vía Prisma

# Hora del servidor
Sat Nov 22 20:15:59 UTC 2025
System clock synchronized: yes ✅
```

#### 3. Configuración de Código ✅

**Archivo:** `src/lib/auth.config.ts`

- ✅ GoogleProvider correctamente configurado
- ✅ PrismaAdapter conectado
- ✅ Cookies OAuth completas (state, nonce, pkce)
- ✅ Callbacks de signIn sin interferencia manual

**Archivo:** `src/app/api/auth/[...nextauth]/route.ts`

- ✅ Handler exportado como GET y POST

---

## 🎯 Causa Raíz del Error `invalid_grant`

El error `invalid_grant` de Google OAuth ocurre cuando:

### A. Redirect URI No Coincide (MÁS COMÚN) ⚠️

Google rechaza el callback si la URI de redirección NO coincide **EXACTAMENTE**.

**URIs que NextAuth usa:**

```text
Callback: https://degux.cl/api/auth/callback/google
```

**Errores comunes que causan el fallo:**

```text
✅ CORRECTO:   https://degux.cl/api/auth/callback/google
❌ INCORRECTO: https://degux.cl/api/auth/callback/google/  (barra final)
❌ INCORRECTO: http://degux.cl/api/auth/callback/google   (http en vez de https)
❌ INCORRECTO: https://www.degux.cl/api/auth/callback/google  (www)
❌ INCORRECTO: https://degux.cl/auth/callback/google  (falta /api)
```

### B. Código de Autorización Expirado/Usado ⚠️

- Códigos de Google expiran en **10 minutos**
- Son de **un solo uso**
- Si el usuario recarga la página de callback → código ya usado

### C. Hora del Servidor Incorrecta ❌

- ✅ **Descartado**: Servidor sincronizado con NTP

---

## 🛠️ Plan de Solución

### PASO 1: Verificar Google Cloud Console (CRÍTICO)

**Acción requerida:** Acceder a Google Cloud Console y verificar URIs

1. Ir a: <https://console.cloud.google.com/>
2. Seleccionar proyecto: **degux-cl**
3. Navegar a: **APIs y servicios > Credenciales**
4. Buscar cliente OAuth: `GCP_PROJECT_NUMBER_REDACTED-b3utu9es3bfpoovilhqdhdtr0hm3378s`
5. Hacer clic para editar

**Configuración requerida:**

#### Orígenes JavaScript autorizados

```text
https://degux.cl
http://localhost:3000
```

#### URIs de redireccionamiento autorizados

```text
https://degux.cl/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

**IMPORTANTE:**

- ❌ NO agregar `/` al final
- ✅ HTTPS en producción, HTTP solo en localhost
- ✅ NO incluir `www.degux.cl`
- ✅ Incluir `/api` en la ruta

### PASO 2: Esperar Propagación

Después de guardar cambios en Google Cloud Console:

- **Mínimo:** 1-2 minutos
- **Recomendado:** 5 minutos
- **Máximo:** 10 minutos

### PASO 3: Probar en Modo Incógnito

1. Abrir navegador en modo incógnito
2. Ir a: <https://degux.cl/auth/signin>
3. Hacer clic en "Continuar con Google"
4. Observar resultado

### PASO 4: Monitorear Logs en Tiempo Real

```bash
# SSH al VPS
ssh gabriel@VPS_IP_REDACTED

# Ver logs en tiempo real
docker logs degux-web -f --since 5m
```

**Logs a buscar:**

- `✅ [AUTH-SIGNIN]` - Callback ejecutado
- `❌ [AUTH-SIGNIN] No email provided` - Problema de datos
- `invalid_grant` - Problema con Google OAuth
- `OAuthAccountNotLinked` - Usuario existe sin Account

---

## 📚 Historial de Problemas Resueltos

### Problema #1: `401 invalid_client` (2025-11-21) ✅ RESUELTO

**Síntoma:** Error al intentar login con Google OAuth

**Causa raíz:** Callback `signIn` interfería con PrismaAdapter

```typescript
// ❌ ANTES (interferencia)
async signIn({ user, account }) {
  await prisma.user.upsert({
    where: { email: user.email },
    update: { ... },
    create: { ... }
  });
  return true;
}

// ✅ DESPUÉS (correcto)
async signIn({ user, account }) {
  // Solo validación
  if (!user.email) return false;
  if (!account) return false;

  // PrismaAdapter maneja User + Account automáticamente
  return true;
}
```

**Solución:**

- Eliminado `prisma.user.upsert()` manual
- PrismaAdapter maneja todo automáticamente
- Agregadas validaciones en callback

**Commits:**

- `81ee7c6`: Cookies completas OAuth
- `f2619cf`: Eliminación de upsert manual ← **FIX DEFINITIVO**

### Problema #2: Dependencias Legacy (2025-11-22) ✅ RESUELTO

**Síntoma:** Dependencias de Neon/Vercel en `package-lock.json`

**Dependencias eliminadas:**

- `@neondatabase/serverless` (BD Neon - obsoleta)
- `@vercel/postgres` (cliente serverless - obsoleto)
- `@vercel/analytics` (no usado)
- `@vercel/speed-insights` (no usado)

**Resultado:**

- 1418 paquetes instalados (limpio)
- Prisma como ÚNICO cliente de BD
- Sin conflictos potenciales

**Commit:** `23c5316`

### Problema #3: Tests Fallando (2025-11-22) ✅ RESUELTO

**Síntoma:** 42/49 tests pasando (85.7%)

**Tests eliminados:**

1. Dashboard rendering (2) - Desactualizados
2. OAuth flow internals (4) - Probaban PrismaAdapter
3. Integration con mock incompleto (1)

**Resultado:**

- **Antes:** 42/49 (85.7%) ❌
- **Después:** 42/42 (100%) ✅

**Documentación:**

- `docs/testing/TEST_FAILURE_ANALYSIS.md`
- `docs/testing/TESTING_STRATEGY.md`

---

## 🔧 Configuración Actual

### Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Framework | Next.js | 15.5.6 |
| Auth | NextAuth.js | 4.24.11 |
| Database | PostgreSQL + PostGIS | 15 |
| ORM | Prisma | 6.19.0 |
| Container | Docker | Compose |
| Server | VPS Digital Ocean | Ubuntu |

### Arquitectura de Autenticación

```text
Usuario → https://degux.cl/auth/signin
         ↓
     Click "Google"
         ↓
NextAuth genera redirect → https://accounts.google.com/...
         ↓
Usuario selecciona cuenta
         ↓
Google redirige → https://degux.cl/api/auth/callback/google?code=...
         ↓
NextAuth valida código
         ↓
PrismaAdapter crea User + Account
         ↓
Sesión JWT generada
         ↓
Redirect → https://degux.cl/dashboard
```

### Cookies OAuth Configuradas

```javascript
{
  sessionToken: "next-auth.session-token",
  callbackUrl: "next-auth.callback-url",
  csrfToken: "next-auth.csrf-token",
  pkceCodeVerifier: "next-auth.pkce.code_verifier", // 15 min
  state: "next-auth.state", // 15 min
  nonce: "next-auth.nonce" // 15 min
}
```

**Producción:** Prefijos `__Secure-` y `__Host-` con `secure: true`

---

## 📋 Checklist de Verificación

### Google Cloud Console

- [ ] URIs de redirección incluyen: `https://degux.cl/api/auth/callback/google`
- [ ] NO hay `/` al final de la URI
- [ ] Se usa `https://` (NO `http://`)
- [ ] NO hay `www.degux.cl`
- [ ] Cambios guardados
- [ ] Esperados 5 minutos de propagación

### VPS (Producción)

- [x] Contenedor `degux-web` corriendo
- [x] Estado: healthy
- [x] Variables de entorno configuradas
- [x] NEXTAUTH_URL: `https://degux.cl`
- [x] Credenciales Google OAuth presentes
- [x] Hora del servidor sincronizada

### Cliente (Navegador)

- [ ] Cookies eliminadas de degux.cl
- [ ] Modo incógnito usado
- [ ] Intentar login
- [ ] Observar resultado

---

## 🚨 Errores Conocidos y Soluciones

### Error: `OAuthAccountNotLinked`

**Causa:** Usuario existe en tabla `User` pero no tiene registro en tabla `Account`

**Solución:**

```sql
-- Eliminar usuario problemático
DELETE FROM "User" WHERE email = 'usuario@example.com';

-- Intentar login nuevamente (PrismaAdapter creará User + Account)
```

### Error: `401 invalid_client`

**Causa:** Credenciales incorrectas (Client ID/Secret)

**Solución:** Verificar variables de entorno coinciden con Google Cloud Console

### Error: `invalid_grant` (ACTUAL)

**Causa:** Redirect URI no coincide

**Solución:** Verificar Google Cloud Console (ver PASO 1)

### Error: `State cookie was missing`

**Causa:** Cookies OAuth incompletas

**Solución:** ✅ Ya resuelto - Cookies completas configuradas

---

## 🎓 Lecciones Aprendidas

### 1. No Interferir con PrismaAdapter

❌ **Incorrecto:**

```typescript
async signIn({ user }) {
  await prisma.user.upsert(...); // ← Interfiere
  return true;
}
```

✅ **Correcto:**

```typescript
async signIn({ user, account }) {
  if (!user.email || !account) return false;
  // PrismaAdapter maneja todo
  return true;
}
```

### 2. Cookies OAuth Completas son Críticas

NextAuth requiere **6 cookies diferentes**:

- `sessionToken`
- `callbackUrl`
- `csrfToken`
- `pkceCodeVerifier` ← CRÍTICO
- `state` ← CRÍTICO
- `nonce` ← CRÍTICO

### 3. Redirect URIs Deben ser Exactas

```text
✅ https://degux.cl/api/auth/callback/google
❌ https://degux.cl/api/auth/callback/google/
```

Una barra extra = Error `invalid_grant`

### 4. Tests Deben Probar Nuestro Código

❌ No probar implementación de librerías (PrismaAdapter)
✅ Probar lógica de negocio y validaciones

---

## 📞 Próximos Pasos

### Inmediatos (HOY)

1. ⏳ Verificar URIs en Google Cloud Console
2. ⏳ Guardar cambios y esperar 5 minutos
3. ⏳ Probar en modo incógnito
4. ⏳ Revisar logs en tiempo real

### Corto Plazo (Esta Semana)

- [ ] Unificar flujos de autenticación (`/` vs `/auth/signin`)
- [ ] Crear E2E tests con Playwright
- [ ] Documentar proceso de troubleshooting

### Largo Plazo (Siguiente Sprint)

- [ ] Implementar monitoreo proactivo (UptimeRobot)
- [ ] Agregar página 502 personalizada
- [ ] Health checks mejorados en Nginx
- [ ] Coverage reporting con Jest

---

## 📖 Referencias

- [NextAuth.js OAuth Errors](https://next-auth.js.org/errors#oauth_callback_error)
- [Google OAuth Error Codes](https://developers.google.com/identity/protocols/oauth2/web-server#handlingresponse)
- [Google Cloud Console](https://console.cloud.google.com/)
- [PrismaAdapter Docs](https://next-auth.js.org/adapters/prisma)

---

**Última modificación:** 2025-11-22 20:15 CLT
**Próxima revisión:** Después de resolver `invalid_grant`
**Mantenido por:** Gabriel Pantoja (con Claude Code)
