# Configuración de Deployment Automático

## Resumen

Este proyecto usa **GitHub Actions** para deployment automático al VPS cada vez que se hace push a `main`.

### Ventajas vs Vercel
- ✅ Control total sobre el servidor
- ✅ Sin límites de tiempo de ejecución
- ✅ Base de datos PostgreSQL dedicada (port 5433)
- ✅ Deployment automático con tests pre-deploy
- ✅ Rollback manual si es necesario
- ✅ Logs centralizados con PM2

---

## Configuración Inicial (Ejecutar una sola vez)

### 1. Configurar Secrets en GitHub

Ir a tu repositorio en GitHub:
`https://github.com/gabrielpantoja-cl/degux.cl/settings/secrets/actions`

Agregar los siguientes **Repository Secrets**:

#### `VPS_HOST`
```
VPS_IP_REDACTED
```

#### `VPS_USER`
```
gabriel
```

#### `VPS_SSH_KEY`
```
[Contenido de tu clave privada SSH]
```

**Cómo obtener la clave SSH:**

```bash
# En tu máquina local (donde haces SSH al VPS)
cat ~/.ssh/id_rsa

# Si no existe, crear una nueva:
ssh-keygen -t rsa -b 4096 -C "deploy@degux.cl"

# Copiar la clave pública al VPS:
ssh-copy-id gabriel@VPS_IP_REDACTED
```

**IMPORTANTE:** Copia el contenido **completo** de la clave privada, incluyendo:
```
-----BEGIN OPENSSH PRIVATE KEY-----
[contenido de la clave]
-----END OPENSSH PRIVATE KEY-----
```

---

### 2. Preparar el VPS para Deployment

Conectarse al VPS:
```bash
ssh gabriel@VPS_IP_REDACTED
```

#### 2.1. Instalar PM2 (si no está instalado)
```bash
npm install -g pm2

# Verificar instalación
pm2 --version
```

#### 2.2. Clonar el repositorio (si no existe)
```bash
cd /home/gabriel
git clone https://github.com/gabrielpantoja-cl/degux.cl.git
cd degux.cl
```

#### 2.3. Configurar variables de entorno
```bash
cd /home/gabriel/degux.cl

# Crear archivo .env.local con las variables necesarias
nano .env.local
```

**Contenido mínimo de `.env.local`:**
```env
# Database
POSTGRES_PRISMA_URL=postgresql://degux_user:PASSWORD@localhost:5433/degux_core?schema=public&sslmode=require

# NextAuth.js
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
NEXTAUTH_URL=https://degux.cl
NEXTAUTH_SECRET=tu_secreto_seguro_32chars

# Google Maps API
GOOGLE_MAPS_API_KEY=tu_maps_api_key
```

#### 2.4. Primera instalación manual
```bash
cd /home/gabriel/degux.cl

# Instalar dependencias
npm ci

# Generar Prisma client
npm run prisma:generate

# Push schema (si es necesario)
npm run prisma:push

# Build
npm run build

# Iniciar con PM2
pm2 start npm --name "degux-app" -- start
pm2 save
pm2 startup  # Seguir instrucciones para autostart
```

#### 2.5. Configurar Nginx (si no está configurado)

Verificar que Nginx esté proxeando a `localhost:3000`:

```bash
sudo nano /etc/nginx/sites-available/degux.cl
```

**Configuración necesaria:**
```nginx
server {
    server_name degux.cl www.degux.cl;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/degux.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/degux.cl/privkey.pem;
}

server {
    if ($host = degux.cl) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name degux.cl www.degux.cl;
    return 404;
}
```

Reiniciar Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Flujo de Deployment Automático

### Cada vez que haces push a `main`:

1. **GitHub Actions detecta el push**
2. **Ejecuta tests** (si están configurados)
3. **Build local** para verificar que compila
4. **Conecta al VPS via SSH**
5. **Ejecuta en el VPS:**
   - `git pull origin main`
   - `npm ci`
   - `npm run prisma:generate`
   - `npm run build`
   - `pm2 restart degux-app`
