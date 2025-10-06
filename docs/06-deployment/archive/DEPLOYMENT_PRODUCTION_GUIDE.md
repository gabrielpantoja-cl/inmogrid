# Guía de Deployment a Producción - degux.cl

**Última actualización**: 6 de Octubre, 2025
**Estado**: Automático con GitHub Actions + PM2
**Método**: Push a `main` → GitHub Actions → VPS (PM2)

---

## 🎯 Resumen

degux.cl usa **deployment automático** via GitHub Actions. Cada push a `main` despliega automáticamente a producción en el VPS usando PM2 para gestionar el proceso Node.js.

### Arquitectura de Deployment

```
Desarrollador
    ↓
git push origin main
    ↓
GitHub Actions (Build + Tests)
    ↓
SSH al VPS (VPS_IP_REDACTED)
    ↓
Pull + Build + PM2 Restart
    ↓
Nginx Proxy (Port 443)
    ↓
Cloudflare CDN
    ↓
Usuario Final
```

---

## ✅ Ventajas vs Vercel/Docker

- ✅ **Control total** sobre el servidor y configuración
- ✅ **Sin límites** de tiempo de ejecución o memoria
- ✅ **PostgreSQL dedicado** (port 5433) con PostGIS
- ✅ **PM2** para gestión de procesos y logs
- ✅ **Cloudflare** como CDN con cache control
- ✅ **Tests pre-deploy** automáticos
- ✅ **Rollback manual** simple con git
- ✅ **Cache control** granular con Next.js 15

---

## 🚀 Configuración Inicial (Ejecutar una sola vez)

### 1. Secrets en GitHub

Ir a: `https://github.com/gabrielpantoja-cl/degux.cl/settings/secrets/actions`

Crear los siguientes **Repository Secrets**:

| Secret | Valor |
|--------|-------|
| `VPS_HOST` | `VPS_IP_REDACTED` |
| `VPS_USER` | `gabriel` |
| `VPS_SSH_KEY` | Contenido completo de la clave privada SSH |

**Obtener clave SSH:**

```bash
# En local (donde haces SSH al VPS)
cat ~/.ssh/id_rsa

# Si no existe, crear nueva:
ssh-keygen -t rsa -b 4096 -C "deploy@degux.cl"
ssh-copy-id gabriel@VPS_IP_REDACTED

# Copiar TODA la clave privada (incluyendo headers):
# -----BEGIN OPENSSH PRIVATE KEY-----
# ...contenido...
# -----END OPENSSH PRIVATE KEY-----
```

---

### 2. Preparar VPS (Primera vez)

```bash
# Conectar al VPS
ssh gabriel@VPS_IP_REDACTED

# Instalar PM2 globalmente (si no existe)
npm install -g pm2
pm2 --version

# Clonar repositorio (si no existe)
cd /home/gabriel
git clone https://github.com/gabrielpantoja-cl/degux.cl.git
cd degux.cl

# Configurar variables de entorno
nano .env.local
```

**Contenido de `.env.local` en VPS:**

```env
# Database (PostgreSQL dedicado en port 5433)
POSTGRES_PRISMA_URL=postgresql://degux_user:PASSWORD@localhost:5433/degux_core?schema=public&sslmode=require

# NextAuth.js (Google OAuth)
GOOGLE_CLIENT_ID=tu_google_client_id_produccion
GOOGLE_CLIENT_SECRET=tu_google_client_secret_produccion
NEXTAUTH_URL=https://degux.cl
NEXTAUTH_SECRET=tu_secreto_seguro_minimo_32_caracteres

# Google Maps API
GOOGLE_MAPS_API_KEY=tu_maps_api_key_con_restricciones

# Revalidate Secret (para on-demand revalidation)
REVALIDATE_SECRET=secreto_para_invalidar_cache
```

---

### 3. Primera Instalación Manual

```bash
cd /home/gabriel/degux.cl

# Instalar dependencias (production mode)
npm ci

# Generar Prisma client
npm run prisma:generate

# Push schema a la base de datos (si es necesario)
npm run prisma:push

# Build de producción
npm run build

# Iniciar con PM2
pm2 start npm --name "degux-app" -- start
pm2 save
pm2 startup  # Ejecutar comando que muestra para autostart
```

---

### 4. Verificar Nginx

Nginx debe estar configurado como proxy reverso a `localhost:3000`.

```bash
sudo nano /etc/nginx/sites-available/degux.cl
```

**Configuración necesaria:**

```nginx
server {
    server_name degux.cl www.degux.cl;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts para Next.js
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }

    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/degux.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/degux.cl/privkey.pem;

    # Security headers (Next.js también envía headers)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}

server {
    listen 80;
    server_name degux.cl www.degux.cl;
    return 301 https://$host$request_uri;
}
```

**Reiniciar Nginx:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔄 Flujo de Deployment Automático

