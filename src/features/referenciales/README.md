# Feature: `referenciales`

Visualización pública de datos abiertos de transacciones inmobiliarias chilenas, consumidos desde la API pública de [referenciales.cl](https://referenciales.cl/api/v1/docs).

## Scope

- Mapa Leaflet con markers de transacciones (ReferencialesMap)
- Panel de estadísticas agregadas por comuna/año (ReferencialesStats)
- Cliente HTTP para la API pública de referenciales.cl (lib/api.ts)

**NO incluye**: ingesta/edición de datos. inmogrid.cl solo **consume** la API de referenciales.cl — es un escaparate público.

## Estructura

```
features/referenciales/
├── components/
│   ├── ReferencialesMap.tsx    # Leaflet map (client-only)
│   └── ReferencialesStats.tsx  # Recharts bar charts
├── lib/
│   └── api.ts                  # fetchReferenciales, fetchComunas, parseMontoCLP, formatCLP
└── index.ts                    # API pública del feature
```

## API pública

Importar siempre desde `@/features/referenciales`:

```ts
import {
  ReferencialesMap,
  ReferencialesStats,
  fetchReferenciales,
  fetchComunas,
  parseMontoCLP,
  formatCLP,
  type Referencial,
  type MapDataFilters,
} from '@/features/referenciales';
```

`ReferencialesMap` debe cargarse con `next/dynamic` + `ssr: false` porque Leaflet es browser-only.

## Dependencias permitidas

- Externas: `react`, `react-leaflet`, `leaflet`, `recharts`
- Internas: **ninguna** por ahora. No depende de `shared/` ni de otros features.

## Variables de entorno

- `NEXT_PUBLIC_REFERENCIALES_API_BASE` (opcional) — override del base URL. Default: `https://referenciales.cl/api/v1`.

## CSP

El `connect-src` en `next.config.js` debe incluir `https://referenciales.cl` y `https://www.referenciales.cl` para que los fetch del cliente funcionen en producción.

## Consumido por

- `src/app/referenciales/page.tsx` — página pública `/referenciales`
