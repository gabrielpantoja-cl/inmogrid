# 🚨 Instrucciones de Recuperación de inmogrid.cl

**Guía rápida de diagnóstico y recuperación para incidentes de disponibilidad del sitio web.**

## 📖 Índice
- [Solución Rápida](#-solución-rápida-opción-1---recomendada)
- [Diagnóstico Manual](#-diagnóstico-manual)
- [Problemas Comunes](#-problemas-comunes-y-soluciones)
- [Verificación Post-Recuperación](#-verificación-post-recuperación)
- [Escalación](#-escalación)
- [Incidentes Anteriores](#-incidentes-anteriores)

## 📊 Síntomas Comunes de Incidentes

| Síntoma | Causa Probable | Solución Rápida |
|---------|----------------|-----------------|
| `ERR_NETWORK_CHANGED` en navegador | Contenedor unhealthy o caído | [Reinicio simple](#método-b-conectándote-directamente-al-vps) |
| Sitio muy lento o timeout | Contenedor sin recursos | [Verificar recursos](#verificar-recursos-del-sistema) |
| Error 502 Bad Gateway | nginx-proxy no puede contactar app | [Reiniciar contenedor](#1-contenedor-caído-exited) |
| Error 500 Internal Server Error | Error de aplicación | [Revisar logs](#ver-logs-de-inmogrid-web) |

---

## 🚀 Solución Rápida (Opción 1 - Recomendada)

### Método A: Desde tu máquina local

1. **Abre tu terminal** y ejecuta:
   ```bash
   ssh gabriel@VPS_IP_REDACTED 'bash -s' < scripts/quick-fix-vps.sh
   ```

   Esto ejecutará el script de recuperación automática en el VPS.

### Método B: Conectándote directamente al VPS

1. **Conéctate al VPS por SSH**:
   ```bash
   ssh gabriel@VPS_IP_REDACTED
   ```

2. **Ejecuta estos comandos** (copiar y pegar todo junto):
   ```bash
   cd /home/gabriel/vps-do

   # Ver estado actual
   docker ps -a | grep inmogrid-web

   # Reiniciar el contenedor
   docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml stop inmogrid-web
   docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml up -d inmogrid-web

   # Esperar 15 segundos
   sleep 15

   # Verificar que esté corriendo
   docker ps | grep inmogrid-web
   docker logs inmogrid-web --tail 20
   ```

3. **Verifica que el sitio esté funcionando**:
   ```bash
   curl -I https://inmogrid.cl
   ```

   Deberías ver `HTTP/2 200` en la respuesta.

---

## 🔧 Solución Completa (Opción 2 - Si la Opción 1 no funciona)

### Desde tu máquina local:

```bash
./scripts/emergency-recovery.sh
```

Este script interactivo te guiará a través de:
1. **Diagnóstico completo** del sistema
2. **Opciones de recuperación**:
   - Reinicio simple (rápido)
   - Rebuild completo con código actualizado
   - Reinicio de todos los servicios
3. **Verificación automática** del health del sitio

---

## 🔍 Diagnóstico Manual

Si quieres investigar qué está pasando antes de reiniciar:

```bash
ssh gabriel@VPS_IP_REDACTED
```

### Ver estado de contenedores:
```bash
docker ps -a
```

### Ver logs de inmogrid-web:
```bash
docker logs inmogrid-web --tail 100
```

### Ver logs en tiempo real:
```bash
docker logs -f inmogrid-web
```

### Verificar recursos del sistema:
```bash
df -h              # Espacio en disco
free -h            # Memoria RAM
docker stats       # Uso de recursos por contenedor
```

---

## 📋 Problemas Comunes y Soluciones

### 1. Contenedor caído (Exited)
**Síntoma**: `docker ps -a` muestra inmogrid-web como "Exited"
**Solución**:
```bash
cd /home/gabriel/vps-do
docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml up -d inmogrid-web
```

### 2. Contenedor reiniciándose constantemente
**Síntoma**: `docker ps` muestra "Restarting" en el status
**Solución**: Ver logs para identificar el error:
```bash
docker logs inmogrid-web --tail 100
```
Luego ejecutar rebuild:
```bash
cd /home/gabriel/vps-do
docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml down inmogrid-web
docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml up -d --build inmogrid-web
```

### 3. Error de Out of Memory (OOM)
**Síntoma**: Logs muestran errores de memoria
**Solución**: Reiniciar contenedor y revisar límites de memoria:
```bash
docker restart inmogrid-web
docker stats inmogrid-web
```

### 4. Error de base de datos
**Síntoma**: Logs muestran errores de conexión a PostgreSQL
**Solución**:
```bash
# Verificar que inmogrid-db esté corriendo
docker ps | grep inmogrid-db

# Si no está corriendo, iniciarlo
cd /home/gabriel/vps-do
docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml up -d inmogrid-db

# Esperar 10 segundos y reiniciar inmogrid-web
sleep 10
docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml restart inmogrid-web
```

### 5. Error de nginx-proxy (problema SSL/HTTPS)
**Síntoma**: HTTP funciona pero HTTPS no
**Solución**:
```bash
docker restart nginx-proxy
sleep 10
docker restart inmogrid-web
```

### 6. Disco lleno
**Síntoma**: `df -h` muestra 100% en `/dev/vda1`
**Solución**:
```bash
# Limpiar imágenes Docker no usadas
docker image prune -a -f

# Limpiar contenedores detenidos
docker container prune -f

# Limpiar volúmenes no usados
docker volume prune -f

# Limpiar build cache
docker builder prune -f
```

### 7. Contenedor "Unhealthy" (pero corriendo) ⚠️ NUEVO
**Síntoma**: `docker ps` muestra inmogrid-web como "Up X hours (unhealthy)"
**Causa**: Error de aplicación no capturado que falla los health checks
**Solución**:
```bash
cd /home/gabriel/vps-do

# 1. Revisar logs para identificar el error
docker logs inmogrid-web --tail 50

# 2. Reiniciar contenedor (solución más rápida)
docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml restart inmogrid-web

# 3. Verificar que vuelva a "healthy"
sleep 15
docker ps | grep inmogrid-web
# Debe mostrar: Up X seconds (healthy)

# 4. Verificar health check
curl https://inmogrid.cl/api/health
# Debe responder: {"status":"ok","database":"connected"}
```

**Nota**: Este fue el problema del incidente del 01-01-2026. Ver [Postmortem](#-incidentes-anteriores) para más detalles.

---

## 🎯 Verificación Post-Recuperación

Después de cualquier acción de recuperación, verifica:

1. **Estado del contenedor**:
   ```bash
   docker ps | grep inmogrid-web
   ```
   Debe mostrar "Up" en el status.

2. **Health check de la API**:
   ```bash
   curl https://inmogrid.cl/api/health
   ```
   Debe responder con: `{"status":"ok"}`

3. **Página principal**:
   ```bash
   curl -I https://inmogrid.cl
   ```
   Debe mostrar: `HTTP/2 200`

4. **Acceso desde navegador**:
   Abre https://inmogrid.cl en tu navegador

---

## 📞 Escalación

Si ninguna de las soluciones anteriores funciona:

1. **Revisar logs completos**:
   ```bash
   ssh gabriel@VPS_IP_REDACTED
   docker logs inmogrid-web > /tmp/inmogrid-web-logs.txt
   docker logs nginx-proxy > /tmp/nginx-proxy-logs.txt
   docker logs inmogrid-db > /tmp/inmogrid-db-logs.txt
   ```

2. **Verificar archivos de configuración**:
   ```bash
   cat /home/gabriel/vps-do/docker-compose.inmogrid.yml
   cat /home/gabriel/inmogrid.cl/.env.local
   ```

3. **Rebuild completo desde cero**:
   ```bash
   cd /home/gabriel/inmogrid.cl
   git pull origin main

   cd /home/gabriel/vps-do
   docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml down inmogrid-web
   docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml build --no-cache inmogrid-web
   docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml up -d inmogrid-web
   ```

4. **Contactar soporte de Digital Ocean**:
   - Dashboard: https://cloud.digitalocean.com
   - Verificar estado del VPS
   - Revisar métricas de CPU, RAM, disco

---

## 📚 Recursos Adicionales

- **Portainer (Dashboard Docker)**: https://VPS_IP_REDACTED:9443
- **Logs de N8N**: `docker logs n8n`
- **Documentación de deployment**: `docs/06-deployment/`
- **Documentación de arquitectura**: `docs/03-arquitectura/`

---

## 📁 Incidentes Anteriores

### 🔥 Incidente 01-01-2026: Contenedor Unhealthy
- **Fecha**: 2026-01-01
- **Duración**: ~5 horas unhealthy, 5 minutos de recuperación
- **Síntoma**: Sitio completamente inaccesible, error `ERR_NETWORK_CHANGED`
- **Causa raíz**: Error de JavaScript no capturado (`TypeError: reading 'aa'`) + ausencia de error boundaries globales
- **Solución**: Reinicio simple del contenedor
- **Mejoras implementadas**:
  - ✅ Creados `src/app/error.tsx` y `src/app/global-error.tsx` (error boundaries globales)
  - ✅ Documentación mejorada de recuperación
  - 🔄 Pendiente: Integración con servicio de error reporting (Sentry)
  - 🔄 Pendiente: Alertas automáticas cuando contenedor pasa a unhealthy

**Postmortem completo**: `docs/06-deployment/POSTMORTEM_2026-01-01_UNHEALTHY_CONTAINER.md`

---

## ✅ Checklist de Recuperación

- [ ] Verificar conectividad SSH al VPS
- [ ] Revisar estado de contenedores Docker
- [ ] Leer logs de inmogrid-web
- [ ] Reiniciar contenedor inmogrid-web
- [ ] Verificar health check (`/api/health`)
- [ ] Confirmar acceso desde navegador
- [ ] Revisar logs post-recuperación
- [ ] Documentar causa raíz del problema

---

---

## 🔗 Documentos Relacionados

- [POSTMORTEM_2026-01-01_UNHEALTHY_CONTAINER.md](./POSTMORTEM_2026-01-01_UNHEALTHY_CONTAINER.md) - Incidente contenedor unhealthy
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Guía de deployment completa
- [PUERTOS_VPS.md](./PUERTOS_VPS.md) - Arquitectura de puertos y contenedores

---

**Última actualización**: 2026-01-01
**Mantenedor**: Gabriel Pantoja
**VPS**: VPS_IP_REDACTED (Digital Ocean)
**Contributors**: Claude Code (AI Assistant)
