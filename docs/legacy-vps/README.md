# Inmogrid - Documentación del Proyecto

**Ecosistema Digital Colaborativo del Sector Inmobiliario Chileno**

---

## 📌 Estado del Proyecto

| Item | Estado |
|------|--------|
| Dominio | ✅ inmogrid.cl (activo) |
| Infraestructura VPS | ✅ Completada |
| Base de Datos | ✅ PostgreSQL + PostGIS (n8n-db compartido) |
| SSL/HTTPS | ✅ Configurado |
| Aplicación Web | 🔄 En desarrollo |
| Repositorio Web | https://github.com/gabrielpantoja-cl/inmogrid.cl.git |

**Última actualización**: 01 de Octubre, 2025

---

## 🚀 PRÓXIMOS PASOS (IMPORTANTE)

**⚠️ La infraestructura está 100% lista. Sigue estos pasos para completar el deployment:**

### **[→ Ver PRÓXIMOS PASOS Detallados](./NEXT-STEPS.md)** ⭐ EMPEZAR AQUÍ

**Resumen rápido:**
1. **[CRÍTICO]** Configurar DNS del dominio (5 min + 30 min propagación)
2. **[CRÍTICO]** Generar certificados SSL (5 min)
3. **[CRÍTICO]** Activar HTTPS en Nginx (10 min)
4. **[IMPORTANTE]** Configurar backups automáticos (5 min)
5. **[IMPORTANTE]** Preparar app web en desarrollo local (1-2 horas)
6. **[IMPORTANTE]** Deploy a producción en Vercel (30 min)
7. **[OPCIONAL]** Configurar N8N workflows (1-2 horas)
8. **[OPCIONAL]** Setup monitoring (30 min)

**Tiempo estimado total**: 4-6 horas (mínimo viable) | 5-9 horas (completo)

---

## 📚 Documentación Disponible

### 🏗️ Guías de Infraestructura

- **[Guía Completa de Infraestructura](./inmogrid-infrastructure-guide.md)** ⭐ PRINCIPAL
  - Arquitectura del sistema
  - Base de datos compartida con N8N
  - Configuración de dominios y SSL
  - Deployment completo
  - Backups y monitoreo
  - Troubleshooting

- **[Decisiones de Arquitectura](./architecture-decisions.md)**
  - ADRs (Architecture Decision Records)
  - Por qué compartir contenedor con N8N
  - Elección de PostgreSQL + PostGIS
  - Estrategia de deployment

### 📖 Documentación Relacionada

**En el repositorio vps-do:**

- `/docs/DEPLOYMENT_INMOGRID.md` - Guía paso a paso de deployment
- `/inmogrid/README.md` - Documentación de base de datos
- `/docs/projects/Plan_Trabajo_Ecosistema_Digital_V4.md` - Plan maestro del proyecto
- `/nginx/conf.d/inmogrid.cl.conf` - Configuración Nginx
- `/scripts/setup-inmogrid-db.sh` - Script de setup de BD
- `/scripts/backup-inmogrid.sh` - Script de backups
- `/scripts/restore-inmogrid.sh` - Script de restore

**En el repositorio web:**

- https://github.com/gabrielpantoja-cl/inmogrid.cl.git - Código de la aplicación

---

## 🚀 Quick Start

### Ver Estado Actual

```bash
# SSH al VPS
ssh gabriel@[IP_VPS]

# Ver contenedores activos
docker ps | grep -E "n8n-db|nginx"

# Verificar base de datos inmogrid
docker exec -it n8n-db psql -U inmogrid_user -d inmogrid -c "SELECT PostGIS_Version();"

# Ver sitio web
curl https://inmogrid.cl
```

### Acceso Rápido

| Servicio | URL |
|----------|-----|
| Sitio Principal | https://inmogrid.cl |
| API | https://api.inmogrid.cl |
| Portainer (gestión) | https://[URL_PORTAINER] |
| N8N (workflows) | http://n8n.inmogrid.cl |

---

## 🔑 Información Clave

### Arquitectura

**⚠️ IMPORTANTE**: Inmogrid **NO tiene su propio contenedor PostgreSQL**.

En su lugar, aprovecha el contenedor `n8n-db` existente, creando una base de datos independiente dentro del mismo servidor. Esta decisión:

- Ahorra ~300MB de RAM
- Reduce costos (vs servicios externos como Neon)
- Mantiene aislamiento total de datos
- Simplifica operaciones

**Diagrama simplificado:**

```
n8n-db (container)
  ├── BD: n8n      (para N8N workflows)
  └── BD: inmogrid    (para Inmogrid app) ← Completamente aislada
```

### Connection Strings

```env
# Desarrollo (desde tu máquina)
DATABASE_URL="postgresql://inmogrid_user:PASSWORD@[IP_VPS]:5432/inmogrid?schema=public"

# Producción (dentro del VPS)
DATABASE_URL="postgresql://inmogrid_user:PASSWORD@n8n-db:5432/inmogrid?schema=public"
```

**Nota**: El password se encuentra en `.env.local` (respaldado localmente, NO en GitHub)

---

## 🛠️ Comandos Útiles

### Base de Datos

```bash
# Conectarse a la BD inmogrid
docker exec -it n8n-db psql -U inmogrid_user -d inmogrid

# Ver bases de datos en n8n-db
docker exec -it n8n-db psql -U n8n -d postgres -c "\l"

# Backup manual
./scripts/backup-inmogrid.sh

# Restore desde backup
./scripts/restore-inmogrid.sh inmogrid_backup_YYYYMMDD_HHMMSS.sql.gz
```

### Nginx

```bash
# Reiniciar Nginx
docker compose restart nginx

# Ver logs
docker logs nginx-proxy -f

# Verificar sintaxis
docker exec nginx-proxy nginx -t
```

### SSL

```bash
# Generar certificados (después de configurar DNS)
docker compose --profile ssl-setup run --rm certbot

# Verificar certificados
docker exec nginx-proxy ls -la /etc/nginx/ssl/live/inmogrid.cl/
```

---

## 📞 Soporte y Troubleshooting

Si encuentras problemas, consulta:

1. **[Guía de Infraestructura](./inmogrid-infrastructure-guide.md#troubleshooting)** - Sección de troubleshooting completa
2. **Logs del sistema**:
   ```bash
   docker logs n8n-db --tail 100
   docker logs nginx-proxy --tail 100
   ```
3. **Estado de servicios**:
   ```bash
   ./scripts/deploy.sh status
   ```

---

## 🎯 Próximos Pasos

### Para Desarrollo Local

1. Clonar repo web: `git clone https://github.com/gabrielpantoja-cl/inmogrid.cl.git`
2. Configurar `.env.local` con connection string de desarrollo
3. Instalar dependencias: `npm install`
4. Ejecutar migrations: `npx prisma migrate dev`
5. Iniciar dev server: `npm run dev`

### Para Production Deployment

Ver guía completa: `/docs/DEPLOYMENT_INMOGRID.md`

---

## 📧 Contacto

- **Repositorio VPS**: https://github.com/gabrielpantoja-cl/vps-do.git
- **Repositorio Web**: https://github.com/gabrielpantoja-cl/inmogrid.cl.git
- **VPS IP**: VPS_IP_REDACTED
- **Dominio**: inmogrid.cl

---

**¿Primera vez aquí?** → Lee la **[Guía Completa de Infraestructura](./inmogrid-infrastructure-guide.md)**
