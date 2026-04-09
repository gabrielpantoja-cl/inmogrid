#!/bin/bash

# Test Suite para inmogrid-db (PostgreSQL dedicado)
# Verifica la integridad y funcionalidad de la base de datos migrada

set -e

BOLD="\033[1m"
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
BLUE="\033[0;34m"
RESET="\033[0m"

API_URL="https://inmogrid.cl/api/public"
TEST_RESULTS=()

echo -e "${BOLD}${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         Test Suite inmogrid-db (PostgreSQL Dedicado)        ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${RESET}"

# Función para reportar test
report_test() {
    local test_name="$1"
    local status="$2"
    local details="$3"

    if [ "$status" == "PASS" ]; then
        echo -e "${GREEN}✅ PASS${RESET} - $test_name"
        TEST_RESULTS+=("✅ $test_name")
    else
        echo -e "${RED}❌ FAIL${RESET} - $test_name"
        TEST_RESULTS+=("❌ $test_name")
    fi

    if [ -n "$details" ]; then
        echo -e "   ${YELLOW}→${RESET} $details"
    fi
    echo
}

# Test 1: Health Check
echo -e "${BOLD}Test 1: Health Check${RESET}"
HEALTH_RESPONSE=$(curl -sL "$API_URL/health")
if echo "$HEALTH_RESPONSE" | grep -q '"status":"healthy"'; then
    DB_RESPONSE_TIME=$(echo "$HEALTH_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['health']['services']['database']['responseTime'])")
    report_test "Health Check" "PASS" "Database response time: ${DB_RESPONSE_TIME}ms"
else
    report_test "Health Check" "FAIL" "API no respondió correctamente"
fi

# Test 2: Conteo de Referenciales
echo -e "${BOLD}Test 2: Conteo de Referenciales${RESET}"
MAP_DATA=$(curl -sL "$API_URL/map-data?limit=1000")
TOTAL_REFS=$(echo "$MAP_DATA" | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data.get('data', [])))" 2>/dev/null || echo "0")

if [ "$TOTAL_REFS" -gt 0 ]; then
    report_test "Referenciales Disponibles" "PASS" "Total de registros: $TOTAL_REFS"
else
    report_test "Referenciales Disponibles" "FAIL" "No se encontraron registros"
fi

# Test 3: Datos Geoespaciales
echo -e "${BOLD}Test 3: Validación de Datos Geoespaciales${RESET}"
FIRST_REF=$(echo "$MAP_DATA" | python3 -c "import sys, json; data = json.load(sys.stdin); ref = data['data'][0]; print(f\"{ref.get('lat', 'N/A')},{ref.get('lng', 'N/A')},{ref.get('comuna', 'N/A')}\")" 2>/dev/null || echo "N/A,N/A,N/A")

IFS=',' read -r LAT LNG COMUNA <<< "$FIRST_REF"

if [[ "$LAT" != "N/A" ]] && [[ "$LNG" != "N/A" ]] && [[ "$COMUNA" != "N/A" ]]; then
    report_test "Coordenadas PostGIS" "PASS" "Lat: $LAT, Lng: $LNG, Comuna: $COMUNA"
else
    report_test "Coordenadas PostGIS" "FAIL" "Datos geoespaciales incompletos"
fi

# Test 4: Filtros por Comuna
echo -e "${BOLD}Test 4: Filtros por Comuna${RESET}"
SANTIAGO_DATA=$(curl -sL "$API_URL/map-data?comuna=santiago&limit=100")
SANTIAGO_COUNT=$(echo "$SANTIAGO_DATA" | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data.get('data', [])))" 2>/dev/null || echo "0")

if [ "$SANTIAGO_COUNT" -gt 0 ]; then
    report_test "Filtro por Comuna (Santiago)" "PASS" "Registros encontrados: $SANTIAGO_COUNT"
else
    report_test "Filtro por Comuna (Santiago)" "FAIL" "No se encontraron registros para Santiago"
fi

# Test 5: Map Config (Conservadores)
echo -e "${BOLD}Test 5: Configuración del Mapa (Conservadores)${RESET}"
MAP_CONFIG=$(curl -sL "$API_URL/map-config")
CBR_COUNT=$(echo "$MAP_CONFIG" | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data.get('conservadores', [])))" 2>/dev/null || echo "0")
COMMUNES_COUNT=$(echo "$MAP_CONFIG" | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data.get('communes', [])))" 2>/dev/null || echo "0")

if [ "$CBR_COUNT" -gt 0 ] && [ "$COMMUNES_COUNT" -gt 0 ]; then
    report_test "Conservadores y Comunas" "PASS" "CBR: $CBR_COUNT, Comunas: $COMMUNES_COUNT"
else
    report_test "Conservadores y Comunas" "FAIL" "Datos de configuración incompletos"
fi

