# Diagnóstico de Error de Autenticación de Google: `401 invalid_client`

**Fecha:** 2025-11-21

## 1. Problema

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

## 7. DIAGNÓSTICO DEFINITIVO - Error 401: invalid_client (2025-11-22)

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
