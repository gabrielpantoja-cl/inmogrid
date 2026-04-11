import React from 'react';
import { PublicHeader } from '@/shared/components/layout/public/PublicHeader';

/**
 * Layout del route group `(public)`. Envuelve todas las páginas públicas
 * con un `PublicHeader` consistente para que el usuario pueda iniciar /
 * cerrar sesión desde cualquier ruta no autenticada.
 *
 * Next.js App Router trata los directorios con paréntesis `(xxx)` como
 * route groups: sirven solo para compartir layouts / organizar el árbol,
 * sin alterar la URL. Es decir, `src/app/(public)/notas/[slug]/page.tsx`
 * sigue renderizando en `/notas/[slug]`.
 *
 * Rutas que pertenecen a este grupo:
 *   /                       — landing con feed
 *   /notas/[slug]           — detalle de publicación
 *   /[username]             — perfil público
 *   /[username]/notas       — listado de notas del perfil
 *   /[username]/notas/[slug]
 *   /referenciales          — mapa público de referenciales
 *   /privacy
 *   /terms
 *
 * Rutas que **no** están aquí (tienen su propio layout o no necesitan header):
 *   /dashboard/*    — layout propio con navbar del dashboard
 *   /auth/*         — login, callback, error (sin navegación)
 *   /chatbot        — embed sin chrome
 *   /login          — redirect server-side a /auth/login
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      {children}
    </div>
  );
}