# Test 6: Campos Requeridos
echo -e "${BOLD}Test 6: Validación de Campos Requeridos${RESET}"
SAMPLE_REF=$(echo "$MAP_DATA" | python3 -c "
import sys, json
data = json.load(sys.stdin)
ref = data['data'][0]
required_fields = ['id', 'lat', 'lng', 'cbr', 'comuna', 'rol', 'anio']
missing = [f for f in required_fields if f not in ref or ref[f] is None]
print(','.join(missing) if missing else 'OK')
" 2>/dev/null || echo "ERROR")

if [ "$SAMPLE_REF" == "OK" ]; then
    report_test "Campos Requeridos" "PASS" "Todos los campos requeridos están presentes"
else
    report_test "Campos Requeridos" "FAIL" "Campos faltantes: $SAMPLE_REF"
fi

# Test 7: Rangos de Coordenadas (Chile)
echo -e "${BOLD}Test 7: Validación de Rangos Geográficos${RESET}"
COORDS_VALID=$(echo "$MAP_DATA" | python3 -c "
import sys, json
data = json.load(sys.stdin)
refs = data['data'][:20]  # Verificar primeros 20
invalid = []
for ref in refs:
    lat = ref.get('lat', 0)
    lng = ref.get('lng', 0)
    # Rangos válidos para Chile
    if not (-56.0 <= lat <= -17.5 and -76.0 <= lng <= -66.0):
        invalid.append(ref.get('id', 'unknown'))
print('OK' if len(invalid) == 0 else ','.join(invalid[:3]))
" 2>/dev/null || echo "ERROR")

if [ "$COORDS_VALID" == "OK" ]; then
    report_test "Rangos Geográficos (Chile)" "PASS" "Todas las coordenadas dentro de Chile"
else
    report_test "Rangos Geográficos (Chile)" "FAIL" "Coordenadas fuera de rango: $COORDS_VALID"
fi

# Test 8: Response Time
echo -e "${BOLD}Test 8: Rendimiento de Queries${RESET}"
START_TIME=$(date +%s%3N)
curl -sL "$API_URL/map-data?limit=100" > /dev/null
END_TIME=$(date +%s%3N)
RESPONSE_TIME=$((END_TIME - START_TIME))

if [ "$RESPONSE_TIME" -lt 1000 ]; then
    report_test "Rendimiento de API" "PASS" "Tiempo de respuesta: ${RESPONSE_TIME}ms (< 1s)"
elif [ "$RESPONSE_TIME" -lt 3000 ]; then
    report_test "Rendimiento de API" "PASS" "Tiempo de respuesta: ${RESPONSE_TIME}ms (aceptable)"
else
    report_test "Rendimiento de API" "FAIL" "Tiempo de respuesta: ${RESPONSE_TIME}ms (> 3s)"
fi

# Test 9: Búsqueda por CBR
echo -e "${BOLD}Test 9: Búsqueda por CBR${RESET}"
VALDIVIA_DATA=$(curl -sL "$API_URL/map-data?cbr=Valdivia&limit=50")
VALDIVIA_COUNT=$(echo "$VALDIVIA_DATA" | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data.get('data', [])))" 2>/dev/null || echo "0")

if [ "$VALDIVIA_COUNT" -gt 0 ]; then
    report_test "Filtro por CBR (Valdivia)" "PASS" "Registros encontrados: $VALDIVIA_COUNT"
else
    report_test "Filtro por CBR (Valdivia)" "FAIL" "No se encontraron registros para Valdivia"
fi

# Test 10: Paginación
echo -e "${BOLD}Test 10: Paginación${RESET}"
PAGE1=$(curl -sL "$API_URL/map-data?limit=5&offset=0")
PAGE2=$(curl -sL "$API_URL/map-data?limit=5&offset=5")

ID1=$(echo "$PAGE1" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['data'][0]['id'])" 2>/dev/null || echo "")
ID2=$(echo "$PAGE2" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['data'][0]['id'])" 2>/dev/null || echo "")

if [ "$ID1" != "$ID2" ] && [ -n "$ID1" ] && [ -n "$ID2" ]; then
    report_test "Paginación (offset)" "PASS" "Páginas diferentes: ID1=$ID1, ID2=$ID2"
else
    report_test "Paginación (offset)" "FAIL" "Paginación no funciona correctamente"
fi

# Resumen Final
echo -e "${BOLD}${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                   RESUMEN DE TESTS                        ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${RESET}"

PASSED=$(echo "${TEST_RESULTS[@]}" | grep -o "✅" | wc -l)
FAILED=$(echo "${TEST_RESULTS[@]}" | grep -o "❌" | wc -l)
TOTAL=$((PASSED + FAILED))

echo -e "Total de tests: ${BOLD}$TOTAL${RESET}"
echo -e "✅ Pasados: ${GREEN}${BOLD}$PASSED${RESET}"
echo -e "❌ Fallidos: ${RED}${BOLD}$FAILED${RESET}"
echo

if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}${BOLD}🎉 ¡TODOS LOS TESTS PASARON!${RESET}"
    echo -e "La base de datos inmogrid-db está funcionando correctamente."
    exit 0
else
    echo -e "${YELLOW}${BOLD}⚠️  ALGUNOS TESTS FALLARON${RESET}"
    echo -e "Por favor, revisa los errores arriba."
    exit 1
fi
