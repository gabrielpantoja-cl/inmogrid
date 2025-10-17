# 📊 Estado Actual del Sistema VPS
## Documentación Completa - 11 de Octubre de 2025

---

## 🏷️ Información del Servidor

| Atributo | Valor |
|----------|-------|
| **Proveedor** | Digital Ocean |
| **Datacenter** | NYC3 (New York) |
| **IP Pública** | 167.172.251.27 |
| **Sistema Operativo** | Ubuntu 22.04 LTS |
| **Hostname** | ubuntu-s-2vcpu-2gb-amd-nyc3-01 |
| **Recursos** | 2 vCPU, 2GB RAM, 60GB SSD |
| **Usuario Admin** | gabriel |

---

## 🌐 Servicios Web Activos

### Sitios en Producción

| Dominio | Tipo | Tecnología | SSL | Estado |
|---------|------|------------|-----|--------|
| **degux.cl** | Aplicación Web | Next.js 15 + React 19 | ✅ Valid | 🟢 Activo |
| **www.degux.cl** | Alias | Redirect a degux.cl | ✅ Valid | 🟢 Activo |
| **api.degux.cl** | API (planeado) | - | ✅ Cert obtenido | ⚠️ Sin configurar |
| **luanti.gabrielpantoja.cl** | Landing Page | HTML/CSS/JS estático | ✅ Valid | 🟢 Activo |
| **n8n.gabrielpantoja.cl** | Automatización | n8n latest | ✅ Valid | 🟢 Activo |
| **pitutito.cl** | Landing | HTML estático | ✅ Valid | 🟢 Activo |
| **studio.pitutito.cl** | Estudio | - | ✅ Valid | ⚠️ Sin verificar |

### Certificados SSL

Todos los certificados son emitidos por **Let's Encrypt** y expiran el **9 de enero de 2026**:

```bash
# Verificar certificados
sudo certbot certificates

# Renovación automática configurada vía systemd timer
systemctl list-timers | grep certbot
```

---

## 🐳 Servicios Docker

### Contenedores en Ejecución

```
CONTAINER NAME              IMAGE                       STATUS              PORTS
────────────────────────────────────────────────────────────────────────────────────────────
degux-web                   vps-do-degux-web           Up (healthy)        0.0.0.0:3000->3000/tcp
n8n                         n8nio/n8n:latest           Up (healthy)        0.0.0.0:5678->5678/tcp
n8n-db                      postgis/postgis:15-3.4     Up (healthy)        5432/tcp (interno)
n8n-redis                   redis:7-alpine             Up (healthy)        6379/tcp (interno)
portainer                   portainer/portainer-ce     Up                  0.0.0.0:8000,9443->8000,9443/tcp
luanti-voxelibre-server     linuxserver/luanti:latest  Up (healthy)        0.0.0.0:30000->30000/udp
luanti-voxelibre-backup     alpine:latest              Up                  -
```

### Arquitectura de Redes Docker

#### Red: vps_network (Docker Compose - vps-do)
```
172.18.0.0/16 (subnet auto-asignada)

Contenedores:
├─ degux-web (172.18.0.X)
├─ n8n (172.18.0.X)
├─ n8n-db (172.18.0.X)
├─ n8n-redis (172.18.0.X)
└─ portainer (172.18.0.X)
```

#### Red: luanti-voxelibre-server_luanti-network (proyecto Luanti)
```
Subnet auto-asignada

Contenedores:
├─ luanti-voxelibre-server
└─ luanti-voxelibre-backup
```

---

## 🔌 Mapa de Puertos

### Puertos Expuestos Públicamente

| Puerto | Protocolo | Servicio | Bind | Acceso |
|--------|-----------|----------|------|--------|
| **22** | TCP | SSH | 0.0.0.0 | Acceso administrativo |
| **80** | TCP | HTTP | 0.0.0.0 | Nginx (redirect a HTTPS) |
| **443** | TCP | HTTPS | 0.0.0.0 | Nginx reverse proxy |
| **3000** | TCP | degux-web | 0.0.0.0 | Interno (proxy nginx) |
| **5678** | TCP | n8n | 0.0.0.0 | Interno (proxy nginx) |
| **8000** | TCP | Portainer | 0.0.0.0 | Gestión contenedores |
| **9443** | TCP | Portainer HTTPS | 0.0.0.0 | Gestión contenedores |
| **30000** | UDP | Luanti Game | 0.0.0.0 | Servidor de juego |

