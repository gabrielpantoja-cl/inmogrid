// Barrel público del feature `referenciales`.
// Consumidores (app/, otros features NO permitidos) deben importar desde aquí.

export { default as ReferencialesMap } from './components/ReferencialesMap';
export { default as ReferencialesStats } from './components/ReferencialesStats';
export { default as ReportModal } from './components/ReportModal';
export {
  fetchReferenciales,
  fetchComunas,
  parseMontoCLP,
  formatCLP,
  REFERENCIALES_API_BASE,
} from './lib/api';
export type {
  Referencial,
  MapDataResponse,
  MapDataFilters,
  ComunasResponse,
} from './lib/api';
