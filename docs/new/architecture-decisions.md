# Degux - Decisiones de Arquitectura (ADRs)

**Architecture Decision Records para el proyecto Degux**

---

## ADR-001: Compartir contenedor PostgreSQL con N8N

**Fecha**: 01 de Octubre, 2025
**Estado**: ✅ Aceptado e Implementado
**Contexto**: Degux necesita una base de datos PostgreSQL con soporte PostGIS

### Decisión

Usar el contenedor PostgreSQL existente de N8N (`n8n-db`) creando una base de datos independiente dentro del mismo servidor, en lugar de desplegar un contenedor PostgreSQL dedicado.

### Alternativas Consideradas

1. **Contenedor PostgreSQL dedicado** (rechazada)
   - Pros: Aislamiento total a nivel de contenedor
   - Contras: ~600MB RAM adicional, complejidad operacional, costos de gestión

2. **Servicio PostgreSQL externo (Neon, RDS)** (rechazada)
   - Pros: Totalmente gestionado, escalable
   - Contras: $20-50/mes adicionales, latencia de red, vendor lock-in

3. **Contenedor compartido con bases de datos separadas** (✅ aceptada)
   - Pros: Optimización de recursos, costo cero, aislamiento lógico completo
   - Contras: Dependencia del contenedor n8n-db

### Justificación

- **Optimización**: Solo ~300MB RAM adicional vs ~600MB con contenedor dedicado
- **Costo**: $0 adicional vs $20-50/mes con servicios externos
- **Simplicidad**: Un solo contenedor PostgreSQL para gestionar
- **Seguridad**: Aislamiento lógico es suficiente (bases de datos, usuarios, permisos separados)
- **Escalabilidad**: PostgreSQL 15 maneja múltiples BD sin problemas hasta ~100GB cada una

### Consecuencias

**Positivas:**
- Ahorro significativo de recursos (~50% menos RAM)
- Cero costos adicionales de infraestructura
- Backups centralizados con scripts separados
- Actualización de imagen beneficia ambos servicios

**Negativas:**
- N8N y Degux comparten el mismo servidor PostgreSQL (mitigado con usuarios/permisos separados)
- Reinicio de n8n-db afecta ambos servicios (mitigado con restart: unless-stopped)

**Mitigaciones:**
- Health checks en n8n-db para detección temprana de problemas
- Backups independientes por base de datos
- Monitoring de uso de recursos compartidos

---

## ADR-002: Actualización a imagen PostGIS

**Fecha**: 01 de Octubre, 2025
**Estado**: ✅ Aceptado e Implementado
**Contexto**: Degux requiere funciones geoespaciales (mapas, ubicaciones, áreas)

### Decisión

Actualizar la imagen Docker de n8n-db de `postgres:15-alpine` a `postgis/postgis:15-3.4` para habilitar soporte PostGIS.

### Alternativas Consideradas

1. **Mantener postgres:15-alpine e instalar PostGIS manualmente** (rechazada)
   - Pros: Menor tamaño de imagen (~50MB menos)
   - Contras: Configuración manual compleja, difícil de mantener, no reproducible

2. **Usar postgres:15 (Debian)** (rechazada)
   - Pros: Más flexible para instalar extensiones
   - Contras: Imagen más pesada (~300MB vs ~150MB alpine), sin PostGIS por defecto

3. **Usar postgis/postgis:15-3.4** (✅ aceptada)
   - Pros: PostGIS preinstalado, imagen oficial, fácil mantenimiento
   - Contras: Imagen ligeramente más pesada que alpine (~100MB adicionales)

### Justificación

- PostGIS es un requisito core para Degux (funciones de geolocalización)
- Imagen oficial `postgis/postgis` es mantenida y confiable
- PostgreSQL 15 + PostGIS 3.4 es una combinación estable y probada
- No afecta a N8N (PostgreSQL sigue siendo 100% compatible)

### Consecuencias

**Positivas:**
- PostGIS 3.4 disponible out-of-the-box
- Degux puede usar funciones geoespaciales nativas
- N8N también puede usar PostGIS si lo necesita en el futuro
- Mantenimiento simplificado (actualizaciones de imagen)

**Negativas:**
- Imagen ~100MB más pesada (mitigación: beneficio justifica el costo)
- Require backup antes de actualizar (realizado exitosamente)

---

## ADR-003: Arquitectura de deployment Vercel + VPS Database

