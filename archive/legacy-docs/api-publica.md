# 🚀 GUÍA COMPLETA DE LA API PÚBLICA DE INMOGRID.CL

## 📋 Resumen

Esta guía proporciona acceso público a los datos de referenciales inmobiliarias de Chile, permitiendo a aplicaciones externas como **pantojapropiedades.cl** integrar y visualizar esta información sin necesidad de autenticación. Detalla los pasos, consideraciones y ejemplos para la implementación y el consumo de la API.

## ✅ Pre-requisitos

Para el correcto funcionamiento de la API, se requieren los siguientes componentes:

*   **Base de Datos**: PostgreSQL con datos de referenciales.
*   **ORM**: Prisma configurado y conectado a la DB.
*   **Framework**: Next.js 15+ (App Router).
*   **Autenticación**: NextAuth.js (para proteger endpoints internos, no la API pública).

## 🎯 Endpoints Disponibles

### Base URL
`https://inmogrid.cl/api/public`

### 1. Datos del Mapa (`/map-data`)

*   **Método:** `GET`
*   **Descripción:** Retorna un listado de referenciales inmobiliarias con sus coordenadas geográficas y detalles relevantes.
*   **Parámetros de Consulta (Query Parameters):**

| Parámetro | Tipo    | Descripción                                     | Ejemplo                  |
|-----------|---------|-------------------------------------------------|--------------------------|
| `comuna`  | `string`| Filtra los resultados por el nombre de la comuna.| `santiago`               |
| `anio`    | `number`| Filtra los resultados por el año de la escritura.| `2024`                   |
| `limit`   | `number`| Limita el número de resultados retornados.      | `50` (por defecto: 100)  |

*   **Ejemplo de Uso:**
    `https://inmogrid.cl/api/public/map-data?comuna=santiago&anio=2024&limit=50`

*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "cl_12345",
          "lat": -33.4489,
          "lng": -70.6693,
          "fojas": "123",
          "numero": 456,
          "anio": 2024,
          "cbr": "Santiago",
          "predio": "Departamento",
          "comuna": "Santiago",
          "rol": "1234-5",
          "fechaescritura": "2024-01-15",
          "superficie": 75.5,
          "monto": "150000000",
          "observaciones": "Vista al parque"
        }
      ]
    }
    ```

*   **Respuesta de Error (400 Bad Request / 500 Internal Server Error):**
    ```json
    {
      "success": false,
      "error": "Mensaje de error descriptivo"
    }
    ```

### 2. Configuración de la API (`/map-config`)

*   **Método:** `GET`
*   **Descripción:** Proporciona metadatos y configuraciones generales de la API, como la versión, fecha de última actualización, y campos disponibles.
*   **Ejemplo de Uso:**
    `https://inmogrid.cl/api/public/map-config`

*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "success": true,
      "config": {
        "apiVersion": "1.0.0",
        "lastUpdated": "2025-06-08T12:00:00Z",
        "availableFields": [
          "id", "lat", "lng", "fojas", "numero", "anio", "cbr", "predio",
          "comuna", "rol", "fechaescritura", "superficie", "monto", "observaciones"
        ],
        "dataSources": ["Conservadores de Bienes Raíces"],
        "contact": "api@inmogrid.cl"
      }
    }
    ```

### 3. Documentación Completa (`/docs`)

*   **Método:** `GET`
*   **Descripción:** Acceso a la documentación interactiva y ejemplos de integración.

### 4. Health Check (`/health`)

*   **Método:** `GET`
*   **Descripción:** Permite verificar el estado de salud de la API y su conexión a la base de datos.
*   **Parámetros de Consulta (Query Parameters):**

| Parámetro | Tipo    | Descripción                                     | Ejemplo                  |
|-----------|---------|-------------------------------------------------|--------------------------|
| `stats`   | `boolean`| Si es `true`, incluye estadísticas adicionales.| `true`                   |

*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "health": {
        "status": "healthy",
        "database": "connected",
        "timestamp": "2025-06-08T12:00:00Z"
      }
    }
    ```

