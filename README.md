# inmogrid.cl

> **Ecosistema inmobiliario abierto y colaborativo para Chile.** Proyecto open source.

`inmogrid.cl` es una plataforma de conocimiento inmobiliario abierto: perfiles profesionales, contenido, networking, agenda de eventos del sector y acceso a referenciales. **No vende propiedades. No intermedia transacciones. No tiene algoritmos de pago por posicionamiento.**

- **Sitio en producción:** https://inmogrid.cl
- **Manifiesto:** [docs/manifesto.md](docs/manifesto.md)
- **Visión y principios:** [docs/vision.md](docs/vision.md)
- **Arquitectura técnica:** [docs/architecture.md](docs/architecture.md)

---

## Qué es esto

Un espacio donde el conocimiento inmobiliario chileno deja de ser propiedad exclusiva de quien puede pagarlo. El modelo mental es la combinación de tres ideas:

- **Substack** — cualquier profesional publica sus metodologías, análisis y conocimiento.
- **Behance** — cada usuario tiene un perfil público (`inmogrid.cl/[username]`) con su trabajo.
- **Linktree + directorio profesional** — la plataforma conecta tasadores, corredores, abogados y municipios por territorio.

La filosofía detrás es la misma que hizo posible Linux, Wikipedia y OpenStreetMap: **el valor viene de la comunidad, la comunidad viene de la confianza, y la confianza viene de no tener conflictos de interés con quien llega a buscar**.

Leé el [manifiesto](docs/manifesto.md) para entender el proyecto en profundidad.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) · React 19 · TypeScript strict |
| Estilos | Tailwind CSS · shadcn/ui (Radix) |
| ORM | Prisma 6 |
| Base de datos | PostgreSQL (Supabase) + Neon PostgreSQL/PostGIS (referenciales, read-only) |
| Auth | Supabase Auth (Google OAuth) |
| IA | Gemini 2.5 Flash (Sofia RAG chatbot) · OpenAI (legacy chat, en migración) |
| Mapas | Leaflet + React Leaflet |
| Hosting | Vercel |

Detalles completos en [docs/architecture.md](docs/architecture.md).

---

## Empezar a desarrollar

### Requisitos

- Node.js 20+
- npm 10+
- Una instancia de Supabase (gratis en https://supabase.com)
- Credenciales OAuth de Google (opcional para probar login)

### Instalación

```bash
git clone https://github.com/gabrielpantoja-cl/inmogrid.git
cd inmogrid.cl
npm install
```

### Variables de entorno

Copia `.env.example` a `.env.local` y completa los valores:

```env
# Prisma + PostgreSQL (ambas obligatorias)
DATABASE_URL="postgresql://...@pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...@pooler.supabase.com:5432/postgres"

# Supabase (públicas)
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."

# Neon — referenciales read-only (requerida para /api/v1/)
NEON_DATABASE_URL="postgresql://...@ep-xxx.aws.neon.tech/referenciales?sslmode=require"

# Gemini AI — Sofia RAG chatbot
GEMINI_API_KEY="AIza..."

# Opcionales
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
OPENAI_API_KEY="sk-..."      # Legacy chat — en migración a Gemini
RESEND_API_KEY="re_..."
```

### Levantar el schema en tu base

```bash
npm run prisma:generate
npm run prisma:push
```

Si preferís partir del SQL plano: [`docs/sql-migrations/001_inmogrid_schema.sql`](docs/sql-migrations/001_inmogrid_schema.sql).

### Correr el proyecto

```bash
npm run dev            # Next.js con Turbopack en http://localhost:3000
npm run lint           # ESLint
npm run test           # Jest
npm run test:e2e       # Playwright
npm run prisma:studio  # UI de Prisma para inspeccionar datos
```

---

## Estructura del repositorio

```
src/
├── app/              # App Router (rutas públicas, privadas, API)
├── features/         # Código de dominio feature-first
├── shared/           # Componentes de layout compartidos
├── components/ui/    # Primitivos shadcn/ui
├── lib/              # Supabase, auth, utilidades transversales
├── hooks/            # Hooks compartidos
└── middleware.ts     # Refresh de sesión Supabase

prisma/schema.prisma  # Modelo de datos
docs/                 # Documentación (arquitectura, ADRs, visión)
```

Ver [docs/architecture.md](docs/architecture.md) para el detalle.

---

## Cómo contribuir

Las contribuciones son bienvenidas. Antes de abrir un PR:

1. Leé [`CONTRIBUTING.md`](CONTRIBUTING.md) y [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).
2. Abrí un **issue** describiendo el cambio si es algo más que un typo o un fix chico.
3. Respetá la [estructura feature-first](docs/adr/ADR-001-feature-first-architecture.md) y los [patrones de código](docs/arquitectura/patrones.md).
4. Corré `npm run lint` y `npm run test` antes de hacer push.

Hay varios tipos de aporte posibles:

- **Código** — features, fixes, refactors
- **Documentación** — aclaraciones, ejemplos, traducciones
- **Datos** — mejoras al modelo de `Event`, `ProfessionalProfile`, etc.
- **Diseño** — UX, accesibilidad, tokens de marca
- **Feedback** — issues reportando bugs o proponiendo mejoras

---

## Proyectos relacionados

`inmogrid.cl` es parte de un ecosistema más amplio de proyectos sobre datos inmobiliarios chilenos:

| Proyecto | Rol | Estado |
|---|---|---|
| [referenciales.cl](https://referenciales.cl) | Base de datos abierta de transacciones inmobiliarias | Público |
| `inmogrid.cl` | Comunidad, perfiles, contenido, agenda (este repo) | Público |
| `scraper-chile-dashboard` | Pipelines de ingesta CBR → referenciales.cl | Privado |

`inmogrid.cl` consume `referenciales.cl` vía su API pública. Los repos son independientes y se pueden usar o forkear por separado.

---

## Licencia

[MIT](LICENSE) © Gabriel Pantoja y contribuidores de `inmogrid.cl`.

Los datos publicados dentro de la plataforma mantienen sus propias condiciones de uso — ver los términos en https://inmogrid.cl/terms.

---

*Un proyecto comunitario en su corazón — construido con la convicción de que el conocimiento inmobiliario debería ser un bien común.*
