# Arquitectura técnica

Este documento describe el stack y la estructura interna de `inmogrid.cl`. Si vas a contribuir código, empieza por aquí.

---

## Stack

| Capa | Tecnología | Rol |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR, Server Components, API routes |
| Runtime UI | React 19 | Concurrent features |
| Lenguaje | TypeScript 5 (strict) | Tipado estricto obligatorio |
| Estilos | Tailwind CSS + shadcn/ui (Radix) | Sistema de diseño — ver [`design-system.md`](design-system.md) |
| Design tokens | CSS vars en `globals.css` ↔ Tailwind | Two-layer system — ver [ADR-003](adr/ADR-003-design-tokens-two-layer-system.md) |
| ORM | Prisma 6 | Modelado, client tipado |
| Base de datos | PostgreSQL (Supabase) | Datos relacionales |
| Auth | Supabase Auth (Google OAuth) | Sesiones, tokens, callbacks |
| Storage | Supabase Storage | Imágenes de perfil y posts |
| IA | OpenAI (`@ai-sdk/openai`) | Chatbot Sofia (streaming) |
| Mapas | Leaflet + React Leaflet | Vista geoespacial |
| Email | Resend | Transaccional |
| Hosting | Vercel | Deploy automático desde `main` |

Nota: el repo **no** usa NextAuth ni TanStack Query — ambas fueron reemplazadas por la capa nativa de Supabase y por Server Components/Server Actions respectivamente.

---

## Estructura del repositorio

```
src/
├── app/                    # App Router — rutas públicas y privadas
│   ├── (public)/           # Rutas públicas (landing, perfiles)
│   ├── dashboard/          # Rutas autenticadas
│   ├── api/
│   │   ├── public/         # API pública (sin auth, CORS abierto)
│   │   └── ...             # API privada (auth requerida)
│   └── auth/               # Login, callback, signout
├── features/               # Lógica de dominio organizada por feature
│   ├── chat/
│   ├── networking/
│   ├── posts/
│   ├── profiles/
│   └── referenciales/
├── shared/
│   └── components/layout/  # Header, Footer, shells
├── components/ui/          # Primitivos shadcn/ui
├── lib/
│   ├── supabase/           # Clientes browser/server, helpers auth
│   ├── auth.ts             # Wrapper server
│   └── auth-utils.ts       # Wrapper client
├── hooks/                  # Hooks compartidos (useAuth, etc.)
└── middleware.ts           # Refresh de sesión Supabase
prisma/
└── schema.prisma           # Fuente de verdad del schema
docs/                       # Esta carpeta
```

Arquitectura **feature-first**: el código de dominio vive en `src/features/<feature>/` con su propia carpeta de `components`, `hooks`, `services`, `types`. Ver [adr/ADR-001-feature-first-architecture.md](adr/ADR-001-feature-first-architecture.md) y [arquitectura/patrones.md](arquitectura/patrones.md) para los detalles.

---

## Modelo de datos

Los modelos principales de Prisma (ver `prisma/schema.prisma`):

| Modelo | Tabla | Rol |
|---|---|---|
| `Profile` | `inmogrid_profiles` | Usuario — `id` es UUID de `auth.users` |
| `Post` | `posts` | Publicaciones de usuarios |
| `Connection` | `inmogrid_connections` | Conexiones (networking) entre perfiles |
| `Event` | `inmogrid_events` | Agenda de eventos del sector |
| `ProfessionalProfile` | `inmogrid_professional_profiles` | Ficha profesional extendida |
| `ChatMessage` | `inmogrid_chat_messages` | Historial del chatbot |
| `AuditLog` | `inmogrid_audit_logs` | Bitácora de acciones sensibles |

**Campos relevantes** (convención Prisma camelCase ↔ Postgres snake_case):

- `fullName` ↔ `full_name`
- `avatarUrl` ↔ `avatar_url`
- `coverImageUrl` ↔ `cover_image_url`
- `isPublicProfile` ↔ `is_public_profile`
- `userId` ↔ `user_id`

**Enums clave:**

- `Role`: `user | admin | superadmin`
- `ProfessionType`: `TASADOR_PERITO`, `PERITO_JUDICIAL`, `CORREDOR_PROPIEDADES`, `ADMINISTRADOR_PROP`, `ABOGADO_INMOBILIARIO`, `ARQUITECTO`, `INGENIERO_CIVIL`, `ACADEMICO`, `FUNCIONARIO_PUBLICO`, `INVERSIONISTA`, `PROPIETARIO`, `OTRO`
- `EventType`: `TALLER | SEMINARIO | CHARLA | CURSO | OPEN_HOUSE | LANZAMIENTO`

