# Deuda técnica — inmogrid.cl

> **Documento vivo**. Inventario canónico de todo lo que sabemos que está roto, frágil, o inconsistente en el repo/infra, con contexto suficiente para retomarlo después sin re-descubrirlo.

**Última revisión**: 2026-04-11
**Mantenedor**: cualquiera que abra un PR puede actualizar este archivo — agregar ítems nuevos al fondo de su sección, mover ítems a "Resuelto" con fecha, o reajustar prioridad.

---

## Cómo usar este documento

- Cada ítem tiene **prioridad**, **contexto**, **impacto**, **opciones de fix** con trade-offs, y **bloqueadores** si los hay.
- **Prioridades**:
  - **P0** — bloquea features user-facing o flujos críticos. Resolver lo antes posible.
  - **P1** — no bloquea hoy pero tiene impacto operacional o de seguridad. Resolver en la próxima ventana de trabajo sustancial.
  - **P2** — warnings, polish, consistencia. Hacer en bulk cuando se toque el área correspondiente.
- **Antes de cerrar un ítem**: mover a la sección "Resuelto" al final del doc, con la fecha y un link al commit/PR.
- **No cobra la lista**: si encontrás algo roto que no está acá, agregalo. Mejor tener deuda visible que invisible.

---

## P0 — Bloquea features user-facing

### 1. Schema de `posts` divergente entre Prisma y la DB real

**Contexto.** La tabla `public.posts` en la DB Supabase compartida tiene columnas originarias de pantojapropiedades.cl:

```
id uuid, created_at timestamptz, title text, content text,
author_id uuid, status text, category text, image text,
excerpt text, slug text
```

El modelo `Post` en `prisma/schema.prisma` describe un schema **diferente**, pensado para inmogrid.cl:

```
id, userId, title, slug, content, excerpt, coverImageUrl,
published, publishedAt, tags[], readTime, createdAt, updatedAt
```

Mapeos divergentes:
| Prisma | DB real | Estado |
|---|---|---|
| `userId` | `author_id` | ambos son uuid pero el nombre difiere |
| `published: boolean` | `status: text ('published' \| ...)` | tipos distintos |
| `publishedAt: timestamptz` | *(no existe)* | se usa `created_at` como proxy |
| `coverImageUrl` | `image` | renombrado |
| `tags: text[]` | *(no existe)* | sin equivalente |
| `readTime: int` | *(no existe)* | sin equivalente |
| `updatedAt` | *(no existe)* | sin equivalente |

**Impacto.** Cualquier llamada tipada a `prisma.post.*` intenta acceder a columnas inexistentes → **runtime error en producción** con mensajes del tipo "column posts.user_id does not exist".

**Archivos afectados** (auditoría 2026-04-11):

```
src/features/posts/lib/queries.ts                        ← capa de acceso a datos del feature (CRÍTICO)
src/app/dashboard/notas/page.tsx                         ← "Mis publicaciones"
src/app/(public)/[username]/page.tsx                     ← perfil público
src/app/(public)/[username]/notas/page.tsx               ← notas del perfil
src/app/(public)/[username]/notas/[slug]/page.tsx        ← nota individual en perfil
src/app/api/delete-account/route.ts                      ← flujo de baja de cuenta
src/app/api/public/health/route.ts                       ← health check del endpoint público
src/app/api/public/profiles/[username]/posts/route.ts    ← API de posts por perfil
src/app/sitemap.ts                                       ← sitemap SEO (emite posts)
```

**Archivos que ya saltearon el problema con `$queryRaw`** (ok, no tocar hasta que se resuelva el schema):

```
src/app/dashboard/(overview)/page.tsx                    ← feed del dashboard
src/app/dashboard/explorar/page.tsx                      ← explorar perfiles/posts
src/app/(public)/notas/[slug]/page.tsx                   ← detalle público de nota
src/app/api/public/posts/route.ts                        ← feed público
```

**Opciones de fix**:

#### Opción A — Migrar el schema del DB al modelo de Prisma *(recomendado para horizonte largo)*

