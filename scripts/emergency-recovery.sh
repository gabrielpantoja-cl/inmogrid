#!/bin/bash

# ========================================
# Script de Diagnóstico y Recuperación de Emergencia
# degux.cl - VPS Digital Ocean
# ========================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables
VPS_HOST="gabriel@167.172.251.27"
VPS_DIR_APP="/home/gabriel/degux.cl"
VPS_DIR_DOCKER="/home/gabriel/vps-do"
CONTAINER_NAME="degux-web"

echo -e "${RED}🚨 EMERGENCY RECOVERY SCRIPT${NC}"
echo -e "${RED}============================${NC}\n"

# Función para ejecutar comandos en el VPS
run_on_vps() {
    echo -e "${CYAN}➜ Ejecutando: $1${NC}"
    ssh "$VPS_HOST" "$1"
}

# Función para mostrar sección
section() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📋 $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# ====================
# FASE 1: DIAGNÓSTICO
# ====================

section "FASE 1: DIAGNÓSTICO DEL SISTEMA"

echo -e "${YELLOW}🔍 Verificando conectividad con VPS...${NC}"
if ssh -o ConnectTimeout=10 "$VPS_HOST" "echo 'Conexión exitosa'" 2>/dev/null; then
    echo -e "${GREEN}✅ Conexión SSH establecida${NC}"
else
    echo -e "${RED}❌ No se puede conectar al VPS${NC}"
    echo -e "${RED}Verifica:${NC}"
    echo -e "  - Tu conexión a internet"
    echo -e "  - La IP del VPS (167.172.251.27)"
    echo -e "  - Tus credenciales SSH"
    exit 1
fi

echo -e "\n${YELLOW}🐳 Verificando estado de contenedores Docker...${NC}"
run_on_vps "docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'" || true

echo -e "\n${YELLOW}📊 Verificando uso de recursos del sistema...${NC}"
run_on_vps "df -h | grep -E 'Filesystem|/dev/vda'" || true
run_on_vps "free -h" || true

echo -e "\n${YELLOW}🔍 Verificando estado específico de degux-web...${NC}"
CONTAINER_STATUS=$(ssh "$VPS_HOST" "docker ps -a --filter name=$CONTAINER_NAME --format '{{.Status}}'" 2>/dev/null || echo "no encontrado")
echo -e "Estado del contenedor $CONTAINER_NAME: ${CYAN}$CONTAINER_STATUS${NC}"

if [[ $CONTAINER_STATUS == *"Up"* ]]; then
    echo -e "${GREEN}✅ El contenedor está corriendo${NC}"

    echo -e "\n${YELLOW}📋 Últimos 50 logs del contenedor:${NC}"
    run_on_vps "docker logs $CONTAINER_NAME --tail 50"

    echo -e "\n${YELLOW}🏥 Verificando health del contenedor...${NC}"
    run_on_vps "docker inspect $CONTAINER_NAME --format='{{.State.Health.Status}}'" || echo "No health check configurado"

elif [[ $CONTAINER_STATUS == *"Exited"* ]] || [[ $CONTAINER_STATUS == *"Dead"* ]]; then
    echo -e "${RED}❌ El contenedor está detenido o ha fallado${NC}"

    echo -e "\n${YELLOW}📋 Últimos 100 logs del contenedor (para diagnóstico):${NC}"
    run_on_vps "docker logs $CONTAINER_NAME --tail 100"

else
    echo -e "${RED}❌ El contenedor no existe${NC}"
fi

echo -e "\n${YELLOW}🌐 Verificando estado de nginx-proxy...${NC}"
NGINX_STATUS=$(ssh "$VPS_HOST" "docker ps --filter name=nginx-proxy --format '{{.Status}}'" 2>/dev/null || echo "no encontrado")
echo -e "Estado de nginx-proxy: ${CYAN}$NGINX_STATUS${NC}"