**Migraciones de schema:** no usamos `prisma migrate`. El flujo es:

1. Editar `prisma/schema.prisma`
2. `npm run prisma:generate`
3. Pegar el SQL equivalente en el SQL editor de Supabase

La razón: la base es compartida con otro proyecto durante la transición y las migraciones automáticas tienen riesgo de romper tablas externas.

---

## Autenticación

Proveedor único: **Supabase Auth con Google OAuth**.

```
/auth/login
   └─> Supabase OAuth
         └─> Google
               └─> /auth/callback
                     └─> upsert en inmogrid_profiles
                           └─> redirect /dashboard
```

**Patrón en Server Components / API routes:**

```ts
import { getUser, getProfile, requireAuth } from '@/lib/supabase/auth'

// Soft check
const user = await getUser()                  // null si no hay sesión
const profile = user ? await getProfile(user.id) : null

// Hard check (redirige si no hay sesión)
const user = await requireAuth()
```

**Patrón en Client Components:**

```ts
import { useAuth } from '@/hooks/useAuth'
const { user, profile, isLoading, isAuthenticated, isAdmin } = useAuth()
```

`src/middleware.ts` corre en cada request y refresca la sesión de Supabase vía cookies.

---

## API

### Pública (`/api/public/*`)

Sin auth, CORS abierto. Pensada para ser consumida por terceros y por la propia aplicación desde el cliente.

| Endpoint | Descripción |
|---|---|
| `GET /api/public/health` | Estado del servicio |
| `GET /api/public/posts` | Feed de posts publicados |
| `GET /api/public/profiles/[username]` | Perfil público por username |
| `GET /api/public/docs` | Catálogo OpenAPI |

### Privada (`/api/*`)

Requiere sesión Supabase. El middleware protege por ruta.

| Endpoint | Descripción |
|---|---|
| `GET/PUT /api/users/profile` | Perfil propio |
| `GET/POST /api/posts` | Listar / crear posts propios |
| `GET/PUT/DELETE /api/posts/[id]` | Leer / editar / borrar un post propio |
| `POST /api/chat` | Chat con Sofia (streaming) |
| `DELETE /api/delete-account` | Baja de cuenta |
| `POST /api/revalidate` | Invalidación de cache Next.js |

**Patrón de handler:**

```ts
export async function GET(request: NextRequest) {
  const user = await getUser()
  if (!user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }
  // Validar input con Zod
  // Mapear errores Prisma: P2002 → 409, P2025 → 404
}
```

---

## Protección de rutas

`src/middleware.ts` corre en todas las requests y aplica dos categorías:

```ts
PUBLIC_PATHS          = ['/auth/', '/api/auth/', '/api/public/', '/_next/', ...]
PROTECTED_PATHS: [] = []   // vacío — ver nota abajo
// cualquier otra ruta: pasa, pero la sesión se refresca en background
```

**La protección de rutas vive ahora en cada server component**, no en el middleware. El path-matching en middleware era demasiado coarse-grained para distinguir entre subrutas del dashboard que requieren auth (`/dashboard/perfil`, `/dashboard/notas/crear`) y las que son informativas (`/dashboard` overview, que muestra el feed público incluso a usuarios no autenticados, estilo Reddit).

El patrón ahora es:

```ts
// src/app/dashboard/notas/page.tsx — requiere sesión
const user = await requireAuth()          // redirige a /auth/login si falta

// src/app/dashboard/(overview)/page.tsx — soft, renderiza igual sin sesión
const user = await getUser()              // null si no hay sesión, el componente lo maneja
```

El middleware sigue corriendo `updateSession()` en cada request para refrescar los cookies de Supabase. Adicionalmente, detecta y auto-limpia **cookies huérfanas** (JWTs de `auth.users.id` que ya no existen — típico después de operaciones destructivas en la base):

```ts
// src/shared/lib/supabase/middleware.ts
const { data: { user }, error } = await supabase.auth.getUser()
if (!user && error && hasSupabaseAuthCookie) {
  await supabase.auth.signOut({ scope: 'local' })
}
```