**Fecha**: 01 de Octubre, 2025
**Estado**: 🔄 Propuesto (pendiente de implementación)
**Contexto**: Decidir dónde hostear la aplicación Next.js de Degux

### Decisión (Propuesta)

Desplegar la aplicación Next.js en **Vercel** (frontend + API Routes) conectando a la base de datos PostgreSQL en el VPS.

### Alternativas Consideradas

1. **Todo en VPS (Next.js en Docker)** (considerada)
   - Pros: Todo en un solo lugar, control total
   - Contras: Más recursos en VPS, gestión de deploy manual, sin edge CDN

2. **Vercel + Database en VPS** (✅ recomendada)
   - Pros: Deploy automático, edge CDN, serverless, escalabilidad, $0 en Vercel hobby plan
   - Contras: Latencia de red DB (mitigada con connection pooling)

3. **Todo en Vercel (con Vercel Postgres)** (rechazada)
   - Pros: Todo serverless, cero gestión
   - Contras: $20-50/mes adicionales, vendor lock-in completo

### Justificación

- Vercel es ideal para Next.js (creadores del framework)
- Deploy automático desde GitHub
- Edge CDN global incluido
- $0 costo en hobby plan para desarrollo
- Base de datos en VPS ya está optimizada y funcional
- Latencia DB-App no es crítica (mitigable con caching)

### Consecuencias

**Positivas:**
- Experiencia de desarrollo superior (preview deploys, rollbacks)
- Escalabilidad automática de frontend
- CDN global sin configuración
- CI/CD integrado

**Negativas:**
- Latencia adicional DB ↔ App (VPS ↔ Vercel edge)
  - Mitigación: Connection pooling, caching en Redis, static data pre-rendering
- Dependencia de Vercel para frontend
  - Mitigación: Next.js es portable, se puede mover a VPS si es necesario

**Estado**: Pendiente de validación con pruebas de latencia reales

---

## ADR-004: Estrategia de backups

**Fecha**: 01 de Octubre, 2025
**Estado**: ✅ Aceptado e Implementado
**Contexto**: Asegurar recuperación de datos ante fallos

### Decisión

Implementar backups automáticos diarios de la base de datos `degux` usando `pg_dump`, con retención de 7 días y almacenamiento local en el VPS.

### Estrategia de Backup

```bash
# Backup automático diario (cron 3 AM)
0 3 * * * /home/gabriel/vps-do/scripts/backup-degux.sh

# Almacenamiento: /home/gabriel/vps-do/degux/backups/
# Formato: degux_backup_YYYYMMDD_HHMMSS.sql.gz
# Retención: 7 días (elimina automáticamente backups >7 días)
```

### Alternativas Consideradas

1. **Backups manuales solo** (rechazada)
   - Contras: Propenso a error humano, no confiable

2. **Backups diarios automáticos locales** (✅ aceptada)
   - Pros: Cero costo, simple, suficiente para comenzar
   - Contras: Sin disaster recovery si el VPS falla completamente

3. **Backups automáticos + almacenamiento remoto (S3)** (futuro)
   - Pros: Disaster recovery completo, geo-redundancia
   - Contras: ~$1-5/mes adicionales
   - Estado: Considerado para fase 2

### Consecuencias

**Positivas:**
- Backups automáticos diarios sin intervención
- Recovery point objective (RPO): 24 horas
- Scripts simples y probados
- Cero costos adicionales

**Negativas:**
- Sin disaster recovery si el VPS entero falla (mitigación futura: backups a S3)
- Backups consumen disco local (~100MB por backup)

**Mejoras futuras:**
- Agregar backups a S3/Backblaze B2 (fase 2)
- Implementar point-in-time recovery con WAL archiving (fase 3)

---

## 📝 Template para Nuevas ADRs

```markdown
## ADR-XXX: [Título de la decisión]

**Fecha**: [YYYY-MM-DD]
**Estado**: [Propuesto | Aceptado | Rechazado | Deprecated]
**Contexto**: [Descripción del problema o situación]

### Decisión

[Descripción clara de la decisión tomada]

### Alternativas Consideradas

1. **Opción 1**
   - Pros: ...
   - Contras: ...

2. **Opción 2** (✅ aceptada / rechazada)
   - Pros: ...
   - Contras: ...

### Justificación

[Por qué se tomó esta decisión]

### Consecuencias

**Positivas:**
- ...

**Negativas:**
- ...

**Mitigaciones:**
- ...
```

---

**Última actualización**: 01 de Octubre, 2025
