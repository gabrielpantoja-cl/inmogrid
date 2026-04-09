# Guía de Deployment - inmogrid.cl

**Última actualización**: 6 de Octubre, 2025
**Arquitectura**: Docker Compose en VPS Digital Ocean

---

## 🏗️ Arquitectura

```
Internet → Cloudflare → VPS (VPS_IP_REDACTED)
                         ↓
                    nginx-proxy (Docker) :80, :443
                         ↓
                    inmogrid-web (Docker) :3000
                         ↓
                    PostgreSQL (Docker) :5433
```

**IMPORTANTE**: El VPS usa Docker Compose, NO servicios nativos (no PM2, no Nginx systemd).

---

## 🚀 Deploy Automatizado

### Método 1: Script Automatizado (Recomendado)

Desde tu máquina local:

```bash
cd ~/Documentos/inmogrid.cl
chmod +x scripts/deploy-to-vps.sh
./scripts/deploy-to-vps.sh
```

El script automáticamente:
1. ✅ Limpia PM2 si existe (instalado por error)
2. ✅ Pull cambios del repositorio en VPS
3. ✅ Rebuild imagen Docker
4. ✅ Reinicia contenedor inmogrid-web
5. ✅ Verifica health check
6. ✅ Valida acceso público

**Tiempo estimado**: 3-5 minutos

---

### Método 2: Deploy Manual Paso a Paso

Si prefieres control total:

```bash
# 1. SSH al VPS
ssh gabriel@VPS_IP_REDACTED

# 2. Limpiar PM2 (si existe)
pm2 delete inmogrid-app 2>/dev/null || true
pm2 kill 2>/dev/null || true

# 3. Actualizar código
cd ~/inmogrid.cl
git pull origin main

# 4. Rebuild contenedor
cd ~/vps-do
docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml build inmogrid-web
docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml up -d inmogrid-web

# 5. Verificar
docker logs inmogrid-web -f
```

---

## 🔍 Verificaciones Post-Deploy

### 1. Health Check Interno

```bash
# SSH al VPS
ssh gabriel@VPS_IP_REDACTED

# Test desde contenedor
docker exec inmogrid-web wget -q -O- http://localhost:3000/api/health

# Debe responder:
# {"status":"ok","timestamp":"...","service":"inmogrid.cl","database":"connected"}
```

### 2. Estado del Contenedor

```bash
# Ver estado
docker ps | grep inmogrid-web

# Debe mostrar:
# inmogrid-web    Up X minutes (healthy)
```

### 3. Acceso Público

```bash
# Desde cualquier lugar
curl -I https://inmogrid.cl/
# Debe responder: HTTP/2 200

curl https://inmogrid.cl/api/health
# Debe responder: {"status":"ok",...}
```

---

## 🔧 Gestión del Contenedor

### Ver Logs

```bash
# Logs en tiempo real
docker logs inmogrid-web -f

# Últimas 50 líneas
docker logs inmogrid-web --tail 50

# Solo errores
docker logs inmogrid-web --tail 100 | grep -i error
```

### Reiniciar Aplicación

```bash
cd ~/vps-do
docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml restart inmogrid-web
```

### Rebuild Completo

```bash
cd ~/vps-do

# Build nueva imagen
docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml build inmogrid-web

# Recrear contenedor
docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml up -d inmogrid-web
```

### Ver Variables de Entorno

```bash
docker exec inmogrid-web env | grep -E "DATABASE|NEXTAUTH|GOOGLE"
```

---

## 📊 Comandos Útiles

### Estado de Servicios

```bash
# Ver todos los contenedores
docker ps

# Filtrar solo inmogrid
docker ps | grep inmogrid

# Inspeccionar contenedor
docker inspect inmogrid-web --format '{{.State.Status}}'
docker inspect inmogrid-web --format '{{.State.Health.Status}}'
```

### Recargar Nginx Proxy

```bash
# Después de cambios en configs nginx
docker exec nginx-proxy nginx -s reload
```

### Test de Conectividad

```bash
# Desde nginx-proxy a inmogrid-web
docker exec nginx-proxy wget -O- http://inmogrid-web:3000/ | head -20

# Desde host
curl -I http://localhost/ -H "Host: inmogrid.cl"
```

---

## 🐛 Troubleshooting

### Problema: Contenedor Unhealthy

**Síntoma:**
```bash
docker ps
# inmogrid-web    Up X minutes (unhealthy)
```

**Solución:**
```bash
# 1. Ver logs de health check
docker logs inmogrid-web | grep health

# 2. Test manual
docker exec inmogrid-web wget --spider http://localhost:3000/api/health

# 3. Si falla, verificar que endpoint existe
docker exec inmogrid-web ls -la /app/src/app/api/health/

# 4. Rebuild si es necesario
cd ~/vps-do
docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml build inmogrid-web
docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml up -d inmogrid-web
```

---

### Problema: Contenedor con Imagen Antigua (GitHub Actions Falló)

**Síntoma:**
- Contenedor ejecutando versión antigua
- Cambios pusheados a GitHub pero no reflejados en producción
- GitHub Actions no ejecutó deployment correctamente

