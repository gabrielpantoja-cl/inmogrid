# 🚀 Degux - Próximos Pasos

**Roadmap de implementación para completar el deployment de Degux**

---

## ✅ Estado Actual (Completado)

### Infraestructura Base
- [x] VPS configurado y accesible (VPS_IP_REDACTED)
- [x] Dominio degux.cl comprado y activo (1 año)
- [x] Base de datos PostgreSQL + PostGIS configurada
- [x] Usuario `degux_user` creado con permisos correctos
- [x] PostGIS 3.4 habilitado y funcionando
- [x] Scripts de backup/restore creados y probados
- [x] Nginx configurado para degux.cl, www.degux.cl, api.degux.cl
- [x] Configuraciones SSL preparadas (pendiente activación)
- [x] Documentación completa de infraestructura
- [x] Integración con contenedor n8n-db funcionando

### Connection Strings Disponibles
```env
# Desarrollo
DATABASE_URL="postgresql://degux_user:bbsOwxrhG6oQeCnRHzWYh/Bd4Mrb4ZomPwSeO/uHJ/o=@VPS_IP_REDACTED:5432/degux?schema=public"

# Producción
DATABASE_URL="postgresql://degux_user:bbsOwxrhG6oQeCnRHzWYh/Bd4Mrb4ZomPwSeO/uHJ/o=@n8n-db:5432/degux?schema=public"
```

---

## 🎯 PASO 1: Configurar DNS del Dominio

**⏱️ Tiempo estimado**: 5 minutos (+ 15-30 min de propagación)
**👤 Responsable**: Gabriel
**📍 Dónde**: Panel del proveedor de dominio (donde compraste degux.cl)

### Acciones

1. Ir al panel de control del proveedor de dominio
2. Buscar la sección "DNS Management" o "Administrar DNS"
3. Agregar los siguientes registros DNS:

```
Tipo    Nombre    Valor              TTL
A       @         VPS_IP_REDACTED     3600
A       www       VPS_IP_REDACTED     3600
A       api       VPS_IP_REDACTED     3600
```

4. Guardar cambios

### Verificación

```bash
# Esperar 15-30 minutos, luego ejecutar:
dig degux.cl +short
dig www.degux.cl +short
dig api.degux.cl +short

# Los tres deben devolver: VPS_IP_REDACTED
```

**⚠️ No continuar al PASO 2 hasta que el DNS esté propagado**

---

## 🔒 PASO 2: Generar Certificados SSL

**⏱️ Tiempo estimado**: 5 minutos
**👤 Responsable**: Gabriel
**📍 Dónde**: VPS (SSH)
**⚠️ Prerequisito**: DNS propagado (PASO 1 completo)

### Acciones

```bash
# 1. SSH al VPS
ssh gabriel@VPS_IP_REDACTED

# 2. Ir al directorio del proyecto
cd ~/vps-do

# 3. Reiniciar Nginx para cargar configs de degux.cl
docker compose restart nginx

# 4. Verificar que Nginx no tenga errores
docker logs nginx-proxy --tail 50

# 5. Generar certificados SSL con certbot
docker compose --profile ssl-setup run --rm certbot

# Deberías ver algo como:
# Successfully received certificate.
# Certificate is saved at: /etc/letsencrypt/live/degux.cl/fullchain.pem
# Key is saved at:         /etc/letsencrypt/live/degux.cl/privkey.pem
```

### Verificación

```bash
# Ver certificados generados
docker exec nginx-proxy ls -la /etc/nginx/ssl/live/degux.cl/

# Deberías ver:
# fullchain.pem
# privkey.pem
# cert.pem
# chain.pem
```

---

## 🔐 PASO 3: Activar HTTPS en Nginx

**⏱️ Tiempo estimado**: 10 minutos
**👤 Responsable**: Gabriel
**📍 Dónde**: VPS (SSH) + GitHub
**⚠️ Prerequisito**: Certificados SSL generados (PASO 2 completo)

### Acciones

#### A. En tu máquina local

```bash
# 1. Editar configuración de degux.cl
nano /home/gabriel/Documentos/vps-do/nginx/conf.d/degux.cl.conf

# 2. Descomentar el bloque server que escucha en puerto 443 (HTTPS)
# Buscar y descomentar desde:
#   server {
#       listen 443 ssl http2;
#   ...
#   }

# 3. Descomentar la redirección HTTP → HTTPS en el bloque del puerto 80
# Buscar y descomentar:
#   return 301 https://$server_name$request_uri;

# 4. Editar configuración de api.degux.cl
nano /home/gabriel/Documentos/vps-do/nginx/conf.d/api.degux.cl.conf

# 5. Repetir pasos 2-3 para api.degux.cl

# 6. Commit y push
git add nginx/conf.d/degux.cl.conf nginx/conf.d/api.degux.cl.conf
git commit -m "Activar HTTPS para degux.cl y api.degux.cl"
git push origin main
```