Aplicar un `ALTER TABLE public.posts` que:
1. Agregue las columnas nuevas: `user_id`, `published`, `published_at`, `cover_image_url`, `tags`, `read_time`, `updated_at`.
2. Copie datos de las columnas viejas donde haga sentido: `author_id → user_id`, `status='published' → published=true`, `image → cover_image_url`, `created_at → published_at` (solo para filas publicadas).
3. Mantenga las columnas viejas durante la transición para no romper a pantojapropiedades.cl.
4. Cuando muera pantoja, `DROP COLUMN` de las columnas legacy.

**Trade-off**: es la solución limpia de largo plazo y desbloquea todas las llamadas tipadas de Prisma. Requiere planificar la ventana de migración y verificar con pantojapropiedades.cl que ninguno de sus queries se rompa por la adición de columnas (no deberían, solo agrega).

**Bloqueador**: coordinar con el mantenedor de pantojapropiedades.cl. Dado que pantoja muere en ~5 días desde 2026-04-11, puede tener más sentido esperar a la baja y entonces hacer la migración sin riesgo.

#### Opción B — Rebajar el schema de Prisma a las columnas reales *(pragmatico para corto plazo)*

Reescribir `model Post` en `prisma/schema.prisma` con los nombres reales (`author_id`, `status`, `image`, sin `tags`/`readTime`/`updatedAt`/`published`). Después todos los `prisma.post.*` del repo funcionarían sin cambios de llamada (solo de tipos).

**Trade-off**: pierde features que el código actual asume (tags, readTime, updatedAt). Los endpoints que los usan (`/api/public/posts` con filtro por tag) tendrían que ser rediseñados o eliminados.

**Bloqueador**: ninguno técnico, solo cuestión de decidir si vale perder features por velocidad.

#### Opción C — Convertir todo a `$queryRaw` *(hack de emergencia)*

Reemplazar cada `prisma.post.*` por una query SQL cruda, como ya hicimos en `dashboard/(overview)` y en `api/public/posts`. Deja el schema Prisma como está, no requiere migraciones DB.

**Trade-off**: pierdes todas las ventajas de Prisma (type safety, generación de clientes, DX). Los `INSERT`/`UPDATE` son más engorrosos. **No es una solución, es un parche** — solo sirve como step intermedio mientras se decide entre A y B.

#### Recomendación

**Esperar a la baja de pantojapropiedades.cl (~2026-04-16)** y entonces ejecutar la **Opción A**. En el mientras tanto:

- No agregar código nuevo que llame a `prisma.post.*` tipado.
- Si un flujo user-facing está roto y bloquea a usuarios reales, parchear con `$queryRaw` (Opción C) como medida temporal.
- Trackear el progreso de la baja en el doc privado `infra/privado/inmogrid.cl/`.

---

## P1 — Impacto operacional o de seguridad

### 2. Base compartida con pantojapropiedades.cl

**Contexto.** El proyecto Supabase compartido (ver `CLAUDE.local.md`) aloja al mismo tiempo los datos de pantojapropiedades.cl (en vida útil residual) y de inmogrid.cl. La base tiene ~36 tablas, de las cuales ~20 son legacy exclusivas de pantoja (`crm_*`, `teams`, `team_members`, `team_notifications`, `external_portals`, `blog_guidelines_versions`, `legal_page_versions`, `property_portal_listings`, `property_videos`, `property_images`, `seo_metrics`, `site_*`, `chat_*`, `documents`, `user_google_tokens`, `user_notification_preferences`, `profiles`, `degux_posts`, `inmobloques_scores`, `cotizaciones`).

**Impacto.**
- Cada operación destructiva sobre `auth.users`, `profiles` o cualquier tabla "transversal" tiene **blast radius en ambos proyectos**. Ya nos pasó con el trigger huérfano de `degux` que bloqueó todo signup nuevo (ver post-mortem privado `auth-triggers-fix-2026-04-11.md`).
- Los RLS policies pueden tener asunciones distintas entre los dos proyectos.
- El `prisma/schema.prisma` de inmogrid.cl solo modela las tablas de inmogrid, así que `prisma db pull` no es seguro de correr (rompería mapeos).

**Opciones de fix**:

#### Opción A — Dejar todo como está hasta que muera pantoja y después limpiar en un batch

Plan (a ejecutar después de 2026-04-16 o cuando pantoja pase a read-only):

