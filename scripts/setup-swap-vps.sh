#!/bin/bash

# Script para configurar 2GB de swap en el VPS
# Ejecutar con: sudo bash setup-swap-vps.sh

set -e

echo "🔧 Configurando 2GB de swap para optimizar builds de Next.js..."
echo ""

# Verificar si ya existe swap
if swapon --show | grep -q '/swapfile'; then
    echo "⚠️  Ya existe un swapfile. Removiendo primero..."
    swapoff /swapfile
    rm -f /swapfile
fi

# Crear archivo swap de 2GB
echo "1️⃣ Creando archivo swap de 2GB..."
fallocate -l 2G /swapfile

# Permisos correctos
echo "2️⃣ Configurando permisos..."
chmod 600 /swapfile

# Formatear como swap
echo "3️⃣ Formateando como swap..."
mkswap /swapfile

# Activar swap
echo "4️⃣ Activando swap..."
swapon /swapfile

# Verificar
echo "5️⃣ Verificando configuración..."
echo ""
free -h
echo ""
swapon --show

# Hacer permanente (agregar a /etc/fstab)
echo ""
echo "6️⃣ Haciendo permanente (agregando a /etc/fstab)..."

if grep -q '/swapfile' /etc/fstab; then
    echo "   ℹ️  /swapfile ya está en /etc/fstab"
else
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "   ✅ Agregado a /etc/fstab"
fi

echo ""
echo "✅ Swap de 2GB configurado exitosamente!"
echo ""
echo "📊 Resumen:"
echo "   - Memoria RAM: $(free -h | grep Mem | awk '{print $2}')"
echo "   - Swap: $(free -h | grep Swap | awk '{print $2}')"
echo "   - Total disponible: ~6GB para builds"
echo ""
echo "🚀 Ahora los builds de Next.js no deberían fallar por memoria."
