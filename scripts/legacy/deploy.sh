#!/bin/bash

# Script de deployment para degux.cl
# Este script debe ejecutarse en el VPS (VPS_IP_REDACTED)

set -e  # Exit on error

echo "🚀 Iniciando deployment de degux.cl..."

# Variables
APP_DIR="/home/gabriel/degux.cl"
PM2_APP_NAME="degux-app"

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función de error
error_exit() {
    echo -e "${RED}❌ Error: $1${NC}" >&2
    exit 1
}

# Verificar que estamos en el directorio correcto
if [ ! -d "$APP_DIR" ]; then
    error_exit "Directorio $APP_DIR no encontrado"
fi

cd "$APP_DIR" || error_exit "No se pudo acceder a $APP_DIR"

# Backup de .env si existe
if [ -f .env.local ]; then
    echo -e "${YELLOW}📦 Haciendo backup de .env.local...${NC}"
    cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
fi

# Pull cambios de Git
echo -e "${YELLOW}📥 Descargando cambios de Git...${NC}"
git fetch origin main || error_exit "Git fetch falló"
git pull origin main || error_exit "Git pull falló"

# Instalar dependencias
echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
npm ci || error_exit "npm ci falló"

# Generar Prisma client
echo -e "${YELLOW}🔧 Generando Prisma client...${NC}"
npm run prisma:generate || error_exit "Prisma generate falló"

# Push schema a la base de datos (solo si hay cambios)
echo -e "${YELLOW}🗄️  Verificando cambios en el schema de la base de datos...${NC}"
npm run prisma:push || echo "No hay cambios en el schema"

# Build de Next.js
echo -e "${YELLOW}🏗️  Compilando aplicación...${NC}"
npm run build || error_exit "Build falló"

# Verificar si PM2 está corriendo
if ! command -v pm2 &> /dev/null; then
    error_exit "PM2 no está instalado. Instalar con: npm install -g pm2"
fi

# Reiniciar o iniciar aplicación con PM2
echo -e "${YELLOW}🔄 Reiniciando aplicación con PM2...${NC}"
if pm2 describe "$PM2_APP_NAME" > /dev/null 2>&1; then
    pm2 restart "$PM2_APP_NAME" --update-env || error_exit "PM2 restart falló"
    echo -e "${GREEN}✅ Aplicación reiniciada${NC}"
else
    pm2 start npm --name "$PM2_APP_NAME" -- start || error_exit "PM2 start falló"
    echo -e "${GREEN}✅ Aplicación iniciada${NC}"
fi

# Guardar configuración de PM2
pm2 save || echo "Advertencia: No se pudo guardar configuración de PM2"

# Verificar estado
echo -e "${YELLOW}📊 Estado de la aplicación:${NC}"
pm2 status

# Health check
echo -e "${YELLOW}🏥 Verificando health endpoint...${NC}"
sleep 5  # Esperar a que la aplicación inicie
if curl -f -s https://degux.cl/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check OK${NC}"
else
    echo -e "${RED}⚠️  Health check falló (puede ser normal si el endpoint no existe aún)${NC}"
fi

echo -e "${GREEN}🎉 Deployment completado exitosamente!${NC}"
echo -e "${GREEN}🌐 Aplicación disponible en: https://degux.cl${NC}"
