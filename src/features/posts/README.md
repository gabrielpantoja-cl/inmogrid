# Feature: `posts`

Gestión de publicaciones (notas/artículos) del ecosistema inmogrid.cl.

## ⚠️ Tabla compartida con pantojapropiedades.cl

La tabla `posts` en Supabase es **compartida** con pantojapropiedades.cl durante la fase de transición. Esto implica:

- **NO** modificar el schema de la tabla sin coordinar con el equipo de pantojapropiedades.cl
- Las migraciones deben ser **backward-compatible**
- Los cambios al algoritmo de `generateSlug` afectan a ambos proyectos — evitar romper slugs existentes

## Scope

- Capa de datos para `posts` (queries Prisma tipadas)
- Validaciones Zod de entrada
- Utilidades de slug y tiempo de lectura
- **NO** incluye componentes UI — el feed público y el editor viven en `src/app/dashboard/notas/` (se migrarán en una iteración posterior cuando haya componentes desacoplados)

## Estructura

```
features/posts/
├── lib/
│   ├── queries.ts       # listPostsByUser, createPostForUser, updatePostForUser, ...
│   ├── validations.ts   # Zod schemas + SELECT projections
│   └── slug.ts          # generateSlug, estimateReadTime
└── index.ts             # API pública
```

## API pública

```ts
import {
  listPostsByUser,
  getPostByIdForUser,
  createPostForUser,
  updatePostForUser,
  deletePostForUser,
  createPostSchema,
  updatePostSchema,
  type CreatePostInput,
  type UpdatePostInput,
} from '@/features/posts';
```

## Dependencias permitidas

- Internas: `@/lib/prisma` (en Sprint 3 migrará a `@/shared/lib/prisma`)
- Externas: `zod`, `crypto` (node built-in)

## Consumido por

- `src/app/api/posts/route.ts` — `GET`, `POST /api/posts`
- `src/app/api/posts/[id]/route.ts` — `GET`, `PUT`, `DELETE /api/posts/[id]`

## Pendiente

- Extraer componentes del editor de notas a `features/posts/components/` cuando se refactorice `src/app/dashboard/notas/crear/CrearNotaForm.tsx`
- Añadir tests unitarios para `queries.ts` con mocks de Prisma
- Añadir endpoint público `GET /api/public/posts` aquí (actualmente no existe feed público)
