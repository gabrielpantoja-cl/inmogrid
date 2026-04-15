/**
 * Opciones estáticas del formulario de perfil.
 *
 * TODO(Sprint 3): mover `REGIONES` a `@/shared/constants/regions.ts` para
 * que otros features (networking, events) también lo consuman sin duplicar.
 */

export const PROFESSION_OPTIONS = [
  { value: '', label: 'Selecciona una opción' },
  { value: 'TASADOR_PERITO', label: 'Tasador / Perito' },
  { value: 'PERITO_JUDICIAL', label: 'Perito Judicial' },
  { value: 'CORREDOR_PROPIEDADES', label: 'Corredor de Propiedades' },
  { value: 'ADMINISTRADOR_PROP', label: 'Administrador de Propiedades' },
  { value: 'ABOGADO_INMOBILIARIO', label: 'Abogado Inmobiliario' },
  { value: 'ARQUITECTO', label: 'Arquitecto' },
  { value: 'INGENIERO_CIVIL', label: 'Ingeniero Civil' },
  { value: 'ACADEMICO', label: 'Académico' },
  { value: 'FUNCIONARIO_PUBLICO', label: 'Funcionario Público' },
  { value: 'INVERSIONISTA', label: 'Inversionista' },
  { value: 'PROPIETARIO', label: 'Propietario' },
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
