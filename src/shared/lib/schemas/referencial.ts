import { z } from 'zod';

/**
 * Schema for raw rows returned by Neon referenciales queries.
 * `monto` comes as string from SQL (`monto::text`) to preserve BigInt precision.
 * `fechaescritura` is coerced from Date to string.
 */
export const MapPointRowSchema = z.object({
  id: z.string(),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  fojas: z.string().nullable().optional(),
  numero: z.coerce.number().nullable().optional(),
  anio: z.coerce.number().nullable().optional(),
  cbr: z.string().nullable().optional(),
  predio: z.string().nullable().optional(),
  comuna: z.string().nullable().optional(),
  rol: z.string().nullable().optional(),
  fechaescritura: z.coerce.date().nullable().optional(),
  superficie: z.coerce.number().nullable().optional(),
  monto: z.string().nullable().optional(), // Already cast to text in SQL
  observaciones: z.string().nullable().optional(),
});

export type MapPointRow = z.infer<typeof MapPointRowSchema>;

/**
 * Schema for the formatted API response point.
 * `monto` is a CLP-formatted string like "$150.000.000".
 * `montoRaw` is the same value as numeric string ("150000000") — solo lo
 * incluye la API autenticada para habilitar analíticas cliente sin re-parsear.
 * `fechaescritura` is a DD/MM/YYYY string.
 */
export const MapPointResponseSchema = z.object({
  id: z.string(),
  lat: z.number(),
  lng: z.number(),
  fojas: z.string().optional(),
  numero: z.number().optional(),
  anio: z.number().optional(),
  cbr: z.string().optional(),
  predio: z.string().optional(),
  comuna: z.string().optional(),
  rol: z.string().optional(),
  fechaescritura: z.string().optional(),
  superficie: z.number().optional(),
  monto: z.string().optional(),
  montoRaw: z.string().optional(),
  observaciones: z.string().optional(),
});

export type MapPointResponse = z.infer<typeof MapPointResponseSchema>;

/**
 * Schema for comuna count rows.
 */
export const ComunaCountSchema = z.object({
  comuna: z.string(),
  count: z.coerce.number(),
});

export type ComunaCount = z.infer<typeof ComunaCountSchema>;

/**
 * Schema for validating incoming API query parameters.
 */
export const MapDataQueryParamsSchema = z.object({
  comuna: z.string().max(100).optional(),
  anio: z.coerce.number().int().min(1900).max(2100).optional(),
  limit: z.coerce.number().int().min(1).max(50000).optional().default(20000),
});

export type MapDataQueryParams = z.infer<typeof MapDataQueryParamsSchema>;

/**
 * Schema extendido de query params — SOLO para la API autenticada
 * (`/api/referenciales/map-data`). Añade filtros avanzados (fechas, rangos,
 * búsqueda, bbox) y eleva el CAP de `limit` a 200 000.
 *
 * El `bbox` llega como string `"minLng,minLat,maxLng,maxLat"` y se parsea a
 * tupla de 4 floats. Si el parseo falla, Zod rechaza el request con 400.
 */
const bboxTuple = z.tuple([z.number(), z.number(), z.number(), z.number()]);

export const MapDataExtendedQueryParamsSchema = z.object({
  comuna: z.string().max(100).optional(),
  anio: z.coerce.number().int().min(1900).max(2100).optional(),
  limit: z.coerce.number().int().min(1).max(200000).optional().default(50000),
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
  montoMin: z.coerce.number().int().nonnegative().optional(),
  montoMax: z.coerce.number().int().nonnegative().optional(),
  superficieMin: z.coerce.number().nonnegative().optional(),
  superficieMax: z.coerce.number().nonnegative().optional(),
  q: z.string().trim().max(100).optional(),
  bbox: z
    .string()
    .optional()
    .transform((val, ctx) => {
      if (!val) return undefined;
      const parts = val.split(',').map((s) => Number(s.trim()));
      if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'bbox debe ser "minLng,minLat,maxLng,maxLat" con 4 floats',
        });
        return z.NEVER;
      }
      const [minLng, minLat, maxLng, maxLat] = parts;
      if (minLng >= maxLng || minLat >= maxLat) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'bbox mal formado: min debe ser menor que max en cada eje',
        });
        return z.NEVER;
      }
      return bboxTuple.parse(parts);
    }),
});

export type MapDataExtendedQueryParams = z.infer<
  typeof MapDataExtendedQueryParamsSchema
>;
