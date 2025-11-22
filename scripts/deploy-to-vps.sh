#!/bin/bash

##############################################################################
# Script: deploy-to-vps.sh
# Descripción: Deploy correcto de degux.cl usando arquitectura Docker Compose
# Fecha: 6 de Octubre, 2025
##############################################################################

set -e  # Exit on error

echo "🚀 Deploy degux.cl - Arquitectura Docker Compose"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables
VPS_USER="gabriel"
VPS_HOST="VPS_IP_REDACTED"
VPS_DIR="/home/gabriel/vps-do"
APP_DIR="/home/gabriel/degux.cl"

##############################################################################
# 1. LIMPIAR PM2 (INSTALADO POR ERROR)
##############################################################################

echo -e "${YELLOW}[1/5]${NC} Limpiando PM2 instalado por error..."

ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
  # Verificar si PM2 existe
  if command -v pm2 &> /dev/null; then
    echo "  → Deteniendo procesos PM2..."
    pm2 delete degux-app 2>/dev/null || true
    pm2 kill 2>/dev/null || true

    # Deshabilitar PM2 startup
    sudo systemctl stop pm2-gabriel 2>/dev/null || true
    sudo systemctl disable pm2-gabriel 2>/dev/null || true

    echo "  ✅ PM2 limpiado"
  else
    echo "  ℹ️  PM2 no instalado (correcto)"
  fi
EOF

echo ""

##############################################################################
# 2. PULL CAMBIOS DEL REPOSITORIO
##############################################################################

echo -e "${YELLOW}[2/5]${NC} Actualizando código en VPS..."

ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
  cd /home/gabriel/degux.cl

  # Guardar cambios locales si existen
  git stash 2>/dev/null || true

  # Pull últimos cambios
  git pull origin main

  echo "  ✅ Código actualizado"
EOF

echo ""

##############################################################################
# 3. REBUILD CONTENEDOR DEGUX-WEB
##############################################################################

echo -e "${YELLOW}[3/5]${NC} Rebuilding contenedor degux-web..."

ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
  cd /home/gabriel/vps-do

  # Build nueva imagen
  echo "  → Building imagen Docker..."
  docker compose -f docker-compose.yml -f docker-compose.degux.yml build degux-web

  # Detener contenedor antiguo
  echo "  → Deteniendo contenedor antiguo..."
  docker compose -f docker-compose.yml -f docker-compose.degux.yml stop degux-web

  # Iniciar contenedor nuevo
  echo "  → Iniciando contenedor nuevo..."
  docker compose -f docker-compose.yml -f docker-compose.degux.yml up -d degux-web

  echo "  ✅ Contenedor rebuildeado"
EOF

echo ""

##############################################################################
# 4. VERIFICAR HEALTH CHECK
##############################################################################

echo -e "${YELLOW}[4/5]${NC} Verificando health check..."

sleep 10  # Esperar a que contenedor inicie

ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
  # Test healthcheck endpoint
  HEALTH_STATUS=$(docker exec degux-web wget -q -O- http://localhost:3000/api/health 2>&1)

  if echo "$HEALTH_STATUS" | grep -q '"status":"ok"'; then
    echo "  ✅ Health check OK"
    echo "  Response: $HEALTH_STATUS"
  else
    echo "  ❌ Health check FAILED"
    echo "  Response: $HEALTH_STATUS"
    exit 1
  fi

  # Verificar estado del contenedor
  CONTAINER_STATUS=$(docker inspect degux-web --format '{{.State.Status}}')
  HEALTH_STATUS=$(docker inspect degux-web --format '{{.State.Health.Status}}' 2>/dev/null || echo "sin healthcheck")

  echo "  Container status: $CONTAINER_STATUS"
  echo "  Health status: $HEALTH_STATUS"
EOF

echo ""

##############################################################################
# 5. VERIFICAR ACCESO PÚBLICO
##############################################################################

echo -e "${YELLOW}[5/5]${NC} Verificando acceso público..."

# Test desde internet
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://degux.cl/)

if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "  ${GREEN}✅ https://degux.cl/ responde correctamente (HTTP $HTTP_STATUS)${NC}"
else
  echo -e "  ${RED}❌ https://degux.cl/ error (HTTP $HTTP_STATUS)${NC}"
fi

# Test health endpoint público
HEALTH_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://degux.cl/api/health)

if [ "$HEALTH_HTTP" = "200" ]; then
  echo -e "  ${GREEN}✅ Health endpoint público OK (HTTP $HEALTH_HTTP)${NC}"
else
  echo -e "  ${YELLOW}⚠️  Health endpoint: HTTP $HEALTH_HTTP${NC}"
fi

echo ""
echo "================================================"
echo -e "${GREEN}✅ Deploy completado exitosamente${NC}"
echo ""
echo "🔗 URLs:"
echo "   - App: https://degux.cl/"
echo "   - Health: https://degux.cl/api/health"
echo "   - API: https://api.degux.cl/"
echo ""
echo "📊 Comandos útiles:"
echo "   - Ver logs: ssh ${VPS_USER}@${VPS_HOST} 'docker logs degux-web -f'"
echo "   - Ver status: ssh ${VPS_USER}@${VPS_HOST} 'docker ps'"
echo "   - Restart: ssh ${VPS_USER}@${VPS_HOST} 'cd ~/vps-do && docker compose -f docker-compose.yml -f docker-compose.degux.yml restart degux-web'"
echo ""