### Puertos Internos (Solo Red Docker)

| Puerto | Protocolo | Servicio | Red | Uso |
|--------|-----------|----------|-----|-----|
| **5432** | TCP | PostgreSQL | vps_network | n8n-db (databases: n8n, degux) |
| **6379** | TCP | Redis | vps_network | n8n-redis (cache) |

---

## 🗄️ Bases de Datos

### PostgreSQL (contenedor: n8n-db)

**Imagen**: `postgis/postgis:15-3.4`
**Versión PostgreSQL**: 15
**Extensiones**: PostGIS 3.4 (para datos geoespaciales)

#### Databases

```sql
-- Database 1: n8n workflows
Name: n8n
Owner: n8n
Purpose: Almacena workflows, credenciales, ejecuciones de n8n
Tables: ~30 (schema manejado por n8n)

-- Database 2: degux.cl application
Name: degux
Owner: degux_user
Purpose: Datos de aplicación degux.cl
Tables: Prisma schema (users, properties, profiles, etc.)
Schema: Migrations vía Prisma ORM
```

#### Conexiones

**Desde n8n**:
```
Host: n8n-db
Port: 5432
Database: n8n
User: n8n
Password: ${N8N_DB_PASSWORD}
```

**Desde degux-web**:
```
Host: n8n-db
Port: 5432
Database: degux
User: degux_user
Password: ${DEGUX_DB_PASSWORD}
POSTGRES_PRISMA_URL: postgresql://degux_user:password@n8n-db:5432/degux?schema=public
```

#### Backups

**Ubicación**: `/var/lib/docker/volumes/vps-do_n8n_db_data/_data`

**Comando de backup manual**:
```bash
docker exec n8n-db pg_dump -U n8n n8n > backup_n8n_$(date +%Y%m%d).sql
docker exec n8n-db pg_dump -U degux_user degux > backup_degux_$(date +%Y%m%d).sql
```

**⚠️ TODO**: Implementar backup automático diario

### Redis (contenedor: n8n-redis)

**Imagen**: `redis:7-alpine`
**Versión**: Redis 7
**Uso**: Cache para n8n queue mode
**Persistencia**: `/var/lib/docker/volumes/vps-do_n8n_redis_data/_data`

---

## ⚙️ Nginx (Reverse Proxy)

### Tipo de Instalación

**Nginx Nativo** (instalado en Ubuntu via apt, NO en Docker)

```bash
# Verificar estado
systemctl status nginx

# Recargar configuración
sudo systemctl reload nginx

# Validar sintaxis
sudo nginx -t
```

### Configuraciones de Sitios

#### Ubicación de Archivos

```
/etc/nginx/
├── nginx.conf                  # Configuración principal
├── sites-available/            # Configs disponibles
│   ├── degux.cl
│   ├── luanti.gabrielpantoja.cl
│   ├── n8n.gabrielpantoja.cl
│   └── pitutito.cl
├── sites-enabled/              # Configs activas (symlinks)
│   ├── degux.cl -> ../sites-available/degux.cl
│   ├── luanti.gabrielpantoja.cl -> ../sites-available/luanti.gabrielpantoja.cl
│   ├── n8n.gabrielpantoja.cl -> ../sites-available/n8n.gabrielpantoja.cl
│   └── pitutito.cl -> ../sites-available/pitutito.cl
└── ssl/                        # Symlink a /etc/letsencrypt
```

#### Flujo de Tráfico