### Cada vez que haces `git push origin main`:

1. **GitHub Actions detecta el push** en rama `main`
2. **Ejecuta workflow** `.github/workflows/deploy-production.yml`:
   - Checkout del código
   - Setup de Node.js 20
   - `npm ci` (instala dependencias)
   - `npm run build` (verifica que compila localmente)
3. **SSH al VPS** usando `appleboy/ssh-action`
4. **Ejecuta en el VPS:**
   ```bash
   cd /home/gabriel/degux.cl
   git pull origin main
   npm ci
   npm run prisma:generate
   rm -rf .next/cache  # ← Limpia cache de Next.js
   npm run build
   pm2 restart degux-app --update-env  # ← Actualiza vars de entorno
   pm2 save
   ```
5. **Verifica health check** (opcional)
6. **Deployment completo** ✅

### Ver estado del deployment:

`https://github.com/gabrielpantoja-cl/degux.cl/actions`

---

## 🗂️ Gestión de Cache

degux.cl implementa estrategia de cache multi-nivel. **Ver guía detallada**: `NEXTJS_CACHE_GUIDE.md`

### Niveles de Cache

1. **Browser Cache** (`max-age`)
2. **Cloudflare CDN** (`s-maxage`)
3. **Next.js Static Generation**

### Cache Control Headers (Configurados en `next.config.js`)

| Tipo de Contenido | Cache-Control |
|-------------------|---------------|
| **Páginas HTML** | `max-age=0, s-maxage=3600, stale-while-revalidate=86400` |
| **Archivos estáticos** (`/_next/static/`) | `max-age=31536000, immutable` |
| **Imágenes** (`/images/`) | `max-age=86400, s-maxage=604800, stale-while-revalidate=2592000` |
| **API Pública** (`/api/public/`) | `max-age=60, s-maxage=300, stale-while-revalidate=600` |
| **APIs Privadas** (`/api/`) | `private, no-cache, no-store, must-revalidate` |

### Invalidar Cache

**1. On-demand Revalidation (Recomendado):**

```bash
curl -X POST "https://degux.cl/api/revalidate?secret=REVALIDATE_SECRET&path=/"
```

**2. Purgar Cloudflare:**

- Ir a Cloudflare Dashboard → Caching → Purge Everything
- O usar Cloudflare API

**3. Limpiar cache de Next.js (en deployment):**

Ya incluido en el workflow de GitHub Actions:
```bash
rm -rf .next/cache
```

---

## 📊 Comandos Útiles

### En el VPS (SSH)

```bash
# Ver estado de PM2
pm2 status

# Ver logs en tiempo real
pm2 logs degux-app

# Ver últimas 100 líneas de logs
pm2 logs degux-app --lines 100

# Ver solo errores
pm2 logs degux-app --err

# Restart manual
pm2 restart degux-app

# Restart con nuevas variables de entorno
pm2 restart degux-app --update-env

# Ver métricas (CPU, memoria)
pm2 monit

# Guardar configuración de PM2
pm2 save

# Ver última versión deployada
cd /home/gabriel/degux.cl
git log -1
```

### En Local

```bash
# Verificar build antes de push
npm run build

# Trigger deployment manual desde GitHub UI
# Ir a: Actions → Deploy to Production VPS → Run workflow

# Ver estado del último deployment (requiere gh CLI)
gh run list --workflow=deploy-production.yml
```

---

## 🔍 Troubleshooting

### 1. Deployment falla en GitHub Actions

**Verificar logs:**
- Ir a `https://github.com/gabrielpantoja-cl/degux.cl/actions`
- Click en el workflow fallido
- Revisar logs de cada step

**Errores comunes:**

| Error | Solución |
|-------|----------|
| `Permission denied (publickey)` | Verificar secret `VPS_SSH_KEY` contiene clave privada completa |
| `npm ERR! code ELIFECYCLE` | Verificar errores de build, revisar TypeScript/ESLint |
| `Killed` | VPS sin memoria, verificar build localmente primero |

### 2. La aplicación no inicia después del deploy

```bash
# En el VPS
cd /home/gabriel/degux.cl

# Ver logs de PM2
pm2 logs degux-app --lines 50

# Verificar variables de entorno
cat .env.local

# Verificar que build existe
ls -la .next

# Restart manual
pm2 delete degux-app
pm2 start npm --name "degux-app" -- start
pm2 save
```

### 3. Los cambios no se reflejan en producción

**Diagnóstico paso a paso:**

```bash
# 1. Verificar que código está actualizado en VPS
ssh gabriel@VPS_IP_REDACTED
cd /home/gabriel/degux.cl
git log -1  # Debe mostrar último commit

# 2. Verificar que build se ejecutó
ls -la .next/cache  # Debe estar vacío o no existir
ls -la .next/server  # Debe tener fecha reciente

# 3. Verificar PM2
pm2 status  # degux-app debe estar "online"
pm2 logs degux-app --lines 20

# 4. Verificar respuesta HTTP
curl -I http://localhost:3000/
# Debe mostrar headers correctos, sin x-nextjs-cache: HIT con s-maxage=31536000

# 5. Verificar Cloudflare
curl -I https://degux.cl/
# Revisar header cf-cache-status
```

