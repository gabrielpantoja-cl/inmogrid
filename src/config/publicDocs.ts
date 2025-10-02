/**
 * Configuración de documentos públicos
 *
 * Este archivo define qué documentos de la carpeta /docs
 * son visibles públicamente en el Centro de Documentación.
 */

export interface PublicDoc {
  id: string;
  title: string;
  description: string;
  filePath: string; // Ruta relativa desde /docs/
  category: 'introduccion' | 'desarrollo' | 'api' | 'infraestructura' | 'guias';
  isPublic: boolean; // Controla si se muestra al público
  icon?: string; // Emoji o icono
  lastUpdated?: string;
}

export const publicDocs: PublicDoc[] = [
  {
    id: 'plan-trabajo-v2',
    title: 'Plan de Trabajo - Ecosistema Digital Colaborativo V2.1',
    description: 'Documento completo del plan de trabajo, arquitectura, roadmap y visión del ecosistema digital colaborativo degux.cl',
    filePath: '01-introduccion/Plan_Trabajo_Ecosistema_Digital_V2.1.md',
    category: 'introduccion',
    isPublic: true,
    icon: '📋',
    lastUpdated: '2025-10-01'
  },
  // Agregar más documentos aquí según sea necesario
  // {
  //   id: 'api-guide',
  //   title: 'Guía de API Pública',
  //   description: 'Documentación de la API pública de degux.cl',
  //   filePath: 'PUBLIC_API_GUIDE.md',
  //   category: 'api',
  //   isPublic: false, // Ejemplo de documento no público
  //   icon: '🔌',
  //   lastUpdated: '2025-09-15'
  // },
];

/**
 * Obtiene todos los documentos públicos
 */
export function getPublicDocs(): PublicDoc[] {
  return publicDocs.filter(doc => doc.isPublic);
}

/**
 * Obtiene un documento por su ID
 */
export function getDocById(id: string): PublicDoc | undefined {
  return publicDocs.find(doc => doc.id === id);
}

/**
 * Obtiene documentos por categoría
 */
export function getDocsByCategory(category: PublicDoc['category']): PublicDoc[] {
  return publicDocs.filter(doc => doc.isPublic && doc.category === category);
}

/**
 * Categorías disponibles
 */
export const categories = [
  { id: 'introduccion', label: 'Introducción', icon: '📚' },
  { id: 'desarrollo', label: 'Desarrollo', icon: '💻' },
  { id: 'api', label: 'API', icon: '🔌' },
  { id: 'infraestructura', label: 'Infraestructura', icon: '🏗️' },
  { id: 'guias', label: 'Guías', icon: '📖' },
] as const;