# 🏠 Guía Completa: Web Scraping Portal Inmobiliario con n8n

## 📖 Tabla de Contenidos

1. [Introducción y Fundamentos Teóricos](#1-introducción-y-fundamentos-teóricos)
2. [Configuración e Implementación Práctica](#2-configuración-e-implementación-práctica)
3. [Arquitectura del Workflow n8n](#3-arquitectura-del-workflow-n8n)
4. [Persistencia e Integración de Datos](#4-persistencia-e-integración-de-datos)
5. [Despliegue y Mantenimiento](#5-despliegue-y-mantenimiento)

---

## 1. Introducción y Fundamentos Teóricos

### 1.1 Visión General del Proyecto

La adquisición automatizada de datos inmobiliarios de Portal Inmobiliario representa un caso de uso avanzado de web scraping que trasciende la simple extracción de datos. Este proyecto requiere una metodología profesional que combine inteligencia técnica, respeto por las mejores prácticas éticas y una arquitectura robusta diseñada para la producción.

### 1.2 Análisis Técnico de Portal Inmobiliario

Portal Inmobiliario es una plataforma web moderna que depende heavily de la renderización del lado del cliente. Las características técnicas clave incluyen:

- **Arquitectura SPA**: Aplicación de página única con carga dinámica de contenido
- **Renderización JavaScript**: Los datos de propiedades se cargan dinámicamente post-renderización inicial
- **Sistema de Paginación**: URLs con patrón `/Desde_X` sugieren paginación basada en offset
- **APIs Internas**: El front-end consume APIs JSON para poblar el contenido

#### Estrategia API-First

La metodología más robusta consiste en identificar las APIs internas que utiliza el front-end:

1. **Abrir DevTools** en Chrome (F12)
2. **Filtrar por XHR/Fetch** en la pestaña Network
3. **Navegar entre páginas** para capturar las llamadas API
4. **Identificar endpoints** que devuelven datos JSON estructurados
5. **Copiar como cURL** para replicar en n8n

### 1.3 Marco Ético y Legal

- **Términos de Servicio**: Portal Inmobiliario generalmente prohíbe extracción automatizada
- **robots.txt**: El archivo no es válido/accesible, creando zona gris
- **Best Practices**: Implementar rate limiting agresivo y usar User-Agent descriptivo
- **Responsabilidad**: Operar de manera conservadora para evitar interrupciones

---

## 2. Configuración e Implementación Práctica

### 2.1 Requisitos Previos

- ✅ n8n configurado y funcionando (http://N8N_HOST_REDACTED)
- ✅ PostgreSQL disponible para almacenamiento
- ✅ Cuenta con servicio de scraping (HTTP Request o servicio especializado)
- ✅ Gmail configurado para notificaciones

### 2.2 Configuración de Base de Datos

Ejecutar el script de configuración de BD:

```bash
# Desde el directorio raíz del proyecto
./scripts/setup-db.sh
```

Este script:
- Verifica que PostgreSQL esté ejecutándose
- Crea las tablas `properties` y `error_logs`
- Configura índices y vistas para performance
- Ejecuta verificaciones de integridad

#### Esquema de Base de Datos

```sql
-- Tabla principal de propiedades
CREATE TABLE properties (
    id VARCHAR(50) PRIMARY KEY,
    title TEXT,
    price DECIMAL(15,2),
    currency VARCHAR(10),
    property_type VARCHAR(50),
    bedrooms INTEGER,
    bathrooms INTEGER,
    surface_area DECIMAL(10,2),
    location TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    description TEXT,
    url TEXT,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de logs de errores
CREATE TABLE error_logs (
    id SERIAL PRIMARY KEY,
    workflow_name VARCHAR(100),
    error_message TEXT,
    error_details JSONB,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.3 Configuración de Credenciales en n8n

#### 2.3.1 Credenciales PostgreSQL
1. Ir a **Settings** → **Credentials** en n8n
2. Añadir credencial **PostgreSQL**
3. Configurar:
   - **Name**: `PostgreSQL` o `postgres-main`
   - **Host**: `localhost` (o IP del servidor)
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: [tu password de PostgreSQL]
   - **Port**: `5432`

#### 2.3.2 Credenciales Gmail (para alertas)
1. Añadir credencial **Gmail OAuth2**
2. Seguir el proceso de autenticación OAuth
3. **Name**: `Gmail` o `gmail-main`

#### 2.3.3 HTTP Request Directo (Recomendado)
**No requiere credenciales externas**. Configuración básica con headers estándar.

---

## 3. Arquitectura del Workflow n8n

### 3.1 Componentes del Workflow Principal

#### 3.1.1 Trigger y Control de Flujo
```
Manual Trigger (desarrollo) → Cron Trigger (producción)
    ↓
Initialize Variables (Edit Fields)
    ↓
Loop Control (Item Lists)
```

#### 3.1.2 Motor de Extracción
```
HTTP Request Node (API call)
    ↓
Item Lists (Split Out Items)
    ↓
Edit Fields (Data transformation)
    ↓
Code Node (Advanced processing)
```

#### 3.1.3 Persistencia y Alertas
```
PostgreSQL Insert/Update
    ↓
Error Handling Branch
    ↓
Gmail Notification (on errors)
```

### 3.2 Configuración del HTTP Request Node

#### HTTP Request Directo (Recomendado)
```json
{
  "method": "GET",
  "url": "={{ $json.baseUrl }}/_Desde_{{ $json.offset }}",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      {
        "name": "User-Agent",
        "value": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      },
      {
        "name": "Accept",
        "value": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
      },
      {
        "name": "Accept-Language",
        "value": "es-CL,es;q=0.8,en;q=0.6"
      }
    ]
  },
  "options": {
    "timeout": 60000,
    "retry": {
      "enabled": true,
      "maxTries": 3,
      "waitBetween": 2000
    },
    "batching": {
      "enabled": false
    }
  }
}
```

#### Para Servicio de Scraping (Opcional)
```json
{
  "method": "POST",
  "url": "https://api.scrapeninja.net/scrape",
  "headers": {
    "X-RapidAPI-Key": "{{ $credentials.scrapeninja.apikey }}"
  },
  "body": {
    "url": "https://www.portalinmobiliario.com/venta/valdivia-los-rios/_Desde_{{ $json.offset }}",
    "retryNum": 3,
    "geo": "CL",
    "renderJs": true
  }
}
```

### 3.3 Lógica de Paginación

```javascript
// En Edit Fields - Inicialización
{
  "offset": 0,
  "hasMorePages": true,
  "pageSize": 50
}

// En Code Node - Incremento de página
const currentOffset = items[0].json.offset;
const pageSize = items[0].json.pageSize;
const resultCount = items[0].json.results.length;

return [{
  json: {
    offset: currentOffset + pageSize,
    hasMorePages: resultCount === pageSize,
    pageSize: pageSize
  }
}];
```

### 3.4 Transformación de Datos

```javascript
// Code Node - Limpieza y estructuración
const properties = [];

for (const item of items) {
  const rawData = item.json;

  properties.push({
    id: rawData.id || `${rawData.title}_${Date.now()}`,
    title: rawData.title?.trim(),
    price: parseFloat(rawData.price?.toString().replace(/[^\d.]/g, '')),
    currency: rawData.currency || 'CLP',
    property_type: rawData.type || 'unknown',
    bedrooms: parseInt(rawData.bedrooms) || null,
    bathrooms: parseInt(rawData.bathrooms) || null,
    surface_area: parseFloat(rawData.surface) || null,
    location: rawData.location?.trim(),
    city: extractCity(rawData.location),
    region: extractRegion(rawData.location),
    description: rawData.description?.trim(),
    url: rawData.url,
    scraped_at: new Date().toISOString()
  });
}

function extractCity(location) {
  // Lógica para extraer ciudad
  return location?.split(',')[0]?.trim();
}

function extractRegion(location) {
  // Lógica para extraer región
  return location?.split(',').pop()?.trim();
}

return properties.map(prop => ({ json: prop }));
```

---

## 4. Persistencia e Integración de Datos

### 4.1 Operaciones de Base de Datos

#### Insert con Upsert Logic
```sql
-- PostgreSQL Node Query
INSERT INTO properties (
  id, title, price, currency, property_type,
  bedrooms, bathrooms, surface_area, location,
  city, region, description, url, scraped_at
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
)
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  title = EXCLUDED.title,
  scraped_at = EXCLUDED.scraped_at
RETURNING id;
```

#### Parámetros del Query
```javascript
[
  "{{ $json.id }}",
  "{{ $json.title }}",
  "{{ $json.price }}",
  "{{ $json.currency }}",
  "{{ $json.property_type }}",
  "{{ $json.bedrooms }}",
  "{{ $json.bathrooms }}",
  "{{ $json.surface_area }}",
  "{{ $json.location }}",
  "{{ $json.city }}",
  "{{ $json.region }}",
  "{{ $json.description }}",
  "{{ $json.url }}",
  "{{ $json.scraped_at }}"
]
```

### 4.2 Manejo de Errores y Logging

#### Query SQL Simplificada (Sin error_details)
```sql
-- Insert Error Log (Configuración actual)
INSERT INTO error_logs (workflow_name, error_message, occurred_at)
VALUES ($1, $2, CURRENT_TIMESTAMP)
RETURNING id;
```

#### Configuración en n8n
**Query Parameters:** `={{ [$json.workflow_name, $json.error_message] }}`

#### Si tu tabla tiene error_details:
```sql
-- Insert Error Log (Con error_details)
INSERT INTO error_logs (workflow_name, error_message, error_details, occurred_at)
VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
RETURNING id;
```

#### Code Node - Error Processing
```javascript
// Preparar datos de error
const errorDetails = {
  error: error.message,
  item: item.json,
  timestamp: new Date().toISOString(),
  stack: error.stack
};

return [{
  json: {
    workflow_name: 'Portal Inmobiliario Scraper',
    error_message: error.message,
    error_details: JSON.stringify(errorDetails) // Solo si tu tabla lo soporta
  }
}];
```

### 4.3 Configuración de Rate Limiting

En el HTTP Request Node:
- **Continue on Fail**: ✅ Habilitado
- **Retry on Fail**: ✅ Habilitado (3 intentos)
- **Batching**: Items per Batch = 1, Batch Interval = 3000ms

---

## 5. Despliegue y Mantenimiento

### 5.1 Programación Automática

#### Cron Trigger Configuration
```
# Ejecutar diariamente a las 3:00 AM (hora local)
0 3 * * *

# Ejecutar cada 6 horas
0 */6 * * *

# Ejecutar solo días laborales a las 9:00 AM
0 9 * * 1-5
```

### 5.2 Monitoreo y Alertas

#### Email Notification Node
```json
{
  "fromEmail": "sistema@tudominio.com",
  "toEmail": "admin@tudominio.com",
  "subject": "🚨 Error en Portal Inmobiliario Scraper",
  "emailFormat": "html",
  "message": `
    <h2>Error en Workflow</h2>
    <p><strong>Workflow:</strong> {{ $json.workflow_name }}</p>
    <p><strong>Error:</strong> {{ $json.error_message }}</p>
    <p><strong>Tiempo:</strong> {{ $now }}</p>
    <p><strong>Detalles:</strong></p>
    <pre>{{ $json.error_details }}</pre>
  `
}
```

### 5.3 Consultas de Análisis

#### Estadísticas de Propiedades
```sql
-- Propiedades por tipo
SELECT
    property_type,
    COUNT(*) as count,
    AVG(price) as avg_price,
    MIN(price) as min_price,
    MAX(price) as max_price
FROM properties
WHERE price IS NOT NULL
GROUP BY property_type
ORDER BY count DESC;

-- Trending por ubicación (últimos 7 días)
SELECT
    city,
    COUNT(*) as listings,
    AVG(price) as avg_price
FROM properties
WHERE scraped_at >= CURRENT_DATE - INTERVAL '7 days'
    AND city IS NOT NULL
GROUP BY city
ORDER BY listings DESC
LIMIT 10;

-- Evolución de precios
SELECT
    DATE(scraped_at) as date,
    COUNT(*) as properties_scraped,
    AVG(price) as avg_price
FROM properties
WHERE scraped_at >= CURRENT_DATE - INTERVAL '30 days'
    AND price IS NOT NULL
GROUP BY DATE(scraped_at)
ORDER BY date;
```

#### Estadísticas de Valdivia (Específicas)
```sql
-- Vista específica para Valdivia
CREATE VIEW valdivia_property_stats AS
SELECT
    property_type,
    COUNT(*) as total_listings,
    AVG(price) as avg_price,
    AVG(surface_area) as avg_surface,
    AVG(bedrooms) as avg_bedrooms
FROM properties
WHERE city ILIKE '%valdivia%'
    AND region ILIKE '%los ríos%'
GROUP BY property_type;

-- Propiedades recientes en Valdivia
CREATE VIEW recent_valdivia_properties AS
SELECT *
FROM properties
WHERE city ILIKE '%valdivia%'
    AND scraped_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY scraped_at DESC;
```

### 5.4 Mantenimiento y Optimización

#### Limpieza Periódica
```sql
-- Función para limpiar propiedades antiguas
CREATE OR REPLACE FUNCTION clean_old_properties(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM properties
    WHERE scraped_at < CURRENT_DATE - INTERVAL days_old || ' days';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    INSERT INTO error_logs (workflow_name, error_message, error_details)
    VALUES ('Maintenance', 'Cleanup completed',
            json_build_object('deleted_records', deleted_count, 'days_old', days_old));

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
```

#### Índices para Performance
```sql
-- Índices recomendados
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_scraped_at ON properties(scraped_at);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price) WHERE price IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
```

### 5.5 Troubleshooting Common Issues

#### 1. Error "batchInterval" en HTTP Request
**Problema:** `Cannot read properties of undefined (reading 'batchInterval')`
**Solución:**
- Cambiar `batching` a `"enabled": false`
- Usar `typeVersion: 4.1` en lugar de `4.2`
- Eliminar propiedades `batchSize` y `batchInterval`

#### 2. Error "column does not exist" en PostgreSQL
**Problema:** `column "error_details" of relation "error_logs" does not exist`
**Solución:**
- **Query simplificada:** `INSERT INTO error_logs (workflow_name, error_message, occurred_at) VALUES ($1, $2, CURRENT_TIMESTAMP)`
- **Query Parameters:** `={{ [$json.workflow_name, $json.error_message] }}`
- O crear la columna: `ALTER TABLE error_logs ADD COLUMN error_details JSONB;`

#### 3. Error "there is no parameter $1"
**Problema:** Faltan Query Parameters en nodo PostgreSQL
**Solución:**
- En **Additional Fields** → activar **Query Parameters**
- Configurar: `={{ [$json.workflow_name, $json.error_message] }}`
- O usar query sin parámetros: `VALUES ('{{ $json.workflow_name }}', '{{ $json.error_message }}', CURRENT_TIMESTAMP)`

#### 4. HTTP Request sin credenciales
**Problema:** Requests fallando por falta de API keys
**Solución:**
- Usar método **GET** directo a Portal Inmobiliario
- Configurar User-Agent y headers básicos
- Evitar servicios externos como ScrapeNinja

#### 5. Actor no encuentra propiedades
- Verificar que Portal Inmobiliario no haya cambiado estructura
- Revisar rate limiting
- Actualizar User-Agent

#### 6. Errores de base de datos
- Verificar credenciales PostgreSQL
- Comprobar que las tablas existan
- Revisar permisos de usuario

#### 7. Notificaciones no llegan
- Verificar credenciales Gmail
- Revisar spam/filtros
- Comprobar permisos OAuth

### 5.6 Estrategias de Resiliencia

#### Múltiples Fuentes de Datos
- Configurar múltiples endpoints como fallback
- Implementar rotación de User-Agents
- Usar proxies si es necesario

#### Backup de Configuración
```bash
# Exportar workflow
curl -X GET "http://localhost:5678/api/v1/workflows/export" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  > portal-inmobiliario-workflow-backup.json
```

---

## 🎯 Conclusiones Estratégicas

### Mejores Prácticas Implementadas

1. **API-First Approach**: Priorizar intercepción de APIs sobre scraping HTML
2. **Arquitectura Resiliente**: Manejo robusto de errores y reintentos
3. **Rate Limiting Responsable**: Respeto por los recursos del servidor objetivo
4. **Monitoreo Proactivo**: Alertas automáticas y logging detallado
5. **Mantenimiento Planificado**: Estrategias de limpieza y optimización

### Expansión Futura

- **Múltiples Portales**: Yapo.cl, MercadoLibre Inmuebles
- **IA y ML**: Análisis de sentimientos, predicción de precios
- **Dashboard**: Visualizaciones en tiempo real
- **APIs Públicas**: Exposición de datos estructurados

### Consideraciones Éticas

- Cumplimiento de términos de servicio
- Rate limiting conservador
- Uso responsable de recursos
- Transparencia en User-Agent
- Respeto por medidas anti-bot

---

**¿Necesitas ayuda con algún paso específico?** Esta guía proporciona una base sólida para implementar un sistema profesional de scraping inmobiliario con n8n. 🚀