6. **Verifica health check**
7. **Notifica resultado**

### Para ver el estado del deployment:

Ve a tu repositorio:
`https://github.com/gabrielpantoja-cl/degux.cl/actions`

---

## Comandos Útiles

### En el VPS (SSH):

```bash
# Ver estado de la aplicación
pm2 status

# Ver logs en tiempo real
pm2 logs degux-app

# Ver logs con filtro
pm2 logs degux-app --lines 100

# Restart manual
pm2 restart degux-app

# Ver métricas
pm2 monit

# Deployment manual
cd /home/gabriel/degux.cl
bash scripts/deploy.sh
```

### En local:

```bash
# Trigger deployment manual desde GitHub UI
# Ir a: Actions -> Deploy to Production VPS -> Run workflow

# Verificar que el build funciona localmente antes de push
npm run build

# Ver estado del último deployment
gh run list --workflow=deploy-production.yml
```

---

## Troubleshooting

### El deployment falla

1. **Verificar logs en GitHub Actions:**
   - `https://github.com/gabrielpantoja-cl/degux.cl/actions`

2. **Verificar SSH key:**
   - Asegúrate de que la clave privada completa está en el secret `VPS_SSH_KEY`
   - Prueba SSH manualmente: `ssh gabriel@VPS_IP_REDACTED`

3. **Verificar permisos en VPS:**
   ```bash
   ls -la /home/gabriel/degux.cl
   git status
   ```

### La aplicación no inicia después del deploy

```bash
# En el VPS
cd /home/gabriel/degux.cl
pm2 logs degux-app --lines 50

# Verificar variables de entorno
cat .env.local

# Verificar que el build existe
ls -la .next

# Restart manual
pm2 restart degux-app
```

### Los cambios no se reflejan en producción

```bash
# En el VPS
cd /home/gabriel/degux.cl
git log -1  # Verificar último commit

# Force pull si es necesario
git fetch origin main
git reset --hard origin/main

# Rebuild manual
npm run build
pm2 restart degux-app
```

### Health check falla

```bash
# Verificar que la app está corriendo
pm2 status

# Verificar que Nginx está proxeando correctamente
curl http://localhost:3000/api/health

# Verificar SSL
curl https://degux.cl/api/health
```

---

## Rollback

Si necesitas hacer rollback a una versión anterior:

```bash
# En el VPS
cd /home/gabriel/degux.cl

# Ver commits recientes
git log --oneline -10

# Rollback al commit anterior
git reset --hard HEAD~1

# O rollback a un commit específico
git reset --hard <commit-hash>

# Rebuild y restart
npm ci
npm run build
pm2 restart degux-app
```

---

## Mejoras Futuras

- [ ] Agregar tests automatizados antes del deploy
- [ ] Implementar health checks más robustos
- [ ] Configurar notificaciones por Slack/Discord
- [ ] Implementar staging environment
- [ ] Agregar smoke tests post-deployment
- [ ] Configurar backup automático antes de deploy
- [ ] Implementar blue-green deployment

---

## Seguridad

- ✅ Las claves SSH están encriptadas en GitHub Secrets
- ✅ Las variables de entorno sensibles no están en el repositorio
- ✅ Nginx usa SSL/TLS (Let's Encrypt)
- ✅ PM2 corre con usuario no-root
- ⚠️ Considerar agregar rate limiting en Nginx
- ⚠️ Considerar agregar fail2ban para protección SSH

---

## Referencias

- **GitHub Actions**: https://docs.github.com/en/actions
- **PM2**: https://pm2.keymetrics.io/docs/usage/quick-start/
- **Nginx**: https://nginx.org/en/docs/
- **SSH Action**: https://github.com/appleboy/ssh-action
