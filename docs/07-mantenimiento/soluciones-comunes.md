# 🚨 Soluciones Comunes - degux.cl

## 📋 Guía de Troubleshooting

Documentación consolidada de errores comunes y sus soluciones para el proyecto degux.cl.

---

## 🔧 Errores Críticos Resueltos

### ✅ Deployment Docker - Contenedor con Imagen Antigua
**Fecha Resolución:** 6 de Octubre, 2025
**Problema:** Contenedor ejecutando versión antigua, GitHub Actions falló silenciosamente
**Síntomas:**
- Contenedor marcado como "unhealthy"
- Código actualizado en VPS pero imagen Docker obsoleta
- Cambios no reflejados en producción

**Solución - Deployment Manual de Emergencia:**
```bash
# SSH al VPS
ssh gabriel@VPS_IP_REDACTED

# 1. Actualizar código
cd ~/degux.cl
git pull origin main

# 2. Rebuild imagen Docker (incluye todos compose files)
cd ~/vps-do
docker compose -f docker-compose.yml -f docker-compose.n8n.yml \
  -f docker-compose.degux.yml build degux-web

# 3. Recrear contenedor
docker compose -f docker-compose.yml -f docker-compose.n8n.yml \
  -f docker-compose.degux.yml up -d degux-web

# 4. Verificar deployment
docker ps | grep degux-web  # Debe mostrar (healthy)
curl -I https://degux.cl/api/health  # Debe responder 200
```

**Prevención:**
- Verificar GitHub Actions después de cada push
- Configurar notificaciones de workflow fallido
- Implementar health checks en el endpoint `/api/health`
- Revisar secrets en GitHub: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`

**Referencias:**
- `docs/06-deployment/DEPLOYMENT_GUIDE.md` - Guía completa
- `docs/06-deployment/SOLUCION_DEPLOYMENT_FINAL.md` - Caso resuelto

---

### ✅ CLIENT_FETCH_ERROR - NextAuth
**Problema:** Conflicto entre NextAuth v4 y Auth.js v5  
**Síntomas:** Error JSON en `/api/auth/signin`  
**Solución:** Limpieza de dependencias conflictivas

```bash
# Remover dependencias conflictivas
npm uninstall @auth/prisma-adapter auth

# Mantener NextAuth v4 estable
npm install @next-auth/prisma-adapter@latest
```

### ✅ @prisma/client did not initialize yet
**Problema:** Cliente Prisma no generado correctamente  
**Síntomas:** Error al conectar con base de datos  
**Solución:** Regeneración completa de Prisma

```bash
# Limpiar y regenerar Prisma
rm -rf .next node_modules/.prisma
npx prisma generate
npx prisma db push
```

### ✅ Fallbacks de imagen fallaron
**Problema:** Configuración de dominios incompleta  
**Síntomas:** Avatares de Google no cargan  
**Solución:** Actualización de next.config.js

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**',
      },
    ],
  },
}
```

---

## 🚀 Soluciones Automáticas

### Opción 1: Script de Reparación Rápida
```bash
#!/bin/bash
# fix-errors.sh

echo "🔧 Iniciando reparación automática..."

# Limpiar caché
rm -rf .next node_modules/.prisma

# Reinstalar dependencias
npm install

# Regenerar Prisma
npx prisma generate
npx prisma db push

# Verificar configuración
npm run build

echo "✅ Reparación completada"
```

### Opción 2: Limpieza Profunda
```bash
#!/bin/bash
# deep-clean.sh

echo "🧹 Limpieza profunda del proyecto..."

# Eliminar todos los caches
rm -rf .next
rm -rf node_modules
rm -rf node_modules/.prisma
rm -rf .npm

# Limpiar cache npm
npm cache clean --force

# Reinstalar desde cero
npm install

# Regenerar Prisma
npx prisma generate
npx prisma db push

# Verificar funcionamiento
npm run dev

echo "✅ Limpieza profunda completada"
```

---

## 🔍 Verificación de Estado

### Script de Verificación
```bash
#!/bin/bash
# verify-setup.sh

echo "🔍 Verificando configuración del proyecto..."

# Verificar variables de entorno
if [[ -z "$NEXTAUTH_SECRET" ]]; then
  echo "❌ NEXTAUTH_SECRET no configurado"
else
  echo "✅ NEXTAUTH_SECRET configurado"
fi

if [[ -z "$POSTGRES_PRISMA_URL" ]]; then
  echo "❌ POSTGRES_PRISMA_URL no configurado"
else
  echo "✅ POSTGRES_PRISMA_URL configurado"
fi

# Verificar dependencias críticas
npm ls @next-auth/prisma-adapter && echo "✅ NextAuth adapter OK" || echo "❌ NextAuth adapter faltante"
npm ls @prisma/client && echo "✅ Prisma client OK" || echo "❌ Prisma client faltante"

# Verificar Prisma
npx prisma validate && echo "✅ Schema Prisma válido" || echo "❌ Schema Prisma inválido"

echo "🏁 Verificación completada"
```