**Si sigue mostrando contenido antiguo:**

```bash
# En el VPS: Force pull y rebuild
cd /home/gabriel/degux.cl
git fetch origin main
git reset --hard origin/main
rm -rf .next
npm ci
npm run build
pm2 restart degux-app

# Luego: Purgar Cloudflare cache
# Dashboard → Caching → Purge Everything
```

### 4. Error "Out of Memory" en build

El VPS tiene 4GB RAM, puede no ser suficiente para builds grandes.

**Solución:**

GitHub Actions hace el build y verifica, por lo que si falla en VPS:

```bash
# Opción 1: Aumentar swap en VPS
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Opción 2: Build con menos memoria
NODE_OPTIONS="--max-old-space-size=3072" npm run build

# Opción 3: Transferir build desde GitHub Actions (futuro)
```

### 5. Health Check falla

```bash
# Verificar que app responde
curl http://localhost:3000/api/health

# Verificar Nginx
sudo nginx -t
curl http://localhost:3000/

# Verificar SSL
curl https://degux.cl/api/health
```

---

## 🔙 Rollback a Versión Anterior

Si el último deploy rompió algo:

```bash
# En el VPS
cd /home/gabriel/degux.cl

# Ver commits recientes
git log --oneline -10

# Opción 1: Rollback al commit anterior
git reset --hard HEAD~1

# Opción 2: Rollback a commit específico
git reset --hard abc1234

# Rebuild y restart
npm ci
npm run prisma:generate
npm run build
pm2 restart degux-app

# IMPORTANTE: Purgar cache de Cloudflare después
```

---

## 📈 Monitoring y Logs

### PM2 Logs

```bash
# Logs en tiempo real
pm2 logs degux-app

# Logs persistentes (rotación automática)
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Métricas de Performance

```bash
# CPU y memoria en tiempo real
pm2 monit

# Ver métricas históricas (requiere PM2 Plus)
pm2 plus
```

### Logs de Nginx

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log

# Filtrar por dominio
sudo grep "degux.cl" /var/log/nginx/access.log
```

---

## 🔐 Seguridad

### Secrets Management

- ✅ Claves SSH encriptadas en GitHub Secrets
- ✅ Variables de entorno solo en `.env.local` (no en repo)
- ✅ SSL/TLS con Let's Encrypt (renovación automática)
- ✅ PM2 corre con usuario `gabriel` (no root)
- ✅ Nginx configurado con security headers
- ✅ Google OAuth con redirect URIs restringidas

### Mejoras Recomendadas

- [ ] Configurar fail2ban para protección SSH
- [ ] Implementar rate limiting en Nginx
- [ ] Configurar monitoreo con alertas (UptimeRobot)
- [ ] Backups automáticos de base de datos
- [ ] Implementar staging environment

---

## 📚 Documentación Relacionada

| Documento | Descripción |
|-----------|-------------|
| `NEXTJS_CACHE_GUIDE.md` | Guía detallada de cache de Next.js y Cloudflare |
| `PM2_GUIDE.md` | Gestión avanzada de PM2 |
| `AUTHENTICATION_GUIDE.md` | Configuración de Google OAuth |
| `.github/workflows/deploy-production.yml` | Workflow de GitHub Actions |

---

## 🎯 Checklist de Deployment

### Configuración Inicial (Una vez)
- [ ] Secrets configurados en GitHub
- [ ] SSH key copiada al VPS
- [ ] PM2 instalado en VPS
- [ ] Nginx configurado con proxy a :3000
- [ ] SSL/TLS generado con Let's Encrypt
- [ ] `.env.local` configurado en VPS
- [ ] Primera instalación manual completada
- [ ] PM2 configurado para autostart

### Cada Deployment
- [x] Build local exitoso (`npm run build`)
- [x] Tests pasando (si aplica)
- [x] Push a `main` realizado
- [x] GitHub Actions workflow completado
- [x] PM2 muestra status "online"
- [x] Health check responde OK
- [ ] Verificar en https://degux.cl que cambios están visibles
- [ ] Purgar cache de Cloudflare si es necesario

---

## 🆘 Soporte

**Si encuentras problemas:**

1. Revisar logs de GitHub Actions
2. Revisar logs de PM2 en VPS
3. Verificar configuración de Nginx
4. Consultar `NEXTJS_CACHE_GUIDE.md` para problemas de cache
5. Hacer rollback si es crítico

**Repositorio**: https://github.com/gabrielpantoja-cl/degux.cl

---

🤖 Documentación generada con Claude Code
