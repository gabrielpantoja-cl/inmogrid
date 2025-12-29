#!/bin/bash

# ========================================
# Quick Fix - Reinicio Rápido de degux.cl
# Este script debe ejecutarse DENTRO del VPS
# Uso: ssh gabriel@VPS_IP_REDACTED < quick-fix-vps.sh
# O: copiar y pegar en terminal SSH del VPS
# ========================================

echo "🚨 Iniciando recuperación rápida de degux.cl..."

# Navegar al directorio Docker
cd /home/gabriel/vps-do || { echo "❌ Error: directorio no encontrado"; exit 1; }

echo "📋 Estado actual de contenedores:"
docker ps -a | grep -E "CONTAINER|degux-web|nginx-proxy|degux-db"

echo ""
echo "🛑 Deteniendo degux-web..."
docker compose -f docker-compose.yml -f docker-compose.degux.yml stop degux-web

echo "▶️  Iniciando degux-web..."
docker compose -f docker-compose.yml -f docker-compose.degux.yml up -d degux-web

echo "⏳ Esperando 15 segundos..."
sleep 15

echo ""
echo "📊 Estado después del reinicio:"
docker ps | grep -E "NAMES|degux-web"

echo ""
echo "📋 Últimos 20 logs:"
docker logs degux-web --tail 20

echo ""
echo "🏥 Health check:"
if curl -f -s -m 10 https://degux.cl/api/health > /dev/null 2>&1; then
    echo "✅ SITIO FUNCIONANDO"
else
    echo "⚠️  Sitio aún no responde - revisa logs completos con:"
    echo "   docker logs degux-web --tail 100"
fi

echo ""
echo "✅ Recuperación completada"
echo "🌐 Verifica en: https://degux.cl"
