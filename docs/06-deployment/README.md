# Documentación de Deployment - degux.cl

Esta carpeta contiene toda la documentación relacionada con el deployment de degux.cl a producción.

## 📚 Guías Principales

### 1. [DEPLOYMENT_PRODUCTION_GUIDE.md](./DEPLOYMENT_PRODUCTION_GUIDE.md) ⭐ PRINCIPAL
**Guía completa de deployment automático con GitHub Actions + PM2**

Cubre:
- Configuración inicial (secrets, VPS, PM2)
- Flujo de deployment automático
- Gestión de cache multi-nivel (Browser, Cloudflare, Next.js)
- Troubleshooting completo
- Rollback procedures
- Monitoring y logs

**Usar esta guía para:**
- Setup inicial del deployment
- Diagnosticar problemas de producción
- Entender el flujo de deployment
- Realizar rollbacks

---

### 2. [NEXTJS_CACHE_GUIDE.md](./NEXTJS_CACHE_GUIDE.md)
**Guía especializada en cache de Next.js 15 + Cloudflare**

Cubre:
- Problema de cache estático (1 año por defecto)
- ISR (Incremental Static Regeneration)
- On-demand revalidation
- Cache-Control headers
- Cloudflare cache management

**Usar esta guía para:**
- Entender problemas de cache
- Configurar cache correctamente
- Purgar cache cuando sea necesario
- Implementar revalidation strategies

---

### 3. [PM2_GUIDE.md](./PM2_GUIDE.md)
**Guía de gestión de procesos con PM2**

Cubre:
- Comandos básicos de PM2
- Configuración de logs
- Monitoring y métricas
- Auto-restart y clustering
- Gestión de múltiples procesos

**Usar esta guía para:**
- Gestionar la aplicación en VPS
- Ver logs y métricas
- Configurar auto-restart
- Troubleshooting de procesos

---

## 🗂️ Archivo

La carpeta `archive/` contiene documentación antigua que ha sido consolidada:

- `degux-deployment-complete.md` - Deployment con Docker (obsoleto, ahora usamos PM2)
- `DEPLOYMENT_SETUP.md` - Primera versión de setup (consolidada en DEPLOYMENT_PRODUCTION_GUIDE.md)

---

## 🚀 Quick Start

### Primera vez deployando:
1. Leer **DEPLOYMENT_PRODUCTION_GUIDE.md** secciones "Configuración Inicial"
2. Configurar secrets en GitHub
3. Preparar VPS según la guía
4. Hacer primera instalación manual
5. Hacer push a `main` y verificar deployment automático

### Deployment rutinario:
1. Hacer cambios en local
2. Verificar build: `npm run build`
3. Push a `main`: `git push origin main`
4. Monitorear GitHub Actions
5. Verificar en https://degux.cl

### Problemas de cache:
1. Consultar **NEXTJS_CACHE_GUIDE.md**
2. Verificar headers: `curl -I https://degux.cl/`
3. Purgar cache de Cloudflare si es necesario
4. Usar on-demand revalidation: `/api/revalidate`

---

## 📊 Estado Actual

**Método de Deployment**: GitHub Actions + PM2 ✅
**VPS**: VPS_IP_REDACTED (Digital Ocean)
**Base de Datos**: PostgreSQL dedicado (port 5433)
**Proxy**: Nginx con SSL (Let's Encrypt)
**CDN**: Cloudflare
**Process Manager**: PM2

---

## 🔗 Links Útiles

- **GitHub Actions**: https://github.com/gabrielpantoja-cl/degux.cl/actions
- **Workflow Config**: `.github/workflows/deploy-production.yml`
- **Producción**: https://degux.cl
- **API Health**: https://degux.cl/api/health

---

🤖 Documentación mantenida por Claude Code