echo -e "\n${YELLOW}🗄️  Verificando estado de degux-db...${NC}"
DB_STATUS=$(ssh "$VPS_HOST" "docker ps --filter name=degux-db --format '{{.Status}}'" 2>/dev/null || echo "no encontrado")
echo -e "Estado de degux-db: ${CYAN}$DB_STATUS${NC}"

# ====================
# FASE 2: DECISIÓN
# ====================

section "FASE 2: PLAN DE RECUPERACIÓN"

echo -e "${YELLOW}Opciones disponibles:${NC}"
echo -e "  ${CYAN}1)${NC} Reiniciar contenedor degux-web (rápido, preserva configuración)"
echo -e "  ${CYAN}2)${NC} Rebuild completo con pull de código (soluciona problemas de build)"
echo -e "  ${CYAN}3)${NC} Reiniciar todos los servicios (nginx-proxy, degux-web, degux-db)"
echo -e "  ${CYAN}4)${NC} Solo mostrar logs detallados"
echo -e "  ${CYAN}5)${NC} Salir sin hacer cambios"
echo ""
read -p "$(echo -e ${YELLOW}"Selecciona una opción (1-5): "${NC})" option

case $option in
    1)
        section "OPCIÓN 1: REINICIO SIMPLE DE DEGUX-WEB"

        echo -e "${YELLOW}🛑 Deteniendo contenedor...${NC}"
        run_on_vps "cd $VPS_DIR_DOCKER && docker compose -f docker-compose.yml -f docker-compose.degux.yml stop $CONTAINER_NAME"

        echo -e "${YELLOW}▶️  Iniciando contenedor...${NC}"
        run_on_vps "cd $VPS_DIR_DOCKER && docker compose -f docker-compose.yml -f docker-compose.degux.yml up -d $CONTAINER_NAME"

        echo -e "${YELLOW}⏳ Esperando 15 segundos para que el contenedor inicie...${NC}"
        sleep 15
        ;;

    2)
        section "OPCIÓN 2: REBUILD COMPLETO"

        echo -e "${YELLOW}📥 Actualizando código desde GitHub...${NC}"
        run_on_vps "cd $VPS_DIR_APP && git pull origin main"

        echo -e "${YELLOW}🛑 Deteniendo y eliminando contenedor...${NC}"
        run_on_vps "cd $VPS_DIR_DOCKER && docker compose -f docker-compose.yml -f docker-compose.degux.yml stop $CONTAINER_NAME" || true
        run_on_vps "cd $VPS_DIR_DOCKER && docker compose -f docker-compose.yml -f docker-compose.degux.yml rm -f $CONTAINER_NAME" || true

        echo -e "${YELLOW}🏗️  Rebuilding imagen (sin cache)...${NC}"
        run_on_vps "cd $VPS_DIR_DOCKER && docker compose -f docker-compose.yml -f docker-compose.degux.yml build --no-cache $CONTAINER_NAME"

        echo -e "${YELLOW}▶️  Iniciando nuevo contenedor...${NC}"
        run_on_vps "cd $VPS_DIR_DOCKER && docker compose -f docker-compose.yml -f docker-compose.degux.yml up -d $CONTAINER_NAME"

        echo -e "${YELLOW}🧹 Limpiando imágenes antiguas...${NC}"
        run_on_vps "docker image prune -f" || true

        echo -e "${YELLOW}⏳ Esperando 20 segundos para que el contenedor inicie...${NC}"
        sleep 20
        ;;

    3)
        section "OPCIÓN 3: REINICIO COMPLETO DE SERVICIOS"

        echo -e "${YELLOW}🛑 Deteniendo todos los servicios degux...${NC}"
        run_on_vps "cd $VPS_DIR_DOCKER && docker compose -f docker-compose.yml -f docker-compose.degux.yml stop"

        echo -e "${YELLOW}▶️  Iniciando todos los servicios degux...${NC}"
        run_on_vps "cd $VPS_DIR_DOCKER && docker compose -f docker-compose.yml -f docker-compose.degux.yml up -d"

        echo -e "${YELLOW}⏳ Esperando 30 segundos para que los servicios inicien...${NC}"
        sleep 30
        ;;

    4)
        section "OPCIÓN 4: LOGS DETALLADOS"

        echo -e "${YELLOW}📋 Logs completos de degux-web (últimas 200 líneas):${NC}"
        run_on_vps "docker logs $CONTAINER_NAME --tail 200"

        echo -e "\n${YELLOW}📋 Logs de nginx-proxy (últimas 50 líneas):${NC}"
        run_on_vps "docker logs nginx-proxy --tail 50" || echo "nginx-proxy no disponible"

        echo -e "\n${YELLOW}🐳 Estado detallado de todos los contenedores:${NC}"
        run_on_vps "docker ps -a"

        exit 0
        ;;

    5)
        echo -e "${YELLOW}👋 Saliendo sin hacer cambios${NC}"
        exit 0
        ;;

    *)
        echo -e "${RED}❌ Opción inválida${NC}"
        exit 1
        ;;
