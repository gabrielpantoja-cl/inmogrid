# 🧹 Análisis de Limpieza de Scripts - inmogrid.cl

**Fecha:** 2026-01-02
**Contexto:** Migración de referenciales.cl (plataforma inmobiliaria) → inmogrid.cl (plataforma colaborativa para marca personal con enfoque en plantas)

## 📋 Resumen Ejecutivo

**Total de scripts:** 28
**Para eliminar:** 13 (46%)
**Para conservar:** 15 (54%)

---

## ❌ ELIMINAR - Scripts Legacy de Referenciales.cl

### 1. **scrape-portal-inmobiliario.ts** 🗑️
- **Razón:** Genera datos falsos de propiedades inmobiliarias
- **Modelo:** Usa `PropertyListing` que NO existe en inmogrid.cl
- **Irrelevante para:** Plataforma de plantas y marca personal

### 2. **scrape-real-portal.ts** 🗑️
- **Razón:** Scraper real de Portal Inmobiliario con Puppeteer
- **Modelo:** Usa `PropertyListing` que NO existe
- **Función:** Extraer departamentos en venta - completamente irrelevante

### 3. **debug-portal.ts** 🗑️
- **Razón:** Debug de selectores de Portal Inmobiliario
- **Función:** Toma screenshots y analiza HTML de portales inmobiliarios
- **Irrelevante para:** inmogrid.cl

### 4. **generate-realistic-data.ts** 🗑️
- **Razón:** Genera datos de propiedades inmobiliarias con precios UF, m², etc.
- **Modelo:** Usa `PropertyListing` con campos inmobiliarios
- **Irrelevante para:** Plataforma de plantas

### 5. **test-api-public.sh** 🗑️
- **Razón:** Tests específicos para API de referenciales.cl
- **Menciones:** "referenciales.cl", "pantojapropiedades.cl"
- **Endpoints:** `/map-data`, `/map-config` que NO existen en inmogrid.cl
- **Comentario línea 37:** "API Pública de referenciales.cl"

### 6. **test-api-public.ps1** 🗑️
- **Razón:** Mismo que test-api-public.sh pero para Windows
- **Irrelevante:** Tests de API que no existe más

### 7. **check-redirects.js** 🗑️
- **Razón:** Verifica redirects específicos de fase de debugging auth legacy
- **Archivos que busca:** Incluye `referenciales/edit-form.tsx`, `referenciales/create-form.tsx`
- **Estado:** Problemas ya resueltos, script no aporta valor actual

### 8. **find-all-redirects.js** 🗑️
- **Razón:** Busca redirects problemáticos en código legacy
- **Archivos que busca:** `referenciales/edit-form.tsx`, `referenciales/create-form.tsx`
- **Estado:** Debugging histórico, no necesario actualmente

### 9. **check-images.js** ⚠️ 🗑️
- **Razón:** Necesito ver contenido, pero probablemente sea legacy
- **Acción:** Revisar y eliminar si es legacy

### 10. **verify-auth-config.js** ⚠️ 🗑️
- **Razón:** Verificación única de configuración auth
- **Acción:** Probablemente legacy de debugging

### 11. **verify-chat-module.js** ⚠️ 🗑️
- **Razón:** Verificar si el módulo chat aún existe
- **Acción:** Eliminar si el módulo fue removido

### 12. **migrate-auth-fix.sh** 🗑️
- **Razón:** Script de migración histórica de auth
- **Estado:** Migración ya completada, innecesario

### 13. **optimize-images.js** ⚠️
- **Razón:** Podría ser útil PERO necesito verificar si optimiza imágenes inmobiliarias específicamente
- **Acción:** Revisar contenido

---

## ✅ CONSERVAR - Scripts Útiles

### **Gestión de Base de Datos**

#### 1. **check-db.sh** ✅
- **Función:** Diagnóstico completo de PostgreSQL
- **Utilidad:** Verifica conectividad, tablas, datos de NextAuth
- **Adaptable:** Funciona con modelo actual (User, Post, Plant, etc.)

#### 2. **check-env.sh** ✅
- **Función:** Verifica variables de entorno
- **Utilidad:** Crítico para deployment y debugging

