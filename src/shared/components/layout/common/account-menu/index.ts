/**
 * Primitivos compartidos para el menú de cuenta (dropdown + hook de
 * estado). Usados tanto por el navbar del dashboard como por el
 * `PublicHeader` de las rutas públicas.
 *
 * La eliminación de cuenta **no está** en este barrel. Vive en el feature
 * `profiles` (`DangerZone` componente en `features/profiles/components`)
 * y solo se monta desde `/dashboard/perfil`. Ver ADR-004 para el diseño
 * del patrón "shared primitive vs contextual composer".
 */
export { AccountMenu } from './AccountMenu';
export { useAccountActions } from './useAccountActions';
