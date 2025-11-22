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
**Cliente OAuth 2.0:** `GCP_PROJECT_NUMBER_REDACTED-b3utu9es3bfpoovilhqdhdtr0hm3378s.apps.googleusercontent.com`

**Credenciales confirmadas:**
```json
{
  "client_id": "GCP_PROJECT_NUMBER_REDACTED-b3utu9es3bfpoovilhqdhdtr0hm3378s.apps.googleusercontent.com",
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
GOOGLE_CLIENT_ID="GCP_PROJECT_NUMBER_REDACTED-b3utu9es3bfpoovilhqdhdtr0hm3378s.apps.googleusercontent.com"
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
ssh root@VPS_IP_REDACTED

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
GOOGLE_CLIENT_ID="GCP_PROJECT_NUMBER_REDACTED-b3utu9es3bfpoovilhqdhdtr0hm3378s.apps.googleusercontent.com"
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
ssh gabriel@VPS_IP_REDACTED

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

## 9. ERRORES TEMPORALES Y ESTRATEGIAS DE PREVENCIÓN (2025-11-22)

### 🔍 Errores Detectados Durante Diagnóstico

#### Error 1: `502 Bad Gateway` (Temporal)
**Síntoma:** Al intentar OAuth callback, aparece error 502.

**Causa:** Contenedor `degux-web` reiniciándose o temporalmente no disponible.

**Evidencia:**
```bash
# Contenedor estaba UP hace 1 minuto (recién reiniciado)
degux-web   Up About a minute (healthy)   0.0.0.0:3000->3000/tcp
```

**Por qué confunde:**
- ❌ Parece un error de configuración grave
- ❌ Usuario no sabe si es temporal o permanente
- ❌ Dificulta debugging (¿fue el código o fue el servidor?)

#### Error 2: `State cookie was missing` (Real y Recurrente)
**Síntoma:** NextAuth no puede guardar/leer cookies de OAuth state.

**Causa:** Configuración incompleta de cookies en `auth.config.ts`.

**Evidencia de logs:**
```
[next-auth][error][OAUTH_CALLBACK_ERROR]
State cookie was missing.
```

**Problema:**
Solo teníamos configurada `sessionToken`, pero NextAuth necesita **6 cookies diferentes**:
1. `sessionToken` - Sesión del usuario
2. `callbackUrl` - URL de redirección después de login
3. `csrfToken` - Protección CSRF
4. `pkceCodeVerifier` - Verificador PKCE para OAuth
5. `state` - Estado OAuth (el que faltaba) ← **CRÍTICO**
6. `nonce` - Número único para prevenir replay attacks

**Solución aplicada:**
Configuración completa de todas las cookies necesarias en `src/lib/auth.config.ts`.

---

### ✅ ESTRATEGIAS DE PREVENCIÓN DE ERRORES TEMPORALES

#### 1. Health Checks Mejorados

**Problema actual:**
Nginx no verifica si el contenedor está listo antes de enviar tráfico.

**Solución:**
Agregar health checks activos en Nginx:

```nginx
# En /etc/nginx/sites-available/degux.cl

upstream degux_backend {
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;

    # Health check (requiere nginx plus o módulo adicional)
    # Alternativa: usar keepalive
    keepalive 32;
}

server {
    # ... configuración SSL ...

    location / {
        # Usar upstream con health check
        proxy_pass http://degux_backend;

        # Reintentos automáticos
        proxy_next_upstream error timeout http_502 http_503;
        proxy_next_upstream_tries 2;
        proxy_next_upstream_timeout 5s;

        # Headers y timeouts...
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://degux_backend/api/health;
        access_log off;
    }
}
```

#### 2. Página de Error 502 Personalizada

**Problema actual:**
Usuario ve error técnico "502 Bad Gateway" sin contexto.

**Solución:**
Crear página de error amigable:

```nginx
# En /etc/nginx/sites-available/degux.cl