#### B. En el VPS

```bash
# 1. SSH al VPS
ssh gabriel@VPS_IP_REDACTED

# 2. Pull cambios
cd ~/vps-do
git pull origin main

# 3. Reiniciar Nginx
docker compose restart nginx

# 4. Ver logs para asegurar que no hay errores
docker logs nginx-proxy --tail 50
```

### Verificación

```bash
# Desde tu máquina local, probar HTTPS
curl -I https://degux.cl
curl -I https://www.degux.cl
curl -I https://api.degux.cl

# Todos deben devolver: HTTP/2 200 (o similar)
# Y la conexión debe ser SSL/TLS
```

---

## 💾 PASO 4: Configurar Backups Automáticos

**⏱️ Tiempo estimado**: 5 minutos
**👤 Responsable**: Gabriel
**📍 Dónde**: VPS (SSH)

### Acciones

```bash
# 1. SSH al VPS
ssh gabriel@VPS_IP_REDACTED

# 2. Editar crontab
crontab -e

# 3. Agregar la siguiente línea al final del archivo:
0 3 * * * /home/gabriel/vps-do/scripts/backup-degux.sh >> /var/log/degux-backup.log 2>&1

# Esto ejecutará un backup diario a las 3 AM

# 4. Guardar y salir (Ctrl+X, luego Y, luego Enter)

# 5. Crear archivo de log
sudo touch /var/log/degux-backup.log
sudo chown gabriel:gabriel /var/log/degux-backup.log

# 6. Probar backup manual
cd ~/vps-do
./scripts/backup-degux.sh

# 7. Verificar que se creó el backup
ls -lh ~/vps-do/degux/backups/
```

### Verificación

```bash
# Al día siguiente (después de las 3 AM), verificar log
tail -f /var/log/degux-backup.log

# Deberías ver algo como:
# [YYYY-MM-DD HH:MM:SS] Backup completed: degux_backup_YYYYMMDD_HHMMSS.sql.gz
```

---

## 💻 PASO 5: Preparar Aplicación Web (Desarrollo Local)

**⏱️ Tiempo estimado**: 30-60 minutos
**👤 Responsable**: Gabriel
**📍 Dónde**: Tu máquina local

### Acciones

#### A. Clonar y configurar repositorio

```bash
# 1. Clonar repositorio web
git clone https://github.com/gabrielpantoja-cl/degux.cl.git
cd degux.cl

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env.local
cp .env.example .env.local

# 4. Editar .env.local
nano .env.local
```

#### B. Configurar variables de entorno

```env
# Database
DATABASE_URL="postgresql://degux_user:bbsOwxrhG6oQeCnRHzWYh/Bd4Mrb4ZomPwSeO/uHJ/o=@VPS_IP_REDACTED:5432/degux?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generar_con_openssl_rand_base64_32"

# APIs externas (si las necesitas)
GOOGLE_MAPS_API_KEY="tu_api_key"
# ...
```

#### C. Configurar Prisma y ejecutar migrations

```bash
# 1. Generar cliente Prisma
npx prisma generate

# 2. Ejecutar migrations iniciales
npx prisma migrate dev --name init

# 3. (Opcional) Poblar base de datos con datos de prueba
npx prisma db seed
```

#### D. Iniciar servidor de desarrollo

```bash
# Iniciar Next.js en modo desarrollo
npm run dev

# Abrir en navegador: http://localhost:3000
```

### Verificación

- [ ] App carga correctamente en http://localhost:3000
- [ ] Conexión a base de datos funciona
- [ ] Prisma Studio funciona: `npx prisma studio`
- [ ] No hay errores en la consola

---

## 🌐 PASO 6: Deployment a Producción (Vercel)

**⏱️ Tiempo estimado**: 15-30 minutos
**👤 Responsable**: Gabriel
**📍 Dónde**: Vercel Dashboard
**⚠️ Prerequisito**: App funcionando en desarrollo (PASO 5 completo)

### Opción A: Deploy en Vercel (Recomendado)

#### Acciones

