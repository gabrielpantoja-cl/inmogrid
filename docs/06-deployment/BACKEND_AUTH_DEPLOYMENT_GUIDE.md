# 🚀 Guía de Deployment y Diagnóstico de Autenticación - Backend

**Fecha**: 2025-10-06
**Proyecto**: degux.cl
**Propósito**: Resolver problemas de autenticación en producción

---

## 📋 Tabla de Contenidos

1. [Diagnóstico Rápido](#diagnóstico-rápido)
2. [Variables de Entorno Requeridas](#variables-de-entorno-requeridas)
3. [Verificación de Base de Datos](#verificación-de-base-de-datos)
4. [Configuración de Google OAuth](#configuración-de-google-oauth)
5. [Deployment con Docker](#deployment-con-docker)
6. [Troubleshooting Común](#troubleshooting-común)
7. [Scripts de Diagnóstico](#scripts-de-diagnóstico)

---

## 🔍 Diagnóstico Rápido

### 1. Verificar Estado Actual

```bash
# Conectar al VPS
ssh gabriel@167.172.251.27

# Verificar contenedores activos
docker ps

# Ver logs de degux-web
docker logs degux-web --tail 100 -f

# Verificar que el middleware NO está bloqueando en producción
docker exec degux-web cat src/middleware.ts | grep "NODE_ENV"
```

### 2. Síntomas Comunes

| Síntoma | Causa Probable | Solución |
|---------|----------------|----------|
| Login redirige a `/auth/signin` en loop | Middleware bloqueando en producción | Desactivar middleware en prod (líneas 11-15) |
| `NEXTAUTH_SECRET` is missing | Variable no configurada en `.env` | Agregar variable al `.env` del VPS |
| "Failed to find user" | Tabla `User` no existe o está vacía | Verificar esquema Prisma |
| Callback error de Google | URLs no autorizadas | Configurar Google Console |

---

## 🔐 Variables de Entorno Requeridas

### Archivo `.env` en VPS (Producción)

**Ubicación**: `/home/gabriel/degux.cl/.env`

```bash
# =========================================
# 🗄️ BASE DE DATOS
# =========================================
POSTGRES_PRISMA_URL="postgresql://degux_user:REAL_PASSWORD@167.172.251.27:5433/degux?schema=public&sslmode=require"

# =========================================
# 🔐 NEXTAUTH.JS
# =========================================
# Generar con: openssl rand -base64 32
NEXTAUTH_SECRET="TU_SECRET_AQUI_MINIMO_32_CARACTERES"

# URL de producción
NEXTAUTH_URL="https://degux.cl"

# ⚠️ IMPORTANTE: NO habilitar debug en producción
# NEXTAUTH_DEBUG="false"

# =========================================
# 🔑 GOOGLE OAUTH
# =========================================
GOOGLE_CLIENT_ID="TU_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="TU_CLIENT_SECRET"

# =========================================
# 🗺️ GOOGLE MAPS API
# =========================================
GOOGLE_MAPS_API_KEY="TU_GOOGLE_MAPS_API_KEY"

# =========================================
# 🌐 AMBIENTE
# =========================================
NODE_ENV="production"
NEXT_TELEMETRY_DISABLED="1"
```

### Generar `NEXTAUTH_SECRET`

```bash
# En el VPS, generar secret seguro
openssl rand -base64 32
```

---

## 🗄️ Verificación de Base de Datos

### 1. Conectar a PostgreSQL

```bash
# Desde el VPS
ssh gabriel@167.172.251.27

# Conectar a PostgreSQL (puerto 5433 - degux)
docker exec -it degux-db psql -U degux_user -d degux
```

### 2. Verificar Tablas de NextAuth

```sql
-- Listar todas las tablas
\dt

-- Verificar estructura de tabla User
\d "User"

-- Verificar estructura de tabla Account
\d "Account"

-- Verificar estructura de tabla Session
\d "Session"

-- Contar usuarios existentes
SELECT COUNT(*) FROM "User";

-- Ver últimos usuarios creados
SELECT id, email, name, role, "createdAt"
FROM "User"
ORDER BY "createdAt" DESC
LIMIT 5;

-- Verificar cuentas OAuth conectadas
SELECT
  u.email,
  a.provider,
  a."providerAccountId"
FROM "Account" a
JOIN "User" u ON a."userId" = u.id
ORDER BY a."createdAt" DESC
LIMIT 5;
```

### 3. Aplicar Schema de Prisma

Si las tablas no existen o están desactualizadas:

```bash
# Dentro del contenedor degux-web
docker exec -it degux-web sh

# Generar Prisma Client
npx prisma generate

# Aplicar schema a la base de datos (CUIDADO: puede sobrescribir datos)
npx prisma db push

# Verificar tablas creadas
npx prisma studio
```

### 4. Script de Verificación de DB

Ejecutar desde VPS:

```bash
# Copiar y pegar este script
cat > check-db.sh << 'EOF'
#!/bin/bash

echo "🔍 Verificando Base de Datos degux..."
echo "========================================"

# Verificar conexión
docker exec degux-db psql -U degux_user -d degux -c "SELECT version();" > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Conexión a PostgreSQL exitosa"
else
  echo "❌ Error conectando a PostgreSQL"
  exit 1
fi

# Verificar tablas de NextAuth
echo ""
echo "📋 Tablas de NextAuth:"
docker exec degux-db psql -U degux_user -d degux -c "\dt" | grep -E "(User|Account|Session|VerificationToken)"

# Contar usuarios
echo ""
echo "👥 Total de usuarios:"
docker exec degux-db psql -U degux_user -d degux -c 'SELECT COUNT(*) as total_users FROM "User";'

echo ""
echo "✅ Verificación completa"
EOF

chmod +x check-db.sh
./check-db.sh
```

---

## 🔑 Configuración de Google OAuth

### 1. Google Cloud Console

**URL**: https://console.cloud.google.com/apis/credentials

### 2. Configurar OAuth 2.0 Client

1. **Crear credenciales** → OAuth 2.0 Client ID
2. **Tipo de aplicación**: Web application
3. **Nombre**: degux.cl Production

### 3. URIs de Redirección Autorizadas

```
https://degux.cl/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

⚠️ **IMPORTANTE**: Las URLs deben ser EXACTAS (sin trailing slash)

### 4. Orígenes JavaScript Autorizados

```
https://degux.cl
http://localhost:3000
```

### 5. Verificar Configuración

```bash
# Desde el VPS, verificar que las variables estén configuradas
docker exec degux-web printenv | grep GOOGLE
```

Deberías ver:
```
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
```

---

## 🐳 Deployment con Docker

### 1. Preparar Deployment

```bash
# En tu máquina local
cd ~/Documentos/degux.cl

# Verificar que .env.local tiene todas las variables
cat .env.local

# Asegurarte que Dockerfile está actualizado
cat Dockerfile
```

### 2. Build y Deploy

```bash
# Opción A: Usar el script de deployment automatizado
./scripts/deploy-to-vps.sh

# Opción B: Manual
# Build local
docker build -t degux-web:latest .

# Tag para registry (si usas uno)
docker tag degux-web:latest your-registry.com/degux-web:latest

# Push
docker push your-registry.com/degux-web:latest

# En VPS: Pull y restart
ssh gabriel@167.172.251.27 << 'EOF'
cd ~/degux.cl
docker compose pull degux-web
docker compose up -d degux-web
EOF
```

### 3. Verificar Deployment

```bash
# Ver logs en tiempo real
ssh gabriel@167.172.251.27 "docker logs degux-web --tail 100 -f"

# Verificar que el contenedor está corriendo
ssh gabriel@167.172.251.27 "docker ps | grep degux-web"

# Probar endpoint de health
curl https://degux.cl/api/health
```

---

## 🐛 Troubleshooting Común

### Problema 1: Middleware bloqueando en producción

**Síntoma**: Login exitoso pero redirige a `/auth/signin`

**Solución**: Deshabilitar middleware en producción

```typescript
// src/middleware.ts (líneas 11-15)
// 🔧 MODO DESARROLLO: Deshabilitar autenticación completa
if (process.env.NODE_ENV === 'development') {
  console.log(`🔧 [DEV MODE] Skipping auth for: ${pathname}`);
  return NextResponse.next();
}

// ⚠️ CAMBIAR TEMPORALMENTE PARA PRODUCCIÓN:
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') {
  console.log(`🔧 [DEV/PROD MODE] Skipping auth for: ${pathname}`);
  return NextResponse.next();
}
```

**Re-build y re-deploy**:
```bash
docker exec degux-web npm run build
docker restart degux-web
```

---

### Problema 2: `NEXTAUTH_SECRET` is missing

**Síntoma**: Error en logs al iniciar

**Solución**:

```bash
# En VPS, generar secret
openssl rand -base64 32

# Agregar a .env
echo 'NEXTAUTH_SECRET="TU_SECRET_GENERADO"' >> ~/degux.cl/.env

# Restart container
docker restart degux-web
```

---

### Problema 3: Tabla User no existe

**Síntoma**: `relation "User" does not exist`

**Solución**:

```bash
# Conectar al container
docker exec -it degux-web sh

# Aplicar schema
npx prisma db push

# Verificar
npx prisma studio
```

---

### Problema 4: Google OAuth callback error

**Síntoma**: Error 400 "redirect_uri_mismatch"

**Solución**:

1. Verificar en Google Console que la URL esté autorizada:
   ```
   https://degux.cl/api/auth/callback/google
   ```

2. Verificar que `NEXTAUTH_URL` en `.env` coincida:
   ```bash
   NEXTAUTH_URL="https://degux.cl"
   ```

3. Reiniciar contenedor:
   ```bash
   docker restart degux-web
   ```

---

## 🧪 Scripts de Diagnóstico

### Script 1: Verificar Variables de Entorno

```bash
#!/bin/bash
# check-env.sh

echo "🔍 Verificando Variables de Entorno..."
echo "========================================"

REQUIRED_VARS=(
  "POSTGRES_PRISMA_URL"
  "NEXTAUTH_SECRET"
  "NEXTAUTH_URL"
  "GOOGLE_CLIENT_ID"
  "GOOGLE_CLIENT_SECRET"
  "NODE_ENV"
)

MISSING_VARS=0

for VAR in "${REQUIRED_VARS[@]}"; do
  VALUE=$(docker exec degux-web printenv $VAR 2>/dev/null)

  if [ -z "$VALUE" ]; then
    echo "❌ $VAR: NO CONFIGURADA"
    MISSING_VARS=$((MISSING_VARS + 1))
  else
    # Ocultar valores sensibles
    MASKED_VALUE="${VALUE:0:10}..."
    echo "✅ $VAR: $MASKED_VALUE"
  fi
done

echo ""
if [ $MISSING_VARS -eq 0 ]; then
  echo "✅ Todas las variables requeridas están configuradas"
  exit 0
else
  echo "❌ Faltan $MISSING_VARS variables"
  exit 1
fi
```

### Script 2: Test de Autenticación

```bash
#!/bin/bash
# test-auth.sh

echo "🧪 Test de Autenticación..."
echo "============================"

# Test 1: API de NextAuth
echo ""
echo "1️⃣ Verificando API de NextAuth..."
curl -s https://degux.cl/api/auth/providers | jq .

# Test 2: Health check
echo ""
echo "2️⃣ Health check de la aplicación..."
curl -s https://degux.cl/api/health | jq .

# Test 3: Verificar redirección de login
echo ""
echo "3️⃣ Verificando redirección de login..."
curl -I https://degux.cl/dashboard 2>&1 | grep -E "(Location|HTTP)"

echo ""
echo "✅ Tests completados"
```

### Script 3: Logs de Autenticación

```bash
#!/bin/bash
# auth-logs.sh

echo "📜 Logs de Autenticación (últimos 50 eventos)..."
echo "================================================"

docker logs degux-web --tail 200 2>&1 | grep -E "\[AUTH-|MIDDLEWARE\]" | tail -50
```

---

## ✅ Checklist de Deployment

### Pre-deployment

- [ ] Variables de entorno configuradas en `.env`
- [ ] `NEXTAUTH_SECRET` generado (mínimo 32 caracteres)
- [ ] Google OAuth configurado correctamente
- [ ] Callback URLs autorizadas en Google Console
- [ ] Schema de Prisma sincronizado con BD
- [ ] Tabla `User` existe y está accesible
- [ ] Puerto 5433 accesible desde contenedor

### Durante Deployment

- [ ] Build exitoso (`docker build`)
- [ ] Imagen subida a registry (si aplica)
- [ ] Container iniciado correctamente
- [ ] Logs no muestran errores fatales
- [ ] Variables de entorno cargadas

### Post-deployment

- [ ] Health check responde OK
- [ ] API `/api/auth/providers` responde
- [ ] Login con Google funciona
- [ ] Usuario se crea en tabla `User`
- [ ] Dashboard accesible post-login
- [ ] No hay loops de redirección

---

## 🆘 Contactos de Emergencia

**Desarrollador Principal**: Gabriel Pantoja
**Email**: gabriel@pantojapropiedades.cl
**VPS IP**: 167.172.251.27
**Portainer**: https://167.172.251.27:9443

---

## 📚 Documentación Relacionada

- [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) - Guía completa de autenticación
- [DEPLOYMENT_GUIDE.md](./06-deployment/DEPLOYMENT_GUIDE.md) - Guía de deployment
- [PUERTOS_VPS.md](./06-deployment/PUERTOS_VPS.md) - Arquitectura de puertos

---

**Última actualización**: 2025-10-06
**Versión**: 1.0.0