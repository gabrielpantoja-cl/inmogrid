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
 *
 * Cuando `includeRawMonto` es true, el campo `montoRaw` (string numérico
 * sin formato) viaja junto con `monto` — solo la API autenticada lo activa.
 */
function toResponsePoint(
  row: MapPointRow,
  options: { includeRawMonto?: boolean } = {}
): MapPointResponse {
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
    ...(options.includeRawMonto && row.monto && { montoRaw: row.monto }),
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
}): Promise<{ data: MapPointResponse[]; total: number; dbTotal: number }> {
  const { comuna, anio, limit = 20000 } = params;

  const sql = getNeonDb();

  // Run data query and total count in parallel for performance
  const [rows, countRows] = await Promise.all([
    sql`
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
    `,
    sql`
      SELECT COUNT(*)::int as total
      FROM referenciales
      WHERE (COALESCE(ST_Y(geom), lat)) IS NOT NULL
        AND (COALESCE(ST_X(geom), lng)) IS NOT NULL
        AND COALESCE(ST_Y(geom), lat) BETWEEN -90 AND 90
        AND COALESCE(ST_X(geom), lng) BETWEEN -180 AND 180
        AND (${comuna ?? null}::text IS NULL OR LOWER(comuna) = LOWER(${comuna ?? null}))
        AND (${anio ?? null}::int IS NULL OR anio = ${anio ?? null})
    `,
  ]);

  const validated = rows.map((row) => MapPointRowSchema.parse(row));
  const data = validated.map((r) => toResponsePoint(r));
  const dbTotal = (countRows[0]?.total as number) ?? 0;

  return { data, total: data.length, dbTotal };
}

/**
 * Query map data from Neon con filtros avanzados — uso exclusivo de la
 * API autenticada (`/api/referenciales/map-data`).
 *
 * Extiende `queryMapData` añadiendo:
 *   - `fechaDesde` / `fechaHasta`: rango sobre `fechaescritura`.
 *   - `montoMin` / `montoMax`: rango sobre `monto::bigint`.
 *   - `superficieMin` / `superficieMax`: rango sobre `superficie`.
 *   - `bbox`: [minLng, minLat, maxLng, maxLat] — filtra geométricamente
 *     vía `ST_MakeEnvelope` + `ST_Contains`, con fallback a comparación
 *     directa sobre `lat`/`lng` si `geom IS NULL` (manteniendo el patrón
 *     COALESCE del resto del módulo).
 *   - `q`: match parcial case-insensitive sobre `predio` o `rol`.
 *   - `includeRawMonto`: si true, cada punto incluye `montoRaw` (string
 *     numérico sin formato) para analíticas/export sin re-parseo.
 *
 * Todos los filtros son opcionales; el patrón `${value ?? null}::type IS
 * NULL OR …` permite dejarlos sin bindear en el template tag sin romper
 * el parsing del query.
 */