esac

# ====================
# FASE 3: VERIFICACIÓN
# ====================

section "FASE 3: VERIFICACIÓN POST-RECUPERACIÓN"

echo -e "${YELLOW}🔍 Verificando estado del contenedor...${NC}"
run_on_vps "docker ps --filter name=$CONTAINER_NAME"

echo -e "\n${YELLOW}📋 Últimos logs (20 líneas):${NC}"
run_on_vps "docker logs $CONTAINER_NAME --tail 20"

echo -e "\n${YELLOW}🏥 Health check de la aplicación...${NC}"
sleep 5  # Dar tiempo extra para que la app responda

# Health check
if curl -f -s -m 10 https://degux.cl/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check EXITOSO${NC}"
else
    echo -e "${RED}⚠️  Health check FALLÓ${NC}"
    echo -e "${YELLOW}Intentando con HTTP...${NC}"
    if curl -f -s -m 10 http://degux.cl/api/health > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  HTTP funciona pero HTTPS no - problema con SSL/nginx-proxy${NC}"
    else
        echo -e "${RED}❌ La aplicación no responde${NC}"
        echo -e "${YELLOW}Revisa los logs detallados con: ssh $VPS_HOST 'docker logs $CONTAINER_NAME --tail 100'${NC}"
    fi
fi

# Verificar página principal
echo -e "\n${YELLOW}🌐 Verificando página principal...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -m 10 https://degux.cl 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Sitio web accesible (HTTP $HTTP_CODE)${NC}"
elif [ "$HTTP_CODE" = "000" ]; then
    echo -e "${RED}❌ No se puede conectar al sitio${NC}"
else
    echo -e "${YELLOW}⚠️  Sitio responde con código HTTP $HTTP_CODE${NC}"
fi

# ====================
# RESUMEN FINAL
# ====================

section "RESUMEN FINAL"

echo -e "${GREEN}✅ Script de recuperación completado${NC}\n"
echo -e "${CYAN}Próximos pasos:${NC}"
echo -e "  1. Visita ${BLUE}https://degux.cl${NC} para verificar que el sitio esté funcionando"
echo -e "  2. Si persisten problemas, revisa logs detallados:"
echo -e "     ${YELLOW}ssh $VPS_HOST 'docker logs $CONTAINER_NAME --tail 100'${NC}"
echo -e "  3. Para monitoreo continuo:"
echo -e "     ${YELLOW}ssh $VPS_HOST 'docker logs -f $CONTAINER_NAME'${NC}"
echo -e "  4. Para acceder al contenedor:"
echo -e "     ${YELLOW}ssh $VPS_HOST 'docker exec -it $CONTAINER_NAME sh'${NC}"
echo -e "\n${BLUE}📊 Dashboard de monitoreo: https://167.172.251.27:9443 (Portainer)${NC}"
echo ""