```
Internet (puertos 80/443)
    ↓
Nginx (0.0.0.0:80, 0.0.0.0:443)
    ├─ degux.cl               → proxy_pass http://127.0.0.1:3000
    ├─ www.degux.cl           → proxy_pass http://127.0.0.1:3000
    ├─ luanti.gabrielpantoja.cl → try_files (archivos estáticos)
    ├─ n8n.gabrielpantoja.cl  → proxy_pass http://127.0.0.1:5678
    ├─ pitutito.cl            → proxy_pass http://127.0.0.1:3000 (⚠️ conflicto con degux?)
    └─ studio.pitutito.cl     → proxy_pass http://127.0.0.1:8005
```

#### Configuración Típica (Ejemplo: n8n)

```nginx
# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name n8n.gabrielpantoja.cl;

    # SSL
    ssl_certificate /etc/letsencrypt/live/n8n.gabrielpantoja.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/n8n.gabrielpantoja.cl/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Proxy
    location / {
        proxy_pass http://127.0.0.1:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        # ... más headers
    }
}

# HTTP → HTTPS Redirect
server {
    listen 80;
    listen [::]:80;
    server_name n8n.gabrielpantoja.cl;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}
```

---

## 🔐 Seguridad

### Firewall (UFW)

```bash
# Estado actual
sudo ufw status numbered

# Reglas activas
To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
8000/tcp                   ALLOW       Anywhere
9443/tcp                   ALLOW       Anywhere
30000/udp                  ALLOW       Anywhere
```

### Autenticación SSH

- ✅ **Solo SSH keys** (password authentication disabled)
- ✅ **Usuario no-root**: gabriel
- ✅ **Root login**: disabled

```bash
# Config: /etc/ssh/sshd_config
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
```

### Autenticación de Servicios

| Servicio | Método | Credenciales |
|----------|--------|--------------|
| **degux.cl** | Google OAuth (NextAuth.js) | GOOGLE_CLIENT_ID/SECRET en .env |
| **n8n** | Basic Auth | N8N_BASIC_AUTH_USER/PASSWORD en .env |
| **Portainer** | Web UI Login | Admin password configurado en primer acceso |
| **PostgreSQL** | Password | N8N_DB_PASSWORD, DEGUX_DB_PASSWORD en .env |

### Gestión de Secretos

**Ubicación**: `/home/gabriel/vps-do/.env` (gitignored)

```bash
# Estructura del archivo .env
N8N_BASIC_AUTH_USER=...
N8N_BASIC_AUTH_PASSWORD=...
N8N_DB_PASSWORD=...
N8N_ENCRYPTION_KEY=...
N8N_REDIS_PASSWORD=...

DEGUX_NEXTAUTH_SECRET=...
DEGUX_GOOGLE_CLIENT_ID=...
DEGUX_GOOGLE_CLIENT_SECRET=...
DEGUX_DB_PASSWORD=...

APIFY_API_TOKEN=...
```

**⚠️ Importante**:
- Nunca commitear `.env` al repositorio
- Usar `.env.example` para documentar variables necesarias
- Rotar credenciales comprometidas inmediatamente

---

## 📁 Estructura de Directorios

### Repositorio vps-do

```
/home/gabriel/vps-do/
├── docker-compose.yml              # Servicios base (Nginx Docker-deshabilitado, Portainer)
├── docker-compose.n8n.yml          # Stack n8n (n8n, PostgreSQL, Redis)
├── docker-compose.degux.yml        # Aplicación degux.cl
├── docker-compose.web.yml          # Sitios estáticos (si se usa)
├── docker-compose.rag.yml          # RAG stack (deshabilitado)
├── docker-compose.supabase.yml     # Supabase (deshabilitado)
├── .env                            # Variables de entorno (gitignored)
├── .env.example                    # Template de variables
├── nginx/                          # Configs para nginx Docker (NO USADO actualmente)
│   ├── nginx.conf
│   ├── conf.d/
│   └── ssl/
├── scripts/                        # Scripts de administración
│   ├── deploy.sh
│   ├── manage-secrets.sh
│   ├── rotate-credentials.sh
│   └── setup-*.sh
├── docs/                           # Documentación
│   ├── infrastructure/             # Este directorio
│   ├── reports/                    # Postmortems
│   └── services/                   # Guías de servicios
└── workflows/                      # n8n workflows (JSON exports)
```

### Proyecto degux.cl

