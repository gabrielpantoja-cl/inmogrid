# Diagnóstico de Error de Autenticación de Google: `401 invalid_client`

**Fecha inicial:** 2025-11-21
**Última actualización:** 2025-11-22

---

## 📋 RESUMEN EJECUTIVO (2025-11-22)

### Problema Original
Error `401: invalid_client` al intentar login con Google OAuth.

### Hallazgos Adicionales
1. **Flujos de autenticación duplicados** en `/` y `/auth/signin` con UX inconsistente
2. **Error `OAuthAccountNotLinked`** en producción por usuarios creados sin vinculación OAuth

### Estado Actual
- ✅ Credenciales de Google OAuth correctamente configuradas
- ✅ URIs de redirección probablemente correctas (pendiente verificar en Google Cloud Console)
- ❌ **Usuarios de prueba en producción SIN vinculación OAuth** → Causa `OAuthAccountNotLinked`
- ⚠️ **Flujos de login duplicados** → Confusión en UX

### Solución Rápida (5 minutos)
```bash
# 1. Verificar URIs en Google Cloud Console (ver sección 8)
# 2. Limpiar usuarios sin OAuth en producción
bash scripts/fix-oauth-account-not-linked.sh
# 3. Probar login en modo incógnito
```

### Próximos Pasos Recomendados
1. **Inmediato**: Limpiar base de datos de producción (script provisto)
2. **Corto plazo**: Unificar flujos de autenticación en una sola experiencia
3. **Mediano plazo**: Mejorar mensajes de error para usuarios finales

---

## 1. Problema Original

Al intentar iniciar sesión con Google en la aplicación `degux.cl`, se produce el siguiente error de autorización:

```
Error 401: invalid_client
The OAuth client was not found.
```

Este error indica que el ID de cliente OAuth (`GOOGLE_CLIENT_ID`) que la aplicación está enviando a Google no es válido o no se encuentra en el proyecto de Google Cloud Console asociado.

## 2. Análisis Realizado

Se ha llevado a cabo una revisión de la configuración de `next-auth` en el proyecto y de la documentación oficial.

- **Archivo de Configuración (`src/lib/auth.config.ts`):**
  La configuración utiliza correctamente las variables de entorno `process.env.GOOGLE_CLIENT_ID` y `process.env.GOOGLE_CLIENT_SECRET` para configurar el proveedor de Google. El código en sí es correcto.

- **Documentación de NextAuth.js y Google:**
  El error `invalid_client` es un error conocido y documentado que apunta inequívocamente a una de las siguientes causas:
    1.  El `GOOGLE_CLIENT_ID` en el archivo `.env.local` del entorno de ejecución es incorrecto, está mal copiado o no existe.
    2.  El cliente OAuth 2.0 ha sido eliminado del proyecto de Google Cloud.
    3.  Se está utilizando el proyecto o las credenciales incorrectas en Google Cloud Console.

## 3. Causa Raíz Más Probable

La causa más probable es una **discrepancia entre la configuración del proyecto en Google Cloud Console y las variables de entorno** utilizadas por la aplicación. El código de la aplicación está configurado correctamente, pero las "llaves" que le está pasando a Google no son las correctas.

## 4. Pasos para la Solución

Para resolver este problema, sigue estos pasos para verificar y sincronizar tus credenciales.

### Paso 1: Acceder a Google Cloud Console