```bash
# 1. Ir a https://vercel.com/dashboard
# 2. Clic en "Add New Project"
# 3. Importar repositorio: gabrielpantoja-cl/degux.cl
# 4. Configurar variables de entorno en Vercel:

Environment Variables:
  DATABASE_URL="postgresql://degux_user:bbsOwxrhG6oQeCnRHzWYh/Bd4Mrb4ZomPwSeO/uHJ/o=@VPS_IP_REDACTED:5432/degux?schema=public"
  NEXTAUTH_URL="https://degux.cl"
  NEXTAUTH_SECRET="tu_secret_de_produccion"
  # ... otras variables

# 5. Deploy
# 6. Configurar custom domain: degux.cl
```

#### Configurar dominio personalizado en Vercel

```bash
# En Vercel Dashboard:
# 1. Ir a Settings > Domains
# 2. Agregar dominio: degux.cl
# 3. Vercel te dará instrucciones DNS (probablemente CNAME)

# ⚠️ IMPORTANTE: Si Vercel requiere CNAME en lugar de A record:
# - Cambiar el registro A de degux.cl por un CNAME apuntando a tu-app.vercel.app
# - O usar Vercel DNS directamente
```

### Opción B: Deploy en VPS (Docker)

Si prefieres no usar Vercel:

```bash
# Crear docker-compose.degux-web.yml en el VPS
# Ver sección "Deployment Docker" en degux-infrastructure-guide.md
```

### Verificación

- [ ] https://degux.cl carga correctamente
- [ ] SSL/TLS funcionando (candado verde en navegador)
- [ ] App conecta a base de datos
- [ ] Autenticación funciona
- [ ] No hay errores en Vercel logs

---

## 📊 PASO 7: Configurar N8N Workflows (Opcional pero Recomendado)

