#!/bin/bash

# Script para configurar Nginx para inmogrid.cl
# Ejecutar con: sudo bash setup-nginx-inmogrid.sh

set -e

echo "🔧 Configurando Nginx para inmogrid.cl..."
echo ""

# Verificar si estamos corriendo con sudo
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script debe ejecutarse con sudo"
    echo "   Ejecutar: sudo bash setup-nginx-inmogrid.sh"
    exit 1
fi

# Verificar si ya existe configuración
if [ -f /etc/nginx/sites-available/inmogrid.cl ]; then
    echo "⚠️  Ya existe configuración para inmogrid.cl"
    echo "   ¿Desea sobrescribir? (s/N)"
    read -r response
    if [[ ! "$response" =~ ^[Ss]$ ]]; then
        echo "   Cancelado."
        exit 0
    fi
fi

# Crear archivo de configuración
echo "1️⃣ Creando configuración Nginx para inmogrid.cl..."
cat > /etc/nginx/sites-available/inmogrid.cl <<'EOF'
server {
    server_name inmogrid.cl www.inmogrid.cl;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # IMPORTANTE: No cachear en Nginx
        proxy_cache_bypass $http_upgrade;
        proxy_no_cache 1;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/inmogrid.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/inmogrid.cl/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = www.inmogrid.cl) {
        return 301 https://$host$request_uri;
    }

    if ($host = inmogrid.cl) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name inmogrid.cl www.inmogrid.cl;
    return 404;
}
EOF

echo "   ✅ Archivo creado: /etc/nginx/sites-available/inmogrid.cl"

# Verificar si certificado SSL existe
echo ""
echo "2️⃣ Verificando certificado SSL..."
if [ ! -f /etc/letsencrypt/live/inmogrid.cl/fullchain.pem ]; then
    echo "   ⚠️  NO se encontró certificado SSL para inmogrid.cl"
    echo "   Generando certificado con Certbot..."

    # Verificar si certbot está instalado
    if ! command -v certbot &> /dev/null; then
        echo "   ❌ Certbot no está instalado"
        echo "   Instalar con: sudo apt install certbot python3-certbot-nginx"
        exit 1
    fi

    # Generar certificado
    certbot --nginx -d inmogrid.cl -d www.inmogrid.cl --non-interactive --agree-tos --email gabrielpantojarivera@gmail.com

    if [ $? -eq 0 ]; then
        echo "   ✅ Certificado SSL generado exitosamente"
    else
        echo "   ❌ Error al generar certificado SSL"
        exit 1
    fi
else
    echo "   ✅ Certificado SSL encontrado"
fi

# Crear symlink en sites-enabled
echo ""
echo "3️⃣ Activando sitio..."
if [ -L /etc/nginx/sites-enabled/inmogrid.cl ]; then
    echo "   ℹ️  Symlink ya existe, removiendo..."
    rm /etc/nginx/sites-enabled/inmogrid.cl
fi

ln -s /etc/nginx/sites-available/inmogrid.cl /etc/nginx/sites-enabled/inmogrid.cl
echo "   ✅ Symlink creado"

# Verificar configuración de Nginx
echo ""
echo "4️⃣ Verificando configuración de Nginx..."
nginx -t

if [ $? -ne 0 ]; then
    echo "   ❌ Error en configuración de Nginx"
    echo "   Revisar manualmente con: sudo nginx -t"
    exit 1
fi

echo "   ✅ Configuración de Nginx válida"

# Limpiar cache de Nginx (si existe)
echo ""
echo "5️⃣ Limpiando cache de Nginx..."
if [ -d /var/cache/nginx ]; then
    rm -rf /var/cache/nginx/*
    echo "   ✅ Cache de Nginx limpiado"
else
    echo "   ℹ️  No se encontró directorio de cache"
fi

# Recargar Nginx
echo ""
echo "6️⃣ Recargando Nginx..."
systemctl reload nginx

if [ $? -eq 0 ]; then
    echo "   ✅ Nginx recargado exitosamente"
else
    echo "   ❌ Error al recargar Nginx"
    systemctl status nginx
    exit 1
fi

echo ""
echo "✅ Configuración de Nginx para inmogrid.cl completada!"
echo ""
echo "📊 Resumen:"
echo "   - Configuración: /etc/nginx/sites-available/inmogrid.cl"
echo "   - Symlink: /etc/nginx/sites-enabled/inmogrid.cl"
echo "   - SSL: /etc/letsencrypt/live/inmogrid.cl/"
echo "   - Proxy a: http://127.0.0.1:3000 (PM2)"
echo ""
echo "🔍 Verificar:"
echo "   curl -k -H \"Host: inmogrid.cl\" https://127.0.0.1/ | grep 'application-name'"
echo ""
echo "🚀 Siguiente paso: Purgar cache de Cloudflare"
