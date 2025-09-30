# Portal Inmobiliario Scraping - Guía de Implementación

## Resumen del Problema Solucionado

El workflow original `workflow-Improved-Scraping.json` tenía el problema de `scraped=0` porque:

1. **Portal Inmobiliario usa contenido dinámico** (JavaScript) - el HTML inicial está vacío
2. **Faltaba paginación robusta** para obtener los ~1706 resultados
3. **Sin evasión de sistemas anti-bot** de Mercado Libre
4. **Sin base de datos centralizada** para almacenar datos

## Soluciones Implementadas

### ✅ Base de Datos Única
- **Utilizamos tu Supabase existente** (`supabase-db` container)
- **Tablas específicas**: `portal_inmobiliario_properties` y `portal_inmobiliario_logs`
- **Sin duplicación** de infraestructura de base de datos

### ✅ Workflows Mejorados

**1. Workflow API Method** (`workflow-Portal-Inmobiliario-Enhanced.json`):
- Intenta usar APIs internas de Portal Inmobiliario
- Método más rápido y eficiente
- Incluye retry logic y manejo de errores

**2. Workflow ScrapingBee** (`workflow-Portal-Inmobiliario-ScrapingBee.json`):
- Usa servicio de terceros para evasión de anti-bot
- JavaScript rendering completo
- Método más robusto pero requiere API key

## Configuración e Implementación

### Paso 1: Configurar Base de Datos

```bash
# Ejecutar script de configuración
./scripts/setup-portal-inmobiliario-db.sh
```

Este script:
- Verifica que Supabase esté corriendo
- Crea las tablas necesarias
- Configura índices y triggers
- Inserta datos de prueba

### Paso 2: Configurar Credenciales en n8n

**PostgreSQL Node Configuration:**
- Host: `supabase-db`
- Port: `5432`
- Database: `postgres`
- Username: `supabase_admin`
- Password: `${SUPABASE_DB_PASSWORD}` (de tu .env)

### Paso 3: Importar y Probar Workflows

1. **Importar a n8n**:
   - Método API: `workflows/workflow-Portal-Inmobiliario-Enhanced.json`
   - Método ScrapingBee: `workflows/workflow-Portal-Inmobiliario-ScrapingBee.json`

2. **Configurar credenciales**:
   - PostgreSQL (ya configurado como "Postgres account")
   - SMTP para notificaciones (opcional)
   - ScrapingBee API key (solo para el segundo workflow)

3. **Prueba manual**:
   - Ejecutar workflow con trigger manual
   - Verificar que se extraigan propiedades
   - Confirmar almacenamiento en base de datos

## Estrategias Recomendadas

### Opción 1: Método API (Recomendado para empezar)
- **Archivo**: `workflow-Portal-Inmobiliario-Enhanced.json`
- **Pro**: Rápido, eficiente, menos recursos
- **Contra**: Puede ser más frágil si cambian las APIs internas
- **Uso**: Ideal para pruebas iniciales

### Opción 2: ScrapingBee (Para producción robusta)
- **Archivo**: `workflow-Portal-Inmobiliario-ScrapingBee.json`
- **Pro**: Muy robusto, evade anti-bot, JavaScript rendering
- **Contra**: Requiere API key de pago, más lento
- **Uso**: Recomendado cuando el Método 1 falle consistentemente

### Configuración de ScrapingBee (Opcional)
```bash
# Añadir a tu .env.local/.env.production
SCRAPINGBEE_API_KEY=your_api_key_here
```

## Monitoreo y Verificación

### Consultas SQL Útiles

```sql
-- Ver propiedades recientes
SELECT * FROM recent_portal_properties LIMIT 10;

-- Contar total de propiedades
SELECT COUNT(*) FROM portal_inmobiliario_properties;

-- Ver logs de ejecución
SELECT * FROM portal_inmobiliario_logs ORDER BY created_at DESC LIMIT 5;

-- Propiedades por rango de precio
SELECT 
    price_range,
    COUNT(*) as count,
    AVG(price) as avg_price
FROM recent_portal_properties 
GROUP BY price_range;
```

### Verificar Funcionamiento

```bash
# Verificar tablas creadas
docker exec -it supabase-db psql -U supabase_admin -d postgres -c "\\dt portal_*"

# Ver registros recientes
docker exec -it supabase-db psql -U supabase_admin -d postgres -c "SELECT COUNT(*) FROM portal_inmobiliario_properties;"
```

## Programación Automática

Ambos workflows incluyen:
- **Schedule Trigger**: Ejecución diaria a las 6:00 AM
- **Manual Trigger**: Para pruebas manuales
- **Email notifications**: Al completar exitosamente

## Solución del Problema Original

El problema `scraped=0` se resolvió mediante:

1. **Detección de contenido dinámico**: Los parsers identifican si el sitio usa JavaScript
2. **APIs internas**: Primer método intenta usar endpoints JSON directos
3. **JavaScript rendering**: Segundo método renderiza completamente la página
4. **Paginación robusta**: Ambos workflows procesan múltiples páginas
5. **Retry logic**: Manejo de errores y reintentos automáticos
6. **Almacenamiento centralizado**: Una sola base de datos en Supabase

## Próximos Pasos

1. **Ejecutar setup**: `./scripts/setup-portal-inmobiliario-db.sh`
2. **Importar workflow preferido** a n8n
3. **Configurar credenciales** PostgreSQL
4. **Prueba manual** primera ejecución
5. **Activar programación** para ejecución diaria
6. **Monitorear logs** y resultados

Con estos workflows deberías poder extraer exitosamente los ~1706 resultados de Portal Inmobiliario y almacenarlos en tu base de datos Supabase existente.