# Arquitectura de Puertos - VPS Digital Ocean

**Fecha**: 6 de Octubre, 2025
**VPS**: VPS_IP_REDACTED (ubuntu-s-2vcpu-2gb-amd-nyc3-01)

---

## 🏗️ Arquitectura General

El VPS utiliza **Docker Compose** con contenedores gestionados, NO servicios nativos de systemd.

```
Internet (Cloudflare)
    ↓
VPS VPS_IP_REDACTED
    ↓
nginx-proxy (Docker) :80, :443
    ↓
[Servicios en contenedores Docker]
```

---

## 🔌 Puertos en Uso

### Puertos Públicos (0.0.0.0)

| Puerto | Servicio | Tipo | Contenedor/Proceso |
|--------|----------|------|-------------------|
| **22** | SSH | TCP | systemd (nativo) |
| **80** | HTTP | TCP | nginx-proxy (Docker) |
| **443** | HTTPS | TCP | nginx-proxy (Docker) |
| **8000** | Portainer HTTP | TCP | portainer (Docker) |
| **9443** | Portainer HTTPS | TCP | portainer (Docker) |
| **30000** | Luanti Game Server | UDP | vegan-wetlands-server (Docker) |

### Puertos Internos (Docker Network)

| Puerto | Servicio | Contenedor | Acceso |
|--------|----------|------------|--------|
| **3000** | inmogrid.cl (Next.js) | inmogrid-web | nginx-proxy → inmogrid-web:3000 |
| **3000** | luanti landing | vegan-wetlands-* | nginx-proxy → contenedor:3000 |
| **5432** | PostgreSQL | n8n-db | Contenedores en red vps_network |
| **5678** | n8n Web UI | n8n | nginx-proxy → n8n:5678 |
| **6379** | Redis | n8n-redis | Solo n8n |

### Puertos Locales (127.0.0.x)

| Puerto | Servicio | Tipo |
|--------|----------|------|
| **53** | systemd-resolved | DNS local |

---

## 📦 Contenedores Docker Activos

```bash
$ docker ps
```

| Contenedor | Estado | Puertos | Descripción |
|------------|--------|---------|-------------|
| **nginx-proxy** | running | 80, 443 | Reverse proxy principal |
| **portainer** | running | 8000, 9443 | UI gestión Docker |
| **inmogrid-web** | unhealthy | 3000 (interno) | inmogrid.cl Next.js app |
| **n8n** | running | 5678 (interno) | Workflow automation |
| **n8n-db** | running | 5432 (interno) | PostgreSQL + PostGIS |
| **n8n-redis** | running | 6379 (interno) | Redis cache |
| **vegan-wetlands-server** | running | 30000 (UDP) | Luanti game server |
| **vegan-wetlands-backup** | running | - | Backup service |

---

## 🌐 Configuración nginx-proxy

### Archivos de Configuración

Ubicación en contenedor: `/etc/nginx/conf.d/`

```bash
$ docker exec nginx-proxy ls /etc/nginx/conf.d/
api.inmogrid.cl.conf       # API subdomain
inmogrid.cl.conf           # Main domain
luanti-landing.conf     # Luanti landing page
n8n.conf                # N8N_HOST_REDACTED
```

### Mapeo de Dominios

| Dominio | Puerto | Target Container | Estado |
|---------|--------|------------------|--------|
| **inmogrid.cl** | 443 | inmogrid-web:3000 | ⚠️ Unhealthy |
| **www.inmogrid.cl** | 443 | inmogrid-web:3000 | ⚠️ Unhealthy |
| **api.inmogrid.cl** | 443 | inmogrid-web:3000 | ⚠️ Unhealthy |
| **N8N_HOST_REDACTED** | 443 | n8n:5678 | ✅ OK |
| **luanti.gabrielpantoja.cl** | 443 | vegan-wetlands:3000 | ✅ OK |
| **pitutito.cl** | 443 | vegan-wetlands:3000 | ✅ OK |

---

## 🔐 Certificados SSL

### Certificados Activos

```
/etc/letsencrypt/live/ (en nginx-proxy)
└── luanti.gabrielpantoja.cl/
    ├── fullchain.pem
    ├── privkey.pem
    └── chain.pem
```

**Certificado Multi-Dominio** cubre:
- luanti.gabrielpantoja.cl
- pitutito.cl
- N8N_HOST_REDACTED
- inmogrid.cl (⚠️ usando cert de luanti temporalmente)
- www.inmogrid.cl
- api.inmogrid.cl

**Generado con**: certbot en modo manual (no --nginx automático)

---

## ⚠️ Problemas Identificados

### 1. Contenedor inmogrid-web Unhealthy

**Síntoma:**
```bash
$ docker ps
inmogrid-web    Up 4 days (unhealthy)
```

**Causa:**
```bash
$ docker exec inmogrid-web wget --spider http://localhost:3000/api/health
wget: server returned error: HTTP/1.1 404 Not Found
```

El healthcheck espera `/api/health` pero la ruta devuelve 404.

**Impacto:**
- Docker marca el contenedor como unhealthy
- nginx-proxy sigue proxy-pasando tráfico (funciona pero con warning)

**Solución pendiente:**
- Verificar que `/api/health` existe en el código de inmogrid.cl
- O actualizar healthcheck en docker-compose.inmogrid.yml

