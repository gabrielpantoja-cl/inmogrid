/**
 * Cliente para la API pública de referenciales.cl
 *
 * referenciales.cl expone datos abiertos de transacciones inmobiliarias
 * (CBR, fojas, ROL, monto, superficie, coordenadas) bajo `/api/public/*`.
 * Todos los endpoints son GET, sin autenticación y con CORS `*`.
 *
 * Docs: https://referenciales.cl/api/public/docs
 */

export const REFERENCIALES_API_BASE =
  process.env.NEXT_PUBLIC_REFERENCIALES_API_BASE ?? 'https://referenciales.cl/api/public';

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

export interface MapDataFilters {
  comuna?: string;
  anio?: number;
  limit?: number;
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(`${REFERENCIALES_API_BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function fetchReferenciales(
  filters: MapDataFilters = {},
  init?: RequestInit
): Promise<MapDataResponse> {
  const res = await fetch(buildUrl('/map-data', filters), {
    ...init,
    headers: { Accept: 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`referenciales.cl /map-data respondió ${res.status}`);
  return (await res.json()) as MapDataResponse;
}

export async function fetchComunas(init?: RequestInit): Promise<ComunasResponse> {
  const res = await fetch(buildUrl('/map-data/comunas'), {
    ...init,
    headers: { Accept: 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`referenciales.cl /map-data/comunas respondió ${res.status}`);
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
