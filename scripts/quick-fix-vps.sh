#!/bin/bash

# ========================================
# Quick Fix - Reinicio Rápido de inmogrid.cl
# Este script debe ejecutarse DENTRO del VPS
# Uso: ssh gabriel@<VPS_HOST> < quick-fix-vps.sh
# O: copiar y pegar en terminal SSH del VPS
# ========================================

echo "🚨 Iniciando recuperación rápida de inmogrid.cl..."

# Navegar al directorio Docker
cd /home/gabriel/vps-do || { echo "❌ Error: directorio no encontrado"; exit 1; }

echo "📋 Estado actual de contenedores:"
docker ps -a | grep -E "CONTAINER|inmogrid-web|nginx-proxy|inmogrid-db"

echo ""
echo "🛑 Deteniendo inmogrid-web..."
docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml stop inmogrid-web

echo "▶️  Iniciando inmogrid-web..."
docker compose -f docker-compose.yml -f docker-compose.inmogrid.yml up -d inmogrid-web

echo "⏳ Esperando 15 segundos..."
sleep 15

echo ""
echo "📊 Estado después del reinicio:"
docker ps | grep -E "NAMES|inmogrid-web"

echo ""
echo "📋 Últimos 20 logs:"
docker logs inmogrid-web --tail 20

echo ""
echo "🏥 Health check:"
if curl -f -s -m 10 https://inmogrid.cl/api/health > /dev/null 2>&1; then
    echo "✅ SITIO FUNCIONANDO"
else
    echo "⚠️  Sitio aún no responde - revisa logs completos con:"
    echo "   docker logs inmogrid-web --tail 100"
fi

echo ""
echo "✅ Recuperación completada"
echo "🌐 Verifica en: https://inmogrid.cl"
