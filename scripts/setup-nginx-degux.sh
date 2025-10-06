#!/bin/bash

# Script para configurar Nginx para degux.cl
# Ejecutar con: sudo bash setup-nginx-degux.sh

set -e

echo "🔧 Configurando Nginx para degux.cl..."
echo ""

# Verificar si estamos corriendo con sudo
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script debe ejecutarse con sudo"
    echo "   Ejecutar: sudo bash setup-nginx-degux.sh"
    exit 1
fi

# Verificar si ya existe configuración
if [ -f /etc/nginx/sites-available/degux.cl ]; then
    echo "⚠️  Ya existe configuración para degux.cl"
    echo "   ¿Desea sobrescribir? (s/N)"
    read -r response
    if [[ ! "$response" =~ ^[Ss]$ ]]; then
        echo "   Cancelado."
        exit 0
    fi
fi

# Crear archivo de configuración
echo "1️⃣ Creando configuración Nginx para degux.cl..."
cat > /etc/nginx/sites-available/degux.cl <<'EOF'
server {
    server_name degux.cl www.degux.cl;

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
    ssl_certificate /etc/letsencrypt/live/degux.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/degux.cl/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = www.degux.cl) {
        return 301 https://$host$request_uri;
    }

    if ($host = degux.cl) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name degux.cl www.degux.cl;
    return 404;
}
EOF

echo "   ✅ Archivo creado: /etc/nginx/sites-available/degux.cl"

# Verificar si certificado SSL existe
echo ""
echo "2️⃣ Verificando certificado SSL..."
if [ ! -f /etc/letsencrypt/live/degux.cl/fullchain.pem ]; then
    echo "   ⚠️  NO se encontró certificado SSL para degux.cl"
    echo "   Generando certificado con Certbot..."

    # Verificar si certbot está instalado
    if ! command -v certbot &> /dev/null; then
        echo "   ❌ Certbot no está instalado"
        echo "   Instalar con: sudo apt install certbot python3-certbot-nginx"
        exit 1
    fi

    # Generar certificado
    certbot --nginx -d degux.cl -d www.degux.cl --non-interactive --agree-tos --email gabrielpantojarivera@gmail.com

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
if [ -L /etc/nginx/sites-enabled/degux.cl ]; then
    echo "   ℹ️  Symlink ya existe, removiendo..."
    rm /etc/nginx/sites-enabled/degux.cl
fi

ln -s /etc/nginx/sites-available/degux.cl /etc/nginx/sites-enabled/degux.cl
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
echo "✅ Configuración de Nginx para degux.cl completada!"
echo ""
echo "📊 Resumen:"
echo "   - Configuración: /etc/nginx/sites-available/degux.cl"
echo "   - Symlink: /etc/nginx/sites-enabled/degux.cl"
echo "   - SSL: /etc/letsencrypt/live/degux.cl/"
echo "   - Proxy a: http://127.0.0.1:3000 (PM2)"
echo ""
echo "🔍 Verificar:"
echo "   curl -k -H \"Host: degux.cl\" https://127.0.0.1/ | grep 'application-name'"
echo ""
echo "🚀 Siguiente paso: Purgar cache de Cloudflare"
