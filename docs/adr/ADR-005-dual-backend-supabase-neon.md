# ADR-005: Dual-Backend Architecture (Supabase + Neon)

**Date**: 2026-04-12
**Status**: Accepted
**Deciders**: Gabriel Pantoja

## Context

inmogrid.cl is a professional networking ecosystem for the Chilean real estate industry. One of its features displays open real estate transaction data ("referenciales") on an interactive map. This data lives in a Neon PostgreSQL database maintained by the sister project referenciales.cl.

Previously, inmogrid.cl consumed this data via HTTP calls to `referenciales.cl/api/v1`. This created three problems:

1. **External dependency** — if referenciales.cl goes down, inmogrid loses a core feature
2. **Double latency** — inmogrid → referenciales.cl → Neon → referenciales.cl → inmogrid
3. **Rate limiting** — 60 req/min anonymous ceiling limits map interactivity under load

## Decision

inmogrid.cl now operates with **two backends**:

| Backend | Engine | Purpose | Access |
|---------|--------|---------|--------|
| **Supabase** | PostgreSQL (Prisma ORM) | User profiles, posts, connections, events, chat, contributions | Read/Write |
| **Neon** | PostgreSQL + PostGIS (postgres.js, raw SQL) | Verified real estate transactions (6,600+ records) | **Read-only** |

### Key design choices

**1. postgres.js over Prisma for Neon**

Prisma's PostGIS support is limited (geometry columns are `Unsupported`). Raw SQL via postgres.js gives full access to `ST_X()`, `ST_Y()`, spatial queries, and `monto::text` BigInt casting — all without ORM overhead on read-only data.

**2. BigInt precision via SQL casting**

Transaction amounts (`monto`) are stored as `BIGINT` in Neon. Large CLP values (e.g., $15.000.000.000 in land transactions) can exceed JavaScript's `Number.MAX_SAFE_INTEGER`. We cast `monto::text` directly in SQL and transport it as a String throughout the entire API. It is formatted to CLP (`$150.000.000`) in the query layer, never converted to `Number` in JSON responses.

**3. PostGIS coordinates extracted in SQL**

Instead of parsing binary EWKB geometry in JavaScript, queries use `COALESCE(ST_Y(geom), lat)` / `COALESCE(ST_X(geom), lng)` to extract coordinates directly. This delivers Leaflet-ready `lat`/`lng` values with zero client-side processing.

**4. Contribution staging in Supabase**

Users can submit new data or report errors, but their input never touches Neon directly. Contributions go to `inmogrid_contributions` (Supabase) with `status: pending`. An admin reviews and approves. A separate pipeline (not yet built) inserts approved records into Neon.

The `source_id` field links corrections/reports to the original Neon record ID, making moderation straightforward.

**5. API v1 compatibility**

inmogrid.cl's `/api/v1/` endpoints produce **identical response shapes** to referenciales.cl's API. This means:
- Any client consuming referenciales.cl can switch to inmogrid.cl with a URL change
- If referenciales.cl is retired, its data lives on through inmogrid

## Consequences

### Positive
- Zero external dependency for map data
- Direct PostGIS queries enable future spatial features (radius search, clustering, heat maps)
- Contribution system creates a community data improvement flywheel
- Rate limiting protects both backends independently

### Negative
- Two connection pools to manage (Supabase + Neon)
- Schema changes in Neon must be monitored (Zod validation catches mismatches at runtime)
- `NEON_DATABASE_URL` must be kept in sync across environments

### Risks
- **Neon cold starts**: First query after idle can take 2-5s. Mitigated by health monitoring keeping the DB warm.
- **Schema drift**: If referenciales.cl changes its schema, inmogrid's queries may break. Zod validation surfaces this immediately as parse errors rather than silent data corruption.

## Architecture Diagram

```
                    ┌──────────────────────────────────┐
                    │         inmogrid.cl               │
                    │       (Next.js 15)                │
                    └──────────┬───────────────────────┘
                               │
               ┌───────────────┼───────────────┐
               │                               │
    ┌──────────▼──────────┐        ┌───────────▼──────────┐
    │  Supabase (Prisma)  │        │  Neon (postgres.js)   │
    │                     │        │     READ-ONLY         │
    │  • inmogrid_profiles│        │  • referenciales      │
    │  • posts            │        │    (6,600+ records)   │
    │  • connections      │        │  • PostGIS geometry   │
    │  • events           │        │                       │
    │  • contributions    │        │                       │
    │    (staging area)   │        │                       │
    └─────────────────────┘        └───────────────────────┘
               │                               ▲
               │  approved contributions       │
               └───────── pipeline ────────────┘
                        (future)

    Public API: /api/v1/*  ──→  Neon (read-only)
    Auth API:   /api/*     ──→  Supabase (read/write)
```

## Related Documents

- `ADR-001` — Feature-first architecture (boundary rules apply to new shared/ code)
- `docs/sql-migrations/` — SQL for `inmogrid_contributions` table