### Checklist Post-Reparación

#### 1. Verificar NextAuth
- [ ] Ir a `http://localhost:3000/api/auth/signin`
- [ ] No debe mostrar errores JSON
- [ ] Página de login debe cargar correctamente

#### 2. Verificar Prisma
- [ ] Dashboard debe cargar sin errores
- [ ] No debe mostrar "did not initialize yet"
- [ ] Consultas a base de datos funcionando

#### 3. Verificar Imágenes
- [ ] Avatares de Google deben cargar
- [ ] No debe mostrar errores de imagen
- [ ] Avatares de usuarios visibles en UI

---

## 🔧 Soluciones por Categoría

### 🔐 Problemas de Autenticación

#### Error: "Configuration invalid"
```bash
# Verificar configuración NextAuth
echo $NEXTAUTH_URL
echo $NEXTAUTH_SECRET
echo $GOOGLE_CLIENT_ID

# Regenerar secret si es necesario
openssl rand -base64 32
```

#### Error: "Session callback error"
```typescript
// lib/auth.config.ts
callbacks: {
  session: ({ session, token }) => {
    if (token) {
      session.user.id = token.id;
    }
    return session;
  },
  jwt: ({ user, token }) => {
    if (user) {
      token.id = user.id;
    }
    return token;
  },
}
```

### 💾 Problemas de Base de Datos

#### Error: "Connection timeout"
```bash
# Verificar conexión a PostgreSQL
npx prisma db pull

# Testear conexión directa
psql $DATABASE_URL
```

#### Error: "Migration failed"
```bash
# Reset completo de base de datos
npx prisma migrate reset
npx prisma db push
npx prisma generate
```

### 🖼️ Problemas de Imágenes

#### Error: "Image optimization failed"
```javascript
// next.config.js - Configuración completa
module.exports = {
  images: {
    remotePatterns: [
      // Google avatares
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // OpenStreetMap tiles
      {
        protocol: 'https',
        hostname: '*.tile.openstreetmap.org',
      },
    ],
  },
}
```

---

## 🚨 Errores Específicos y Soluciones

### API Routes No Funcionan

**Problema:** API endpoints retornan 404  
**Causa:** Estructura de carpetas incorrecta  
**Solución:**
```bash
# Verificar estructura
ls -la src/app/api/

# Debe existir:
# src/app/api/auth/[...nextauth]/route.ts
# src/app/api/public/map-data/route.ts
```

### Middleware Bloqueando Rutas

**Problema:** Rutas públicas requieren auth  
**Causa:** Configuración de middleware incorrecta  
**Solución:**
```typescript
// middleware.ts
export const config = {
  matcher: [
    // Excluir rutas públicas
    '/((?!api/public|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### Performance Issues

**Problema:** Carga lenta del dashboard  
**Causa:** Queries no optimizadas  
**Solución:**
```typescript
// Optimizar queries Prisma
const referenciales = await prisma.referencial.findMany({
  take: 50, // Limitar resultados
  select: { // Solo campos necesarios
    id: true,
    lat: true,
    lng: true,
    monto: true,
  }
});
```

---

## 📞 Escalation y Soporte

### Niveles de Soporte

#### Nivel 1: Auto-servicio
- Ejecutar scripts de reparación automática
- Consultar esta documentación
- Verificar logs de desarrollo

#### Nivel 2: Investigación
- Revisar logs de producción
- Analizar métricas de performance  
- Consultar documentación técnica avanzada

#### Nivel 3: Escalation
- Contactar equipo de desarrollo
- Reportar issues en GitHub
- Solicitar revisión de arquitectura

### Información para Reportar Issues

Incluir siempre:
```bash
# Información del sistema
node --version
npm --version
npx prisma --version

# Logs relevantes
npm run build 2>&1 | tee build.log
npm run dev 2>&1 | tee dev.log

# Variables de entorno (sin valores sensibles)
echo "NEXTAUTH_URL: ${NEXTAUTH_URL:-'not set'}"
echo "DATABASE_URL: ${DATABASE_URL:0:20}... (truncated)"
```

---

## 📈 Prevención de Errores

### Checklist Pre-Deploy

- [ ] **Variables de entorno**: Todas configuradas
- [ ] **Build success**: `npm run build` sin errores
- [ ] **Tests**: Todos los tests pasando  
- [ ] **Linting**: `npm run lint` sin warnings
- [ ] **Type checking**: `npx tsc --noEmit` sin errores

### Monitoreo Continuo

- [ ] **Health checks**: Endpoints de salud funcionando
- [ ] **Error tracking**: Logs de errores monitoreados
- [ ] **Performance**: Core Web Vitals tracking
- [ ] **Database**: Queries lentas identificadas

---

**Última actualización:** 28 de Agosto de 2025  
**Responsable:** Equipo de Desarrollo  
**Estado:** ✅ Errores críticos resueltos