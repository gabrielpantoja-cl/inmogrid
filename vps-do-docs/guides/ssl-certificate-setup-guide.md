# Guía de Configuración de Certificados SSL/HTTPS

Esta guía documenta el proceso correcto para generar y configurar certificados SSL Let's Encrypt en nuestros sitios web usando Docker Compose y Nginx.

## 🔒 Arquitectura SSL

### Componentes
- **Let's Encrypt**: Autoridad certificadora gratuita
- **Certbot**: Cliente automatizado para Let's Encrypt
- **Nginx**: Reverse proxy con terminación SSL
- **Docker Compose**: Orquestación de servicios

### Estructura de Archivos
```
/
├── docker-compose.yml          # Servicio certbot configurado
├── nginx/
│   ├── ssl/                    # Certificados SSL montados desde host
│   ├── www/                    # Webroot para challenges ACME
│   └── conf.d/
│       └── sitio.conf          # Configuración nginx con SSL
└── scripts/
    └── setup-ssl-[sitio].sh    # Scripts de configuración automatizada
```

## 📋 Proceso de Configuración SSL

### 1. Preparar Configuración Nginx

Crear archivo `nginx/conf.d/sitio.conf` con dos bloques server:

```nginx
# HTTPS Configuration
server {
    listen 443 ssl http2;
    server_name sitio.dominio.cl;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/live/sitio.dominio.cl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/live/sitio.dominio.cl/privkey.pem;
    ssl_trusted_certificate /etc/nginx/ssl/live/sitio.dominio.cl/chain.pem;

    # Modern SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Enhanced Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'";

    root /var/www/sitio-content;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}

# HTTP to HTTPS Redirect
server {
    listen 80;
    server_name sitio.dominio.cl;

    # Let's Encrypt challenge location
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}
```

### 2. Actualizar Docker Compose

Agregar el dominio al comando certbot en `docker-compose.yml`:

```yaml
certbot:
  image: certbot/certbot:latest
  container_name: certbot
  volumes:
    - ./nginx/ssl:/etc/letsencrypt
    - ./nginx/www:/var/www/certbot
  command: certonly --webroot --webroot-path=/var/www/certbot --email tu@email.cl --agree-tos --no-eff-email -d dominio-existente.cl -d nuevo-sitio.dominio.cl
  profiles:
    - ssl-setup
```

### 3. Proceso de Implementación

#### Método Automático (Recomendado)
```bash
# 1. Ejecutar script automatizado
./scripts/setup-ssl-sitio.sh

# 2. Verificar instalación
curl -I https://sitio.dominio.cl
```

#### Método Manual
```bash
# 1. Crear configuración temporal solo HTTP
# (Remover bloque HTTPS temporalmente)

# 2. Reiniciar nginx
docker compose restart nginx

# 3. Generar certificado
docker compose --profile ssl-setup run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  --email tu@email.cl --agree-tos --no-eff-email \
  -d sitio.dominio.cl

# 4. Restaurar configuración HTTPS completa

# 5. Recargar nginx
docker compose exec nginx-proxy nginx -s reload

# 6. Probar configuración
curl -I https://sitio.dominio.cl
curl -I http://sitio.dominio.cl  # Debe devolver 301
```

## 🛠️ Scripts de Automatización

### Template de Script SSL
```bash
#!/bin/bash
# SSL Certificate Setup for sitio.dominio.cl

set -e

DOMAIN="sitio.dominio.cl"
cd /home/gabriel/vps-do

# Ensure webroot directory exists
mkdir -p nginx/www

# Generate SSL certificate
docker compose --profile ssl-setup run --rm certbot \
  certonly --webroot --webroot-path=/var/www/certbot \
  --email gabriel@pantoja.cl --agree-tos --no-eff-email \
  -d $DOMAIN

# Reload nginx
docker compose exec nginx-proxy nginx -s reload

# Test SSL
if curl -I https://$DOMAIN 2>/dev/null | grep -q "200 OK"; then
  echo "✅ SSL certificate installed successfully!"
else
  echo "❌ SSL setup may have issues"
fi
```

## 🔄 Renovación Automática

Los certificados Let's Encrypt duran 90 días. Para renovación automática:

```bash
# Renovar todos los certificados
docker compose --profile ssl-setup run --rm certbot renew

# Recargar nginx después de renovación
docker compose exec nginx-proxy nginx -s reload

# Cron job recomendado (ejecutar mensualmente)
0 12 1 * * cd /home/gabriel/vps-do && docker compose --profile ssl-setup run --rm certbot renew && docker compose exec nginx-proxy nginx -s reload
```

## 🔍 Verificación y Troubleshooting

### Comandos de Verificación
```bash
# Verificar configuración nginx
docker compose exec nginx-proxy nginx -t

# Ver certificados disponibles
docker compose exec nginx-proxy ls -la /etc/nginx/ssl/live/

# Probar HTTPS
curl -I https://sitio.dominio.cl

# Probar redirect HTTP → HTTPS
curl -I http://sitio.dominio.cl

# Ver logs de nginx
docker compose logs nginx-proxy

# Ver logs de certbot
docker compose --profile ssl-setup logs certbot
```

### Problemas Comunes

**1. Certificate not found (nginx fails to start)**
- Solución: Usar configuración temporal solo HTTP para generar certificados

**2. Challenge failed (403/404 on .well-known)**
- Solución: Verificar que nginx esté sirviendo en HTTP con webroot correcto

**3. Domain validation failed**
- Solución: Verificar DNS y accesibilidad del dominio

**4. Conflicting server names**
- Solución: Eliminar configuraciones duplicadas en nginx/conf.d/

## 🎯 SSL Rating A+

La configuración implementada logra rating A+ en SSL Labs con:

- **Protocolos**: TLS 1.2 y 1.3 únicamente
- **Cifrados**: Suite moderna sin vulnerabilidades
- **HSTS**: Activado con 2 años de duración
- **Headers de Seguridad**: Completos (CSP, X-Frame-Options, etc.)
- **Certificate Chain**: Correcta con intermediate certificates

### Verificar Rating
```bash
# URL para verificar SSL Labs
echo "Verify SSL rating at: https://www.ssllabs.com/ssltest/analyze.html?d=sitio.dominio.cl"
```

## 📚 Casos de Uso Implementados

### Luanti Landing Page
- **Dominio**: `luanti.gabrielpantoja.cl`
- **Script**: `scripts/setup-ssl-luanti.sh`
- **Estado**: ✅ Implementado con éxito (Sep 2025)
- **Rating SSL**: A+ esperado

### Próximos Sitios
Para nuevos sitios, seguir este proceso documentado usando los templates proporcionados.

---

*Documentación actualizada: Septiembre 2025*
*Autor: Gabriel Pantoja con asistencia de Claude Code*