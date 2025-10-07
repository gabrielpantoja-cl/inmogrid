# 🧪 Prueba Manual de Autenticación - degux.cl

**Fecha**: 2025-10-06
**Estado**: ✅ Configuración completa y lista para pruebas

---

## 📋 Pre-requisitos Verificados

### ✅ Variables de Entorno
- [x] `POSTGRES_PRISMA_URL` - Conexión a PostgreSQL en VPS (n8n-db:5432)
- [x] `NEXTAUTH_SECRET` - Secret configurado (32+ caracteres)
- [x] `NEXTAUTH_URL` - http://localhost:3000
- [x] `GOOGLE_CLIENT_ID` - Credenciales de Google OAuth
- [x] `GOOGLE_CLIENT_SECRET` - Credenciales de Google OAuth

### ✅ Base de Datos
- [x] Base de datos `degux` creada en VPS
- [x] Usuario `degux_user` configurado
- [x] Tablas de NextAuth creadas:
  - `User` (18 columnas incluyendo perfil profesional)
  - `Account` (OAuth providers)
  - `Session` (sesiones activas)
  - `VerificationToken` (tokens de verificación)

### ✅ Código
- [x] NextAuth.js configurado (`src/lib/auth.config.ts`)
- [x] Middleware de protección activo (`src/middleware.ts`)
- [x] Rutas API configuradas (`src/app/api/auth/[...nextauth]/route.ts`)
- [x] Prisma Client generado

---

## 🚀 Pasos para Probar Autenticación

### 1. Iniciar Servidor de Desarrollo

```bash
# Asegúrate de estar en el directorio del proyecto
cd /home/gabriel/Documentos/degux.cl

# Iniciar servidor
npm run dev
```

**Resultado esperado**:
```
▲ Next.js 15.3.5 (Turbopack)
- Local:        http://localhost:3000
- Network:      http://192.168.4.209:3000
✓ Ready in 1399ms
```

### 2. Acceder a la Página de Login

Abre tu navegador y visita:
```
http://localhost:3000/auth/signin
```

**Verificar**:
- [ ] La página carga sin errores
- [ ] Se muestra botón "Iniciar sesión con Google"
- [ ] No hay errores en consola del navegador

### 3. Hacer Login con Google

1. Haz clic en "Iniciar sesión con Google"
2. Se abrirá la ventana de autenticación de Google
3. Selecciona tu cuenta Google
4. Acepta los permisos solicitados

**Verificar en consola del servidor**:
```bash
# Deberías ver logs como:
✅ [AUTH-SIGNIN] {
  userId: 'clf8x9y2z0001...',
  email: 'tu-email@gmail.com',
  provider: 'google',
  timestamp: '2025-10-06T...'
}

📥 [AUTH-SIGNIN-EVENT] { userId: '...', provider: 'google', timestamp: '...' }
```

### 4. Verificar Redirección

**Resultado esperado**:
- Después del login exitoso, serás redirigido a `/dashboard`
- Si hay error, serás redirigido a `/auth/error`

### 5. Verificar Usuario en Base de Datos

```bash
# Conectar al VPS
ssh gabriel@VPS_IP_REDACTED

# Conectar a PostgreSQL
docker exec -it n8n-db psql -U degux_user -d degux

# Ver usuario creado
SELECT id, email, name, role, "createdAt", "updatedAt"
FROM "User"
WHERE email = 'tu-email@gmail.com';
```

**Resultado esperado**:
```
                  id                  |       email        |     name     | role |         createdAt          |         updatedAt
--------------------------------------+--------------------+--------------+------+----------------------------+----------------------------
 clf8x9y2z0001...                    | tu@gmail.com       | Tu Nombre    | user | 2025-10-06 21:30:15.123... | 2025-10-06 21:30:15.123...
```

### 6. Verificar Cuenta OAuth

```sql
SELECT u.email, a.provider, a."providerAccountId", a."createdAt"
FROM "Account" a
JOIN "User" u ON a."userId" = u.id
WHERE u.email = 'tu-email@gmail.com';
```

**Resultado esperado**:
```
      email       | provider | providerAccountId |         createdAt
------------------+----------+-------------------+----------------------------
 tu@gmail.com     | google   | 1234567890...     | 2025-10-06 21:30:15.456...
```

### 7. Verificar Sesión Activa

```sql
SELECT u.email, s."sessionToken", s.expires
FROM "Session" s
JOIN "User" u ON s."userId" = u.id
WHERE u.email = 'tu-email@gmail.com'
AND s.expires > NOW()
ORDER BY s."createdAt" DESC
LIMIT 1;
```

**Resultado esperado**:
```
      email       |           sessionToken            |           expires
------------------+-----------------------------------+----------------------------
 tu@gmail.com     | abc123...                         | 2025-10-07 21:30:15...
```

---

## 🧪 Tests Automatizados

Ya se crearon tests de integración completos:

### Ejecutar Tests

```bash
# Tests de configuración básica
./scripts/test-auth-local.sh

# Tests de integración con mocks
npm test -- __tests__/auth/auth-integration.test.ts

# Tests de flujo OAuth completo
npm test -- __tests__/auth/oauth-flow.test.ts
```

### Resultados de Tests Actuales

**✅ Tests que pasan (19/29)**:
- ✅ Configuración de NextAuth completa
- ✅ Google Provider configurado
- ✅ Estrategia JWT activa
- ✅ Páginas personalizadas (/auth/signin, /auth/error)
- ✅ Callback signIn permite login con email válido
- ✅ Callback signIn crea usuario en BD
- ✅ Callback signIn mantiene rol admin existente
- ✅ Callback signIn rechaza login sin email
- ✅ Callback JWT incluye userId y role
- ✅ Callback session incluye userId y role
- ✅ Callback redirect convierte URLs relativas
- ✅ Callback redirect permite URLs del mismo origen
- ✅ Callback redirect previene redirecciones externas
- ✅ Cookies httpOnly configuradas
- ✅ sameSite lax para CSRF protection
- ✅ Debug habilitado

