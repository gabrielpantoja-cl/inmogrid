# Diagnóstico: Error OAuth `invalid_grant` - degux.cl

**Fecha**: 2025-11-22 17:15 CLT
**Error**: `invalid_grant (Bad Request)` al intentar login con Google
**Entorno**: Producción (VPS)

---

## 🔴 Error Detectado

```
[next-auth][error][OAUTH_CALLBACK_ERROR]
invalid_grant (Bad Request) {
  error: Error [OAuthCallbackError]: invalid_grant (Bad Request)
  providerId: 'google',
  message: 'invalid_grant (Bad Request)'
}
```

---

## 🔍 Diagnóstico Realizado

### 1. Variables de Entorno (VPS) ✅
```bash
NEXTAUTH_URL=https://degux.cl ✅
NEXTAUTH_SECRET=*** ✅
GOOGLE_CLIENT_ID=322068607230-b3utu9es3bfpoovilhqdhdtr0hm3378s.apps.googleusercontent.com ✅
GOOGLE_CLIENT_SECRET=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 ✅
```

### 2. Contenedor Docker ✅
```bash
degux-web	Up 26 minutes (healthy) ✅
```

### 3. Base de Datos ✅
Prisma conecta correctamente a PostgreSQL

---

## 🎯 Causa Raíz del Error `invalid_grant`

El error `invalid_grant` de Google OAuth ocurre en **una de estas situaciones**:

### A. Redirect URI No Coincide (MÁS COMÚN) ⚠️

Google rechaza el callback si la URI de redirección enviada NO coincide **EXACTAMENTE** con la configurada en Google Cloud Console.

**URIs que NextAuth v4 usa**:
- Callback: `https://degux.cl/api/auth/callback/google`

**Diferencias que causan el error**:
```
✅ CORRECTO:   https://degux.cl/api/auth/callback/google
❌ INCORRECTO: https://degux.cl/api/auth/callback/google/
❌ INCORRECTO: http://degux.cl/api/auth/callback/google
❌ INCORRECTO: https://www.degux.cl/api/auth/callback/google
❌ INCORRECTO: https://degux.cl/auth/callback/google
```

### B. Código de Autorización Expirado/Usado ⚠️

- Google emite códigos de autorización de **un solo uso**
- Expiran en **10 minutos**
- Si el usuario recarga la página de callback, el código ya fue usado

### C. Hora del Servidor Incorrecta ⚠️

- Si el reloj del servidor VPS está desincronizado > 5 minutos
- Google rechaza tokens con timestamps inválidos

---

## 🛠️ Plan de Acción

### Paso 1: Verificar Redirect URI en Google Cloud Console

**Acción**: Ir a Google Cloud Console y verificar la configuración

1. Acceder a: https://console.cloud.google.com/
2. Seleccionar proyecto: **degux-cl**
3. Ir a: **APIs y servicios > Credenciales**
4. Buscar cliente OAuth: `322068607230-b3utu9es3bfpoovilhqdhdtr0hm3378s`
5. Hacer clic para editar

**URIs que DEBEN estar configuradas**:

#### Orígenes JavaScript autorizados:
```
https://degux.cl
http://localhost:3000
```

#### URIs de redireccionamiento autorizados:
```
https://degux.cl/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

**IMPORTANTE**:
- ❌ NO agregar `/` al final
- ✅ Usar HTTPS en producción, HTTP solo en localhost
- ✅ Verificar que NO haya `www.degux.cl`

---

### Paso 2: Verificar Hora del Servidor VPS

```bash
# SSH al VPS
ssh gabriel@167.172.251.27

# Ver hora actual
date

# Ver timezone
timedatectl

# Si la hora está mal, sincronizar
sudo timedatechange set-ntp true
```

**Hora esperada**: Chile Continental (CLT/CLST - UTC-3 o UTC-4)

---

### Paso 3: Limpiar Cookies y Probar de Nuevo

Después de verificar/corregir Google Cloud Console:

1. Ir a **https://degux.cl**
2. Abrir DevTools (F12)
3. Ir a **Application > Cookies**
4. Eliminar todas las cookies de `degux.cl`
5. Cerrar DevTools
6. Intentar login nuevamente

**O usar modo incógnito** (más rápido)

---

### Paso 4: Verificar Logs con Timestamp

```bash
# SSH al VPS
ssh gabriel@167.172.251.27

# Ver logs en tiempo real
docker logs degux-web -f --since 5m

# Ahora intentar login desde el navegador
# Observar los logs para ver el error exacto
```

**Buscar en los logs**:
- `✅ [AUTH-SIGNIN]` - Indica que el callback de signIn se ejecutó
- `❌ [AUTH-SIGNIN] No email provided` - Indica problema de datos
- `invalid_grant` - Indica problema con Google OAuth

---

## 📊 Checklist de Solución

### En Google Cloud Console
- [ ] Verificar que `https://degux.cl/api/auth/callback/google` está en URIs autorizadas
- [ ] Verificar que NO hay `/` extra al final
- [ ] Verificar que es HTTPS (no HTTP)
- [ ] Verificar que NO dice `www.degux.cl`
- [ ] Guardar cambios
- [ ] Esperar 5 minutos para propagación

### En VPS
- [ ] Verificar que hora del servidor es correcta (timedatectl)
- [ ] Verificar que NEXTAUTH_URL es `https://degux.cl` (sin trailing slash)
- [ ] Verificar que las credenciales son correctas
- [ ] Reiniciar contenedor si se cambiaron variables: `docker restart degux-web`

### En Navegador
- [ ] Limpiar cookies de degux.cl
- [ ] Usar modo incógnito
- [ ] Intentar login
- [ ] Ver logs en tiempo real en VPS

---

## 🔧 Solución Rápida (Si URIs Están Mal)

Si descubres que las URIs en Google Cloud Console están incorrectas:

1. **Editar en Google Cloud Console**
2. **Copiar EXACTAMENTE estas URIs** (sin modificar):

```
Orígenes JavaScript autorizados:
https://degux.cl
http://localhost:3000

URIs de redireccionamiento autorizados:
https://degux.cl/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

3. **Guardar**
4. **Esperar 5 minutos**
5. **Probar en modo incógnito**

---

## 📝 Notas Adicionales

### Error `invalid_client` vs `invalid_grant`

- **`invalid_client`**: Credenciales incorrectas (Client ID/Secret)
- **`invalid_grant`**: Credenciales correctas, pero problema con redirect_uri o código expirado

### Por Qué Este Error No Aparece en Desarrollo Local

En desarrollo local probablemente funciona porque:
- Usas `http://localhost:3000` que está bien configurado
- O no has probado aún

### Propagación de Cambios en Google

Cambios en Google Cloud Console pueden tardar:
- **Mínimo**: 1-2 minutos
- **Promedio**: 5 minutos
- **Máximo**: 10 minutos

Recomendación: Esperar 5 minutos después de guardar cambios.

---

## 🎯 Próximos Pasos

1. **Verificar Google Cloud Console** (5 min)
2. **Corregir URIs si están mal** (2 min)
3. **Esperar propagación** (5 min)
4. **Probar en modo incógnito** (1 min)
5. **Reportar resultado** ✅

**Estimación total**: 15 minutos

---

## 📚 Referencias

- [NextAuth.js OAuth Errors](https://next-auth.js.org/errors#oauth_callback_error)
- [Google OAuth Error Codes](https://developers.google.com/identity/protocols/oauth2/web-server#handlingresponse)
- [Google Cloud Console](https://console.cloud.google.com/)