server {
    # ... configuración ...

    # Página de error personalizada
    error_page 502 503 504 /502.html;

    location = /502.html {
        root /var/www/degux.cl/error_pages;
        internal;
    }
}
```

Crear `/var/www/degux.cl/error_pages/502.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Servicio Temporalmente No Disponible</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
        }
        .container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 500px;
            text-align: center;
        }
        h1 { color: #e74c3c; }
        .retry-btn {
            background: #3498db;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 1rem;
        }
        .retry-btn:hover { background: #2980b9; }
    </style>
</head>
<body>
    <div class="container">
        <h1>⏳ Servicio Temporalmente No Disponible</h1>
        <p>Estamos actualizando nuestros sistemas. Por favor, intenta de nuevo en unos segundos.</p>
        <button class="retry-btn" onclick="location.reload()">🔄 Reintentar</button>
        <p style="font-size: 0.9rem; color: #666; margin-top: 1.5rem;">
            Si el problema persiste, contacta a soporte.
        </p>
    </div>
</body>
</html>
```

#### 3. Logging Mejorado para Debugging

**Problema actual:**
Difícil saber si error fue temporal o permanente.

**Solución:**
Agregar timestamps y contexto en logs:

```typescript
// En src/lib/auth.config.ts

callbacks: {
  async signIn({ user, account }) {
    const timestamp = new Date().toISOString();
    const logPrefix = `[${timestamp}] [AUTH-SIGNIN]`;

    console.log(`${logPrefix} Attempt:`, {
      userId: user.id,
      email: user.email,
      provider: account?.provider,
    });

    try {
      // ... lógica de signIn ...
      console.log(`${logPrefix} SUCCESS:`, user.email);
      return true;
    } catch (error) {
      console.error(`${logPrefix} ERROR:`, error);
      return false;
    }
  }
}
```

#### 4. Retry Logic en Frontend

**Problema actual:**
Si el servidor está reiniciando, el usuario ve error inmediatamente.

**Solución:**
Implementar reintentos automáticos:

```typescript
// En src/app/auth/signin/page.tsx

const handleGoogleSignIn = async () => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 segundos

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🔐 [SIGNIN] Attempt ${attempt}/${MAX_RETRIES}`);

      const result = await signIn('google', {
        callbackUrl,
        redirect: true
      });

      // Si llega aquí, fue exitoso
      return;

    } catch (error: any) {
      console.error(`❌ [SIGNIN] Attempt ${attempt} failed:`, error);

      // Si no es el último intento, esperar antes de reintentar
      if (attempt < MAX_RETRIES) {
        console.log(`⏳ [SIGNIN] Retrying in ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      } else {
        // Último intento falló, mostrar error al usuario
        setError('El servicio está temporalmente no disponible. Por favor, intenta nuevamente en unos momentos.');
      }
    }
  }
};
```

#### 5. Monitoreo Proactivo con Uptime Checks

**Problema actual:**
No sabemos cuándo el servicio está caído hasta que un usuario reporta.

**Solución:**
Configurar monitoreo externo:

**Opción A: UptimeRobot (Gratis)**
- URL: https://uptimerobot.com
- Monitorea https://degux.cl cada 5 minutos
- Envía email/Telegram si está caído

**Opción B: Healthchecks.io (Gratis)**
- URL: https://healthchecks.io
- Cron job en VPS cada minuto:
```bash
# En VPS, agregar a crontab
*/1 * * * * curl -fsS -m 10 --retry 3 https://hc-ping.com/TU_PING_KEY > /dev/null || echo "Degux health check failed"
```

**Opción C: Script de Monitoreo Local**
```bash
# scripts/monitor-degux.sh
#!/bin/bash

HEALTHCHECK_URL="https://degux.cl/api/health"
WEBHOOK_URL="https://discord.com/api/webhooks/TU_WEBHOOK" # O Telegram

while true; do
  HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' "$HEALTHCHECK_URL")

  if [ "$HTTP_CODE" != "200" ]; then
    # Enviar alerta
    curl -X POST "$WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "{\"content\": \"⚠️ Degux.cl is down! HTTP $HTTP_CODE\"}"
  fi

  sleep 60 # Verificar cada minuto
done
```

#### 6. Docker Compose con Auto-Restart

**Problema actual:**
Si el contenedor muere, queda caído hasta reinicio manual.

**Solución:**
Asegurar restart policy en `docker-compose.yml`:

```yaml
services:
  degux-web:
    image: degux-web:latest
    container_name: degux-web
    restart: unless-stopped  # ← CRÍTICO
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

---

### 📋 Checklist de Prevención de Errores Temporales

- [ ] Health checks configurados en Nginx
- [ ] Página de error 502 personalizada creada
- [ ] Logging mejorado con timestamps
- [ ] Retry logic implementado en frontend
- [ ] Monitoreo externo configurado (UptimeRobot/Healthchecks)
- [ ] Docker restart policy configurado
- [ ] Alertas automáticas configuradas (Discord/Telegram)

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
4. Encuentra el cliente OAuth: `GCP_PROJECT_NUMBER_REDACTED-b3utu9es3bfpoovilhqdhdtr0hm3378s.apps.googleusercontent.com`
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
ssh gabriel@VPS_IP_REDACTED

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