**⚠️ Tests que requieren conexión a BD (10/29)**:
- ⏸️ Tests de integración con PostgreSQL (requieren VPS accesible)
- ⏸️ Verificación de variables de entorno en Jest

---

## 🔍 Troubleshooting

### Error: "Can't reach database server"

**Problema**: No se puede conectar a PostgreSQL en VPS.

**Soluciones**:
1. Verificar que estás conectado a VPN/red con acceso al VPS
2. Verificar que el puerto 5432 está expuesto:
   ```bash
   ssh gabriel@VPS_IP_REDACTED 'docker ps | grep n8n-db'
   ```
3. Probar conexión directa:
   ```bash
   psql "postgresql://degux_user:PASSWORD@VPS_IP_REDACTED:5432/degux"
   ```

### Error: "redirect_uri_mismatch"

**Problema**: Google OAuth rechaza la redirección.

**Solución**:
1. Ir a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Editar credenciales OAuth 2.0
3. Agregar a "Authorized redirect URIs":
   ```
   http://localhost:3000/api/auth/callback/google
   ```

### Error: "Session not found"

**Problema**: No se crea sesión después del login.

**Solución**:
1. Limpiar cookies del navegador
2. Verificar que `NEXTAUTH_SECRET` no haya cambiado
3. Revisar logs del servidor:
   ```bash
   tail -f /tmp/degux-dev.log
   ```

### Usuario no se crea en BD

**Problema**: Login exitoso pero usuario no aparece en BD.

**Solución**:
1. Verificar connection string en `.env.local`
2. Verificar que Prisma Client está actualizado:
   ```bash
   npm run prisma:generate
   ```
3. Revisar logs de errores en `src/lib/auth.config.ts`

---

## 📊 Resultados Esperados

### ✅ Login Exitoso

1. **Navegador**:
   - Redirección a `/dashboard`
   - Cookie de sesión creada (`next-auth.session-token`)
   - No hay errores en consola

2. **Servidor**:
   - Logs de `[AUTH-SIGNIN]`
   - Logs de `[AUTH-SIGNIN-EVENT]`
   - Sin errores en terminal

3. **Base de Datos**:
   - Usuario creado en tabla `User`
   - Cuenta OAuth en tabla `Account`
   - Sesión activa en tabla `Session`

### ❌ Login Fallido

**Si el login falla**, verificar:

1. **Consola del Navegador**:
   ```
   F12 → Console → Buscar errores
   ```

2. **Consola del Servidor**:
   ```bash
   tail -f /tmp/degux-dev.log | grep ERROR
   ```

3. **Base de Datos**:
   ```sql
   -- Verificar que las tablas existen
   \dt

   -- Verificar permisos del usuario
   \du degux_user
   ```

---

## 🎯 Próximos Pasos Después de Pruebas

Una vez que las pruebas manuales sean exitosas:

1. **Crear usuario admin**:
   ```sql
   UPDATE "User"
   SET role = 'admin'
   WHERE email = 'tu-email@gmail.com';
   ```

2. **Configurar perfil profesional**:
   - Ir a `/dashboard/perfil`
   - Completar bio, profesión, empresa
   - Configurar visibilidad pública

3. **Probar rutas protegidas**:
   - `/dashboard/propiedades` - CRUD de propiedades
   - `/dashboard/estadisticas` - Estadísticas avanzadas
   - `/networking` - Directorio de profesionales

4. **Deploy a producción**:
   - Actualizar `NEXTAUTH_URL` a `https://degux.cl`
   - Actualizar redirect URIs en Google Console
   - Deploy con `scripts/deploy-to-vps.sh`

---

## 📝 Archivos Relacionados

### Configuración
- `src/lib/auth.config.ts` - Configuración de NextAuth.js
- `src/lib/prisma.ts` - Cliente de Prisma
- `src/middleware.ts` - Protección de rutas
- `.env.local` - Variables de entorno

### Tests
- `scripts/test-auth-local.sh` - Test de configuración básica
- `__tests__/auth/auth-integration.test.ts` - Tests de integración
- `__tests__/auth/oauth-flow.test.ts` - Tests de flujo OAuth

### Documentación
- `docs/AUTHENTICATION_GUIDE.md` - Guía completa de autenticación
- `docs/03-arquitectura/DATABASE_SETUP_SUMMARY.md` - Setup de BD
- `docs/03-arquitectura/MIGRATION_COMPLETE.md` - Migración completa

---

## ✅ Checklist de Pruebas

- [ ] Servidor de desarrollo iniciado correctamente
- [ ] Página `/auth/signin` carga sin errores
- [ ] Click en "Iniciar sesión con Google" abre ventana de OAuth
- [ ] Selección de cuenta Google funciona
- [ ] Redirección a `/dashboard` después de login
- [ ] Usuario creado en tabla `User`
- [ ] Cuenta OAuth creada en tabla `Account`
- [ ] Sesión activa en tabla `Session`
- [ ] Logs de servidor muestran `[AUTH-SIGNIN]` exitoso
- [ ] Perfil de usuario accesible en `/dashboard/perfil`
- [ ] Logout funciona correctamente
- [ ] Segundo login (usuario existente) funciona

---

**Autor**: Claude Code
**Proyecto**: degux.cl
**Versión**: 1.0
**Estado**: ✅ Listo para pruebas
