# 🚀 Deployment - degux.cl

Documentación completa de deployment para el ecosistema degux.cl.

---

## 📚 Índice de Documentación

### 🎯 Documentos Principales

#### 1. DEPLOYMENT_GUIDE.md ⭐ **EMPIEZA AQUÍ**
**Propósito**: Guía completa de deployment paso a paso
**Cuándo usar**:
- Hacer deployment manual al VPS
- Entender el proceso automatizado
- Troubleshooting de deployments

**Contenido**:
- Arquitectura de deployment (Docker)
- Método automatizado con script
- Método manual paso a paso
- Verificación de deployment
- Troubleshooting común

**Tiempo de lectura**: 15-20 minutos

---

#### 2. SISTEMA_ACTUAL_2025-10-11.md
**Propósito**: Documentación completa del estado actual del sistema
**Cuándo usar**:
- Entender la arquitectura completa del VPS
- Ver configuración de todos los servicios
- Referencia de puertos y contenedores

**Contenido**:
- Estado de todos los servicios Docker
- Configuración de Nginx, PostgreSQL, N8N
- Variables de entorno
- Configuración de backups

**Tiempo de lectura**: 30-40 minutos

---

#### 3. PUERTOS_VPS.md
**Propósito**: Mapeo de puertos y arquitectura de contenedores
**Cuándo usar**:
- Verificar qué servicio corre en qué puerto
- Troubleshoot problemas de conectividad
- Configurar nuevos servicios

**Contenido**:
- Tabla completa de puertos
- Arquitectura de red Docker
- Configuración de firewall

**Tiempo de lectura**: 10 minutos

---

#### 4. RECOVERY_INSTRUCTIONS.md
**Propósito**: Procedimientos de recuperación ante desastres
**Cuándo usar**:
- Sistema caído o inaccesible
- Recuperación de backups
- Emergencias de producción

**Contenido**:
- Procedimientos de recuperación
- Restauración de backups
- Troubleshooting de emergencias

**Tiempo de lectura**: 15 minutos (leer ANTES de necesitarlo)

---

#### 5. RESILIENCIA_Y_ERROR_HANDLING.md
**Propósito**: Mejores prácticas de resiliencia y manejo de errores
**Cuándo usar**:
- Desarrollar nuevas features
- Mejorar robustez del sistema
- Implementar error handling

**Contenido**:
- Patrones de resiliencia
- Estrategias de retry
- Circuit breakers
- Logging y monitoring

**Tiempo de lectura**: 25 minutos

---

#### 6. BACKEND_AUTH_DEPLOYMENT_GUIDE.md
**Propósito**: Deployment específico de autenticación
**Cuándo usar**:
- Troubleshoot problemas de Google OAuth
- Verificar configuración de autenticación
- Deployment de cambios de auth

**Contenido**:
- Configuración de Google OAuth
- Variables de entorno de auth
- Troubleshooting de autenticación
- Scripts de verificación

**Tiempo de lectura**: 20 minutos

---

#### 7. BACKEND_TROUBLESHOOTING.md
**Propósito**: Troubleshooting general de backend
**Cuándo usar**:
- Diagnosticar problemas de producción
- Verificar logs y estado del sistema
- Resolver errores comunes

**Contenido**:
- Checklist de diagnóstico rápido
- Problemas comunes y soluciones
- Scripts de verificación
- Logs y debugging

**Tiempo de lectura**: 15 minutos

---

### 📋 Postmortems

**Carpeta**: `postmortems/`

Documentación de incidentes pasados y lecciones aprendidas:

- **2025-10-07_DISK_FULL.md**: Disco lleno por logs sin rotación
- **2025-10-17_SERVICE_OUTAGE.md**: Caída de servicio múltiple
- **2026-01-01_UNHEALTHY_CONTAINER.md**: Container unhealthy

**Cuándo leer**:
- Aprender de incidentes pasados
- Entender problemas recurrentes
- Implementar mejoras preventivas

---

### 📦 Archivo Histórico

**Carpeta**: `archive/`

Documentos obsoletos preservados para referencia histórica:
- `archive/2025-10/`: Documentos de octubre 2025 (obsoletos)

**No necesitas leer estos documentos** - están archivados porque:
- Información ya incorporada en docs actuales
- Problemas ya resueltos
- Snapshots históricos puntuales

---

## 🗺️ Rutas de Lectura Sugeridas

### Para Deployment Rápido (15 min)
1. DEPLOYMENT_GUIDE.md - Sección "Deploy Automatizado"
2. Ejecutar: `./scripts/deploy-to-vps.sh`

### Para Entender el Sistema Completo (60 min)
1. DEPLOYMENT_GUIDE.md (20 min)
2. SISTEMA_ACTUAL_2025-10-11.md (30 min)
3. PUERTOS_VPS.md (10 min)

### Para Troubleshooting (30 min)
1. BACKEND_TROUBLESHOOTING.md (15 min)
2. DEPLOYMENT_GUIDE.md - Sección "Troubleshooting" (10 min)
3. RECOVERY_INSTRUCTIONS.md - Escanear (5 min)

### Para Desarrollo (45 min)
1. RESILIENCIA_Y_ERROR_HANDLING.md (25 min)
2. SISTEMA_ACTUAL_2025-10-11.md (20 min)

### Para Problemas de Autenticación (20 min)
1. BACKEND_AUTH_DEPLOYMENT_GUIDE.md (20 min)

---

## 🚀 Comandos Rápidos

### Deployment Automatizado
```bash
# Desde tu máquina local
./scripts/deploy-to-vps.sh
```

### Verificación Rápida
```bash
# Conectar al VPS
ssh gabriel@VPS_IP_REDACTED

# Ver estado de contenedores
docker ps

# Ver logs de degux-web
docker logs degux-web --tail 50 -f

# Health check
curl https://degux.cl/api/health
```

### Recovery de Emergencia
```bash
# Ver RECOVERY_INSTRUCTIONS.md para procedimientos completos
ssh gabriel@VPS_IP_REDACTED
cd /home/gabriel/vps-do
docker compose up -d degux-web
```

---

## 📝 Configuración de Archivos

### dns-degux.cl.txt
Configuración DNS de producción (Cloudflare)

---

## ✅ Checklist de Deployment

Antes de hacer deployment a producción:

- [ ] Tests pasando localmente (`npm run test`)
- [ ] Build exitoso localmente (`npm run build`)
- [ ] Variables de entorno configuradas en VPS
- [ ] Backup reciente de base de datos
- [ ] Revisión de cambios en PR
- [ ] Merge a rama `main`
- [ ] Ejecutar `./scripts/deploy-to-vps.sh`
- [ ] Verificar health check: `https://degux.cl/api/health`
- [ ] Verificar funcionalidad principal
- [ ] Monitorear logs por 5-10 minutos

---

## 🔗 Enlaces Útiles

- **VPS**: VPS_IP_REDACTED
- **Producción**: https://degux.cl
- **Health Check**: https://degux.cl/api/health
- **N8N**: http://VPS_IP_REDACTED:5678
- **Portainer**: https://VPS_IP_REDACTED:9443

---

## 📞 Soporte

Si tienes problemas:
1. Consulta BACKEND_TROUBLESHOOTING.md
2. Revisa logs: `docker logs degux-web`
3. Consulta postmortems para problemas similares
4. Usa RECOVERY_INSTRUCTIONS.md para emergencias

---

**Última actualización**: 2026-01-03
**Mantenedor**: Gabriel (gabriel@degux.cl)
