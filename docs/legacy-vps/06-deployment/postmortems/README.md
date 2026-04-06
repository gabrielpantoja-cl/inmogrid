# 📋 Postmortems - degux.cl

Documentación de incidentes y lecciones aprendidas.

---

## Índice de Postmortems

### 2025-10-07: Disco Lleno
**Archivo**: `2025-10-07_DISK_FULL.md`
- **Severidad**: Alta
- **Duración**: ~2 horas
- **Causa raíz**: Logs sin rotación, builds sin limpieza
- **Lecciones**: Implementar rotación de logs, limpieza automática

### 2025-10-17: Caída de Servicio
**Archivo**: `2025-10-17_SERVICE_OUTAGE.md`
- **Severidad**: Crítica
- **Duración**: Variable
- **Causa raíz**: Múltiples factores (contenedores, base de datos, red)
- **Lecciones**: Mejorar monitoreo, health checks, recuperación automática

### 2026-01-01: Contenedor Unhealthy
**Archivo**: `2026-01-01_UNHEALTHY_CONTAINER.md`
- **Severidad**: Media-Alta
- **Duración**: ~1 hora
- **Causa raíz**: Health check fallando, configuración incorrecta
- **Lecciones**: Validar health checks, mejorar logs de diagnóstico

---

## Acciones Preventivas Implementadas

✅ Rotación automática de logs (logrotate)
✅ Limpieza periódica de Docker images (`docker image prune`)
✅ Health checks mejorados en contenedores
✅ Monitoreo de disco con alertas
✅ Backups automáticos diarios
✅ Procedimientos de recuperación documentados

---

## Formato de Postmortem

Cada postmortem sigue este formato estándar:
1. **Resumen Ejecutivo**: Qué pasó, cuándo, impacto
2. **Timeline**: Secuencia de eventos
3. **Causa Raíz**: Análisis técnico
4. **Impacto**: Usuarios afectados, tiempo de inactividad
5. **Resolución**: Qué se hizo para resolver
6. **Lecciones Aprendidas**: Qué aprendimos
7. **Acciones Correctivas**: Qué haremos para prevenir
8. **Referencias**: Links a PRs, issues, docs relacionados

---

**Última actualización**: 2026-01-03
