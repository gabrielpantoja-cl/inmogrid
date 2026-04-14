#!/bin/bash

# ============================================
# Script para Resolver Error OAuthAccountNotLinked
# ============================================
#
# Este script limpia usuarios de prueba que fueron creados
# manualmente (sin pasar por OAuth) y que causan el error
# "OAuthAccountNotLinked" cuando intentan hacer login con Google.
#
# USO:
#   bash scripts/fix-oauth-account-not-linked.sh
#
# IMPORTANTE:
#   - Este script elimina TODOS los usuarios sin vinculación OAuth
#   - Haz un backup antes de ejecutar
#   - Solo usar en desarrollo/staging, NO en producción con datos reales
#
# ============================================

set -e  # Exit on error

echo "🔧 Fix OAuthAccountNotLinked - Limpieza de Usuarios de Prueba"
echo "============================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
VPS_HOST="gabriel@<VPS_HOST>"
DB_CONTAINER="n8n-db"
DB_USER="inmogrid_user"
DB_NAME="inmogrid"

echo -e "${YELLOW}⚠️  ADVERTENCIA:${NC}"
echo "Este script eliminará TODOS los usuarios que no tengan"
echo "vinculación OAuth (registros en la tabla Account)."
echo ""
echo "Usuarios actuales en producción:"
echo "  - user-gabriel-001 (gabriel@inmogrid.cl)"
echo "  - user-mona-001 (mona@inmogrid.cl)"
echo "  - cm99ydecv... (monacaniqueo@gmail.com)"
echo "  - cm7q0t1yi... (gabrielpantojarivera@gmail.com)"
echo ""
echo -e "${RED}Todos estos usuarios serán ELIMINADOS.${NC}"
echo ""

# Confirmación del usuario
read -p "¿Deseas continuar? (escribe 'SI' para confirmar): " CONFIRM

if [ "$CONFIRM" != "SI" ]; then
  echo -e "${YELLOW}❌ Operación cancelada por el usuario.${NC}"
  exit 0
fi

echo ""
echo "🔌 Conectando a VPS en producción..."

# Paso 1: Backup de usuarios
echo ""
echo "📦 Paso 1: Creando backup de tabla User..."
ssh $VPS_HOST "docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c \"\\copy \\\"User\\\" TO '/tmp/users_backup_$(date +%Y%m%d_%H%M%S).csv' CSV HEADER;\"" 2>&1

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Backup creado exitosamente en /tmp/users_backup_*.csv${NC}"
else
  echo -e "${RED}❌ Error al crear backup. Abortando.${NC}"
  exit 1
fi

# Paso 2: Mostrar usuarios actuales
echo ""
echo "👥 Paso 2: Usuarios actuales en base de datos:"
ssh $VPS_HOST "docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c 'SELECT id, email, name, role FROM \"User\";'" 2>&1

# Paso 3: Mostrar cuentas OAuth actuales (debería estar vacía)
echo ""
echo "🔗 Paso 3: Vinculaciones OAuth actuales:"
ssh $VPS_HOST "docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c 'SELECT \"userId\", provider, \"providerAccountId\" FROM \"Account\";'" 2>&1

# Paso 4: Eliminar usuarios sin Account
echo ""
echo "🗑️  Paso 4: Eliminando usuarios sin vinculación OAuth..."

DELETE_QUERY="DELETE FROM \"User\" WHERE id NOT IN (SELECT \"userId\" FROM \"Account\");"

ssh $VPS_HOST "docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c '$DELETE_QUERY'" 2>&1

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Usuarios eliminados exitosamente.${NC}"
else
  echo -e "${RED}❌ Error al eliminar usuarios.${NC}"
  exit 1
fi

# Paso 5: Verificar que la tabla User esté vacía
echo ""
echo "🔍 Paso 5: Verificando tabla User después de la limpieza:"
ssh $VPS_HOST "docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c 'SELECT COUNT(*) as total_users FROM \"User\";'" 2>&1

echo ""
echo -e "${GREEN}✅ LIMPIEZA COMPLETADA${NC}"
echo ""
echo "📋 Próximos pasos:"
echo "  1. Abre tu navegador en modo incógnito"
echo "  2. Ve a https://inmogrid.cl/auth/signin"
echo "  3. Haz clic en 'Continuar con Google'"
echo "  4. Selecciona tu cuenta de Google"
echo "  5. El usuario se creará correctamente con vinculación OAuth"
echo ""
echo "El error 'OAuthAccountNotLinked' debería desaparecer."
echo ""
