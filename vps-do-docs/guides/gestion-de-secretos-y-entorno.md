# 🔒 Gestión Segura de Secretos y Variables de Entorno

## 🚨 Actualización de Seguridad - Septiembre 2025

**IMPORTANTE**: Este documento ha sido completamente actualizado tras identificar y resolver una vulnerabilidad crítica de seguridad donde credenciales reales estaban siendo trackeadas por Git. El nuevo sistema implementa múltiples capas de protección.

---

## Filosofía de Seguridad: Código Público, Secretos Privados

### Principio Fundamental
- **Código**: Toda la lógica, scripts y configuraciones no sensibles viven en Git
- **Secretos**: Credenciales JAMÁS se suben a Git, solo existen en entornos seguros
- **Separación**: Uso de archivos de plantilla y herramientas automatizadas

### Nueva Arquitectura de Archivos
```
.env.template       # ✅ Plantilla con instrucciones de generación (Git)
.env.example        # ✅ Ejemplos públicos seguros (Git)
.env.local          # 🔒 Desarrollo local (NO Git)
.env.production     # 🔒 Producción VPS (NO Git)
```

---

## 🛠️ Herramientas de Gestión Automatizada

### 1. Setup Inicial Seguro

#### Opción A: Generación Automática (Recomendada)
```bash
# Genera credenciales seguras automáticamente
./scripts/manage-secrets.sh setup
```

#### Opción B: Manual desde Template
```bash
# Copia plantilla y edita manualmente
cp .env.template .env.local
nano .env.local  # Reemplazar placeholders con valores reales
```

### 2. Validación de Seguridad
```bash
# Valida archivo local antes de usar
./scripts/manage-secrets.sh validate

# Valida archivo específico
./scripts/manage-secrets.sh validate .env.production
```

### 3. Sincronización Segura al VPS
```bash
# Sincroniza archivo local al servidor de forma segura
./scripts/manage-secrets.sh sync

# Con archivo específico
./scripts/manage-secrets.sh sync .env.production
```

---

## 🔐 Configuración de APIs Externas

### Gmail App Password (para n8n)
1. Ir a: https://myaccount.google.com/security
2. Navegar a: **2-Step Verification > App Passwords**
3. Generar nueva app password para "n8n"
4. Actualizar `GMAIL_APP_PASSWORD` en tu archivo `.env.local`

### Apify API Token
1. Ir a: https://console.apify.com/account/integrations
2. Crear nuevo **API Token**
3. Actualizar `APIFY_API_TOKEN` en tu archivo `.env.local`

### Supabase Keys
1. Ir a tu **Supabase Dashboard**
2. Obtener `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_KEY`
3. Actualizar en tu archivo `.env.local`

---

## 🚨 Procedimiento de Emergencia: Credenciales Comprometidas

### Respuesta Inmediata
```bash
# 1. Rotar APIs externas (mostrar instrucciones)
./scripts/rotate-credentials.sh external

# 2. Rotar todas las credenciales internas automáticamente
./scripts/rotate-credentials.sh all

# 3. Validar nuevas credenciales
./scripts/manage-secrets.sh validate

# 4. Sincronizar al VPS
./scripts/manage-secrets.sh sync

# 5. Verificar estado de rotación
./scripts/rotate-credentials.sh status
```

### Rotación Específica por Servicio
```bash
# Solo n8n
./scripts/rotate-credentials.sh n8n

# Solo Supabase
./scripts/rotate-credentials.sh supabase

# Verificar estado
./scripts/rotate-credentials.sh status
```

---

## 📋 Flujo de Trabajo Actualizado

### 1. Desarrollo Local (Primera vez)
```bash
# Configurar entorno local seguro
./scripts/manage-secrets.sh setup

# Actualizar APIs externas manualmente
nano .env.local  # Agregar Gmail, Apify, Supabase keys

# Validar configuración
./scripts/manage-secrets.sh validate
```