#### 3. **db-local-start.sh** ✅
- **Función:** Inicia base de datos local con Docker
- **Utilidad:** Desarrollo local

#### 4. **db-sync-from-prod.sh** ✅
- **Función:** Sincroniza DB desde producción
- **Utilidad:** Útil para debugging con datos reales

#### 5. **test-inmogrid-db.sh** ✅
- **Función:** Tests específicos de inmogrid.cl
- **Utilidad:** Verifica integridad de DB actual

### **Autenticación**

#### 6. **fix-oauth-account-not-linked.sh** ✅
- **Función:** Arregla problema de cuentas OAuth no vinculadas
- **Utilidad:** Útil para problemas de auth actuales

#### 7. **test-auth-local.sh** ✅
- **Función:** Tests de autenticación en local
- **Utilidad:** Desarrollo y debugging

#### 8. **test-auth.sh** ✅
- **Función:** Tests de autenticación generales
- **Utilidad:** QA y debugging

### **Deployment y VPS**

#### 9. **quick-deploy.sh** ✅
- **Función:** Deploy rápido a VPS sin esperar GitHub Actions
- **Utilidad:** Deployment ágil en producción

#### 10. **quick-fix-vps.sh** ✅
- **Función:** Fixes rápidos en VPS
- **Utilidad:** Emergencias de producción

#### 11. **emergency-recovery.sh** ✅
- **Función:** Recovery de emergencia del VPS
- **Utilidad:** Crítico para disaster recovery

#### 12. **setup-nginx-inmogrid.sh** ✅
- **Función:** Configura Nginx para inmogrid.cl
- **Utilidad:** Setup de infraestructura

#### 13. **setup-swap-vps.sh** ✅
- **Función:** Configura memoria swap en VPS
- **Utilidad:** Performance del servidor

### **Desarrollo**

#### 14. **check-mona-profile.ts** ✅ (CONSERVAR CON CAMBIOS)
- **Función:** Verifica perfil de usuario específico (Mona)
- **Utilidad:** Debugging de perfiles de usuario
- **Acción:** Renombrar a `check-user-profile.ts` y hacer genérico

---

## 🔧 Acciones Recomendadas

### Fase 1: Eliminar Scripts Legacy (AHORA)
```bash
rm scripts/scrape-portal-inmobiliario.ts
rm scripts/scrape-real-portal.ts
rm scripts/debug-portal.ts
rm scripts/generate-realistic-data.ts
rm scripts/test-api-public.sh
rm scripts/test-api-public.ps1
rm scripts/check-redirects.js
rm scripts/find-all-redirects.js
rm scripts/migrate-auth-fix.sh
```

### Fase 2: Revisar y Decidir (SIGUIENTE)
Leer contenido completo de:
- `check-images.js`
- `optimize-images.js`
- `verify-auth-config.js`
- `verify-chat-module.js`

### Fase 3: Refactorizar (FUTURO)
- Renombrar `check-mona-profile.ts` → `check-user-profile.ts`
- Hacer que reciba username como argumento
- Actualizar documentación de scripts conservados

---

## 📊 Impacto

**Espacio liberado:** ~100KB de código legacy
**Reducción de confusión:** Eliminación de referencias a referenciales.cl
**Mejora de mantenibilidad:** Solo scripts relevantes para inmogrid.cl
**Claridad:** Scripts conservados son 100% aplicables al proyecto actual

---

## 🎯 Criterios de Decisión Aplicados

1. ❌ **Menciona "referenciales.cl"** → ELIMINAR
2. ❌ **Menciona "Portal Inmobiliario"** → ELIMINAR
3. ❌ **Usa modelos inexistentes** (`PropertyListing`, `Referenciales`) → ELIMINAR
4. ❌ **Scraping inmobiliario** → ELIMINAR
5. ❌ **Tests de APIs eliminadas** → ELIMINAR
6. ❌ **Debugging histórico resuelto** → ELIMINAR
7. ✅ **Gestión de infraestructura actual** → CONSERVAR
8. ✅ **Autenticación y usuarios** → CONSERVAR
9. ✅ **Deployment y VPS** → CONSERVAR
10. ✅ **Debugging de modelos actuales** → CONSERVAR

---

**Preparado por:** Claude Code
**Fecha:** 2026-01-02