**⏱️ Tiempo estimado**: 1-2 horas
**👤 Responsable**: Gabriel
**📍 Dónde**: N8N (http://N8N_HOST_REDACTED)

### Workflows Sugeridos

#### 1. Scraping de portales inmobiliarios

```
Trigger (Schedule)
  → HTTP Request (Portal Inmobiliario, Yapo, etc.)
  → HTML Extract (datos de propiedades)
  → PostgreSQL (insert en BD degux)
  → Notify (Slack/Email si hay errores)
```

#### 2. Health check de Degux

```
Trigger (Schedule cada 5 min)
  → HTTP Request (https://degux.cl/api/health)
  → Conditional
    → Si falla: Send alert (Slack/Email)
    → Si OK: Log metrics
```

#### 3. Backup automático notify

```
Trigger (Schedule daily 3:10 AM)
  → Execute Command (check backup log)
  → Conditional
    → Si backup OK: Send success notification
    → Si backup falla: Send alert
```

### Acciones

```bash
# 1. Acceder a N8N
# Abrir: http://N8N_HOST_REDACTED

# 2. Crear credenciales para PostgreSQL degux
# - Tipo: Postgres
# - Host: n8n-db (desde N8N, no localhost)
# - Port: 5432
# - Database: degux
# - User: degux_user
# - Password: [tu password]

# 3. Importar workflows desde /workflows/
# O crear manualmente siguiendo las plantillas de arriba

# 4. Activar workflows
```

### Verificación

- [ ] Workflows activos en N8N
- [ ] Conexión a BD degux funciona desde N8N
- [ ] Scraping workflows ejecutan sin errores
- [ ] Notificaciones funcionan

---

## 📈 PASO 8: Monitoreo y Mantenimiento

**⏱️ Tiempo estimado**: 30 minutos (configuración inicial)
**👤 Responsable**: Gabriel
**📍 Dónde**: VPS + Dashboards

### Acciones

#### A. Configurar alertas

```bash
# 1. Configurar Uptime Robot (gratuito)
# https://uptimerobot.com
# - Monitor: https://degux.cl (HTTP(s))
# - Check interval: 5 minutos
# - Alert contacts: tu email

# 2. Opcional: Configurar Grafana (si ya tienes)
# - Agregar datasource: PostgreSQL (degux)
# - Crear dashboard con métricas clave
```

#### B. Documentar métricas clave

```bash
# Crear script de monitoring simple
nano ~/vps-do/scripts/degux-status.sh
```

```bash
#!/bin/bash
# Degux Health Check

echo "=== Degux Status Report ==="
echo "Date: $(date)"
echo ""

# Check database
echo "Database size:"
docker exec n8n-db psql -U degux_user -d degux -c "SELECT pg_size_pretty(pg_database_size('degux'));"

echo ""
echo "Recent backups:"
ls -lht ~/vps-do/degux/backups/ | head -5

echo ""
echo "App uptime:"
curl -s -o /dev/null -w "%{http_code}" https://degux.cl
```

#### C. Programar chequeos semanales

```bash
# Agregar a crontab
crontab -e

# Chequeo semanal (cada lunes a las 9 AM)
0 9 * * 1 /home/gabriel/vps-do/scripts/degux-status.sh | mail -s "Degux Weekly Status" tu@email.com
```

### Verificación

- [ ] Uptime monitoring activo
- [ ] Alertas configuradas
- [ ] Script de status funciona
- [ ] Recibes reportes semanales

---

## 🎉 PASO 9: Go Live Checklist

**Antes de anunciar públicamente Degux, verificar:**

### Seguridad
- [ ] HTTPS funcionando en todos los dominios
- [ ] Certificados SSL válidos y auto-renovables
- [ ] Variables de entorno seguras (no expuestas)
- [ ] Rate limiting configurado en API
- [ ] CORS configurado correctamente
- [ ] Headers de seguridad activos (HSTS, XSS, etc.)

### Funcionalidad
- [ ] Registro de usuarios funciona
- [ ] Login/Logout funciona
- [ ] Dashboard de usuario carga
- [ ] Mapas con PostGIS funcionan
- [ ] API endpoints responden correctamente
- [ ] Formularios validan datos

### Performance
- [ ] Tiempos de carga < 3 segundos
- [ ] Imágenes optimizadas
- [ ] Caching configurado
- [ ] CDN activo (si usas Vercel)

### Monitoring
- [ ] Backups automáticos activos
- [ ] Uptime monitoring configurado
- [ ] Alertas funcionando
- [ ] Logs accesibles

### Documentación
- [ ] README.md actualizado
- [ ] Guías de usuario creadas
- [ ] API documentation disponible
- [ ] Onboarding flow funcional

---

## 📅 Timeline Estimado

| Fase | Pasos | Tiempo Estimado | Puede hacerse en paralelo |
|------|-------|-----------------|--------------------------|
| **Fase 1: DNS y SSL** | PASO 1-3 | 1 hora (+30min propagación) | No |
| **Fase 2: Backups** | PASO 4 | 10 minutos | Sí |
| **Fase 3: Desarrollo** | PASO 5 | 2-4 horas | Sí |
| **Fase 4: Deployment** | PASO 6 | 30 minutos | No (requiere PASO 5) |
| **Fase 5: Automation** | PASO 7 | 1-2 horas | Sí |
| **Fase 6: Monitoring** | PASO 8 | 30 minutos | Sí |
| **Fase 7: Go Live** | PASO 9 | 1 hora | No |
| **TOTAL** | | **5-9 horas** | |

**Tiempo mínimo viable** (PASO 1-6 solo): ~4-6 horas

---

## 🆘 Recursos de Ayuda

### Documentación
- [Guía de Infraestructura](./degux-infrastructure-guide.md)
- [Deployment Guide](/docs/DEPLOYMENT_DEGUX.md)
- [Database README](/degux/README.md)

### Scripts Útiles
- Setup DB: `/scripts/setup-degux-db.sh`
- Backup: `/scripts/backup-degux.sh`
- Restore: `/scripts/restore-degux.sh`
- Deploy: `/scripts/deploy.sh`

### Comandos Rápidos
```bash
# Status general
./scripts/deploy.sh status

# Ver logs
docker logs n8n-db -f
docker logs nginx-proxy -f

# Conectar a BD
docker exec -it n8n-db psql -U degux_user -d degux

# Backup manual
./scripts/backup-degux.sh
```

---

## 🎯 Prioridades

**CRÍTICO (hacer ya):**
1. ✅ PASO 1: Configurar DNS ← **EMPEZAR POR AQUÍ**
2. ⏳ PASO 2-3: SSL/HTTPS
3. ⏳ PASO 4: Backups automáticos

**IMPORTANTE (próxima semana):**
4. ⏳ PASO 5: Desarrollo local
5. ⏳ PASO 6: Deployment producción

**OPCIONAL (cuando haya tiempo):**
6. ⏳ PASO 7: N8N workflows
7. ⏳ PASO 8: Monitoring avanzado

---

**🚀 ¡La infraestructura está lista! Solo falta deployment de la aplicación.**

**Última actualización**: 01 de Octubre, 2025