```
/home/gabriel/degux.cl/
├── app/                            # Next.js App Router
├── components/                     # React components
├── lib/                            # Utilities
├── prisma/                         # Prisma schema & migrations
│   ├── schema.prisma
│   └── migrations/
├── public/                         # Static assets
├── Dockerfile                      # Container image definition
├── package.json
├── next.config.js
└── .env.local                      # Local env vars (gitignored)
```

### Proyecto Luanti

```
/home/gabriel/luanti-voxelibre-server/
├── server/
│   ├── landing-page/               # Landing page estática
│   │   ├── index.html
│   │   ├── galeria.html
│   │   └── assets/
│   ├── config/                     # Configuración Luanti
│   ├── mods/                       # Mods instalados
│   ├── worlds/                     # Mundo activo
│   ├── games/                      # Voxelibre game
│   └── backups/                    # Backups automáticos (cada 6h)
├── scripts/
│   ├── backup.sh
│   └── rotate-backups-container.sh
└── docker-compose.yml              # Servidor de juego + backup cron
```

---

## 🔄 Procedimientos Operativos

### Inicio/Parada de Servicios

#### Iniciar Todo el Stack

```bash
cd /home/gabriel/vps-do

# Servicios base
docker compose up -d

# Stack n8n
docker compose -f docker-compose.yml -f docker-compose.n8n.yml up -d

# degux.cl
docker compose -f docker-compose.yml -f docker-compose.n8n.yml -f docker-compose.degux.yml up -d
```

#### Detener Servicios Específicos

```bash
# Detener degux-web
docker stop degux-web

# Detener stack n8n completo
docker compose -f docker-compose.yml -f docker-compose.n8n.yml stop

# Detener todo
docker compose -f docker-compose.yml -f docker-compose.n8n.yml -f docker-compose.degux.yml down
```

#### Reiniciar Servicios

```bash
# Reinicio graceful de un contenedor
docker restart degux-web

# Recrear contenedor (rebuild si hay cambios)
docker compose -f docker-compose.yml -f docker-compose.n8n.yml -f docker-compose.degux.yml up -d --force-recreate degux-web
```

### Logs y Diagnóstico

```bash
# Logs de un contenedor (tiempo real)
docker logs -f degux-web

# Logs de nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/degux_access.log

# Health check de contenedores
docker ps --format "table {{.Names}}\t{{.Status}}"

# Inspeccionar health status
docker inspect degux-web --format '{{.State.Health.Status}}'

# Ver procesos dentro de un contenedor
docker top degux-web

# Entrar a un contenedor (troubleshooting)
docker exec -it degux-web sh
docker exec -it n8n-db psql -U n8n
```

### Mantenimiento de Base de Datos

```bash
# Conectar a PostgreSQL
docker exec -it n8n-db psql -U n8n -d n8n

# Backup manual
docker exec n8n-db pg_dump -U n8n n8n | gzip > backup_n8n_$(date +%Y%m%d).sql.gz

# Restaurar backup
gunzip < backup_n8n_20251011.sql.gz | docker exec -i n8n-db psql -U n8n -d n8n

# Ver tamaño de databases
docker exec n8n-db psql -U n8n -c "
SELECT
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE datname IN ('n8n', 'degux');"

# Vacuuming (mantenimiento)
docker exec n8n-db psql -U n8n -d n8n -c "VACUUM ANALYZE;"
```

### Actualización de Servicios

```bash
# Pull de imágenes nuevas
cd /home/gabriel/vps-do
docker compose pull

# Actualizar servicios con downtime mínimo
docker compose -f docker-compose.yml -f docker-compose.n8n.yml up -d

# Verificar versiones actuales
docker images | grep -E "n8n|postgis|redis|portainer"

# Limpiar imágenes antiguas
docker image prune -a
```

---

## 🚨 Procedimientos de Emergencia

### Si degux.cl No Responde

```bash
# 1. Verificar contenedor
docker ps -a | grep degux-web

# 2. Si está detenido, iniciarlo
cd /home/gabriel/vps-do
docker compose -f docker-compose.yml -f docker-compose.n8n.yml -f docker-compose.degux.yml up -d degux-web

# 3. Verificar logs
docker logs degux-web --tail 50

# 4. Verificar puerto 3000
curl http://localhost:3000/api/health

# 5. Verificar nginx
sudo nginx -t
sudo systemctl status nginx
```