**Diagnóstico:**
```bash
# 1. Verificar versión del contenedor
docker exec inmogrid-web cat /app/package.json | grep version

# 2. Verificar último commit en VPS
ssh gabriel@VPS_IP_REDACTED 'cd ~/inmogrid.cl && git log -1 --oneline'

# 3. Verificar último commit en GitHub
git log -1 --oneline

# 4. Comparar: si difieren, la imagen Docker no se rebuildeó
```

**Solución - Deployment Manual de Emergencia:**
```bash
# Desde VPS:
ssh gabriel@VPS_IP_REDACTED

# 1. Actualizar código
cd ~/inmogrid.cl
git pull origin main

# 2. Rebuild imagen completa (incluye todos los compose files)
cd ~/vps-do
docker compose -f docker-compose.yml -f docker-compose.n8n.yml \
  -f docker-compose.inmogrid.yml build inmogrid-web

# 3. Recrear contenedor
docker compose -f docker-compose.yml -f docker-compose.n8n.yml \
  -f docker-compose.inmogrid.yml up -d inmogrid-web

# 4. Verificar deployment exitoso
docker ps | grep inmogrid-web  # Debe mostrar (healthy)
docker logs inmogrid-web --tail 20
curl -I https://inmogrid.cl/api/health  # Debe responder 200
```

**Prevención - Verificar GitHub Actions:**
- Revisar logs del workflow en GitHub Actions tab
- Verificar secrets configurados: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`
- Probar trigger manual del workflow
- Configurar notificaciones de workflow fallido

---

### Problema: Cambios no se reflejan

**Síntoma:** Hice cambios pero inmogrid.cl sigue mostrando versión antigua.

**Solución:**
```bash
# 1. Verificar que código está actualizado en VPS
ssh gabriel@VPS_IP_REDACTED
cd ~/inmogrid.cl
git pull origin main
git log -1  # Verificar último commit

# 2. Rebuild completo
cd ~/vps-do
docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml build --no-cache inmogrid-web
docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml up -d inmogrid-web

# 3. Purgar cache de Cloudflare
# Dashboard → Caching → Purge Everything
```

---

### Problema: Error de Base de Datos

**Síntoma:** Health check devuelve `database: "disconnected"`

**Solución:**
```bash
# 1. Verificar que PostgreSQL está corriendo
docker ps | grep postgres

# 2. Test conexión desde contenedor
docker exec inmogrid-web node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  prisma.\$connect()
    .then(() => console.log('✅ DB Connected'))
    .catch(e => console.error('❌ DB Error:', e));
"

# 3. Verificar variables de entorno
docker exec inmogrid-web env | grep POSTGRES

# 4. Verificar que .env está montado correctamente
docker exec inmogrid-web cat /app/.env | grep POSTGRES
```

---

### Problema: Puerto 3000 en uso

**Síntoma:** Error al iniciar contenedor, puerto ocupado.

**Solución:**
```bash
# Ver qué usa el puerto
ss -tlnp | grep :3000

# Si es PM2 (instalado por error)
pm2 delete inmogrid-app
pm2 kill

# Si es otro contenedor
docker ps | grep 3000
docker stop <container_id>

# Reintentar
cd ~/vps-do
docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml up -d inmogrid-web
```

---

## 📋 Checklist de Deploy

Antes de cada deploy:

- [ ] Código commiteado y pusheado a GitHub
- [ ] Build local exitoso: `npm run build`
- [ ] Tests pasando: `npm run test`
- [ ] Variables de entorno actualizadas en VPS (.env)
- [ ] Migrations aplicadas si hay cambios de DB

Durante deploy:

- [ ] Script ejecutado sin errores
- [ ] Health check verde (healthy)
- [ ] Logs sin errores críticos
- [ ] Acceso público funcional (https://inmogrid.cl/)

Post-deploy:

- [ ] Verificar endpoints críticos funcionan
- [ ] Verificar autenticación Google OAuth
- [ ] Verificar API pública accesible
- [ ] Purgar cache de Cloudflare si es necesario

---

## 🔐 Variables de Entorno Críticas

Ubicación en VPS: `/home/gabriel/inmogrid.cl/.env`

```env
# PostgreSQL (dedicada en puerto 5433)
POSTGRES_PRISMA_URL="postgresql://inmogrid_user:PASSWORD@VPS_IP_REDACTED:5433/inmogrid_core?schema=public&sslmode=require"

# NextAuth.js
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
NEXTAUTH_URL="https://inmogrid.cl"
NEXTAUTH_SECRET="..."

# Google Maps
GOOGLE_MAPS_API_KEY="..."
```

**IMPORTANTE**: Nunca committear `.env` al repositorio.

---

## 📚 Referencias

- **Docker Compose Files**: `/home/gabriel/vps-do/docker-compose*.yml`
- **Nginx Configs**: `/home/gabriel/vps-do/nginx/*.conf`
- **Arquitectura VPS**: `docs/06-deployment/PUERTOS_VPS.md`
- **Diagnóstico**: `docs/06-deployment/DIAGNOSTICO_DEPLOYMENT_2025-10-06.md`

---

## 🆘 Soporte

Si el deploy falla:

1. Revisa logs: `docker logs inmogrid-web -f`
2. Verifica estado: `docker ps`
3. Consulta documentación: `docs/06-deployment/`
4. Revisa issues en GitHub del proyecto

---

🤖 Documentación actualizada por Claude Code
📅 6 de Octubre, 2025