*   **Respuesta con Estadísticas (200 OK):**
    ```json
    {
      "health": {
        "status": "healthy",
        "database": "connected",
        "timestamp": "2025-06-08T12:00:00Z",
        "stats": {
          "totalReferenciales": 12345,
          "lastReferencialAdded": "2025-06-07T10:30:00Z",
          "referencialesByComuna": {
            "Santiago": 5000,
            "Providencia": 3000
          }
        }
      }
    }
    ```

## 🚀 Proceso de Implementación y Despliegue

### 1. Estructura de Archivos

*   Crear directorio `src/app/api/public/`.
*   Crear `src/app/api/public/map-data/route.ts` (Endpoint principal de datos).
*   Crear `src/app/api/public/map-config/route.ts` (Endpoint de configuración/metadatos).
*   Crear `src/app/api/public/docs/route.ts` (Endpoint para documentación de la API).
*   Crear `src/app/api/public/health/route.ts` (Endpoint para health check).

### 2. Lógica de Endpoints

*   **`map-data/route.ts`**: Implementar `GET` request handler, conectar con Prisma para obtener datos de `Referencial`, filtrar por `comuna`, `anio`, `limit`, excluir campos sensibles, transformar `BigInt` de forma segura, manejar errores y retornar JSON.
*   **`map-config/route.ts`**: Implementar `GET` request handler, retornar metadatos de la API (versión, fecha, campos disponibles, etc.).
*   **`docs/route.ts`**: Implementar `GET` request handler, servir contenido Markdown o HTML con la documentación de la API, incluir ejemplos de uso.
*   **`health/route.ts`**: Implementar `GET` request handler, verificar conexión a la base de datos, retornar estado `healthy` o `unhealthy`, opcionalmente incluir estadísticas.

### 3. Middleware y Seguridad

*   **CORS**: Configurar `src/middleware.ts` para permitir CORS para `https://pantojapropiedades.cl` y `*` (todos los orígenes) para la API pública. Asegurar `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods` (GET, OPTIONS), y `Access-Control-Allow-Headers`.
*   **Autenticación**: Asegurar que las rutas `/api/public/*` no requieran autenticación.
*   **Rate Limiting**: Considerar implementar rate limiting (ej: `next-rate-limit`) para prevenir abuso (futuro).
*   **Validación de Entrada**: Sanitizar y validar todos los query parameters.
*   **Errores**: Evitar exponer detalles internos del servidor en mensajes de error.

### 4. Testing

*   **Unit Tests**: Para `map-data` (filtrado, transformación, errores), `map-config` (metadatos), `health` (conexión DB, estado).
*   **Integration Tests**: Probar endpoints con `curl` o Postman, probar CORS desde un dominio externo.
*   **Performance Tests**: Medir tiempo de respuesta con diferentes filtros y volúmenes de datos.

### 5. Documentación

*   Crear `README-PUBLIC-API.md` en la raíz del proyecto.
*   Crear `docs/integration-examples/` con ejemplos de uso (React, Vanilla JS).
*   Actualizar `README.md` principal con enlace a la documentación de la API pública.
*   Detallar el esquema de respuesta JSON para cada endpoint.

### 6. Despliegue

*   Asegurar que las variables de entorno de base de datos estén configuradas en el entorno de producción (Vercel).
*   Verificar que el build de Next.js incluye las nuevas rutas de la API.
*   Monitorear logs en producción para detectar errores.

## 💻 Ejemplos de Integración

### React + TypeScript (Recomendado)

