#!/bin/bash

# Script para iniciar servidor de desarrollo con túnel SSH a la base de datos N8N

set -e

echo "🚀 Iniciando entorno de desarrollo completo..."
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función de limpieza al salir
cleanup() {
    echo ""
    echo -e "${YELLOW}⏸️  Deteniendo servicios...${NC}"

    # Matar el túnel SSH si existe
    if [ ! -z "$SSH_PID" ]; then
        kill $SSH_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Túnel SSH cerrado${NC}"
    fi

    # Matar Next.js si existe
    if [ ! -z "$NEXT_PID" ]; then
        kill $NEXT_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Servidor Next.js detenido${NC}"
    fi

    exit 0
}

# Capturar Ctrl+C y otras señales
trap cleanup SIGINT SIGTERM EXIT

# Verificar si el puerto 5432 ya está en uso
if lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Puerto 5432 ya está en uso${NC}"
    echo "Si es un túnel anterior, usa: pkill -f 'ssh -N -L 5432:localhost:5432'"
    exit 1
fi

# 1. Iniciar túnel SSH en background
echo -e "${BLUE}📡 Iniciando túnel SSH a base de datos N8N...${NC}"
ssh -N -L 5432:localhost:5432 gabriel@VPS_IP_REDACTED &
SSH_PID=$!

# Esperar a que el túnel se establezca
sleep 3

# Verificar que el túnel está activo
if ! ps -p $SSH_PID > /dev/null; then
    echo -e "${YELLOW}❌ Error: El túnel SSH no se pudo establecer${NC}"
    echo "Verifica tu conexión SSH al VPS"
    exit 1
fi

echo -e "${GREEN}✅ Túnel SSH establecido (PID: $SSH_PID)${NC}"
echo -e "${BLUE}   localhost:5432 → VPS_IP_REDACTED:5432${NC}"
echo ""

# 2. Iniciar Next.js dev server
echo -e "${BLUE}⚡ Iniciando servidor Next.js...${NC}"
npm run dev &
NEXT_PID=$!

echo ""
echo -e "${GREEN}✅ Entorno de desarrollo iniciado${NC}"
echo ""
echo -e "${BLUE}📊 Servicios activos:${NC}"
echo -e "   • Túnel SSH (PID: $SSH_PID)"
echo -e "   • Next.js (PID: $NEXT_PID)"
echo ""
echo -e "${YELLOW}Presiona Ctrl+C para detener todos los servicios${NC}"
echo ""

# Esperar indefinidamente
wait