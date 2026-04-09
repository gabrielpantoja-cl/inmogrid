# Inmogrid - Documentación Completa del Servicio

**Ecosistema Digital Colaborativo del Sector Inmobiliario Chileno**

**Fecha de implementación:** 01 de Octubre, 2025
**Estado:** ✅ Infraestructura completa - En desarrollo aplicación web
**Dominio:** https://inmogrid.cl
**Repositorio Web:** https://github.com/gabrielpantoja-cl/inmogrid.cl.git

---

## 📋 Tabla de Contenidos

1. [Resumen del Proyecto](#resumen-del-proyecto)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Infraestructura VPS](#infraestructura-vps)
4. [Base de Datos](#base-de-datos)
5. [Configuración de Dominios y SSL](#configuración-de-dominios-y-ssl)
6. [Repositorio de Código](#repositorio-de-código)
7. [Deployment](#deployment)
8. [Backups y Recuperación](#backups-y-recuperación)
9. [Monitoreo](#monitoreo)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Resumen del Proyecto

### ¿Qué es Inmogrid?

Inmogrid es un ecosistema digital colaborativo para el sector inmobiliario chileno, diseñado como infraestructura abierta tipo "GitHub del sector inmobiliario". No es un portal inmobiliario tradicional, sino una plataforma de colaboración entre profesionales.

### Concepto Clave

**"InfraTech del mercado inmobiliario chileno"** - Infraestructura colaborativa de código abierto que democratiza el acceso a datos inmobiliarios.

### Pilares Estratégicos

- Plataforma abierta con datos colaborativos (crowdsourced)
- API-first para integraciones con CRMs existentes
- Freemium: Core gratuito y open source
- MLS abierto como estándar de facto
- Datos como activo estratégico

### Diferenciador Clave

No competimos con portales inmobiliarios (Portal Inmobiliario, Yapo), CRMs cerrados (KiteProp, Wasi), ni plataformas verticales (Houm). Somos **infraestructura horizontal abierta** que facilita colaboración.

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

```
┌─────────────────────────────────────────────────────────┐
│                    DOMINIO: inmogrid.cl                     │
│                                                           │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │   inmogrid.cl │  │ www.inmogrid.cl │  │  api.inmogrid.cl   │ │
│  └──────┬─────┘  └──────┬───────┘  └────────┬────────┘ │
│         │                │                   │           │
│         └────────────────┴───────────────────┘           │
│                          │                                │
│                   ┌──────▼──────┐                        │
│                   │ Nginx Proxy │ (SSL)                  │
│                   └──────┬──────┘                        │
└──────────────────────────┼────────────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
    ┌───────▼────────┐          ┌────────▼────────┐
    │  Next.js App   │          │  PostgreSQL     │
    │  (inmogrid-web)   │◄─────────┤  (n8n-db)       │
    │                │          │                 │
    │  - Frontend    │          │  ┌───────────┐  │
    │  - API Routes  │          │  │ BD: n8n   │  │
    │  - Auth        │          │  └───────────┘  │
    │                │          │  ┌───────────┐  │
    └────────────────┘          │  │ BD: inmogrid │  │
                                │  │ + PostGIS │  │
                                │  └───────────┘  │
                                └─────────────────┘
```

### Componentes

#### 1. **Frontend + Backend (Repositorio separado)**
- **Ubicación**: https://github.com/gabrielpantoja-cl/inmogrid.cl.git
- **Framework**: Next.js 14+ (App Router)
- **Hosting**: Por definir (Vercel / VPS)
- **Features**:
  - Sistema de autenticación (NextAuth.js)
  - Dashboard de usuario
  - Mapas con PostGIS (Leaflet)
  - API Routes para backend

#### 2. **Base de Datos (Compartida con N8N)**
- **Contenedor**: `n8n-db` (⚠️ **COMPARTIDO** con N8N para optimizar recursos)
- **Imagen**: `postgis/postgis:15-3.4` (actualizada desde postgres:15-alpine)
- **Base de datos**: `inmogrid` (lógicamente **separada** de `n8n`)
- **Usuario**: `inmogrid_user` (dedicado, aislado de usuario `n8n`)
- **Puerto**: `5432` (mismo puerto que N8N, diferentes bases de datos)
- **Extensiones**: PostGIS 3.4, PostGIS Topology

**📌 Nota importante**: Inmogrid **NO tiene su propio contenedor PostgreSQL**. En lugar de eso, aprovecha el contenedor `n8n-db` existente, creando una base de datos independiente dentro del mismo servidor PostgreSQL. Esto ahorra ~300MB de RAM y simplifica la administración.

#### 3. **Proxy Reverso**
- **Servicio**: Nginx (contenedor `nginx-proxy`)
- **Dominios gestionados**:
  - `inmogrid.cl`
  - `www.inmogrid.cl`
  - `api.inmogrid.cl`
- **SSL**: Let's Encrypt (certbot)

#### 4. **Integración con N8N**

Inmogrid se beneficia de la infraestructura de N8N de múltiples formas:

**Base de datos compartida:**
- Ambos servicios comparten el contenedor `n8n-db` (PostgreSQL + PostGIS)
- Bases de datos lógicamente separadas pero en el mismo servidor
- N8N gestiona su propia BD independientemente

**Workflows de automatización:**
- **Scraping inmobiliario**: N8N ejecuta workflows para extraer datos de portales
- **ETL pipelines**: Transformación y carga de datos a la BD inmogrid
- **Notificaciones**: Alertas automáticas para usuarios de Inmogrid
- **Sincronización**: Actualización periódica de catálogos inmobiliarios

**Ventajas de la integración:**
- N8N puede escribir directamente a la BD `inmogrid` (usando credenciales separadas)
- Workflows programados que enriquecen la base de datos de Inmogrid
- Monitoring y health checks automatizados
- Webhooks desde Inmogrid hacia N8N para procesamiento asíncrono

---

## 🖥️ Infraestructura VPS

### Servidor

- **Proveedor**: Digital Ocean
- **IP**: [IP_VPS]
- **OS**: Ubuntu 22.04 LTS
- **Usuario SSH**: gabriel
- **Directorio proyecto**: `/home/gabriel/vps-do`

### Servicios Activos

```bash
# Ver todos los servicios
docker ps

# Servicios relacionados con Inmogrid:
# - n8n-db (PostgreSQL con BD inmogrid)
# - nginx-proxy (routing a inmogrid.cl)
```

### Recursos

- **RAM**: ~300MB adicional para BD inmogrid (comparte contenedor con N8N)
- **Disco**: ~2GB inicial (crecerá con datos)
- **Red**: Compartida `vps_network`

---

## 🗄️ Base de Datos

### Arquitectura de Base de Datos

**💡 Decisión estratégica clave**: Inmogrid reutiliza el contenedor PostgreSQL existente de N8N (`n8n-db`) en lugar de crear un contenedor independiente. Esta arquitectura compartida optimiza recursos sin comprometer la seguridad o el aislamiento de datos.

#### Estructura del Contenedor n8n-db

```
┌─────────────────────────────────────────────────────────┐
│         Contenedor Docker: n8n-db                        │
│         Imagen: postgis/postgis:15-3.4                   │
│         Puerto: 5432 (expuesto externamente)             │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  PostgreSQL Server 15 + PostGIS 3.4                      │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Base de datos: n8n                               │  │
│  │  Usuario: n8n                                     │  │
│  │  Uso: Workflows, credenciales, ejecuciones N8N    │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Base de datos: inmogrid                ← INMOGRID      │  │
│  │  Usuario: inmogrid_user                              │  │
│  │  Password: ${INMOGRID_DB_PASSWORD}                   │  │
│  │  Extensiones: PostGIS, PostGIS Topology           │  │
│  │  Uso: Datos inmobiliarios, usuarios, geolocation │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ✅ Aislamiento completo entre bases de datos            │
│  ✅ Usuarios separados con permisos independientes       │
│  ✅ Backups individuales por base de datos               │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

#### ¿Por qué compartir el contenedor?

**Ventajas técnicas:**

✅ **Optimización de recursos**: Solo ~300MB RAM adicional vs ~600MB con contenedor dedicado
✅ **Costo cero**: Sin servicios externos como Neon ($20-30/mes) o RDS ($15-50/mes)
✅ **Simplicidad operacional**: Un solo contenedor PostgreSQL para gestionar y monitorear
✅ **Backups centralizados**: Mismo flujo de backup, pero bases de datos independientes
✅ **PostGIS nativo**: Actualización de imagen a `postgis/postgis:15-3.4` beneficia ambas apps
✅ **Networking simplificado**: Ambas apps usan la misma red Docker interna
✅ **Zero downtime**: N8N no se ve afectado por operaciones en Inmogrid

**Seguridad y aislamiento:**

🔒 **Aislamiento lógico total**: Cada base de datos es completamente independiente
🔒 **Usuarios separados**: `n8n` y `inmogrid_user` no tienen acceso cruzado
🔒 **Permisos granulares**: `inmogrid_user` solo puede acceder a la BD `inmogrid`
🔒 **Contraseñas independientes**: Credenciales separadas para cada servicio
🔒 **Sin impacto mutuo**: Fallo en Inmogrid no afecta N8N y viceversa

#### Cambio de imagen Docker

Para soportar Inmogrid (que requiere PostGIS), se actualizó la imagen base:

```yaml
# ANTES (solo para N8N)
n8n-db:
  image: postgres:15-alpine  # Sin PostGIS

# DESPUÉS (para N8N + Inmogrid)
n8n-db:
  image: postgis/postgis:15-3.4  # Con PostGIS 3.4
```

**Impacto**: Esta actualización no afecta a N8N (PostgreSQL es 100% compatible), pero agrega capacidades geoespaciales que Inmogrid necesita para funciones de mapas y ubicaciones.

### Connection Strings

**Desarrollo (desde tu máquina local):**
```env
DATABASE_URL="postgresql://inmogrid_user:[PASSWORD]@[IP_VPS]:5432/inmogrid?schema=public"
```

**Producción (dentro del VPS):**
```env
DATABASE_URL="postgresql://inmogrid_user:[PASSWORD]@n8n-db:5432/inmogrid?schema=public"
```

### Configuración Inicial

```bash
# 1. Asegurar que N8N está corriendo
cd ~/vps-do
./scripts/deploy.sh deploy n8n

# 2. Ejecutar script de setup de Inmogrid
# Esto crea: usuario, base de datos, habilita PostGIS
./scripts/setup-inmogrid-db.sh

# 3. Verificar
docker exec -it n8n-db psql -U n8n -d postgres -c "\l"
# Deberías ver: n8n y inmogrid
```

### Archivos de Configuración

- **Script de setup**: `/scripts/setup-inmogrid-db.sh`
- **Backups**: `/inmogrid/backups/`
- **Migrations SQL**: `/inmogrid/migrations/01_init_postgis.sql`
- **README**: `/inmogrid/README.md`

---

## 🌐 Configuración de Dominios y SSL

### Dominios Configurados

| Dominio | Propósito | Estado |
|---------|-----------|--------|
| `inmogrid.cl` | Landing page / App principal | ✅ Configurado |
| `www.inmogrid.cl` | Redirect a inmogrid.cl | ✅ Configurado |
| `api.inmogrid.cl` | API endpoints | ✅ Configurado |

### DNS Setup (Proveedor de dominio)

```
Tipo    Nombre    Valor              TTL
A       @         VPS_IP_REDACTED     3600
A       www       VPS_IP_REDACTED     3600
A       api       VPS_IP_REDACTED     3600
```

### Nginx Configuration

**Archivos:**
- `/nginx/conf.d/inmogrid.cl.conf` - Configuración de inmogrid.cl y www.inmogrid.cl
- `/nginx/conf.d/api.inmogrid.cl.conf` - Configuración de api.inmogrid.cl

**Features:**
- ✅ Redirección HTTP → HTTPS
- ✅ Security headers (HSTS, XSS Protection, etc.)
- ✅ CORS configurado para API
- ✅ Proxy pass a Next.js app (cuando se despliegue)
- ✅ Let's Encrypt SSL/TLS

### SSL Certificates

```bash
# Generar certificados (después de configurar DNS)
cd ~/vps-do
docker compose --profile ssl-setup run --rm certbot

# Certificados guardados en:
# /nginx/ssl/live/inmogrid.cl/fullchain.pem
# /nginx/ssl/live/inmogrid.cl/privkey.pem
```

### Activar HTTPS

Editar archivos de configuración y descomentar bloques HTTPS:
```bash
nano ~/vps-do/nginx/conf.d/inmogrid.cl.conf
nano ~/vps-do/nginx/conf.d/api.inmogrid.cl.conf

# Reiniciar Nginx
docker compose restart nginx
```

---

## 💻 Repositorio de Código

### Repositorio Principal

**URL**: https://github.com/gabrielpantoja-cl/inmogrid.cl.git

### Estructura del Proyecto Web

```
inmogrid.cl/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   ├── dashboard/         # Dashboard de usuario
│   ├── api/               # API Routes
│   └── ...
├── components/            # React components
├── lib/                   # Utilidades
├── prisma/                # Schema y migrations
│   ├── schema.prisma
│   └── migrations/
├── public/                # Assets estáticos
├── .env.local             # Variables de entorno (local)
├── .env.production        # Variables de entorno (prod)
├── package.json
└── README.md
```

### Variables de Entorno

**En `.env.local` (desarrollo):**
```env
# Database
DATABASE_URL="postgresql://inmogrid_user:PASSWORD@VPS_IP_REDACTED:5432/inmogrid?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu_secret_generado"

# APIs externas
GOOGLE_MAPS_API_KEY="..."
```

**En `.env.production` (VPS):**
```env
# Database (dentro del VPS)
DATABASE_URL="postgresql://inmogrid_user:PASSWORD@n8n-db:5432/inmogrid?schema=public"

# NextAuth
NEXTAUTH_URL="https://inmogrid.cl"
NEXTAUTH_SECRET="tu_secret_generado"

# APIs externas
GOOGLE_MAPS_API_KEY="..."
```

### Prisma Migrations

```bash
# Desarrollo
npx prisma migrate dev --name nombre_migration

# Producción
npx prisma migrate deploy
```

---

## 🚀 Deployment

### Guía Completa de Deployment

Ver documentación detallada: `/docs/DEPLOYMENT_INMOGRID.md`

### Resumen Rápido

#### 1. Configurar DNS
```bash
# Esperar propagación DNS (15-30 minutos)
dig inmogrid.cl +short
# Debe devolver: VPS_IP_REDACTED
```

#### 2. Configurar Variables de Entorno en VPS
```bash
ssh gabriel@[IP_VPS]
cd ~/vps-do
nano .env

# Agregar:
INMOGRID_DB_PASSWORD=[YOUR_DB_PASSWORD]
```

#### 3. Crear Base de Datos
```bash
# Asegurar N8N corriendo
./scripts/deploy.sh deploy n8n

# Crear BD inmogrid
./scripts/setup-inmogrid-db.sh
```

#### 4. Configurar SSL
```bash
# Reiniciar Nginx con configs de inmogrid.cl
docker compose restart nginx

# Generar certificados SSL
docker compose --profile ssl-setup run --rm certbot

# Activar HTTPS en configs de Nginx
nano ~/vps-do/nginx/conf.d/inmogrid.cl.conf
# (Descomentar bloque HTTPS)

docker compose restart nginx
```

#### 5. Desplegar Aplicación Web (cuando esté lista)

**Opción A: Vercel (recomendado para empezar)**
1. Conectar repo GitHub a Vercel
2. Configurar `DATABASE_URL` en Vercel
3. Deploy automático

**Opción B: Docker en VPS**
1. Crear `docker-compose.inmogrid-web.yml`
2. Build imagen Docker
3. Deploy con `docker compose up -d`

---

## 💾 Backups y Recuperación

### Backups Automáticos

**Script**: `/scripts/backup-inmogrid.sh`

**Configuración cron:**
```bash
crontab -e

# Backup diario a las 3 AM
0 3 * * * /home/gabriel/vps-do/scripts/backup-inmogrid.sh >> /var/log/inmogrid-backup.log 2>&1
```

**Ubicación backups:**
```
/home/gabriel/vps-do/inmogrid/backups/
├── inmogrid_backup_20251001_030000.sql.gz
├── inmogrid_backup_20251002_030000.sql.gz
└── ...
```

**Retención**: 7 días

### Backup Manual

```bash
./scripts/backup-inmogrid.sh

# Ver backups
ls -lh ~/vps-do/inmogrid/backups/
```

### Restore desde Backup

```bash
# Listar backups disponibles
ls -lh ~/vps-do/inmogrid/backups/

# Restaurar backup específico
./scripts/restore-inmogrid.sh inmogrid_backup_20251001_030000.sql.gz
```

### Backup de Código (GitHub)

El código de la aplicación web está en GitHub:
```bash
# Clonar repo
git clone https://github.com/gabrielpantoja-cl/inmogrid.cl.git

# Branches principales:
# - main: producción
# - dev: desarrollo
```

---

## 📊 Monitoreo

### Logs

```bash
# Logs de Nginx
docker logs nginx-proxy -f

# Logs de base de datos
docker logs n8n-db -f

# Logs de backups
tail -f /var/log/inmogrid-backup.log

# Logs de aplicación web (cuando esté desplegada)
docker logs inmogrid-web -f
```

### Métricas de Recursos

```bash
# Estado de contenedores
docker ps

# Estadísticas en tiempo real
docker stats

# Uso de disco
df -h
docker system df

# Tamaño de base de datos inmogrid
docker exec n8n-db psql -U inmogrid_user -d inmogrid -c "SELECT pg_size_pretty(pg_database_size('inmogrid'));"
```

### Health Checks

```bash
# Verificar que n8n-db está healthy
docker inspect n8n-db --format='{{.State.Health.Status}}'

# Verificar que inmogrid BD existe
docker exec -it n8n-db psql -U n8n -d postgres -c "\l" | grep inmogrid

# Verificar PostGIS
docker exec -it n8n-db psql -U inmogrid_user -d inmogrid -c "SELECT PostGIS_Version();"

# Test de conexión desde local
psql -h VPS_IP_REDACTED -p 5432 -U inmogrid_user -d inmogrid
```

---

## 🛠️ Troubleshooting

### Base de datos no conecta

```bash
# 1. Verificar que n8n-db está corriendo
docker ps | grep n8n-db

# 2. Verificar que la BD inmogrid existe
docker exec -it n8n-db psql -U n8n -d postgres -c "\l"

# 3. Verificar usuario inmogrid_user
docker exec -it n8n-db psql -U n8n -d postgres -c "\du"

# 4. Verificar puerto expuesto
docker port n8n-db

# 5. Test de conexión
psql -h VPS_IP_REDACTED -p 5432 -U inmogrid_user -d inmogrid
```

### SSL no funciona

```bash
# 1. Verificar certificados
docker exec nginx-proxy ls -la /etc/nginx/ssl/live/inmogrid.cl/

# 2. Ver logs de Nginx
docker logs nginx-proxy

# 3. Verificar DNS
dig inmogrid.cl +short

# 4. Test HTTPS
curl -I https://inmogrid.cl
```

### Nginx no inicia

```bash
# 1. Verificar sintaxis
docker exec nginx-proxy nginx -t

# 2. Ver logs detallados
docker logs nginx-proxy --tail 100

# 3. Reiniciar Nginx
docker compose restart nginx
```

### La aplicación web no carga

```bash
# 1. Verificar que el contenedor está corriendo
docker ps | grep inmogrid-web

# 2. Ver logs de la aplicación
docker logs inmogrid-web

# 3. Verificar variables de entorno
docker exec inmogrid-web env | grep DATABASE_URL

# 4. Verificar que Nginx está proxying correctamente
docker exec nginx-proxy cat /etc/nginx/conf.d/inmogrid.cl.conf
```

---

## 📚 Referencias Adicionales

### Documentación

- **Plan de Trabajo**: `/docs/projects/Plan_Trabajo_Ecosistema_Digital_V4.md`
- **Guía de Deployment**: `/docs/DEPLOYMENT_INMOGRID.md`
- **README Base de Datos**: `/inmogrid/README.md`

### Scripts

- **Setup BD**: `/scripts/setup-inmogrid-db.sh`
- **Backup**: `/scripts/backup-inmogrid.sh`
- **Restore**: `/scripts/restore-inmogrid.sh`
- **Deploy General**: `/scripts/deploy.sh`

### Configuración

- **Nginx inmogrid.cl**: `/nginx/conf.d/inmogrid.cl.conf`
- **Nginx api.inmogrid.cl**: `/nginx/conf.d/api.inmogrid.cl.conf`
- **Certbot**: `docker-compose.yml` (profile: ssl-setup)
- **Variables de entorno**: `.env.template`

### URLs

- **Dominio**: https://inmogrid.cl
- **API**: https://api.inmogrid.cl
- **GitHub**: https://github.com/gabrielpantoja-cl/inmogrid.cl.git
- **VPS IP**: [IP_VPS]
- **Portainer**: https://[URL_PORTAINER]
- **N8N**: http://n8n.inmogrid.cl

---

## ✅ Checklist de Estado Actual

### Infraestructura
- [x] VPS configurado y accesible
- [x] Dominio inmogrid.cl comprado
- [x] DNS configurado y propagado
- [x] Nginx configurado para inmogrid.cl
- [x] Certificados SSL generados
- [x] HTTPS funcionando

### Base de Datos
- [x] PostgreSQL con PostGIS habilitado
- [x] Base de datos `inmogrid` creada
- [x] Usuario `inmogrid_user` configurado
- [x] Connection strings documentados
- [x] Backups automáticos configurados

### Aplicación Web
- [x] Repositorio GitHub creado
- [ ] Aplicación Next.js desplegada
- [ ] Prisma migrations aplicadas
- [ ] NextAuth configurado
- [ ] Conectada a base de datos

---

**Estado del proyecto**: ✅ Infraestructura 100% completa - Listo para recibir la aplicación web

**Próximo paso**: Desplegar aplicación web desde https://github.com/gabrielpantoja-cl/inmogrid.cl.git

**Última actualización**: 01 de Octubre, 2025