Sin este branch, un cliente con sesión stale vería el navbar diciendo "Hola, {email}" (JWT cacheado) mientras el server component devolvía `null` ("Inicia sesión…") — UI desincronizada. Ver [ADR-004](adr/ADR-004-public-route-group-and-shared-account-menu.md#capa-5--sesiones-stale-auto-limpiadas-en-middleware).

---

## Layouts y chrome de navegación

La app tiene **dos layouts** separados por contexto, cada uno con su propio header, pero ambos consumen el **mismo primitivo de menú de cuenta** (`common/account-menu`) para garantizar consistencia cross-layout:

```
src/app/
├── (public)/          ← route group — no afecta URLs
│   └── layout.tsx     ← monta <PublicHeader /> + children
│       • /                       (landing con feed)
│       • /notas/[slug]
│       • /[username], /[username]/notas, /[username]/notas/[slug]
│       • /referenciales
│       • /privacy, /terms
│
├── dashboard/
│   └── layout.tsx     ← monta <Navbar /> del dashboard + children
│       • /dashboard, /dashboard/notas, /dashboard/perfil, etc.
│
└── layout.tsx         ← root (fonts, providers, Footer global, Analytics condicional)
```

**Route group `(public)`**: los paréntesis son sintaxis del router que sirve para compartir un layout entre rutas sin alterar sus URLs. `src/app/(public)/notas/[slug]/page.tsx` sigue respondiendo en `/notas/[slug]`.

**Primitivo compartido**: `src/shared/components/layout/common/account-menu/` exporta `AccountMenu` (dropdown presentacional), `DeleteAccountDialog` (modal), y `useAccountActions` (hook de sesión + delete). Tanto `PublicHeader` como el navbar del dashboard lo consumen — un cambio en `useAccountActions` se refleja automáticamente en ambos lados.

**Rutas sin chrome** (no pertenecen a `(public)/` ni a `dashboard/`): `/auth/*` (flujo de OAuth), `/chatbot` (embed), `/login` (redirect server-side a `/auth/login`).

Diseño completo y razones en [ADR-004](adr/ADR-004-public-route-group-and-shared-account-menu.md).

---

## Variables de entorno

```env
# Prisma + PostgreSQL (ambas necesarias)
DATABASE_URL="postgresql://...@pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...@pooler.supabase.com:5432/postgres"

# Supabase (públicas — seguras en el browser)
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."

# Opcionales
NEXT_PUBLIC_BASE_URL="https://inmogrid.cl"
OPENAI_API_KEY="sk-..."
RESEND_API_KEY="re_..."
```

Tanto `DATABASE_URL` como `DIRECT_URL` son obligatorias para Prisma — si falta una, Prisma falla con `P1012`.

---

## Convenciones de contribución

Antes de abrir un PR, revisá:

- [ADR-001 — Feature-first architecture](adr/ADR-001-feature-first-architecture.md)
- [ADR-003 — Design tokens two-layer system](adr/ADR-003-design-tokens-two-layer-system.md)
- [ADR-004 — Route group `(public)` + shared `AccountMenu`](adr/ADR-004-public-route-group-and-shared-account-menu.md)
- [Patrones de código](arquitectura/patrones.md)
- [Roadmap de refactor](arquitectura/ROADMAP-refactor.md)

**Reglas rápidas:**

- TypeScript `strict`, sin `any` implícitos
- Forms con React Hook Form + Zod
- Import alias: `@/` → `src/`
- Estilos con Tailwind usando **tokens semánticos** (`bg-primary`, `text-foreground`, `bg-accent/20`). **No usar** Tailwind raw como `text-blue-600` — ver [`design-system.md`](design-system.md) y [ADR-003](adr/ADR-003-design-tokens-two-layer-system.md)
- Nada de secretos en el repo — usar `.env.local`

---

## Ecosistema

`inmogrid.cl` es parte de un ecosistema más amplio de proyectos abiertos sobre datos inmobiliarios chilenos:

```
referenciales.cl          →  base de datos abierta de transacciones (proyecto hermano)
inmogrid.cl               →  este repo — comunidad, perfiles, contenido, agenda
gabrielpantoja.cl         →  blog personal del autor principal
scraper-chile-dashboard   →  pipelines de ingesta CBR → referenciales.cl (privado)
```

`inmogrid.cl` consume `referenciales.cl` vía su API pública. Los proyectos son repositorios independientes y se pueden usar o forkear por separado.
