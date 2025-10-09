#!/bin/bash
# ========================================
# Script: Iniciar Base de Datos Local
# ========================================
# Levanta PostgreSQL local con Docker y aplica schema de Prisma

set -e  # Salir en caso de error

echo "🐘 Iniciando PostgreSQL local con Docker..."

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker no está corriendo"
    echo "   Inicia Docker Desktop o el servicio de Docker"
    exit 1
fi

# Levantar contenedores
echo "📦 Levantando contenedores..."
docker compose -f docker-compose.local.yml up -d

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 5

# Verificar que el contenedor esté corriendo
if docker ps | grep -q "degux-postgres-local"; then
    echo "✅ PostgreSQL local está corriendo"
else
    echo "❌ Error: PostgreSQL no se inició correctamente"
    docker compose -f docker-compose.local.yml logs postgres-local
    exit 1
fi

# Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

# Aplicar schema de Prisma
echo "📊 Aplicando schema de Prisma..."
npx prisma db push

echo ""
echo "✅ Base de datos local lista!"
echo ""
echo "📋 Información de conexión:"
echo "   Host: localhost"
echo "   Puerto: 5432"
echo "   Usuario: degux_user"
echo "   Base de datos: degux_dev"
echo "   Password: degux_local_password"
echo ""
echo "🌐 Adminer (GUI): http://localhost:8080"
echo ""
echo "🔧 Comandos útiles:"
echo "   - Ver estado: docker compose -f docker-compose.local.yml ps"
echo "   - Ver logs: docker compose -f docker-compose.local.yml logs -f"
echo "   - Detener: docker compose -f docker-compose.local.yml down"
echo "   - Prisma Studio: npx prisma studio"
echo ""