### Si n8n No Responde

```bash
# 1. Verificar contenedor
docker ps -a | grep n8n

# 2. Verificar dependencias
docker ps -a | grep -E "n8n-db|n8n-redis"

# 3. Reiniciar stack completo
docker compose -f docker-compose.yml -f docker-compose.n8n.yml restart

# 4. Verificar puerto 5678
curl http://localhost:5678/healthz
```

### Si Nginx Cae

```bash
# 1. Verificar estado
sudo systemctl status nginx

# 2. Intentar inicio
sudo systemctl start nginx

# 3. Si falla, verificar logs
sudo journalctl -xeu nginx.service | tail -50

# 4. Validar configuración
sudo nginx -t

# 5. Si hay error de sintaxis, restaurar backup
sudo cp /etc/nginx/sites-available/degux.cl.backup-* /etc/nginx/sites-available/degux.cl
sudo systemctl restart nginx
```

### Si PostgreSQL (n8n-db) Cae

```bash
# 1. Verificar contenedor
docker ps -a | grep n8n-db

# 2. Ver logs
docker logs n8n-db --tail 100

# 3. Verificar health
docker inspect n8n-db --format '{{.State.Health.Status}}'

# 4. Reiniciar
docker restart n8n-db

# 5. Esperar a que esté healthy
watch -n 1 'docker inspect n8n-db --format "{{.State.Health.Status}}"'

# 6. Reiniciar servicios dependientes
docker restart degux-web n8n
```

### Rollback de Deployment

```bash
# 1. Ir al directorio vps-do
cd /home/gabriel/vps-do

# 2. Ver commits recientes
git log --oneline -10

# 3. Crear branch de emergencia
git checkout -b emergency-rollback-$(date +%Y%m%d)

# 4. Revertir al commit anterior
git revert <commit-hash>

# 5. Pull en VPS
ssh gabriel@167.172.251.27
cd /home/gabriel/vps-do
git pull

# 6. Recrear servicios
docker compose -f docker-compose.yml -f docker-compose.n8n.yml -f docker-compose.degux.yml up -d --force-recreate
```

---

## 📊 Monitoreo

### Health Checks Configurados

| Servicio | Endpoint | Intervalo | Timeout | Retries |
|----------|----------|-----------|---------|---------|
| **degux-web** | http://localhost:3000/api/health | 30s | 10s | 5 |
| **n8n** | http://localhost:5678/healthz | 30s | 10s | 5 |
| **n8n-db** | pg_isready -U n8n -d n8n | 30s | 10s | 5 |
| **n8n-redis** | redis-cli ping | 30s | 10s | 5 |
| **luanti-voxelibre-server** | netstat -tulpn \| grep :30000 | 30s | 10s | 3 |

### Comandos de Monitoreo Manual

```bash
# Ver todos los health statuses
docker ps --format "table {{.Names}}\t{{.Status}}"

# Ver uso de recursos
docker stats --no-stream

# Ver espacio en disco
df -h
docker system df

# Ver logs de todos los contenedores
docker compose -f docker-compose.yml -f docker-compose.n8n.yml -f docker-compose.degux.yml logs --tail=20
```

### Métricas Importantes

```bash
# Uso de CPU y memoria del host
top
htop

# Conexiones activas a nginx
sudo ss -tlnp | grep nginx

# Conexiones a PostgreSQL
docker exec n8n-db psql -U n8n -c "SELECT count(*) FROM pg_stat_activity;"

# Tamaño de volúmenes Docker
docker volume ls -q | xargs docker volume inspect --format '{{ .Name }}: {{ .Mountpoint }}' | while read line; do
    name=$(echo $line | cut -d: -f1)
    path=$(echo $line | cut -d: -f2)
    size=$(sudo du -sh $path 2>/dev/null | cut -f1)
    echo "$name: $size"
done
```

---

## 🔧 Configuración de Entorno de Desarrollo