---

### 2. Proceso PM2 Duplicado

**Encontrado:**
```bash
gabriel  1510130  PM2 v6.0.13 (/home/gabriel/.pm2)  # ← inmogrid-app
root     1806465  PM2 v6.0.13 (/root/.pm2)          # ← instalado por script
```

**Causa:**
- Script `deploy-inmogrid-simple.sh` asumió arquitectura nativa
- Instaló PM2 y creó proceso que compite con Docker

**Impacto:**
- Confusión entre proceso PM2 y contenedor Docker
- PM2 escucha puerto 3000 en host (conflicto potencial)

**Solución:**
```bash
# Detener y eliminar PM2
pm2 delete inmogrid-app
pm2 save
sudo systemctl disable pm2-gabriel
```

---

### 3. Intento de Iniciar Nginx Nativo

**Error:**
```bash
$ sudo systemctl start nginx
Job for nginx.service failed because the control process exited with error code.
nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)
```

**Causa:**
- nginx-proxy (Docker) ya usa puertos 80/443
- Script intentó iniciar Nginx nativo de systemd

**Solución:**
- NO usar Nginx nativo
- Gestionar todo a través de nginx-proxy (Docker)

---

## ✅ Arquitectura Correcta

### Deployment Workflow

```
1. Desarrollador hace cambios en inmogrid.cl repo
2. GitHub Actions build imagen Docker
3. VPS pull nueva imagen
4. docker compose restart inmogrid-web
5. nginx-proxy proxy_pass a inmogrid-web:3000
```

### Docker Compose Files

```
~/vps-do/
├── docker-compose.yml              # Base (nginx-proxy, portainer)
├── docker-compose.inmogrid.yml        # inmogrid.cl service
├── docker-compose.n8n.yml          # n8n + PostgreSQL
├── docker-compose.web.yml          # luanti landing
├── docker-compose.rag.yml          # RAG stack (disabled)
└── docker-compose.supabase.yml     # Supabase (disabled)
```

### Comandos de Gestión

```bash
# Ver todos los servicios
docker ps

# Reiniciar inmogrid.cl
cd ~/vps-do
docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml restart inmogrid-web

# Ver logs de inmogrid
docker logs inmogrid-web -f

# Rebuild inmogrid (después de cambios en código)
cd ~/vps-do
docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml build inmogrid-web
docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml up -d inmogrid-web

# Recargar nginx-proxy (después de cambios en configs)
docker exec nginx-proxy nginx -s reload
```

---

## 📋 Verificaciones

### Health Checks

```bash
# Verificar contenedor inmogrid-web
docker inspect inmogrid-web --format '{{.State.Health.Status}}'

# Test manual healthcheck
docker exec inmogrid-web wget --spider http://localhost:3000/api/health

# Ver logs de health check
docker logs inmogrid-web | grep health
```

### Conectividad

```bash
# Test desde nginx-proxy a inmogrid-web
docker exec nginx-proxy wget -O- http://inmogrid-web:3000/ | head -20

# Test desde host
curl -I http://localhost/ -H "Host: inmogrid.cl"

# Test producción
curl -I https://inmogrid.cl/
```

---

## 🔧 Troubleshooting

### Problema: Contenedor no responde

```bash
# Ver logs
docker logs inmogrid-web --tail 50

# Reiniciar contenedor
docker restart inmogrid-web

# Verificar red Docker
docker network inspect vps_network
```

### Problema: nginx-proxy no encuentra contenedor

```bash
# Verificar que ambos están en misma red
docker inspect inmogrid-web --format '{{.NetworkSettings.Networks}}'
docker inspect nginx-proxy --format '{{.NetworkSettings.Networks}}'

# Verificar DNS interno Docker
docker exec nginx-proxy nslookup inmogrid-web
```

### Problema: Puerto en uso

```bash
# Ver qué usa el puerto
ss -tlnp | grep :3000

# Detener proceso/contenedor conflictivo
docker stop <container>
# o
pm2 delete <app>
```

---

## 📚 Referencias

- **Docker Compose Docs**: `/home/gabriel/vps-do/docs/`
- **Nginx Configs**: `/home/gabriel/vps-do/nginx/` (copiados a contenedor)
- **CLAUDE.md**: `/home/gabriel/vps-do/CLAUDE.md`
- **Deploy Scripts**: `/home/gabriel/vps-do/scripts/`

---

## 🎯 Próximos Pasos

1. **Arreglar healthcheck de inmogrid-web**
   - Verificar endpoint `/api/health` existe
   - O cambiar healthcheck a `/` o `/api/`

2. **Limpiar PM2 instalado por error**
   ```bash
   pm2 delete inmogrid-app
   pm2 kill
   sudo systemctl disable pm2-gabriel
   ```

3. **Generar certificado SSL dedicado para inmogrid.cl**
   ```bash
   docker exec nginx-proxy certbot certonly --webroot \
     -w /var/www/certbot \
     -d inmogrid.cl -d www.inmogrid.cl -d api.inmogrid.cl
   ```

4. **Actualizar nginx config para usar cert correcto**

5. **Rebuild inmogrid-web con código actualizado**

---

🤖 Documentación creada por Claude Code
📅 6 de Octubre, 2025
