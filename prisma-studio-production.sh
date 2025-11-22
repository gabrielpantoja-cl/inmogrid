#!/bin/bash

# Script para abrir Prisma Studio conectado a la base de datos de producción (VPS)
# Requiere túnel SSH activo al puerto 5433

echo "🔍 Verificando túnel SSH al VPS..."

# Verificar si el túnel SSH ya está activo
if ! pgrep -f "ssh.*5433:localhost:5433.*gabriel@VPS_IP_REDACTED" > /dev/null; then
    echo "📡 Creando túnel SSH al puerto 5433..."
    ssh -L 5433:localhost:5433 gabriel@VPS_IP_REDACTED -N -f

    if [ $? -eq 0 ]; then
        echo "✅ Túnel SSH creado exitosamente"
    else
        echo "❌ Error al crear el túnel SSH"
        exit 1
    fi
else
    echo "✅ Túnel SSH ya está activo"
fi

echo ""
echo "🚀 Iniciando Prisma Studio con base de datos de PRODUCCIÓN..."
echo "📊 Base de datos: degux_core (VPS: VPS_IP_REDACTED)"
echo "🌐 Prisma Studio estará disponible en: http://localhost:5555"
echo ""
echo "⚠️  ADVERTENCIA: Estás conectado a la base de datos de PRODUCCIÓN"
echo "    Ten cuidado al modificar datos."
echo ""

# Cargar variables de entorno de producción y ejecutar Prisma Studio
env $(grep -v '^#' .env.production | xargs) npx prisma studio

# Cuando se cierre Prisma Studio, preguntar si cerrar el túnel
echo ""
read -p "¿Deseas cerrar el túnel SSH? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    pkill -f "ssh.*5433:localhost:5433.*gabriel@VPS_IP_REDACTED"
    echo "✅ Túnel SSH cerrado"
fi