### Variables de Entorno Necesarias

Para trabajar localmente en degux.cl:

```bash
# .env.local en /home/gabriel/degux.cl/
DATABASE_URL="postgresql://user:pass@localhost:5432/degux"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

Para VPS:

```bash
# .env en /home/gabriel/vps-do/
# Ver .env.template para la lista completa
```

### Acceso a Servicios desde Local

```bash
# Port forwarding para acceder a servicios en VPS desde local
ssh -L 5432:localhost:5432 gabriel@167.172.251.27  # PostgreSQL
ssh -L 5678:localhost:5678 gabriel@167.172.251.27  # n8n
ssh -L 3000:localhost:3000 gabriel@167.172.251.27  # degux-web
```

---

## 📚 Documentación Adicional

### Archivos de Referencia

- `/home/gabriel/Documentos/vps-do/CLAUDE.md` - Documentación general del proyecto
- `/home/gabriel/Documentos/vps-do/README.md` - Setup inicial
- `/home/gabriel/Documentos/vps-do/docs/infrastructure/PUERTOS_VPS.md` - Mapa detallado de puertos
- `/home/gabriel/Documentos/vps-do/docs/infrastructure/ssl-certificates-management.md` - Gestión de SSL
- `/home/gabriel/Documentos/vps-do/docs/reports/` - Postmortems de incidentes

### Guías de Servicios

- n8n: `/home/gabriel/Documentos/vps-do/docs/services/n8n/n8n-guide.md`
- Luanti: `/home/gabriel/Documentos/vps-do/docs/services/luanti/README.md`
- degux.cl: `/home/gabriel/Documentos/degux.cl/CLAUDE.md`

---

## 🔄 Historial de Cambios

### 2025-10-11 - Restauración Completa del Sistema

**Incidentes Resueltos**:
1. ✅ Luanti Landing Page restaurada (ruta obsoleta corregida)
2. ✅ degux.cl restaurado (servicios Docker levantados, puerto 3000 expuesto, SSL configurado)
3. ✅ n8n.gabrielpantoja.cl configurado (puerto 5678 expuesto, nginx + SSL configurado)

**Cambios en Configuración**:
- `docker-compose.degux.yml`: Agregado `ports: ["3000:3000"]`
- `docker-compose.n8n.yml`: Agregado `ports: ["5678:5678"]`
- `/etc/nginx/sites-available/luanti.gabrielpantoja.cl`: Creado
- `/etc/nginx/sites-available/degux.cl`: Actualizado con SSL
- `/etc/nginx/sites-available/n8n.gabrielpantoja.cl`: Creado
- Certificados SSL obtenidos para todos los dominios

**Documentos Creados**:
- `POSTMORTEM_2025-10-11_LUANTI_LANDING_PAGE_RESTORATION.md`
- `POSTMORTEM_2025-10-11_DEGUX_CL_RESTORATION.md`
- `SISTEMA_ACTUAL_2025-10-11.md` (este documento)

---

## 📞 Contacto y Soporte

**Administrador**: Gabriel Pantoja
**Email**: gabriel@pantoja.cl
**SSH**: `ssh gabriel@167.172.251.27`

**Servicios de Terceros**:
- Digital Ocean: https://cloud.digitalocean.com/
- Let's Encrypt: https://letsencrypt.org/
- n8n Community: https://community.n8n.io/

---

## ✅ Checklist de Estado Actual

- [x] Todos los contenedores Docker corriendo
- [x] Todos los sitios web accesibles con HTTPS
- [x] Certificados SSL válidos (expiran 2026-01-09)
- [x] Base de datos PostgreSQL funcionando
- [x] Backups de Luanti configurados (cada 6 horas)
- [ ] Backups de PostgreSQL automatizados (TODO)
- [ ] Monitoreo 24/7 implementado (TODO)
- [ ] Alertas configuradas (TODO)
- [ ] Documentation actualizada en GitHub (TODO)

---

**Última actualización**: 11 de octubre de 2025 - 05:45 UTC
**Versión del documento**: 1.0
**Estado del sistema**: ✅ Completamente operativo