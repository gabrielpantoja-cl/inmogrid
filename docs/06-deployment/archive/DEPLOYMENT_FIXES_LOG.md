# Log de Correcciones de Deployment - degux.cl

**Fecha**: 6 de Octubre, 2025
**Problema**: Producción mostraba versión antigua después de deployment

---

## 🔍 Diagnóstico Inicial

### Síntomas
1. ❌ Producción (https://degux.cl) mostraba contenido antiguo
2. ❌ Referencias a dominio antiguo "degux.cl"
3. ❌ Errores de GitHub API: `https://api.github.com/repos/TheCuriousSloth/degux 404`
4. ❌ Errores CSP: Cloudflare Insights bloqueado
5. ❌ Errores 404: `/_vercel/speed-insights/script.js`
6. ❌ Headers HTTP antiguos: `Cache-Control: s-maxage=31536000` (1 año)

### Causa Raíz Identificada

**Múltiples capas de cache sirviendo contenido antiguo:**

1. **Cloudflare CDN** - Cacheando HTML y assets
2. **Next.js Static Generation** - Páginas pre-renderizadas con headers antiguos
3. **Browser Cache** - Cache local del navegador
4. **Build incompleto en VPS** - Faltaba `.next/prerender-manifest.json`

---

## ✅ Correcciones Aplicadas

### 1. Actualización de Referencias de Dominio

**Archivos modificados:**

```bash
src/app/layout.tsx                              # metadataBase, applicationName
src/app/api/public/docs/route.ts               # Título de documentación
src/app/api/public/map-config/route.ts         # baseUrl
src/hooks/useReferencialMapData.ts             # DEFAULT_CONFIG baseUrl
src/components/ui/legal/CookieConsentBanner.tsx # "Referenciales.cl" → "degux.cl"
src/components/ui/dashboard/navbar.tsx         # Logo text
src/components/features/docs/DocsSidebar.tsx   # Footer text
src/app/api/chat/route.ts                      # FAQs content
```

**Comando usado:**
```bash
sed -i 's/referenciales\.cl/degux.cl/g' [archivos]
```

---

### 2. Deshabilitar Vercel Analytics (VPS Deployment)

**Problema**: Deployment en VPS propio (no Vercel) causaba errores 404:
- `/_vercel/speed-insights/script.js`
- `/_vercel/insights/script.js`

**Solución**:

```typescript
// src/components/ui/legal/ConditionalAnalytics.tsx

export function ConditionalVercelAnalytics() {
  // Deshabilitado para deployment en VPS (no Vercel)
  return null;
}

export function ConditionalSpeedInsights() {
  // Deshabilitado para deployment en VPS (no Vercel)
  return null;
}
```

---

### 3. Actualizar Content Security Policy (CSP)

**Problema**: Cloudflare Insights bloqueado por CSP

**Cambios en `next.config.js`:**

```diff
- script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://vercel.live/ https://va.vercel-scripts.com;
+ script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://static.cloudflareinsights.com;

- img-src 'self' blob: data: https://*.googleusercontent.com https://*.tile.openstreetmap.org https://vercel.app https://degux.cl;
+ img-src 'self' blob: data: https://*.googleusercontent.com https://*.tile.openstreetmap.org https://degux.cl https://www.degux.cl;
```

---

### 4. Configurar Cache-Control Headers

**Problema**: Next.js servía páginas estáticas con `s-maxage=31536000` (1 año)

**Solución en `next.config.js`:**

```javascript
async headers() {
  return [
    // Páginas HTML - cache corto
    {
      source: '/:path*',
      has: [{ type: 'header', key: 'accept', value: '(.*text/html.*)' }],
      headers: [{
        key: 'Cache-Control',
        value: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      }],
    },
    // Archivos estáticos con hash - inmutables
    {
      source: '/_next/static/:path*',
      headers: [{
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      }],
    },
    // API Pública - cache medio
    {
      source: '/api/public/:path*',
      headers: [{
        key: 'Cache-Control',
        value: 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
      }],
    },
  ];
}
```

**IMPORTANTE**: Los headers de `next.config.js` **NO se aplican** a páginas estáticas pre-renderizadas. Solo afectan a:
- Server Components dinámicos
- API Routes
- Assets en `/_next/static/`

---

### 5. Fix Build Incompleto en VPS

**Problema**: Build en VPS fallaba silenciosamente, faltaba:
- `.next/prerender-manifest.json`
- `.next/cache/` corrupto

**Solución**:

```bash
# En el VPS
cd ~/degux.cl
rm -rf .next
npm run build
pm2 restart degux-app
```

**Resultado**: Build completado exitosamente en ~2 minutos

---

### 6. Workflow de GitHub Actions Actualizado

**Cambios aplicados**:

```yaml
# .github/workflows/deploy-production.yml

- name: Deploy to VPS
  script: |
    cd /home/gabriel/degux.cl
    git pull origin main
    npm ci
    npm run prisma:generate
    rm -rf .next/cache  # ← NUEVO: Limpiar cache
    npm run build
    pm2 restart degux-app --update-env  # ← NUEVO: Actualizar env vars
    pm2 save
```

---

## 📊 Resultados

### Antes de las correcciones:
```
GET https://api.github.com/repos/TheCuriousSloth/degux 404
Refused to load script 'https://static.cloudflareinsights.com/beacon.min.js'
GET https://degux.cl/_vercel/speed-insights/script.js 404
Banner: "Referenciales.cl usa cookies"
```

### Después de las correcciones:
```
✅ Dominio correcto: "degux.cl" en todo el sitio
✅ CSP: Cloudflare Insights permitido
✅ Sin errores 404 de Vercel Analytics
✅ Build completo en VPS
✅ Headers HTTP configurados (pendiente regeneración de páginas)
```

---

## ⚠️ Limitaciones Conocidas

### 1. Headers de Páginas Estáticas

**Problema**: Las páginas pre-renderizadas en build-time tienen headers embebidos.

**Status**: Los headers de `next.config.js` están configurados correctamente, pero Next.js seguirá sirviendo páginas estáticas con los headers del momento del build.

**Solución a largo plazo**: Implementar ISR (Incremental Static Regeneration)

```typescript
// app/page.tsx
export const revalidate = 3600; // Regenerar cada hora
```

Ver: `docs/06-deployment/NEXTJS_CACHE_GUIDE.md`

---

### 2. Cloudflare Cache Persistence

**Problema**: Incluso después de "Purge Everything", Cloudflare puede mantener cache en algunos edge locations.

**Soluciones**:

1. **Esperar 5-10 minutos** después de purgar
2. **Hard refresh** en el navegador: `Ctrl+Shift+R` (Windows/Linux) o `Cmd+Shift+R` (Mac)
3. **Incognito mode** para evitar cache del navegador
4. **Purgar por URL específica** en Cloudflare Dashboard

---

## 🔧 Proceso de Deployment Final

### Checklist Completo

1. **Desarrollo Local**
   - [ ] Hacer cambios en código
   - [ ] Verificar build local: `npm run build`
   - [ ] Commit: `git commit -m "mensaje"`
   - [ ] Push: `git push origin main`

2. **GitHub Actions (Automático)**
   - [ ] Build y validación
   - [ ] SSH al VPS
   - [ ] `git pull`
   - [ ] `npm ci`
   - [ ] `npm run prisma:generate`
   - [ ] `rm -rf .next/cache`
   - [ ] `npm run build`
   - [ ] `pm2 restart degux-app`

3. **Verificación en VPS**
   ```bash
   ssh gabriel@VPS_IP_REDACTED
   cd ~/degux.cl

   # Verificar commit
   git log -1 --oneline

   # Verificar build
   ls .next/prerender-manifest.json

   # Verificar PM2
   npx pm2 status
   npx pm2 logs degux-app --lines 20

   # Verificar headers
   curl -I http://localhost:3000/
   ```

4. **Purgar Cloudflare**
   - [ ] Cloudflare Dashboard → Caching → Purge Everything
   - [ ] Esperar 5 minutos

5. **Verificación Final**
   ```bash
   # Desde local
   curl -I https://degux.cl/

   # Verificar en navegador (incognito)
   # Abrir https://degux.cl/
   # Revisar consola del navegador (F12)
   ```

---

## 📚 Documentación Creada

1. **DEPLOYMENT_PRODUCTION_GUIDE.md** - Guía consolidada de deployment
2. **VPS_MEMORY_OPTIMIZATION.md** - Solución al problema de memoria
3. **NEXTJS_CACHE_GUIDE.md** - Guía completa de cache
4. **PM2_GUIDE.md** - Gestión de procesos con PM2
5. **README.md** - Índice de documentación
6. **DEPLOYMENT_FIXES_LOG.md** - Este documento

---

## 🎯 Próximos Pasos Recomendados

### Corto Plazo (1 semana)

- [ ] Agregar swap de 2 GB en VPS para evitar OOM en builds
- [ ] Implementar ISR en páginas principales
- [ ] Configurar alertas de uptime (UptimeRobot, Pingdom)

### Mediano Plazo (1 mes)

- [ ] Implementar transfer de build desde GitHub Actions al VPS
- [ ] Configurar staging environment
- [ ] Implementar smoke tests post-deployment

### Largo Plazo (3 meses)

- [ ] Evaluar upgrade de VPS a 8 GB RAM
- [ ] Implementar Docker multi-stage builds
- [ ] Configurar CI/CD con tests automatizados

---

## 🆘 Troubleshooting Rápido

### Producción muestra versión antigua

```bash
# 1. Verificar deployment en VPS
ssh gabriel@VPS_IP_REDACTED "cd ~/degux.cl && git log -1"

# 2. Verificar PM2
ssh gabriel@VPS_IP_REDACTED "npx pm2 status"

# 3. Purgar Cloudflare
# Dashboard → Caching → Purge Everything

# 4. Hard refresh en navegador
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)
```

### Errores 404 de scripts

```bash
# Verificar que ConditionalAnalytics retorna null
grep -A 3 "ConditionalVercelAnalytics" src/components/ui/legal/ConditionalAnalytics.tsx
```

### Errores de CSP

```bash
# Verificar CSP en next.config.js
grep "script-src" next.config.js
```

---

## 📝 Commits Relacionados

1. `c01ba62` - Fix: Actualizar referencias de dominio de referenciales.cl a degux.cl
2. `5420ab8` - Fix: Actualizar branding final y deshabilitar Vercel Analytics

---

🤖 Documentación creada por Claude Code - degux.cl