```sql
-- DROP de tablas legacy — ninguna de estas es usada por inmogrid.cl
DROP TABLE IF EXISTS public.cotizaciones, public.crm_clientes, public.crm_interacciones,
  public.crm_oportunidades, public.crm_ordenes_visita, public.crm_tareas,
  public.teams, public.team_members, public.team_notifications, public.external_portals,
  public.blog_guidelines_versions, public.legal_page_versions, public.property_portal_listings,
  public.property_videos, public.property_images, public.seo_metrics,
  public.site_daily_stats, public.site_page_views, public.site_popular_content,
  public.site_session_analytics, public.chat_conversations, public.chat_messages,
  public.documents, public.user_google_tokens, public.user_notification_preferences,
  public.profiles, public.degux_posts, public.inmobloques_scores
  CASCADE;

-- DROP del trigger legacy de pantoja sobre auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_create_profile ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_profile();
```

**Trade-off**: rápido, pero deja inmogrid.cl en el mismo proyecto Supabase compartido. Si mañana aparece otro proyecto que use la base, vuelve a haber riesgo de blast radius.

#### Opción B — Migrar inmogrid.cl a su propio proyecto Supabase *(recomendado)*

Crear un proyecto Supabase nuevo `inmogrid-prod`, volcar las 6 tablas que usa inmogrid.cl (`inmogrid_profiles`, `posts` con schema limpio, `inmogrid_connections`, `inmogrid_events`, `inmogrid_professional_profiles`, `inmogrid_audit_logs`, `inmogrid_chat_messages`), apuntar `DATABASE_URL`/`DIRECT_URL`/`NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` al nuevo project ref, deploy.

**Trade-off**: más trabajo (es una migración, no un DROP), pero aísla permanentemente el blast radius y permite rediseñar el schema sin legacy. Buena oportunidad de hacer la migración P0 #1 (schema de `posts`) al mismo tiempo.

**Bloqueador**: coordinar la ventana de downtime con los usuarios activos de inmogrid.cl. Tener backups hot ready.

#### Recomendación

**Opción B después de la muerte de pantoja**. Bundle con la migración de schema de `posts` para que sea una sola ventana de mantenimiento.

---

### 3. `inmogrid_profiles.id` sin FK hard a `auth.users`

**Contexto.** Durante el diagnóstico de la consolidación de usuarios (2026-04-11) se verificó que **ninguna tabla de `public.*` tiene una FK hard que apunte a `auth.users`**. En particular `inmogrid_profiles.id` es un `uuid` que "debería" matchear `auth.users.id` por convención, pero no hay constraint que lo enforce.

**Impacto.**
- Si se borra una fila de `auth.users` (manual, script, Supabase dashboard), la fila correspondiente en `inmogrid_profiles` queda **huérfana** y no se limpia automáticamente.
- Inversamente, si se borra una fila de `inmogrid_profiles`, el user de `auth.users` sigue existiendo y puede volver a loguearse — pero sin perfil (el trigger `on_auth_user_created_inmogrid` ya no lo re-crea porque solo corre en `INSERT` nuevo a `auth.users`).
- Estado actual es consistente gracias a intervenciones manuales, pero es frágil.

**Comparar**: `public.profiles.user_id` sí tiene `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE`. `inmogrid_profiles` no tiene equivalente.

**Fix propuesto**:

