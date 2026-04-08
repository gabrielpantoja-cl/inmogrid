/**
 * Opciones estáticas del formulario de perfil.
 *
 * TODO(Sprint 3): mover `REGIONES` a `@/shared/constants/regions.ts` para
 * que otros features (networking, events) también lo consuman sin duplicar.
 */

export const PROFESSION_OPTIONS = [
  { value: '', label: 'Selecciona una opción' },
  { value: 'CORREDOR', label: 'Corredor de Propiedades' },
  { value: 'TASADOR', label: 'Tasador / Perito' },
  { value: 'ARQUITECTO', label: 'Arquitecto' },
  { value: 'CONSTRUCTOR', label: 'Constructor' },
  { value: 'INGENIERO', label: 'Ingeniero' },
  { value: 'INVERSIONISTA', label: 'Inversionista' },
  { value: 'ABOGADO', label: 'Abogado' },
  { value: 'OTRO', label: 'Otro' },
] as const;

export const REGIONES = [
  'Región de Arica y Parinacota',
  'Región de Tarapacá',
  'Región de Antofagasta',
  'Región de Atacama',
  'Región de Coquimbo',
  'Región de Valparaíso',
  'Región Metropolitana',
  "Región del Libertador General Bernardo O'Higgins",
  'Región del Maule',
  'Región de Ñuble',
  'Región del Biobío',
  'Región de La Araucanía',
  'Región de Los Ríos',
  'Región de Los Lagos',
  'Región de Aysén',
  'Región de Magallanes',
] as const;
