/**
 * Cliente para la API pública de referenciales.cl (v1)
 *
 * referenciales.cl expone datos abiertos de transacciones inmobiliarias
 * (CBR, fojas, ROL, monto, superficie, coordenadas) bajo `/api/v1/*`.
 * Todos los endpoints son GET, sin autenticación y con CORS `*`.
 * Rate limit: 60 req/min (anónimo), 600 req/min (con X-API-Key).
 *
 * Docs: https://referenciales.cl/api/v1/docs
 */

/**
 * Default: use internal API (/api/v1) which queries Neon directly.
 * Override via NEXT_PUBLIC_REFERENCIALES_API_BASE to fallback to external API
 * (e.g., 'https://referenciales.cl/api/v1') if the internal API has issues.
 */
export const REFERENCIALES_API_BASE =
  process.env.NEXT_PUBLIC_REFERENCIALES_API_BASE ?? '/api/v1';

export interface Referencial {
  id: string;
  lat: number;
  lng: number;
  fojas?: string;
  numero?: number;
  anio?: number;
  cbr?: string;
  predio?: string;
  comuna?: string;
  rol?: string;
  fechaescritura?: string;
  superficie?: number;
  /** Monto ya formateado como string en CLP, ej: "$150.000.000" */
  monto?: string;
  observaciones?: string;
}

export interface MapDataResponse {
  success: boolean;
  data: Referencial[];
  metadata: {
    total: number;
    /** Total real de registros en la BD (sin LIMIT aplicado) */
    dbTotal?: number;
    filters: { comuna: string | null; anio: number | null; limit: number | null };
    timestamp: string;
    center: [number, number];
    defaultZoom: number;
    attribution?: string;
  };
}

export interface ComunasResponse {
  success: boolean;
  data: Array<{ comuna: string; count: number }>;
  metadata: { total: number; distinct: number; timestamp: string };
}

export type MapDataFilters = {
  comuna?: string;
  anio?: number;
  limit?: number;
};

function buildUrl(
  path: string,
  params?: Record<string, string | number | undefined>
): string {
  const base = `${REFERENCIALES_API_BASE}${path}`;

  // For relative URLs (/api/v1/...), use string concatenation + URLSearchParams
  if (!base.startsWith('http')) {
    const sp = new URLSearchParams();
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
      }
    }
    const qs = sp.toString();
    return qs ? `${base}?${qs}` : base;
  }

  // For absolute URLs (external API fallback)
  const url = new URL(base);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function fetchWithRetry(url: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: { Accept: 'application/json', ...(init?.headers ?? {}) },
  });
  if (res.status === 429) {
    const retryAfter = Number(res.headers.get('Retry-After') || '5');
    const wait = Math.min(retryAfter, 30) * 1000;
    await new Promise((r) => setTimeout(r, wait));
    return fetch(url, {
      ...init,
      headers: { Accept: 'application/json', ...(init?.headers ?? {}) },
    });
  }
  return res;
}

export async function fetchReferenciales(
  filters: MapDataFilters = {},
  init?: RequestInit
): Promise<MapDataResponse> {
  const res = await fetchWithRetry(buildUrl('/map-data', filters), init);
  if (!res.ok) {
    if (res.status === 429) throw new Error('Demasiadas solicitudes a referenciales.cl. Intenta en unos segundos.');
    throw new Error(`referenciales.cl /map-data respondió ${res.status}`);
  }
  return (await res.json()) as MapDataResponse;
}

export async function fetchComunas(init?: RequestInit): Promise<ComunasResponse> {
  const res = await fetchWithRetry(buildUrl('/map-data/comunas'), init);
  if (!res.ok) {
    if (res.status === 429) throw new Error('Demasiadas solicitudes a referenciales.cl. Intenta en unos segundos.');
    throw new Error(`referenciales.cl /map-data/comunas respondió ${res.status}`);
  }
  return (await res.json()) as ComunasResponse;
}

/**
 * Parsea un monto CLP formateado tipo "$150.000.000" a un número.
 * Devuelve null si no se puede parsear.
 */
export function parseMontoCLP(monto?: string): number | null {
  if (!monto) return null;
  const digits = monto.replace(/[^0-9]/g, '');
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

export function formatCLP(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);
}
