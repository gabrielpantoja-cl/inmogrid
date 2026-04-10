# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**inmogrid.cl** is a collaborative digital ecosystem for personal branding and professional networking in the Chilean real estate space — think Substack + Behance + Linktree. Users create profiles, publish posts, connect with professionals, and access real estate tools.

**Stack**: Next.js 15 (App Router) · React 19 · TypeScript · Prisma ORM · Supabase PostgreSQL · Supabase Auth (Google OAuth) · Tailwind CSS · Vercel

**Current Phase**: Phase 1 (User Profiles + Posts) — in progress

## Shared Database (Important)

inmogrid.cl and **pantojapropiedades.cl share the same Supabase database** during this transition/transformation period. Tables like `posts` are read by both platforms. This means:
- Do NOT drop or rename shared tables without coordinating with pantojapropiedades.cl
- Schema migrations must be backward-compatible with the existing pantojapropiedades.cl data model
- The `posts` table (and potentially others) contain data used by both sites

## Development Commands

```bash
npm run dev              # Next.js with Turbo
npm run build            # Runs prisma generate + next build
npm run lint             # ESLint

# Database
npm run prisma:generate  # Regenerate Prisma client
npm run prisma:push      # Apply schema to DB (uses .env.local)
npm run prisma:studio    # Prisma Studio UI
npm run prisma:reset     # generate + push

# Seed
npm run seed             # prisma/seed.mjs
npm run seed:profiles    # prisma/seed-profiles.ts

# Tests
npm run test             # Jest
npm run test:watch       # Jest watch
npm run test:api         # API tests
npm run test:public-api  # Public API tests only
npm run test:e2e         # Playwright E2E

# API smoke tests
npm run api:health       # GET /api/public/health
npm run api:config       # GET /api/public/map-config

# Cleanup
npm run clean            # rm -rf .next
npm run clean:full       # rm -rf .next + node_modules
```

> **Database migrations**: run SQL manually in the Supabase dashboard. No `prisma migrate`, no `db pull`. Workflow: edit `prisma/schema.prisma` → `prisma:generate` → paste SQL in Supabase SQL editor.

## Auth Architecture

**Provider**: Supabase Auth (Google OAuth only). NextAuth has been fully removed.

```
src/lib/supabase/
  client.ts     → createClient() for browser components
  server.ts     → createClient() for server components / API routes
  middleware.ts → updateSession() — refreshes session on every request
  auth.ts       → getUser(), getProfile(), requireAuth() helpers
src/lib/auth.ts       → auth() — thin server wrapper around getUser()
src/lib/auth-utils.ts → robustSignOut() for client components
src/hooks/useAuth.ts  → useAuth() hook (isAuthenticated, user, profile, signOut)
```

**Server components / API routes** — soft check:
```typescript
import { getUser } from '@/lib/supabase/auth'
const user = await getUser()              // null if not logged in
const profile = await getProfile(user.id) // inmogrid_profiles row
```

**Server components / API routes** — hard check (redirects):
```typescript
import { requireAuth } from '@/lib/supabase/auth'
const user = await requireAuth()          // throws/redirects if unauthenticated
```

**Client components**:
```typescript
import { useAuth } from '@/hooks/useAuth'
const { user, profile, isLoading, isAuthenticated, isAdmin } = useAuth()
```

**Auth flow**: `/auth/login` → Supabase OAuth → Google → `/auth/callback` → creates Profile row in `inmogrid_profiles` → redirect to `/dashboard`.

## Data Model

The primary user model is **Profile** (not User). `Profile.id` is a UUID matching `auth.users.id` in Supabase.

```
Profile             → inmogrid_profiles table
Post                → posts table              (shared with pantojapropiedades.cl)
Connection          → inmogrid_connections table
Event               → inmogrid_events table
ProfessionalProfile → inmogrid_professional_profiles table
AuditLog            → inmogrid_audit_logs table
ChatMessage         → inmogrid_chat_messages table
```