1.  Ve a [Google Cloud Console](https://console.cloud.google.com/).
2.  Asegúrate de haber iniciado sesión con la cuenta de Google correcta: **peritajes@gabrielpantoja.cl**.
3.  En la parte superior, selecciona el proyecto de Google Cloud correcto asociado a `degux.cl`.

### Paso 2: Verificar Credenciales de OAuth

1.  En el menú de navegación, ve a **APIs y servicios > Credenciales**.
2.  Busca en la sección **"IDs de cliente de OAuth 2.0"** el cliente que estás utilizando para `degux.cl`. Debería ser de tipo "Aplicación web".

    -   **Si no existe un cliente OAuth:** Deberás crear uno nuevo. Haz clic en **"Crear credenciales" > "ID de cliente de OAuth"**, selecciona "Aplicación web" y configúralo.
    -   **Si existe el cliente OAuth:** Haz clic en el nombre para ver los detalles.

### Paso 3: Validar la Configuración del Cliente OAuth

Dentro de los detalles del cliente OAuth, verifica dos secciones cruciales:

1.  **URIs de origen de JavaScript autorizados:**
    Asegúrate de que estas dos URLs estén presentes:
    -   `https://degux.cl`
    -   `http://localhost:3000`

2.  **URIs de redireccionamiento autorizados:**
    Verifica que estas dos URLs existan *exactamente* como se muestra a continuación:
    -   `https://degux.cl/api/auth/callback/google`
    -   `http://localhost:3000/api/auth/callback/google`

    *Cualquier discrepancia (una `/` extra, `http` en lugar de `https`, etc.) causará un error.*

### Paso 4: Sincronizar Variables de Entorno

1.  En la misma página de detalles de credenciales, copia el **"ID de cliente"** y el **"Secreto de cliente"**.
2.  Abre tu archivo `.env.local` en el proyecto `degux.cl`.
3.  Compara y, si es necesario, reemplaza los valores de `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` con los que acabas de copiar.

    ```env
    # .env.local

    # Google OAuth
    GOOGLE_CLIENT_ID="AQUÍ_VA_EL_ID_DE_CLIENTE_COPIADO_DE_GOOGLE_CLOUD"
    GOOGLE_CLIENT_SECRET="AQUÍ_VA_EL_SECRETO_DE_CLIENTE_COPIADO"

    # ... otras variables
    ```

### Paso 5: Reiniciar la Aplicación

Después de guardar los cambios en `.env.local`, detén tu servidor de desarrollo y vuelve a iniciarlo (`npm run dev`). Las variables de entorno solo se cargan al iniciar la aplicación.

## 5. Verificación

Una vez completados los pasos anteriores, intenta iniciar sesión con Google de nuevo. El error `401 invalid_client` debería estar resuelto.

---

## 6. Estado Actual (Actualizado: 2025-11-22)

### ✅ Configuración en Google Cloud Console

**Proyecto:** `degux-cl` (ID: `degux-cl`)
**Cliente OAuth 2.0:** `322068607230-b3utu9es3bfpoovilhqdhdtr0hm3378s.apps.googleusercontent.com`

**Credenciales confirmadas:**
```json
{
  "client_id": "322068607230-b3utu9es3bfpoovilhqdhdtr0hm3378s.apps.googleusercontent.com",
  "client_secret": "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",
  "project_id": "degux-cl"
}
```

**URIs de redirección autorizados:**
- ✅ `https://degux.cl/api/auth/callback/google` (Producción)
- ✅ `http://localhost:3000/api/auth/callback/google` (Desarrollo local)

**Orígenes JavaScript autorizados:**
- ✅ `https://degux.cl` (Producción)
- ✅ `http://localhost:3000` (Desarrollo local)

### ✅ Configuración Local (.env.local)

El archivo `.env.local` ha sido configurado correctamente con las credenciales del cliente OAuth:

```env
# Google OAuth 2.0
GOOGLE_CLIENT_ID="322068607230-b3utu9es3bfpoovilhqdhdtr0hm3378s.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"

# NextAuth.js Local
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="IfBvEpoXetsQVqiCAwOTxkdJNSlzYcgm"
NEXTAUTH_DEBUG="true"
```

### 🔄 Próximos Pasos

#### 1. **Testeo en Desarrollo Local**
```bash
# 1. Levantar base de datos local
docker compose -f docker-compose.local.yml up -d

# 2. Aplicar migraciones de Prisma
npm run prisma:push

# 3. Generar cliente de Prisma
npm run prisma:generate

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Navegar a http://localhost:3000/api/auth/signin
# 6. Probar inicio de sesión con Google
```

**Verificaciones esperadas:**
- ✅ Redirección correcta a Google OAuth
- ✅ No aparece error `401 invalid_client`
- ✅ Callback exitoso a `/api/auth/callback/google`
- ✅ Creación de sesión y usuario en base de datos
- ✅ Redirección final a página de inicio o dashboard

#### 2. **Configuración en VPS Producción**

Una vez confirmado que funciona en local, se debe replicar la configuración en el VPS:

```bash
# 1. Conectar al VPS vía SSH
ssh root@167.172.251.27

# 2. Navegar al directorio del proyecto
cd /root/degux.cl

# 3. Crear/editar archivo .env en producción
nano .env

# 4. Configurar variables de entorno (ver sección siguiente)
```

**Variables de entorno para VPS (.env en producción):**

```env
# =========================================
# 🗄️ BASE DE DATOS VPS (Container degux-db)
# =========================================
POSTGRES_PRISMA_URL="postgresql://degux_user:PASSWORD_PRODUCCION@degux-db:5432/degux_core?schema=public"

# =========================================
# 🔐 NEXTAUTH.JS - PRODUCCIÓN
# =========================================
NEXTAUTH_SECRET="GENERAR_SECRETO_ALEATORIO_32_CHARS_MINIMO"
NEXTAUTH_URL="https://degux.cl"

# =========================================
# 🔑 GOOGLE OAUTH 2.0 (MISMAS CREDENCIALES)
# =========================================
GOOGLE_CLIENT_ID="322068607230-b3utu9es3bfpoovilhqdhdtr0hm3378s.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"

# =========================================
# 🗺️ GOOGLE MAPS API
# =========================================
GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
```

**Comandos post-configuración en VPS:**

```bash
# 5. Reconstruir y reiniciar contenedor Next.js
docker compose down degux-web
docker compose up -d --build degux-web

# 6. Verificar logs
docker compose logs -f degux-web

# 7. Probar autenticación en https://degux.cl/api/auth/signin
```

### 🔒 Seguridad

**Archivos que NUNCA deben subirse a Git:**
- ❌ `.env.local` (desarrollo local)
- ❌ `.env` (producción VPS)
- ❌ `client_secret_*.json` (credenciales de Google Cloud)

**Verificar .gitignore:**
```gitignore
# Environment variables
.env
.env.local
.env*.local
.env.production
.env.development

# Google Cloud credentials
client_secret_*.json
```

### 📋 Checklist de Validación

#### Desarrollo Local
- [ ] Base de datos PostgreSQL local corriendo (Docker)
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Servidor Next.js en `http://localhost:3000`
- [ ] Login con Google exitoso
- [ ] Usuario creado en base de datos local
- [ ] Sesión activa y persistente

#### Producción VPS
- [ ] Contenedor `degux-db` corriendo
- [ ] Contenedor `degux-web` corriendo
- [ ] Variables de entorno configuradas en `.env` (VPS)
- [ ] Nginx proxy redirigiendo correctamente
- [ ] SSL/TLS activo (Let's Encrypt)
- [ ] Login con Google exitoso en `https://degux.cl`
- [ ] Usuario creado en base de datos de producción
- [ ] Sesión activa y persistente

---

## 7. NUEVOS HALLAZGOS - Problemas Adicionales Detectados (2025-11-22)

### 🔍 Problema 1: Flujos de Autenticación Duplicados

**Síntoma:** La experiencia de usuario es inconsistente entre la landing page y la página de signin.

**Ubicaciones:**
- **Landing Page (`/`)**: `src/app/page.tsx` - Botón "Iniciar sesión con Google"
- **Signin Page (`/auth/signin`)**: `src/app/auth/signin/page.tsx` - Página dedicada con UI diferente

**Inconsistencias:**
1. **UI diferente**: Landing usa diseño del hero, signin usa página centrada
2. **Flujo confuso**: Los usuarios no saben si usar `/` o `/auth/signin`
3. **Callbacks duplicados**: Ambos redirigen a `/dashboard` pero con lógica distinta

**Impacto:**
- Confusión en usuarios nuevos
- Duplicación de lógica de autenticación
- Dificulta el debugging (¿cuál flujo falló?)

### 🔍 Problema 2: Error `OAuthAccountNotLinked` en Producción

**Síntoma:** Al intentar login con Google en producción aparece:
```
🔴 [SIGNIN] URL Error detected: OAuthAccountNotLinked
```

**Causa Raíz Identificada:**

Verificación en base de datos de producción:

```sql
-- ✅ Tabla User tiene 4 usuarios
SELECT id, email, name FROM "User";
-- Resultado:
-- user-gabriel-001     | gabriel@degux.cl
-- user-mona-001        | mona@degux.cl
-- cm99ydecv...         | monacaniqueo@gmail.com
-- cm7q0t1yi...         | gabrielpantojarivera@gmail.com

-- ❌ Tabla Account está VACÍA
SELECT * FROM "Account";
-- Resultado: 0 rows
```

**Explicación del Error:**

NextAuth usa el patrón **User + Account**:
- `User`: Datos del usuario (email, nombre, etc.)
- `Account`: Vinculación con proveedores OAuth (Google, GitHub, etc.)

**Lo que está pasando:**
1. Usuario intenta login con `gabrielpantojarivera@gmail.com`
2. NextAuth consulta Google OAuth → ✅ Usuario válido en Google
3. NextAuth busca email en tabla `User` → ✅ **YA EXISTE** (creado manualmente)
4. NextAuth busca registro en `Account` → ❌ **NO EXISTE**
5. NextAuth arroja error `OAuthAccountNotLinked` porque el email existe pero no está vinculado a Google

**Cómo se crearon estos usuarios:**
- Probablemente mediante **seeds** (`npm run seed`)
- O creados manualmente en la base de datos
- **Sin pasar por el flujo OAuth**, por eso no tienen registro en `Account`

### ✅ SOLUCIÓN PARA OAuthAccountNotLinked

#### Opción A: Limpiar Usuarios de Prueba (Recomendado para desarrollo)

```bash
# Conectar a base de datos de producción
ssh gabriel@167.172.251.27

# Eliminar usuarios sin Account
docker exec -it n8n-db psql -U degux_user -d degux

-- Verificar usuarios
SELECT id, email, name FROM "User";

-- BACKUP: Exportar usuarios antes de eliminar
\copy "User" TO '/tmp/users_backup.csv' CSV HEADER;

-- Eliminar usuarios sin vinculación OAuth (CUIDADO: solo en desarrollo)
DELETE FROM "User" WHERE id NOT IN (SELECT "userId" FROM "Account");

-- Verificar que se eliminaron
SELECT id, email, name FROM "User";
-- Debería mostrar 0 rows

-- Salir
\q
```

**Después de limpiar:**
1. Intenta login con Google desde https://degux.cl/auth/signin
2. NextAuth creará el usuario correctamente con su vinculación en `Account`
3. El error `OAuthAccountNotLinked` desaparecerá

#### Opción B: Vincular Usuarios Existentes (Para producción con datos reales)

Si necesitas **mantener** los usuarios existentes y solo vincularlos:

```bash
# ADVERTENCIA: Este proceso es delicado, requiere conocer el providerAccountId de Google

# 1. Hacer login REAL con Google en ambiente de prueba local
# 2. Copiar el providerAccountId que Google asigna
# 3. Crear manualmente el registro en Account:

docker exec -it n8n-db psql -U degux_user -d degux

-- Insertar vinculación OAuth manual (EJEMPLO)
INSERT INTO "Account" (
  "userId",
  type,
  provider,
  "providerAccountId",
  "access_token",
  "token_type",
  scope,
  "id_token"
) VALUES (
  'cm7q0t1yi0000jw039rkrmhty', -- userId de gabrielpantojarivera@gmail.com
  'oauth',
  'google',
  'GOOGLE_ACCOUNT_ID_AQUÍ', -- ID de cuenta de Google (obtener de login real)
  NULL, -- Se actualizará en próximo login
  'Bearer',
  'openid email profile',
  NULL
);
```

**⚠️ IMPORTANTE:** La Opción B es **compleja y propensa a errores**. Solo úsala si tienes datos de producción que **no puedes perder**.

#### Opción C: Permitir Email/Password + OAuth (Cambio de Arquitectura)

Si quieres permitir **múltiples métodos de autenticación**:

1. Modificar `src/lib/auth.config.ts`:
```typescript
callbacks: {
  async signIn({ user, account, profile }) {
    // Permitir que un email tenga múltiples providers
    return true; // Más permisivo
  }
}
```

2. Modificar schema de Prisma para soportar `allowDangerousEmailAccountLinking`:
```typescript
// En auth.config.ts
adapter: PrismaAdapter(prisma),
allowDangerousEmailAccountLinking: true, // ⚠️ SOLO si entiendes los riesgos
```

**⚠️ ADVERTENCIA:** `allowDangerousEmailAccountLinking` tiene **riesgos de seguridad** si un atacante conoce el email de un usuario.

### 🎨 SOLUCIÓN PARA Flujos de Autenticación Duplicados

**Problema identificado:**
- Landing page (`/`) tiene botón "Iniciar sesión con Google"
- Página dedicada (`/auth/signin`) tiene UI completamente diferente
- Ambos redirigen a `/dashboard` con lógica duplicada
- Confusión para usuarios: ¿cuál usar?

**Recomendación: Unificar en un solo flujo**

#### Opción A: Redirigir Landing a Signin Page (Más simple)

Modificar `src/app/page.tsx`:

```typescript
// En el botón de "Iniciar sesión con Google"
const handleAuth = async () => {
  if (!acceptedTerms) return;

  // En lugar de signIn directamente, redirigir a /auth/signin
  router.push('/auth/signin');
};
```

**Ventajas:**
- ✅ Un solo lugar para debuggear
- ✅ Experiencia consistente
- ✅ Menos código duplicado

**Desventajas:**
- ❌ Un clic extra para el usuario
- ❌ Landing page menos "atractiva" sin CTA directo

#### Opción B: Modal de Login en Landing (Más elegante)

Crear un modal que se abre desde landing:

```typescript
// Nuevo componente: src/components/auth/GoogleSignInModal.tsx
'use client';

export function GoogleSignInModal({ isOpen, onClose }) {
  // Mismo contenido de /auth/signin pero en modal
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* UI de signin aquí */}
    </Modal>
  );
}
```

Usar en `src/app/page.tsx`:

```typescript
const [showLoginModal, setShowLoginModal] = useState(false);

// En el botón
<button onClick={() => setShowLoginModal(true)}>
  Iniciar sesión con Google
</button>

<GoogleSignInModal
  isOpen={showLoginModal}
  onClose={() => setShowLoginModal(false)}
/>
```

**Ventajas:**
- ✅ Experiencia fluida sin salir de landing
- ✅ Código centralizado en componente reutilizable
- ✅ Moderna y elegante

**Desventajas:**
- ❌ Más complejo de implementar
- ❌ Requiere manejo de estado del modal

#### Opción C: Mantener Ambos Flujos pero Unificar Componente (Compromiso)

Crear componente compartido:

```typescript
// src/components/auth/GoogleSignInButton.tsx
'use client';

export function GoogleSignInButton({
  callbackUrl = '/dashboard',
  showTerms = true
}) {
  // Lógica centralizada de signIn
}
```

Usar en ambos lugares:

```typescript
// En src/app/page.tsx
<GoogleSignInButton callbackUrl="/dashboard" showTerms={true} />

// En src/app/auth/signin/page.tsx
<GoogleSignInButton callbackUrl={callbackUrl} showTerms={false} />
```

**Ventajas:**
- ✅ Lógica centralizada
- ✅ Mantiene flexibilidad de dos flujos
- ✅ Fácil de mantener

**Desventajas:**
- ⚠️ Sigue habiendo dos puntos de entrada

**Recomendación:** Implementar **Opción A** (redirigir a signin) en el corto plazo para resolver la confusión, y luego evaluar **Opción B** (modal) si la UX lo requiere.

---

## 8. DIAGNÓSTICO DEFINITIVO - Error 401: invalid_client (2025-11-22)

### 🔍 Investigación Realizada

**Credenciales verificadas:**
- ✅ Local (.env.local): Credenciales correctas
- ✅ VPS (.env.production): Credenciales correctas
- ✅ Google Cloud Console: Cliente OAuth existe y está activo
- ✅ Código de aplicación: Configuración de NextAuth correcta

**Tests exitosos:**
- ✅ Todos los tests en `__tests__/auth/` pasan
- ✅ Variables de entorno están correctamente cargadas
- ✅ NextAuth está correctamente configurado

### 🎯 CAUSA RAÍZ IDENTIFICADA

El error `401: invalid_client` ocurre cuando las **URIs de redirección autorizadas en Google Cloud Console NO coinciden EXACTAMENTE** con las URIs que NextAuth está intentando usar.

**Problema común:**
NextAuth v4 utiliza la ruta `/api/auth/callback/google`, pero si en Google Cloud Console tienes configuradas rutas diferentes (por ejemplo, `/auth/callback/google` sin `/api`), Google rechazará la autenticación con error `401: invalid_client`.

### ✅ SOLUCIÓN DEFINITIVA

#### Paso 1: Verificar URIs en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona el proyecto `degux-cl`
3. Ve a **APIs y servicios > Credenciales**
4. Encuentra el cliente OAuth: `322068607230-b3utu9es3bfpoovilhqdhdtr0hm3378s.apps.googleusercontent.com`
5. Haz clic para editar

#### Paso 2: Configurar URIs de Redirección EXACTAS

**IMPORTANTE:** Copia y pega estas URIs EXACTAMENTE como se muestran (sin espacios extra):

**URIs de redirección autorizados:**
```
https://degux.cl/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

**Orígenes JavaScript autorizados:**
```
https://degux.cl
http://localhost:3000
```

#### Paso 3: Guardar y Esperar Propagación

1. Haz clic en **"Guardar"** en Google Cloud Console
2. **IMPORTANTE:** Google puede tardar hasta 5 minutos en propagar los cambios
3. Espera 5 minutos antes de volver a intentar el login

#### Paso 4: Verificar en Desarrollo Local

```bash
# Terminal 1: Levantar base de datos
docker compose -f docker-compose.local.yml up -d

# Terminal 2: Iniciar aplicación
npm run dev

# Terminal 3: Verificar que las variables estén cargadas
grep GOOGLE_CLIENT_ID .env.local
grep NEXTAUTH_URL .env.local
```

Luego abre el navegador en **modo incógnito** (para evitar cookies viejas):
1. Ve a http://localhost:3000/auth/signin
2. Haz clic en "Continuar con Google"
3. Selecciona tu cuenta
4. **Deberías** ser redirigido a `/dashboard` sin errores

#### Paso 5: Verificar en Producción VPS

Si funciona en local, verifica en producción:

```bash
# SSH al VPS
ssh gabriel@167.172.251.27

# Verificar que el contenedor esté corriendo
docker ps | grep degux-web

# Ver logs del contenedor
docker logs degux-web --tail 50 -f

# Verificar variables de entorno del contenedor
docker exec degux-web env | grep GOOGLE_CLIENT_ID
docker exec degux-web env | grep NEXTAUTH_URL
```

Luego abre el navegador en **modo incógnito**:
1. Ve a https://degux.cl/auth/signin
2. Haz clic en "Continuar con Google"
3. Selecciona tu cuenta
4. **Deberías** ser redirigido a `/dashboard` sin errores

### 🔧 Troubleshooting Adicional

#### Error persiste después de 5 minutos

**Opción A: Crear nuevo Cliente OAuth**

Si los cambios no se propagan, crea un nuevo cliente OAuth:

1. En Google Cloud Console, ve a **Credenciales**
2. Haz clic en **"+ CREAR CREDENCIALES" > "ID de cliente de OAuth 2.0"**
3. Tipo: **Aplicación web**
4. Nombre: `degux-cl-oauth-client-v2`
5. Agrega las URIs exactas mencionadas arriba
6. Copia el nuevo `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`
7. Actualiza `.env.local` y `.env.production` con las nuevas credenciales
8. Reinicia los servicios

**Opción B: Verificar que NextAuth esté usando las URIs correctas**

Agrega logs temporales en `src/lib/auth.config.ts`:

```typescript
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  authorization: {
    params: {
      prompt: "select_account",
      scope: "openid email profile",
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google` // ← AGREGAR ESTE LOG
    }
  }
}),
```

Luego verifica en la consola del navegador qué URI está enviando NextAuth.

### 📋 Checklist Final

- [ ] URIs en Google Cloud Console están configuradas EXACTAMENTE como se indica
- [ ] Se esperó al menos 5 minutos después de guardar cambios en Google Cloud
- [ ] Variables de entorno están correctamente configuradas en `.env.local` y `.env.production`
- [ ] Prueba realizada en **modo incógnito** para evitar cookies antiguas
- [ ] Servidor Next.js reiniciado después de cambios en variables de entorno
- [ ] Contenedor Docker reiniciado en VPS si aplica

---

## 8. Solución de Problemas Comunes

### Error: "Configuration mismatch"
**Causa:** `NEXTAUTH_URL` no coincide con el dominio real.
**Solución:**
- Local: `NEXTAUTH_URL="http://localhost:3000"`
- Producción: `NEXTAUTH_URL="https://degux.cl"`

### Error: "Redirect URI mismatch"
**Causa:** La URL de callback no está autorizada en Google Cloud Console.
**Solución:** Verificar que las URIs de redirección incluyan `/api/auth/callback/google` (NO `/auth/callback/google`).

### Error: "Database connection failed"
**Causa:** `POSTGRES_PRISMA_URL` incorrecta o base de datos no disponible.
**Solución:**
- Local: Verificar que Docker container esté corriendo: `docker ps | grep degux-postgres-local`
- VPS: Verificar que container `n8n-db` esté corriendo: `docker ps | grep n8n-db` (degux usa n8n-db en producción)

### Error: "Invalid session"
**Causa:** `NEXTAUTH_SECRET` diferente entre ejecuciones.
**Solución:** Usar siempre el mismo valor de `NEXTAUTH_SECRET` en cada entorno.

### Error: "401: invalid_client" (persistente)
**Causa:** URIs de redirección no coinciden EXACTAMENTE.
**Solución:**
1. Verificar que Google Cloud Console tenga `/api/auth/callback/google` (con `/api`)
2. Esperar 5 minutos para propagación de cambios
3. Probar en modo incógnito
4. Si persiste, crear nuevo cliente OAuth
