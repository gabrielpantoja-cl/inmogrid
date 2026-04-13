import { getNeonDb } from '@/shared/lib/neon';
import {
  MapPointRowSchema,
  ComunaCountSchema,
  type MapPointRow,
  type MapPointResponse,
  type ComunaCount,
} from '@/shared/lib/schemas/referencial';

/**
 * Formats a raw monto string (from BigInt::text) to CLP currency.
 * Input: "150000000" → Output: "$150.000.000"
 * Returns undefined if input is null/empty.
 */
export function formatMontoCLP(monto: string | null | undefined): string | undefined {
  if (!monto) return undefined;
  const num = Number(monto);
  if (!Number.isFinite(num)) return undefined;
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Formats a Date to DD/MM/YYYY string (es-CL locale).
 */
export function formatFechaEscritura(fecha: Date | null | undefined): string | undefined {
  if (!fecha) return undefined;
  return fecha.toLocaleDateString('es-CL');
}

/**
 * Transforms a raw DB row into the API response format.
 * - monto: BigInt string → CLP formatted string
 * - fechaescritura: Date → DD/MM/YYYY
 * - Nulls become undefined (omitted from JSON)
 */
function toResponsePoint(row: MapPointRow): MapPointResponse {
  return {
    id: row.id,
    lat: row.lat,
    lng: row.lng,
    ...(row.fojas && { fojas: row.fojas }),
    ...(row.numero != null && { numero: row.numero }),
    ...(row.anio != null && { anio: row.anio }),
    ...(row.cbr && { cbr: row.cbr }),
    ...(row.predio && { predio: row.predio }),
    ...(row.comuna && { comuna: row.comuna }),
    ...(row.rol && { rol: row.rol }),
    ...(row.fechaescritura && { fechaescritura: formatFechaEscritura(row.fechaescritura) }),
    ...(row.superficie != null && { superficie: row.superficie }),
    ...(row.monto && { monto: formatMontoCLP(row.monto) }),
    ...(row.observaciones && { observaciones: row.observaciones }),
  };
}

/**
 * Query map data from Neon with optional filters.
 * Uses PostGIS ST_X/ST_Y with fallback to lat/lng columns.
 * monto is cast to text in SQL to preserve BigInt precision.
 */
export async function queryMapData(params: {
  comuna?: string;
  anio?: number;
  limit?: number;
}): Promise<{ data: MapPointResponse[]; total: number }> {
  const { comuna, anio, limit = 20000 } = params;

  const sql = getNeonDb();
  const rows = await sql`
    SELECT
      id,
      COALESCE(ST_Y(geom), lat) as lat,
      COALESCE(ST_X(geom), lng) as lng,
      fojas, numero, anio, cbr, predio, comuna, rol,
      fechaescritura, superficie,
      monto::text as monto,
      observaciones
    FROM referenciales
    WHERE (COALESCE(ST_Y(geom), lat)) IS NOT NULL
      AND (COALESCE(ST_X(geom), lng)) IS NOT NULL
      AND COALESCE(ST_Y(geom), lat) BETWEEN -90 AND 90
      AND COALESCE(ST_X(geom), lng) BETWEEN -180 AND 180
      AND (${comuna ?? null}::text IS NULL OR LOWER(comuna) = LOWER(${comuna ?? null}))
      AND (${anio ?? null}::int IS NULL OR anio = ${anio ?? null})
    ORDER BY fechaescritura DESC
    LIMIT ${limit}
  `;

  const validated = rows.map((row) => MapPointRowSchema.parse(row));
  const data = validated.map(toResponsePoint);

  return { data, total: data.length };
}

/**
 * Query distinct comunas with their record count.
 * Ordered by count descending for relevance.
 */
export async function queryComunas(): Promise<ComunaCount[]> {
  const sql = getNeonDb();
  const rows = await sql`
    SELECT comuna, COUNT(*)::int as count
    FROM referenciales
    WHERE comuna IS NOT NULL
      AND comuna <> ''
      AND (COALESCE(ST_Y(geom), lat)) IS NOT NULL
      AND (COALESCE(ST_X(geom), lng)) IS NOT NULL
    GROUP BY comuna
    ORDER BY count DESC
  `;

  return rows.map((row) => ComunaCountSchema.parse(row));
}

/**
 * Query aggregate stats for the referenciales dataset.
 */
export async function queryReferencialStats(): Promise<{
  totalReferenciales: number;
  lastUpdate: string;
}> {
  const sql = getNeonDb();
  const [stats] = await sql`
    SELECT
      COUNT(*)::int as total,
      MAX("updatedAt") as last_update
    FROM referenciales
  `;

  return {
    totalReferenciales: stats.total ?? 0,
    lastUpdate: stats.last_update
      ? new Date(stats.last_update).toISOString()
      : new Date().toISOString(),
  };
}