**Critical field mappings** (Prisma camelCase → DB snake_case):
- `fullName` → `full_name`
- `avatarUrl` → `avatar_url`
- `isPublicProfile` → `is_public_profile`
- `coverImageUrl` → `cover_image_url`
- `userId` → `user_id`

**Connection relations** use field names `requester` and `receiver` (NOT long Prisma-generated names like `Connection_requesterIdToProfile`).

**Role enum**: `user | admin | superadmin` — stored in `Profile.role`, not in Supabase Auth.

**ProfessionType enum**: `TASADOR_PERITO | PERITO_JUDICIAL | CORREDOR_PROPIEDADES | ADMINISTRADOR_PROP | ABOGADO_INMOBILIARIO | ARQUITECTO | INGENIERO_CIVIL | ACADEMICO | FUNCIONARIO_PUBLICO | INVERSIONISTA | PROPIETARIO | OTRO`

## API Structure

```
/api/public/              → No auth required
  health/                 → System health
  posts/                  → Published posts feed
  profiles/[username]/    → Public profile by username
  docs/                   → API docs

/api/                     → Auth required (middleware enforces)
  users/profile           → GET/PUT current user's profile
  posts/                  → GET/POST user's posts
  posts/[id]/             → GET/PUT/DELETE single post
  chat/                   → Sofia AI chat
  delete-account/         → Account deletion
  revalidate/             → Next.js cache revalidation
```

**Standard API pattern**:
```typescript
export async function GET(request: NextRequest) {
  const authUser = await auth()   // or getUser() from '@/lib/supabase/auth'
  if (!authUser?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  // Validate input with Zod
  // Handle Prisma errors: P2002 → 409, P2025 → 404
}
```

## Route Protection

```typescript
// src/middleware.ts
PUBLIC_PATHS   = ['/auth/', '/api/auth/', '/api/public/', '/_next/', ...]
PROTECTED_PATHS = ['/dashboard']
// updateSession() runs on every request to refresh Supabase session cookies
```

## Environment Variables

```env
# Prisma / Supabase PostgreSQL
DATABASE_URL="postgresql://...@pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...@pooler.supabase.com:5432/postgres"

# Supabase Auth (public — safe in browser)
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."

# Optional
NEXT_PUBLIC_BASE_URL="https://inmogrid.cl"
OPENAI_API_KEY="..."
RESEND_API_KEY="..."
```

Both `DATABASE_URL` and `DIRECT_URL` are required for Prisma. Missing either causes `P1012` errors. Both must also be set in Vercel environment variables for production.

## Infrastructure

- **Production**: Vercel (auto-deploy on push to `main`)
- **DNS**: Cloudflare — `inmogrid.cl` A→`76.76.21.21`, `www` CNAME→`cname.vercel-dns.com`, proxy OFF
- **Supabase project**: `SUPABASE_PROJECT_REF` (shared with pantojapropiedades.cl)
- **N8N**: accessible at `N8N_HOST_REDACTED` (VPS DigitalOcean) — separate from Vercel web app

## Specialized Agents (`.claude/agents/`)

| Agent | Use for |
|---|---|
| `inmogrid-orchestrator` | Multi-feature coordination, architecture decisions |
| `api-developer-agent` | New API routes, OpenAPI docs |
| `database-manager-agent` | Schema changes, RLS policies, query optimization |
| `frontend-agent` | UI components, Next.js pages, hooks |
| `data-ingestion-agent` | Chilean real estate data pipelines, CBR validation |
| `security-auditor-agent` | OWASP audits, Ley 19.628 compliance |
| `infrastructure-agent` | VPS/Docker/Nginx, N8N workflows |

## Chilean Domain Knowledge

- **ROL**: property identifier, format `/^\d{5}-\d{4}$/`
- **CBR**: Conservador de Bienes Raíces (property registry)
- **Tasación**: appraisal; **Peritaje**: judicial expert appraisal
- Geographic bounds: lat -56.0 to -17.5, lng -76.0 to -66.0
- 346 communes, 16 regions