### 2. Despliegue a Producción (Primera vez)
```bash
# Conectar al VPS
ssh gabriel@VPS_IP_REDACTED

# Navegar al proyecto
cd vps-do

# Actualizar código
git pull

# Sincronizar credenciales desde local
exit  # Volver a local

# Sincronizar archivo local al VPS
./scripts/manage-secrets.sh sync

# Conectar nuevamente y reiniciar servicios
ssh gabriel@VPS_IP_REDACTED
cd vps-do && ./scripts/deploy.sh restart
```

### 3. Actualizaciones de Código (Rutina)
```bash
# En local: subir cambios
git add .
git commit -m "Tu mensaje"
git push

# En VPS: actualizar y reiniciar
ssh gabriel@VPS_IP_REDACTED
cd vps-do
git pull
./scripts/deploy.sh restart
```

### 4. Actualizar Secretos en Producción
```bash
# Actualizar local
nano .env.local

# Validar cambios
./scripts/manage-secrets.sh validate

# Sincronizar al VPS
./scripts/manage-secrets.sh sync

# Reiniciar servicios afectados
ssh gabriel@VPS_IP_REDACTED "cd vps-do && ./scripts/deploy.sh restart [servicio]"
```

---

## 🔧 Comandos Útiles de Gestión

### Generación Manual de Credenciales
```bash
# Generar diferentes tipos de credenciales
./scripts/manage-secrets.sh generate

# Output:
# Secure password (32 chars): [password]
# Hex key (64 chars): [key]
# JWT secret (64 chars): [secret]
```

### Monitoreo y Diagnóstico
```bash
# Estado de servicios en VPS
ssh gabriel@VPS_IP_REDACTED "cd vps-do && ./scripts/deploy.sh status"

# Logs de servicios
ssh gabriel@VPS_IP_REDACTED "cd vps-do && ./scripts/deploy.sh logs [servicio]"

# Verificar que .env no está en Git
git ls-files | grep -E '\\.env$' || echo "✅ .env no está trackeado"
```

---

## 📊 Checklist de Seguridad

### ✅ Verificaciones Diarias
- [ ] `.env.local` existe y está actualizado
- [ ] `./scripts/manage-secrets.sh validate` pasa sin errores
- [ ] Servicios funcionando: `./scripts/deploy.sh status`

### ✅ Verificaciones Semanales
- [ ] Backup de `.env.local` actualizado
- [ ] No hay credenciales débiles: `./scripts/rotate-credentials.sh status`
- [ ] Logs de servicios sin errores críticos

### ✅ Verificaciones Mensuales
- [ ] Rotación preventiva de credenciales críticas
- [ ] Revisión de permisos y accesos
- [ ] Actualización de dependencias

---

## 🚨 Mejores Prácticas de Seguridad

### ❌ NUNCA hacer:
- Commitear archivos con credenciales reales
- Usar contraseñas débiles o predecibles
- Compartir credenciales por medios inseguros
- Ignorar alertas de validación del script
- Reutilizar contraseñas entre servicios

### ✅ SIEMPRE hacer:
- Usar `./scripts/manage-secrets.sh setup` para nuevos entornos
- Validar con `./scripts/manage-secrets.sh validate` antes de deploy
- Crear backups antes de cambios importantes
- Rotar credenciales comprometidas inmediatamente
- Documentar cambios de configuración

---

## 🔄 Diagrama del Flujo Actualizado

```
 Tu PC (Local)              │     GitHub       │      VPS (Producción)
────────────────────────────┼──────────────────┼────────────────────────
 código + .env.local        │                  │
      │                     │                  │
      ├─> git push ─────────>  código          │
      │                           │             │
      └─> manage-secrets.sh sync  │             │
                │                 └─> git pull ──> código
                │                                 │
                └─────────────────────────────────> .env (seguro)
                                                  │
 (desarrollo local)          │                  │  ./scripts/deploy.sh
```

---

## 📞 Soporte y Contacto

**Para vulnerabilidades críticas**: Contacto directo inmediato
**Para mejoras**: Issues en GitHub (sin incluir credenciales)
**Documentación**: Este archivo y `CLAUDE.md`

---

**Última actualización**: 2025-09-20
**Versión**: 2.0 (Sistema post-incident completamente renovado)
**Estado**: ✅ Implementado y operativo con herramientas automatizadas