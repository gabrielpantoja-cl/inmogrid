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
