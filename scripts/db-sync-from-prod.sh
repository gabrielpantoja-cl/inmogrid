#!/bin/bash
# ========================================
# Script: Sincronizar DB Local desde Producción
# ========================================
# Descarga un dump de la DB de producción y lo importa en local

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Sincronización de Base de Datos${NC}"
echo "=================================="
echo ""

# Variables de configuración
VPS_HOST="<VPS_HOST>"
VPS_USER="root"
VPS_CONTAINER="inmogrid-db"  # Ajustar al nombre real del contenedor
VPS_DB_NAME="inmogrid"       # Ajustar al nombre real de la DB
VPS_DB_USER="inmogrid_user"  # Ajustar al usuario real
DUMP_FILE="inmogrid_dump_$(date +%Y%m%d_%H%M%S).sql"
BACKUP_DIR="./backups"

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}⚠️  ADVERTENCIA:${NC}"
echo "   Esta operación sobrescribirá tu base de datos local"
echo "   con los datos de producción."
echo ""
read -p "¿Deseas continuar? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Operación cancelada"
    exit 1
fi

echo ""
echo "📥 Paso 1: Creando dump de la base de datos de producción..."
ssh "$VPS_USER@$VPS_HOST" "docker exec $VPS_CONTAINER pg_dump -U $VPS_DB_USER -d $VPS_DB_NAME --clean --if-exists" > "$BACKUP_DIR/$DUMP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dump creado: $BACKUP_DIR/$DUMP_FILE${NC}"
else
    echo -e "${RED}❌ Error creando dump${NC}"
    exit 1
fi

echo ""
echo "📊 Paso 2: Importando dump en base de datos local..."

# Verificar que el contenedor local esté corriendo
if ! docker ps | grep -q "inmogrid-postgres-local"; then
    echo -e "${RED}❌ Error: PostgreSQL local no está corriendo${NC}"
    echo "   Ejecuta: ./scripts/db-local-start.sh"
    exit 1
fi

# Importar dump
docker exec -i inmogrid-postgres-local psql -U inmogrid_user -d inmogrid_dev < "$BACKUP_DIR/$DUMP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Importación completada${NC}"
else
    echo -e "${RED}❌ Error importando dump${NC}"
    exit 1
fi

echo ""
echo "🔧 Paso 3: Aplicando migraciones pendientes de Prisma..."
npx prisma db push

echo ""
echo -e "${GREEN}✅ Sincronización completada!${NC}"
echo ""
echo "📋 Resumen:"
echo "   - Dump creado: $BACKUP_DIR/$DUMP_FILE"
echo "   - Base de datos local actualizada con datos de producción"
echo ""
echo "🔍 Verificar datos:"
echo "   npx prisma studio"
echo ""