```tsx
import { useEffect, useState } from 'react';

interface ReferencialPoint {
  id: string;
  lat: number;
  lng: number;
  comuna?: string;
  monto?: string;
  superficie?: number;
  // ... más campos
}

const useReferenciales = (comuna?: string) => {
  const [data, setData] = useState<ReferencialPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = comuna ? `?comuna=${comuna}` : '';
        const response = await fetch(
          `https://inmogrid.cl/api/public/map-data${params}`
        );
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [comuna]);

  return { data, loading };
};
```

### JavaScript Vanilla

```javascript
// Obtener datos
async function getReferenciales(filters = {}) {
  const params = new URLSearchParams(filters);
  const url = `https://inmogrid.cl/api/public/map-data?${params}`;
  
  try {
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

// Usar los datos
getReferenciales({ comuna: 'santiago', limit: 50 })
  .then(data => {
    console.log('Referenciales:', data);
    // Renderizar en el mapa
  });
```

### Componente React con Leaflet (`ReferencialMapComponent.tsx`)

Este componente completo está disponible en `docs/integration-examples/ReferencialMapComponent.tsx` y puede ser utilizado directamente en tu proyecto React.

```tsx
import ReferencialMapComponent from './components/ReferencialMapComponent';

function PaginaMapa() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Referencias Inmobiliarias
      </h1>
      
      <ReferencialMapComponent 
        filters={{ 
          comuna: 'santiago', 
          limit: 100 
        }}
        height="600px"
        onMarkerClick={(point) => {
          console.log('Referencial seleccionado:', point);
          // Aquí puedes abrir un modal, navegar a detalle, etc.
        }}
      />
    </div>
  );
}
```

## 🎨 Personalización para Pantoja Propiedades

### Integración con tu Design System

```tsx
// Ejemplo personalizado para pantojapropiedades.cl
const PantojaReferencialMap = () => {
  return (
    <div className="pantoja-map-container">
      <div className="pantoja-header">
        <h2>Referencias del Mercado</h2>
        <p>Datos oficiales de transacciones inmobiliarias</p>
      </div>
      
      <ReferencialMapComponent 
        filters={{ limit: 200 }}
        height="500px"
        className="pantoja-map"
        customPopupContent={(point) => (
          <div className="pantoja-popup">
            <h3>{point.predio}</h3>
            <div className="price-highlight">
              {point.monto}
            </div>
            <div className="details">
              <span>📍 {point.comuna}</span>
              <span>📐 {point.superficie}m²</span>
              <span>📅 {point.anio}</span>
            </div>
            <button 
              className="pantoja-btn-primary"
              onClick={() => {
                // Integrar con tu sistema de contacto
                window.open(`/contacto?referencia=${point.id}`);
              }}
            >
              Consultar Similar
            </button>
          </div>
        )}
        onMarkerClick={(point) => {
          // Tracking para analytics
          gtag('event', 'referencial_click', {
            comuna: point.comuna,
            monto: point.monto
          });
        }}
      />
    </div>
  );
};
```

### Filtros Inteligentes

```tsx
const SmartFilters = () => {
  const [filters, setFilters] = useState({});
  
  return (
    <div className="filter-bar">
      <select 
        onChange={(e) => setFilters({...filters, comuna: e.target.value})}
      >
        <option value="">Todas las comunas</option>
        <option value="santiago">Santiago</option>
        <option value="providencia">Providencia</option>
        <option value="las-condes">Las Condes</option>
        {/* Más comunas de tu interés */}
      </select>
      
      <input 
        type="range" 
        min="2020" 
        max="2024"
        onChange={(e) => setFilters({...filters, anio: e.target.value})}
      />
      
      <ReferencialMapComponent filters={filters} />
    </div>
  );
};
```

## 📈 Casos de Uso Específicos

### 1. Página de Valuación

```tsx
const ValuationPage = ({ propertyAddress }) => {
  return (
    <div>
      <h1>Valuación de Propiedad</h1>
      <p>Comparar con referencias cercanas:</p>
      
      <ReferencialMapComponent 
        filters={{ 
          comuna: extractComuna(propertyAddress),
          limit: 20 
        }}
        center={getCoordinatesFromAddress(propertyAddress)}
        zoom={15}
      />
    </div>
  );
};
```

### 2. Análisis de Mercado

```tsx
const MarketAnalysis = () => {
  const [selectedComuna, setSelectedComuna] = useState('santiago');
  
  return (
    <div className="market-dashboard">
      <div className="controls">
        <ComunaSelector onChange={setSelectedComuna} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <ReferencialMapComponent 
          filters={{ comuna: selectedComuna }}
        />
        <MarketStats comuna={selectedComuna} />
      </div>
    </div>
  );
};
```

### 3. Widget en Sidebar

```tsx
const ReferencialWidget = ({ comuna }) => {
  const { data, loading } = useReferenciales(comuna);
  
  if (loading) return <WidgetSkeleton />;
  
  return (
    <div className="widget">
      <h3>Referencias en {comuna}</h3>
      <div className="mini-map">
        <ReferencialMapComponent 
          filters={{ comuna, limit: 10 }}
          height="200px"
          zoom={12}
        />
      </div>
      <div className="stats">
        <p>{data.length} referencias encontradas</p>
        <p>Rango: {calculatePriceRange(data)}</p>
      </div>
    </div>
  );
};
```

## 🔧 Optimizaciones Recomendadas

### 1. Caching

```tsx
// Cache los datos por 5 minutos para mejorar performance
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const cachedFetch = async (url: string) => {
  const cacheKey = `referencial_${url}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  
  const response = await fetch(url);
  const data = await response.json();
  
  localStorage.setItem(cacheKey, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
  
  return data;
};
```

### 2. Lazy Loading

```tsx
// Cargar el mapa solo cuando sea visible
const LazyReferencialMap = ({ ...props }) => {
  const [inView, setInView] = useState(false);
  const ref = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={ref}>
      {inView ? (
        <ReferencialMapComponent {...props} />
      ) : (
        <div className="map-placeholder">Cargando mapa...</div>
      )}
    </div>
  );
};
```

## 📱 Responsive Design

```css
/* CSS para hacer el mapa responsive */
.referencial-map-container {
  width: 100%;
  height: 500px;
  
  @media (max-width: 768px) {
    height: 300px;
  }
  
  @media (max-width: 480px) {
    height: 250px;
  }
}

/* Popups más pequeños en móvil */
@media (max-width: 768px) {
  .leaflet-popup-content {
    max-width: 250px !important;
    font-size: 12px;
  }
}
```

## 🔒 Seguridad y Consideraciones

*   **CORS**: La API está configurada para permitir solicitudes desde cualquier origen (`*`), facilitando la integración desde cualquier frontend.
*   **Autenticación**: No se requiere autenticación para acceder a estos endpoints públicos.
*   **Rate Limiting**: Actualmente no hay límites de tasa implementados, pero se recomienda un uso responsable para evitar bloqueos futuros.
*   **Datos Sensibles**: La API excluye automáticamente cualquier información personal o sensible (ej: nombres de compradores/vendedores).

## 📊 Monitoreo y Analytics

```tsx
// Trackear uso de la API
const trackAPIUsage = (endpoint: string, filters: any) => {
  gtag('event', 'api_usage', {
    event_category: 'referenciales_api',
    event_label: endpoint,
    custom_parameters: {
      filters: JSON.stringify(filters),
      timestamp: new Date().toISOString()
    }
  });
};

// Usar en tu componente
useEffect(() => {
  trackAPIUsage('map-data', filters);
}, [filters]);
```

## 🐛 Troubleshooting

### Problemas Comunes

1.  **Error CORS**: La API está configurada con CORS `*`, no debería haber problemas.
2.  **Marcadores no aparecen**: Verificar que los datos tengan `lat` y `lng` válidos.
3.  **Mapa no carga**: Asegurar que Leaflet CSS está importado.
4.  **Performance lenta**: Usar filtro `limit` para reducir cantidad de datos.

### Debug Mode

```tsx
const DEBUG_MODE = process.env.NODE_ENV === 'development';

if (DEBUG_MODE) {
  console.log('API Response:', result);
  console.log('Filtered data:', filteredData);
}
```

## 📞 Soporte

Para cualquier consulta o problema con la API, por favor, abre un issue en el repositorio de GitHub o contacta a `api@inmogrid.cl`.

## 🔒 Consideraciones Futuras

*   **Autenticación (Opcional)**: Implementar API keys para clientes específicos si se requiere mayor control.
*   **Webhooks**: Notificaciones en tiempo real sobre actualizaciones de datos.
*   **GraphQL**: Ofrecer una alternativa GraphQL para mayor flexibilidad en las consultas.
*   **Versiones**: Implementar versionado de la API (ej: `/api/v1/public/`).

## 🎉 ¡Listo para Integrar!

Con esta API, tendrás acceso a:

*   Datos actualizados de referenciales inmobiliarias.
*   Mapa interactivo con marcadores.
*   Filtros por comuna, año, etc.
*   Información detallada de cada transacción.
*   Todo sin autenticación y completamente gratis.

---

**Fecha de Creación:** 8 de Junio de 2025  
**Autor:** Claude Assistant  
**Estado:** Completo