export async function queryMapDataExtended(params: {
  comuna?: string;
  anio?: number;
  limit?: number;
  fechaDesde?: Date;
  fechaHasta?: Date;
  montoMin?: number;
  montoMax?: number;
  superficieMin?: number;
  superficieMax?: number;
  q?: string;
  bbox?: [number, number, number, number];
  includeRawMonto?: boolean;
}): Promise<{ data: MapPointResponse[]; total: number; dbTotal: number }> {
  const {
    comuna,
    anio,
    limit = 50000,
    fechaDesde,
    fechaHasta,
    montoMin,
    montoMax,
    superficieMin,
    superficieMax,
    q,
    bbox,
    includeRawMonto = false,
  } = params;

  const sql = getNeonDb();

  // Extraer bbox a 4 bindings individuales para que postgres.js los trate
  // como `float8` explícitos; el pattern `(${minLng ?? null}::float8 IS NULL …)`
  // desactiva la cláusula entera cuando bbox no viene.
  const minLng = bbox?.[0] ?? null;
  const minLat = bbox?.[1] ?? null;
  const maxLng = bbox?.[2] ?? null;
  const maxLat = bbox?.[3] ?? null;

  // `q` se usa con ILIKE → escapamos los comodines `%` y `_` para que
  // un input del usuario no arme una query de prefix/wildcard no deseada.
  const qPattern = q
    ? `%${q.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')}%`
    : null;

  const [rows, countRows] = await Promise.all([
    sql`
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
        AND (${fechaDesde ?? null}::timestamp IS NULL OR fechaescritura >= ${fechaDesde ?? null})
        AND (${fechaHasta ?? null}::timestamp IS NULL OR fechaescritura <= ${fechaHasta ?? null})
        AND (${montoMin ?? null}::bigint IS NULL OR monto >= ${montoMin ?? null})
        AND (${montoMax ?? null}::bigint IS NULL OR monto <= ${montoMax ?? null})
        AND (${superficieMin ?? null}::numeric IS NULL OR superficie >= ${superficieMin ?? null})
        AND (${superficieMax ?? null}::numeric IS NULL OR superficie <= ${superficieMax ?? null})
        AND (
          ${qPattern}::text IS NULL
          OR predio ILIKE ${qPattern}
          OR rol ILIKE ${qPattern}
        )
        AND (
          ${minLng}::float8 IS NULL
          OR COALESCE(ST_X(geom), lng) BETWEEN ${minLng ?? null} AND ${maxLng ?? null}
        )
        AND (
          ${minLat}::float8 IS NULL
          OR COALESCE(ST_Y(geom), lat) BETWEEN ${minLat ?? null} AND ${maxLat ?? null}
        )
      ORDER BY fechaescritura DESC
      LIMIT ${limit}
    `,
    sql`
      SELECT COUNT(*)::int as total
      FROM referenciales
      WHERE (COALESCE(ST_Y(geom), lat)) IS NOT NULL
        AND (COALESCE(ST_X(geom), lng)) IS NOT NULL
        AND COALESCE(ST_Y(geom), lat) BETWEEN -90 AND 90
        AND COALESCE(ST_X(geom), lng) BETWEEN -180 AND 180
        AND (${comuna ?? null}::text IS NULL OR LOWER(comuna) = LOWER(${comuna ?? null}))
        AND (${anio ?? null}::int IS NULL OR anio = ${anio ?? null})
        AND (${fechaDesde ?? null}::timestamp IS NULL OR fechaescritura >= ${fechaDesde ?? null})
        AND (${fechaHasta ?? null}::timestamp IS NULL OR fechaescritura <= ${fechaHasta ?? null})
        AND (${montoMin ?? null}::bigint IS NULL OR monto >= ${montoMin ?? null})
        AND (${montoMax ?? null}::bigint IS NULL OR monto <= ${montoMax ?? null})
        AND (${superficieMin ?? null}::numeric IS NULL OR superficie >= ${superficieMin ?? null})
        AND (${superficieMax ?? null}::numeric IS NULL OR superficie <= ${superficieMax ?? null})
        AND (
          ${qPattern}::text IS NULL
          OR predio ILIKE ${qPattern}
          OR rol ILIKE ${qPattern}
        )
        AND (
          ${minLng}::float8 IS NULL
          OR COALESCE(ST_X(geom), lng) BETWEEN ${minLng ?? null} AND ${maxLng ?? null}
        )
        AND (
          ${minLat}::float8 IS NULL
          OR COALESCE(ST_Y(geom), lat) BETWEEN ${minLat ?? null} AND ${maxLat ?? null}
        )
    `,
  ]);

  const validated = rows.map((row) => MapPointRowSchema.parse(row));
  const data = validated.map((r) => toResponsePoint(r, { includeRawMonto }));
  const dbTotal = (countRows[0]?.total as number) ?? 0;

  return { data, total: data.length, dbTotal };
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
 * Query CBR directory with transaction counts from Neon (read-only).
 */
export async function queryCBRDirectory(): Promise<{ cbr: string; count: number }[]> {
  const sql = getNeonDb();
  const rows = await sql`
    SELECT cbr, COUNT(*)::int as count
    FROM referenciales
    WHERE cbr IS NOT NULL AND cbr <> ''
    GROUP BY cbr ORDER BY count DESC
  `;
  return rows.map((r) => ({ cbr: r.cbr as string, count: r.count as number }));
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