```sql
ALTER TABLE public.inmogrid_profiles
ADD CONSTRAINT inmogrid_profiles_id_fkey
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

**Bloqueador**: antes de aplicar, verificar que todas las filas actuales de `inmogrid_profiles` tengan un matching `auth.users.id`:

```sql
SELECT ip.id FROM public.inmogrid_profiles ip
LEFT JOIN auth.users u ON u.id = ip.id
WHERE u.id IS NULL;
```

Si devuelve filas, son huérfanos — decidir si borrarlos o restaurar el user antes de agregar el constraint.

**Prioridad**: P1 por el riesgo de integridad, pero sin incidente activo.

---

### 4. Paths hardcodeados al source en server components de `content.md`

**Contexto.** `src/app/(public)/privacy/page.tsx` y `src/app/(public)/terms/page.tsx` leen sus respectivos `content.md` con:

```ts
const contentPath = path.join(
  process.cwd(),
  'src/app/(public)/privacy/content.md'
)
const content = await fs.readFile(contentPath, 'utf8')
```

El patrón ya se rompió una vez durante el refactor del route group (2026-04-11) porque el path estaba cableado al source físico y al mover el `page.tsx` de `src/app/privacy/` a `src/app/(public)/privacy/` el `content.md` se quedó en su carpeta pero el código apuntaba a la vieja.

**Impacto.** Cualquier refactor futuro que mueva estos archivos rompe el build con `ENOENT` durante el prerender. No hay protección ni test.

**Opciones de fix**:

#### Opción A — Import literal del markdown

```ts
import content from './content.md?raw'
```

Requiere configurar un webpack/turbopack loader en `next.config.js` para manejar `.md?raw`. Ventaja: el bundler trackea la dependencia automáticamente y mueve el archivo al bundle.

**Trade-off**: configuración extra en `next.config.js`. Quiebra si se cambia de bundler sin actualizar el loader.

#### Opción B — `fileURLToPath(import.meta.url)`

```ts
import { fileURLToPath } from 'url'
import path from 'path'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const contentPath = path.join(__dirname, 'content.md')
```

Resuelve relativo al archivo, no al cwd. Más portable conceptualmente, pero **conflictivo con los chunks serverless de Next.js** — en algunos casos `import.meta.url` se resuelve a una ruta del bundle en vez del source.

#### Opción C — Mover el contenido a `content/legal/*.md` *(recomendado)*

Mover los dos markdowns a una carpeta fuera de `src/app/`:

```
content/
└── legal/
    ├── privacy.md
    └── terms.md
```

Y en cada page.tsx:

```ts
const contentPath = path.join(process.cwd(), 'content/legal/privacy.md')
```

**Trade-off**: pierde la co-ubicación del markdown con su page. Ganás estabilidad ante refactors de rutas, y dejás el directorio `content/` listo para futuros contenidos estáticos (FAQ, términos comerciales, documentación de partners, etc.).

#### Recomendación

**Opción C**, 10 minutos de trabajo. Mover los 2 archivos, actualizar los 2 paths, verificar el build, commitear.

---

### 5. Perfil de `pplosrios@gmail.com` incompleto

**Contexto.** Durante la consolidación de usuarios del 2026-04-11 se creó manualmente la fila de `pplosrios@gmail.com` en `public.inmogrid_profiles` con el mínimo de datos necesarios para que el trigger (ahora existente, ver [`authentication.md`](authentication.md#triggers-de-authusers--creación-de-perfiles-en-signup)) no volviera a correr:

```sql
INSERT INTO public.inmogrid_profiles (id, full_name, is_public_profile, role, ...)
VALUES (..., 'PP Bienes Raices', true, 'admin', ...)
ON CONFLICT (id) DO NOTHING;
```

Los campos `username`, `bio`, `tagline`, `profession`, `company`, `location`, `region`, `commune`, `avatar_url`, etc. **quedaron en NULL**.

**Impacto.**
- Los links del feed del dashboard a las publicaciones de pplosrios caen al fallback `/notas/[slug]` en vez de `/[username]/notas/[slug]` porque `author.username` es null. Funcionalmente equivalente, cosmética peor.
- El perfil público en `/[username]` no es accesible porque no hay `username` a qué matchear.
- El avatar en el navbar del dashboard renderiza el `<UserIcon />` fallback en vez de la foto de Google.

**Fix**: entrar al dashboard como pplosrios, ir a `/dashboard/perfil`, completar los campos desde la UI. Cinco minutos.

Alternativamente, un `UPDATE` directo en la DB:

```sql
UPDATE public.inmogrid_profiles
   SET username = 'pplosrios',
       profession = 'CORREDOR_PROPIEDADES',
       company = 'PP Bienes Raíces SpA',
       region = 'Los Ríos',
       commune = 'Valdivia',
       updated_at = NOW()
 WHERE id = '<uid de pplosrios — ver doc privado>';
```

---

### 6. API routes y server components que aún llaman a `prisma.post.*`

Estas rutas están rotas por el issue **P0 #1** y cada una necesita ser parchada con `$queryRaw` o esperar a la migración del schema:

| Archivo | Llamada problemática | Impacto al usuario |
|---|---|---|
| `src/features/posts/lib/queries.ts` | listPostsByUser, getPostByIdForUser, createPostForUser, updatePostForUser, deletePostForUser | CRUD de posts roto en dashboard |
| `src/app/dashboard/notas/page.tsx` | `prisma.post.findMany({where:{userId}})` | "Mis publicaciones" no carga |
| `src/app/(public)/[username]/page.tsx` | `prisma.post.findMany({where:{userId,published:true}})` | Perfil público no carga posts del autor |
| `src/app/(public)/[username]/notas/page.tsx` | idem | Listado de notas del perfil no carga |
| `src/app/(public)/[username]/notas/[slug]/page.tsx` | `prisma.post.findFirst({where:{slug,published:true,author:{username}}})` | Nota individual en perfil 404 |
| `src/app/api/public/health/route.ts` | `prisma.post.count()` + `prisma.post.findFirst()` | Health endpoint retorna 500 |
| `src/app/api/public/profiles/[username]/posts/route.ts` | `prisma.post.findMany` | API pública de posts por perfil 500 |
| `src/app/sitemap.ts` | `prisma.post.findMany({where:{published:true}})` | Sitemap SEO sin URLs de posts |

**Estrategia recomendada**: **no arreglar individualmente**. Resolver P0 #1 (Opción A — migrar schema) de una y todos estos se desbloquean juntos.

**Si un ítem puntual bloquea a un usuario antes de que P0 #1 se resuelva**: parchar con `$queryRaw` siguiendo el patrón de `src/app/dashboard/(overview)/page.tsx`, `src/app/api/public/posts/route.ts`, o `src/app/api/delete-account/route.ts` (este último usa `$executeRaw` dentro de una `prisma.$transaction`). **No** rebajar el Prisma schema localmente — rompe el tipo cliente compartido.

---

## P2 — Warnings, polish, consistencia

### 7. ESLint warnings del build de Vercel

El build de Vercel (2026-04-11) emitió 14 warnings que no rompen deploy pero reflejan oportunidades de cleanup:

| Archivo:línea | Rule | Qué hacer |
|---|---|---|
| `src/app/(public)/[username]/page.tsx:123:23` | `no-img-element` | Reemplazar `<img>` por `<Image />` de next/image |
| `src/app/(public)/referenciales/page.tsx:4:8` | `no-unused-vars` | `import Link` no usado post-refactor — borrar |
| `src/app/api/revalidate/route.ts:34:27` | `no-unused-vars` | Param `request` no usado — renombrar `_request` o eliminar |
| `src/app/api/users/profile/route.ts:30:27` | `no-unused-vars` | Param `_request` no usado — eliminar |
| `src/app/dashboard/explorar/page.tsx:96:19` | `no-img-element` | `<img>` → `<Image />` |
| `src/app/dashboard/notas/crear/CrearNotaForm.tsx:253:15` | `no-img-element` | `<img>` → `<Image />` (preview de upload) |
| `src/features/docs/components/DocsContent.tsx:99:22` | `no-unused-vars` | Param `node` en renderer de markdown — renombrar `_node` |
| `src/features/github-stars/components/GitHubStarsDisplay.tsx:8:32` | `no-unused-vars` | `getCacheInfo` importado pero no usado — borrar |
| `src/features/networking/components/ConnectionButton.tsx:14:25` | `no-unused-vars` | `useActionState` importado pero no usado — borrar |
| `src/shared/components/layout/common/AcmeLogo.tsx:34:27` | `react-hooks/exhaustive-deps` | `useCallback` con deps desconocidas — envolver en inline function o memoizar |
| `src/shared/components/layout/common/OptimizedHeroImage.tsx:25:9` | `react-hooks/exhaustive-deps` | `imageOptions` debe estar en `useMemo` para que `useCallback` lo vea estable |
| `src/shared/components/layout/common/custom-link.tsx:7:35` | `import/no-named-as-default-member` | Probable `React.LinkHTMLAttributes` — cambiar a `import { LinkHTMLAttributes } from 'react'` |
| `src/shared/components/layout/legal/CookiePreferencesLink.tsx:4:10` | `no-unused-vars` | `Settings` importado pero no usado |
| `src/shared/components/layout/profile/ProfileHero.tsx:16:3` | `no-unused-vars` | Prop `username` declarada pero no usada |

**Estrategia**: resolver todos en un único commit de cleanup. `npm run lint -- --fix` resuelve los `no-unused-vars` triviales; el resto es trabajo manual.

### 8. `boundaries/element-types` ESLint rule deprecada

Vercel también warneo:

```
[boundaries/element-types] Rule name is deprecated. Use "boundaries/dependencies" instead.
Detected legacy selector syntax in 2 rule(s) at indices: 0, 1.
```

**Fix**: actualizar `.eslintrc.*` migrando la config de `boundaries/element-types` a `boundaries/dependencies` siguiendo la [guía v5→v6](https://www.jsboundaries.dev/docs/releases/migration-guides/v5-to-v6/). Relacionado con [ADR-001](adr/ADR-001-feature-first-architecture.md) (usa `eslint-plugin-boundaries` para enforcar feature-first).

### 9. `baseline-browser-mapping` stale

```
[baseline-browser-mapping] The data in this module is over two months old.
```

**Fix**: `npm i baseline-browser-mapping@latest -D` y commitear el lock.

### 10. Node engines warning de Vercel

```
Warning: Detected "engines": { "node": ">=18.0.0" } in your package.json that will
automatically upgrade when a new major Node.js Version is released.
```

**Fix**: pinear a un rango cerrado en `package.json`:

```json
"engines": {
  "node": ">=20 <23"
}
```

Y alinear con la versión de Node que Vercel usa en prod. Docs: https://vercel.link/node-version.

### 11. Indentación residual en `(public)/referenciales/page.tsx`

Al refactorizar el route group (2026-04-11) se unwrappeó el `<div className="min-h-screen">` exterior de la página, pero el contenido interno quedó indentado a 8 espacios en vez de 6. No rompe nada, solo estético.

**Fix**: correr `npx prettier --write 'src/app/(public)/referenciales/page.tsx'`. Si no hay config de prettier en el repo (verificar), agregar el `.prettierrc` antes.

### 12. Auditoría de RLS pendiente sobre todas las tablas

El CLAUDE.md del proyecto declara:

> **Database**: Supabase/PostgreSQL with mandatory RLS on all tables — except `referenciales.cl` which uses Prisma ORM

Pero **no hay verificación activa** de que cada tabla de `public.*` tenga RLS habilitado + policies válidas. Dada la consolidación reciente y la cantidad de tablas legacy en la base compartida, es muy probable que algunas tengan RLS `DISABLED` o policies permisivas de más.

**Fix**: ejecutar

```sql
SELECT c.relname,
       c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relname;
```

Para cada tabla con `rls_enabled = false`, decidir:
- Habilitar RLS + escribir policies, o
- Verificar que la tabla nunca se expone por el PostgREST API (API keys anon/service_role).

El audit completo como documento privado en `infra/privado/inmogrid.cl/rls-audit-<fecha>.md`.

**Prioridad**: P1 desde la perspectiva de seguridad, P2 en esta lista porque no hay incidente activo. Subir a P1 cuando se migre a proyecto Supabase propio (item #2).

### 13. OpenAPI docs potencialmente desactualizadas

CLAUDE.md menciona `/api/public/docs` como "API docs". No se revisó en esta sesión si el contenido refleja el estado actual de los endpoints públicos después del refactor de `(public)/` y los cambios en el schema de `posts`.

**Fix**: abrir `src/app/api/public/docs/` (si existe), verificar contra la lista real de endpoints en `src/app/api/public/*`, actualizar el OpenAPI spec. Considerar generar el spec automáticamente a partir de Zod schemas si el volumen crece.

### 14. Tabla `public.degux_posts` huérfana

Durante la auditoría del 2026-04-11 se encontró que `public.degux_profiles` no existe (su trigger huérfano rompió el signup, ver item #3 de la sección "Resuelto"), pero **`public.degux_posts` sí existe** y está vacía.

**Fix**: confirmar con el proyecto hermano `degux.cl` (si sigue vivo) que nadie lo usa, y luego `DROP TABLE public.degux_posts`.

**Bloqueador**: coordinar con el mantenedor de degux.cl antes de dropear.

### 15. `SignOutTestComponent` borrado pero el patrón de debug panels no tiene reemplazo

Se borró `src/shared/components/layout/common/SignOutTestComponent.tsx` (panel de debug histórico que solo renderizaba en dev). La lección aprendida es que componentes de debug-only deben vivir en un lugar discoverable y tener un owner claro.

**Fix**: cuando se necesiten panels de debug futuros, crear `src/shared/components/dev/` con el convenio de que todos los archivos ahí retornan `null` en `process.env.NODE_ENV === 'production'`. Documentar en `patrones.md`. Sin urgencia.

---

## Resuelto recientemente (para trazabilidad)

### [✅ 2026-04-11] Flujo de "Eliminar cuenta" roto + rediseño de confirmación GitHub-style

- `/api/delete-account/route.ts` usaba `prisma.post.count({where:{userId}})` (roto por P0 #1 — el schema divergente) y `prisma.profile.delete({where:{id:authUser.id}})` (**siempre fallaba** porque `profiles.id` es una PK sintética, no el `auth.users.id`).
- Además, el endpoint nunca borraba `auth.users` ni las filas de `inmogrid_*` — el user quedaba con data huérfana y el account seguía logueable.
- El dropdown del `AccountMenu` exponía "Eliminar Cuenta" con solo 2 clicks — demasiado fácil de disparar por accidente.
- **Fix**:
  - Reescrita la ruta con `prisma.$transaction` + `$executeRaw` que valida `{ confirmation: string }` contra el email del user, borra todas las filas de `public.*` que le pertenecen y finalmente `DELETE FROM auth.users` (que cascadea `auth.identities`/`auth.sessions`/`auth.refresh_tokens`).
  - Nuevo componente `DangerZone` en `src/features/profiles/components/DangerZone.tsx` — zona de peligro GitHub-style al final de `/dashboard/perfil`, con botón inicial que despliega un input donde el usuario debe escribir **su email exacto**; el botón "Eliminar mi cuenta para siempre" queda deshabilitado hasta que matchee carácter por carácter.
  - `AccountMenu` y `useAccountActions` simplificados: ya no manejan lógica de delete. Solo cerrar sesión + links legales.
  - Borrados `src/shared/components/layout/common/account-menu/DeleteAccountDialog.tsx` y `src/shared/hooks/useDeleteAccount.ts` (deuda técnica cerrada, reemplazados por el flujo nuevo).

### [✅ 2026-04-11] CSP bloqueaba el cliente Supabase del browser

- `next.config.js` tenía `connect-src 'self' ... https://api.openai.com ...` pero **sin** `https://*.supabase.co`. El hook `useAuth` del cliente (que llama `supabase.from('inmogrid_profiles').select('*').eq('id',...)`) era bloqueado por la política — el `profile` quedaba en `null` y el navbar mostraba el email crudo en vez del `full_name`.
- **Fix**: agregado `https://*.supabase.co wss://*.supabase.co` al `connect-src` del header CSP en `next.config.js`.

### [✅ 2026-04-11] Triggers rotos en `auth.users` bloqueaban todo signup

- Trigger huérfano `trg_on_auth_user_created_degux` apuntaba a `public.degux_profiles` (tabla inexistente).
- Trigger redundante `on_auth_user_created` era subconjunto de `on_auth_user_created_create_profile`.
- No existía trigger para crear la fila en `public.inmogrid_profiles` en cada signup.
- **Fix**: DROP de los dos triggers rotos, CREATE de `on_auth_user_created_inmogrid` + función `handle_new_inmogrid_profile`.
- **Docs**: [`authentication.md#triggers-de-authusers--creación-de-perfiles-en-signup`](authentication.md#triggers-de-authusers--creación-de-perfiles-en-signup) (público) + `infra/privado/inmogrid.cl/auth-triggers-fix-2026-04-11.md` (privado con script completo).

### [✅ 2026-04-11] Sign-out colgado en "Cerrando..." infinito

- `supabase.auth.signOut({scope:'local'})` podía tardar varios segundos o colgarse en edge cases.
- El handler usaba `await` sin timeout antes de navegar, dejando al usuario viendo "Cerrando..." indefinidamente.
- **Fix**: `Promise.race` del signOut contra un timeout duro de 500 ms + redirect a `/` en vez de `/auth/login`.
- **Código muerto borrado**: `src/shared/components/layout/dashboard/sidenav.tsx`, `src/shared/lib/auth-utils.ts`, `src/shared/components/layout/common/SignOutTestComponent.tsx`. Los tres estaban implicados en patrones legacy de signOut que convivían con el flujo correcto.
- **Docs**: [`authentication.md#sign-out--diseño-defensivo`](authentication.md#sign-out--diseño-defensivo).

### [✅ 2026-04-11] Sesiones huérfanas dejaban UI desincronizada

- Cookie `sb-*-auth-token` con `sub` claim apuntando a un `auth.users.id` ya borrado → navbar client-side mostraba email cacheado del JWT, server component mostraba "Inicia sesión".
- **Fix**: `updateSession` en `middleware.ts` detecta el error de `getUser()`, llama `supabase.auth.signOut({scope:'local'})` para limpiar las cookies huérfanas, el siguiente request queda consistente.
- **Docs**: [`authentication.md#middleware--auto-limpieza-de-cookies-huerfanas`](authentication.md#middleware--auto-limpieza-de-cookies-huérfanas).

### [✅ 2026-04-11] Dashboard overview tiraba "Error al cargar el dashboard"

- `src/app/dashboard/(overview)/page.tsx` usaba `prisma.post.findMany()` con el schema Prisma divergente (ver P0 #1).
- **Fix**: reescrita con `$queryRaw` usando las columnas reales del DB.
- **Bonus**: quitar `/dashboard` de `PROTECTED_PATHS` del middleware para que el feed sea visible a usuarios no autenticados (estilo Reddit).
- **Docs**: [`ADR-004`](adr/ADR-004-public-route-group-and-shared-account-menu.md#capa-4--protección-de-rutas-movida-al-nivel-de-página).

### [✅ 2026-04-11] Navegación inconsistente entre rutas públicas

- Cada ruta pública inventaba su propio navbar (landing, notas, perfiles, referenciales). Algunas sin chrome de cuenta.
- **Fix**: route group `(public)/` + layout compartido con `PublicHeader` + primitivo compartido `common/account-menu/` consumido por todos los headers de la app.
- **Docs**: [`ADR-004`](adr/ADR-004-public-route-group-and-shared-account-menu.md).

### [✅ 2026-04-11] Build de Vercel rompió por paths hardcodeados al mover `/privacy` y `/terms` al route group

- `src/app/privacy/page.tsx` leía `path.join(process.cwd(), 'src/app/privacy/content.md')`. Al mover al route group, el content.md viajó pero el path hardcodeado no se actualizó.
- **Fix**: actualizado a `src/app/(public)/privacy/content.md` + comentario advirtiendo la fragilidad del patrón.
- **TODO permanente**: item P1 #4 en este doc (mover a `content/legal/`).

---

## Temas observados pero no accionados todavía

Estos se capturaron durante el trabajo pero no califican como deuda concreta aún — algunos requieren decisión de producto o más investigación:

- **Monorepo vs. repos separados**: los 5 proyectos del workspace (`inmogrid.cl`, `pantojapropiedades.cl`, `gabrielpantoja.cl`, `degux.cl`, `scraper-chile-dashboard`) hoy viven en repos independientes pero comparten base de datos y branding. ¿Tiene sentido evaluar un monorepo (pnpm workspaces, Turborepo, Nx) post-muerte de pantoja?
- **Prisma vs. Drizzle**: si se migra inmogrid a su propio proyecto Supabase, es el momento natural para evaluar si Prisma sigue siendo la mejor opción — Drizzle tiene mejor DX para `$queryRaw` mixto.
- **Feature flags**: hoy no hay sistema de feature flags. Para cambios grandes futuros (schema posts, migración de DB) vale agregar uno (`@vercel/flags`, `growthbook`, o un rollout artesanal con cookies).
- **Tests E2E**: `playwright.config.ts` existe pero no se validó en esta sesión que los tests estén cubriendo los flows críticos (login, signup, sign-out, creación de post). Auditar.

Cuando uno de estos se convierta en decisión concreta, moverlo a la sección de prioridad correspondiente con un plan de acción.
