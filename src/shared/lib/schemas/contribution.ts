import { z } from 'zod';

/**
 * Zod schema for user contribution input.
 * Geographic bounds enforce Chilean territory.
 * ROL format: XXXXX-XXXX (SII property identifier).
 */
export const ContributionInputSchema = z.object({
  sourceId: z.string().max(100).optional(),
  contributionType: z.enum(['new', 'correction', 'report']).default('new'),
  lat: z.number().min(-56).max(-17.5),
  lng: z.number().min(-76).max(-66),
  fojas: z.string().max(50).optional(),
  numero: z.number().int().positive().optional(),
  anio: z.number().int().min(1900).max(2100).optional(),
  cbr: z.string().max(200).optional(),
  predio: z.string().max(500).optional(),
  comuna: z.string().max(100).optional(),
  rol: z
    .string()
    .regex(/^\d{1,5}-\d{1,4}$/, 'ROL must match format XXXXX-XXXX')
    .optional(),
  fechaescritura: z.string().datetime().optional(),
  superficie: z.number().positive().optional(),
  monto: z.number().int().nonnegative().optional(),
  observaciones: z.string().max(1000).optional(),
});

export type ContributionInput = z.infer<typeof ContributionInputSchema>;

/**
 * Zod schema for admin review action.
 */
export const ReviewInputSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reviewNote: z.string().max(500).optional(),
});

export type ReviewInput = z.infer<typeof ReviewInputSchema>;
