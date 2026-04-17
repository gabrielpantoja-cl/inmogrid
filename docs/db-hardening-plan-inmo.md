# DB Hardening Plan — inmogrid.cl

> **Estado**: en ejecución · **Fecha de inicio**: 2026-04-17 · **Última actualización**: 2026-04-17 (pm) · **Owner**: Gabriel Pantoja

Plan maestro para sanear la base de datos Supabase de inmogrid.cl. Consolida:

- Limpieza de tablas, triggers y funciones heredados de pantojapropiedades.cl y degux.cl.
- Hardening de RLS en tablas nuevas que se desplegaron sin policies.
- Resolución del schema divergente en `posts` (bloqueador P0 de varios endpoints).
- Agregado de FK hard `inmogrid_profiles.id → auth.users.id`.
- Rotación de credenciales comprometidas en el incidente de 2026-04-11 (detalles forenses en el repo privado).

Este documento es auto-contenido: cualquier colaborador puede retomarlo desde acá sin necesidad de leer el repo privado, salvo para valores de secrets que por definición no viven acá.

> **Nota sobre redacción**: este repo es opensource. Los valores sensibles están sustituidos por placeholders:
> - `<SUPABASE_PROJECT_REF>` → el project ref real vive en `CLAUDE.local.md` (gitignored) y en `infra/privado/inmogrid.cl/credentials/supabase.md`.
> - PATs y keys aparecen truncados (`sbp_0d7d…5800`) solo para trazabilidad post-rotación; nunca en texto completo.

### Resumen de progreso — 2026-04-17 pm

- **Fase 0** (Inventario): ✅ completa. Bloques 1-5 ejecutados, sampling de tablas dudosas hecho, grep de funciones Sofia legacy confirma 0 consumidores.
- **Fase 1** (Rotación de credenciales): 🟡 en progreso.
  - Inventario de consumidores: ✅ hecho (ver §1 abajo).
  - Vercel `pantojapropiedadescl` eliminado.
  - n8n VPS confirmado **NO consumidor** (vars vacías en runtime).
  - MCP de Supabase: 🟡 migración CLI/PAT → hosted/OAuth en progreso. Ver §1.6.
  - JWT secret, DB password, Google OAuth Client Secret: ⏳ pendientes.
- **Fase 2** (Limpieza legacy): 🟢 pre-flight parcial — 4 backups de tablas críticas guardados en `infra/privado/inmogrid.cl/sql/backups/`. Falta `pg_dump` completo + DROP.
- **Fases 3–6**: ⏳ no iniciadas.

---

## Tabla de contenidos

1. [Contexto](#1-contexto)
2. [Estado actual — inventario 2026-04-17](#2-estado-actual--inventario-2026-04-17)
3. [Decisiones](#3-decisiones)
4. [Fase 0 — Inventario (hecho)](#fase-0--inventario-hecho)
5. [Fase 1 — Rotación de credenciales](#fase-1--rotación-de-credenciales)
6. [Fase 2 — Limpieza de legacy](#fase-2--limpieza-de-legacy)
7. [Fase 3 — Hardening RLS](#fase-3--hardening-rls)
8. [Fase 4 — Migración del schema `posts`](#fase-4--migración-del-schema-posts)
9. [Fase 5 — FK hard `inmogrid_profiles`](#fase-5--fk-hard-inmogrid_profiles)
10. [Fase 6 — Prevención y monitoreo](#fase-6--prevención-y-monitoreo)
11. [Checklist consolidado](#checklist-consolidado)
12. [Apéndice A — SQL de inventario](#apéndice-a--sql-de-inventario)
13. [Apéndice B — SQL de limpieza completo](#apéndice-b--sql-de-limpieza-completo)

---

## 1. Contexto

inmogrid.cl **hereda** el proyecto Supabase de pantojapropiedades.cl (project ref `<SUPABASE_PROJECT_REF>`). No hubo brecha en inmogrid — el riesgo viene del proyecto compartido. Dos factores que habilitan ejecutar este plan ahora:

- **Pantojapropiedades.cl**: dominio vencido el 2026-04-16, repo archivado privado en GitHub, sin deploys activos.
- **Degux.cl**: mismo estado — archivado privado, sin consumidores vivos de la DB.

Eso significa que podemos ejecutar DDL destructivo sobre las ~25 tablas legacy sin coordinar con terceros, sin blast radius hacia otras apps y sin ventana de mantenimiento compleja.

**Decisión estratégica**: quedarse en `<SUPABASE_PROJECT_REF>`, no migrar a un proyecto Supabase nuevo. Razón: menor costo operacional y la herencia ya no genera blast radius.

---

## 2. Estado actual — inventario 2026-04-17

Los siguientes datos vienen del SQL de inventario ejecutado el 2026-04-17 (ver [Apéndice A](#apéndice-a--sql-de-inventario)). **Todos los bloques (1-5) ya fueron corridos** — los conteos de abajo son los exactos del bloque 2 alternativo.

### 2.1 Tablas en `public` — 43 totales

#### A. Tablas de inmogrid.cl — **mantener** (16)

| Tabla | Propósito | Notas |
|---|---|---|
| `inmogrid_profiles` | Perfil de usuario, PK = `auth.users.id` | Sin FK hard — se agrega en Fase 5 |
| `inmogrid_professional_profiles` | Perfil profesional extendido | |
| `inmogrid_connections` | Conexiones entre profesionales | |
| `inmogrid_events` | Eventos de usuario | |
| `inmogrid_audit_logs` | Logs de auditoría | |
| `inmogrid_chat_messages` | Mensajes chat (schema viejo) | Posible duplicado de `inmogrid_sofia_messages` — revisar |
| `inmogrid_contributions` | Aportes del usuario al set Neon (staging) | |
| `inmogrid_sofia_conversations` | Conversaciones del chatbot Sofia | RAG via pgvector |
| `inmogrid_sofia_documents` | Knowledge base con embeddings | RAG via pgvector |
| `inmogrid_sofia_messages` | Mensajes por conversación de Sofia | |
| `inmogrid_badges` | Catálogo de badges | **RLS deshabilitado** — ver §3 |
| `inmogrid_points_ledger` | Ledger de puntos | **RLS deshabilitado** — ver §3 |
| `inmogrid_user_badges` | Badges ganados por usuario | **RLS deshabilitado** — ver §3 |
| `posts` | Publicaciones | 12 filas · schema divergente, ver §4 |
| `properties` | Propiedades listadas | 5 filas |
| *(implícita)* `auth.users` | Usuarios autenticados | 4 usuarios totales |

#### B. Tablas legacy de pantojapropiedades.cl — **DROP** (22 — `legal_page_versions` se mantiene, ver §3.6)

Conteos exactos del bloque 2 alternativo (2026-04-17):

| Tabla | Filas exactas | Decisión |
|---|---|---|
| `profiles` | 4 | DROP (conflicto con `inmogrid_profiles`) |
| `cotizaciones` | 2 | DROP |
| `crm_clientes` | 6 | DROP (✅ backup en `sql/backups/legacy-crm_clientes-20260417-141514.sql`) |
| `crm_interacciones` | 0 | DROP |
| `crm_oportunidades` | 2 | DROP |
| `crm_ordenes_visita` | 1 | DROP |
| `crm_tareas` | 0 | DROP |
| `teams` | 1 | DROP |
| `team_members` | 1 | DROP |
| `team_notifications` | 48 | DROP |
| `external_portals` | 9 | DROP |
| `blog_guidelines_versions` | 3 | DROP (✅ backup en `sql/backups/legacy-blog_guidelines_versions-20260417-141514.sql`) |
| `legal_page_versions` | 3 | **MANTENER** — posible reuso para versionado de T&C de inmogrid (ver §3.6) |
| `property_portal_listings` | 0 | DROP |
| `property_videos` | 4 | DROP (✅ backup en `sql/backups/legacy-property_videos-20260417-141514.sql`) |
| `property_images` | 79 | DROP (✅ backup en `sql/backups/legacy-property_images-20260417-141514.sql`) |
| `seo_metrics` | 0 | DROP |
| `site_daily_stats` | 83 | DROP |
| `site_page_views` | **5832** | DROP |
| `site_popular_content` | 76 | DROP |
| `site_session_analytics` | **1531** | DROP |
| `chat_conversations` | 0 | DROP |
| `chat_messages` | 0 | DROP |
| `user_notification_preferences` | 0 | DROP |

#### C. Tablas legacy de degux.cl — **DROP** (2)

- `degux_posts` (0 filas) · `inmobloques_scores` (3 filas).

#### D. Tablas dudosas — **resueltas** (2)

| Tabla | Filas exactas | Resolución |
|---|---|---|
| `documents` | **238** (7.3 MB) | **MANTENER** como snapshot. Sampling confirmó que es la knowledge base vieja de Sofia: chunks del PDF `libro_apuntes_corredor_V.24.pdf` (cursos de ANACOPRO A.G. de corredor de propiedades). 0 referencias en `src/` (grep confirmado). Decisión: dejar la tabla intacta hasta re-seedear la nueva KB en `inmogrid_sofia_documents` (Fase 4 del ADR-006). Ver §3.5. |
| `user_google_tokens` | **0** | DROP seguro. Tabla vacía — el estimado original de 2 filas estaba errado. |

### 2.2 Triggers sobre `auth.users`

| Trigger | Función | Clasificación | Acción |
|---|---|---|---|
| `on_auth_user_created_create_profile` | `handle_new_user_profile()` | Legacy pantoja — escribe a `public.profiles` | **DROP** |
| `on_auth_user_created_inmogrid` | `handle_new_inmogrid_profile()` | inmogrid — escribe a `public.inmogrid_profiles` | **Mantener** |

### 2.3 Funciones `public` — 137 totales

- **~100 funciones del extension `pgvector`** (`vector_*`, `halfvec_*`, `sparsevec_*`, `cosine_distance`, `l2_distance`, etc.) — se limpian solas si algún día se dropea el extension. No tocar individualmente.
- **8 funciones de inmogrid** — mantener: `handle_new_inmogrid_profile`, `handle_property_update`, `is_admin`, `get_my_role`, `validar_rut`, `set_updated_at`, `update_updated_at_column`, `rpc_function_exists`.
- **15 funciones legacy** — DROP (lista en [Apéndice B](#apéndice-b--sql-de-limpieza-completo)).
- **6 funciones dudosas** que operan sobre `documents` — requieren verificación: `match_documents`, `match_documents_enhanced`, `mark_documents_for_embedding`, `ingest_existing_content`, `analyze_similarity_distribution`, `get_rag_stats`.

### 2.4 Extensiones

Bloque 5 ejecutado el 2026-04-17. 8 extensiones activas, ninguna inesperada:

| Extensión | Versión |
|---|---|
| `pg_graphql` | 1.5.11 |
| `pg_stat_statements` | 1.10 |
| `pgcrypto` | 1.3 |
| `pgjwt` | 0.2.0 |
| `plpgsql` | 1.0 |
| `supabase_vault` | 0.3.1 |
| `uuid-ossp` | 1.1 |
| `vector` (pgvector) | 0.8.0 |

Sin acción pendiente.

### 2.5 Hallazgos críticos

1. **3 tablas de inmogrid sin RLS**: `inmogrid_badges`, `inmogrid_points_ledger`, `inmogrid_user_badges`. El feature de gamificación se desplegó sin policies. Cualquiera con la `anon key` puede leerlas/escribirlas. Fix en Fase 3.
2. **6 tablas nuevas no documentadas** en auditorías previas: la trinca de Sofia y la trinca de gamificación. Este plan las deja formalmente registradas.
3. **Schema `posts` divergente** entre la DB real y `prisma/schema.prisma` — varios endpoints están rotos (`dashboard/notas`, `[username]/notas`, `sitemap`, health checks). Fix en Fase 4.
4. **`inmogrid_profiles.id` sin FK hard a `auth.users.id`**: integridad referencial frágil. Fix en Fase 5.
5. **Inmogrid NO consume `SUPABASE_SERVICE_ROLE_KEY`** (grep confirmado en `src/`). La rotación del JWT secret solo requiere actualizar `NEXT_PUBLIC_SUPABASE_ANON_KEY` en Vercel — el service_role nuevo se guarda en Bitwarden pero no se pega en ningún lado.
6. **1 único PAT de Supabase** (no 2 como decía la auditoría previa) propagado en 6 archivos locales: `~/.claude.json`, `~/.config/Claude/claude_desktop_config.json`, y 3 `.mcp.json` de proyectos (`inmogrid.cl`, `soymona.cl`, `gabrielpantoja.cl`) + un `settings.local.json`. Decisión: migrar MCP a hosted OAuth en vez de rotar PAT (ver §3.4).
7. **`~/Developer/infra/vps-oracle/.env` contiene `SUPABASE_ANON_KEY=eyJ...` en plaintext** pero NO se sincroniza al VPS (verificación via SSH el 2026-04-17: ambas vars están vacías en el contenedor n8n del VPS — md5 del runtime = md5 de string vacío, distinto del md5 del valor local). Es **dead code en disco**: hay que limpiarlo en un commit aparte del repo `infra/vps-oracle`, pero NO es un consumidor activo de la key.
8. **n8n workflow `PANTOJA-RESEND v.1.4-EMAIL-FIX`**: único workflow que referenciaba Supabase vía `$env.SUPABASE_URL`. 0 ejecuciones en su historial. Pantojapropiedades.cl está muerto (dominio vencido + Vercel eliminado el 2026-04-17). → limpieza de workflow + retiro de vars del `docker-compose.n8n.yml`.

---

## 3. Decisiones

### 3.1 Quedarse en el proyecto Supabase heredado

Alternativa evaluada: migrar a `inmogrid-prod` limpio. Descartada porque:

- pantoja y degux están archivados → no hay consumidores activos del proyecto compartido.
- Una migración implica downtime, migración de `auth.users`, redirects OAuth, re-aprobación de consent screens.
- El beneficio incremental es marginal una vez ejecutada la limpieza.

### 3.2 No purgar historial git del repo público

Los secrets leakeados en el incidente 2026-04-11 quedan en el historial como strings invalidados tras la rotación. Purgar con `git filter-repo` es security theater una vez que los secrets están indexados por bots — la rotación es la única defensa real. Detalle completo en el repo privado.

### 3.3 Sofia RAG usa `inmogrid_sofia_*`, no `documents`

**Confirmado el 2026-04-17**. Grep de `src/` contra las 6 funciones dudosas (`match_documents`, `match_documents_enhanced`, `mark_documents_for_embedding`, `ingest_existing_content`, `analyze_similarity_distribution`, `get_rag_stats`) devolvió **0 referencias** fuera de este mismo documento. Sofia actual usa solo `inmogrid_sofia_*` + `src/shared/lib/gemini.ts`.

### 3.4 Migrar MCP de Supabase a hosted OAuth (en vez de rotar PAT)

Decisión tomada el 2026-04-17 tras verificar en docs oficiales (ver [Supabase MCP Server](https://supabase.com/docs/guides/getting-started/mcp) y [Claude Code MCP docs](https://code.claude.com/docs/en/mcp)):

- El CLI/`npx @supabase/mcp-server-supabase` no soporta OAuth 2.1 (solo PAT). El hosted MCP en `https://mcp.supabase.com/mcp` sí — usa dynamic client registration.
- Migrar elimina el problema de raíz: no hay PAT en disco para regar, rotar, ni filtrar.
- El hosted MCP tiene superset de tools respecto al CLI.

Plan de migración (en ejecución):
1. ✅ Remover `supabase` del `.mcp.json` del proyecto inmogrid.
2. ✅ Agregar hosted MCP con `--scope project`: `https://mcp.supabase.com/mcp?project_ref=<SUPABASE_PROJECT_REF>`.
3. ⏳ Disparar OAuth flow vía `claude mcp list`, verificar conexión.
4. ⏳ Repetir para `soymona.cl` y `gabrielpantoja.cl` (con sus `project_ref` respectivos si cada uno tiene su propio Supabase).
5. ⏳ Limpiar PAT de `~/.claude.json` (scope user) y `~/.config/Claude/claude_desktop_config.json` (Claude Desktop).
6. ⏳ Revocar el PAT `sbp_0d7d…5800` en Supabase Dashboard → account/tokens.

### 3.5 Mantener `documents` como snapshot

`documents` (238 filas, 7.3 MB) es la knowledge base antigua de Sofia con PDFs de cursos de corretaje (ANACOPRO A.G.). Sin consumidores activos (grep confirmado), pero el contenido tiene valor. **Decisión**: dejar la tabla intacta hasta que la Fase 4 del ADR-006 (seeding de la KB nueva en `inmogrid_sofia_documents`) esté lista. Entonces se evalúa: (a) migrar los 238 chunks al esquema nuevo, o (b) DROP tras confirmar que la KB nueva la reemplaza.

### 3.6 Mantener `legal_page_versions`

Tabla de versionado de Términos y Condiciones / Política de Privacidad. 3 filas. Aunque vino de pantoja, **sirve para inmogrid**: el producto necesita el mismo versionado legal. Se conserva la tabla + estructura, a futuro se adapta si Prisma requiere ajustes de nombres.

### 3.7 Backups antes de DROP

Para las 4 tablas legacy con más data (por valor histórico o potencial reuso), se generaron dumps individuales en `~/Developer/infra/privado/inmogrid.cl/sql/backups/` el 2026-04-17:

- `legacy-blog_guidelines_versions-20260417-141514.sql` — 3 filas (pautas de escritura)
- `legacy-property_images-20260417-141514.sql` — 79 filas
- `legacy-crm_clientes-20260417-141514.sql` — 6 filas
- `legacy-property_videos-20260417-141514.sql` — 4 filas

El `pg_dump` completo del cluster va aparte en Fase 2.1 (pre-DROP).

---

## Fase 0 — Inventario (✅ completa)

- [x] Ejecutado SQL de inventario bloques 1, 3, 4, 5-usuarios el 2026-04-17 am.
- [x] Bloque 2 alternativo (conteos exactos) ejecutado vía psql directo el 2026-04-17 pm. Resultados integrados en §2.1.
- [x] Bloque 5 completo (extensiones) ejecutado el 2026-04-17 pm. 8 extensiones activas, ninguna sospechosa (ver §2.4).
- [x] Grep de las 6 funciones dudosas de Sofia en `src/`: **0 referencias**. Safe drop (se ejecuta en Fase 2 junto con `documents` si se decide eliminar).
- [x] Sampling de `documents` y `user_google_tokens` hecho (ver §2.1 D y §3.5).

---

## Fase 1 — Rotación de credenciales

> **Los valores de secrets NO viven en este repo**. Se guardan en Bitwarden y el repo privado documenta los pasos forenses. Esta sección registra el *qué* y el *estado*, no los valores.

### 1.1 JWT secret del proyecto Supabase

Regenera `anon key` + `service_role key` en un paso. Mata la `service_role` leakeada en el incidente de 2026-04-11.

**Inventario previo de consumidores** (completado el 2026-04-17 pm):

Lado código (grep en `src/`):
- [x] `NEXT_PUBLIC_SUPABASE_URL` → `src/shared/lib/supabase/{client,server,middleware}.ts`
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` → mismos 3 archivos
- [x] `SUPABASE_SERVICE_ROLE_KEY` → **NO USADO** (confirmado, ver §2.5 hallazgo 5)

Lado infra:
- [x] Vercel `inmogrid.cl` (production): `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEON_DATABASE_URL`, `UPSTASH_*`, `N8N_LOGIN_WEBHOOK_URL`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_GA_ID`, `GENERIC_APP_KEY`. **No hay `SUPABASE_SERVICE_ROLE_KEY`**.
- [x] Vercel `pantojapropiedadescl`: **eliminado** el 2026-04-17.
- [x] Vercel `degux.cl`: no existe.
- [x] n8n (VPS Oracle): confirmado NO consumidor (vars vacías en runtime — ver §2.5 hallazgo 7).
- [x] `scraper-chile`: solo Neon, no afecta.
- [x] Scripts/cron locales: ninguno activo con keys de inmogrid.

**Ejecución** (pendiente):
1. [ ] Dashboard → Settings → API → JWT Settings → Generate new JWT secret.
2. [ ] Actualizar env vars en Vercel → redeploy.
3. [ ] Guardar en Bitwarden: `Supabase - anon key - inmogrid`, `Supabase - service role key - inmogrid` (este último solo para futuro, no se pega en Vercel).

### 1.2 Password de la DB Postgres

- Reset desde Dashboard → Settings → Database.
- Actualizar `DATABASE_URL` y `DIRECT_URL` en Vercel.
- Guardar en Bitwarden: `Supabase - DB password - inmogrid`.

### 1.3 PAT de Supabase — reemplazado por migración a MCP hosted OAuth

**Contexto**: el inventario del 2026-04-17 encontró **1 único PAT** `sbp_0d7d…5800` (no 2 como decía la auditoría previa) propagado en 6 archivos locales. Ver [§3.4](#34-migrar-mcp-de-supabase-a-hosted-oauth-en-vez-de-rotar-pat) para la decisión de migrar en vez de rotar.

Progreso (2026-04-17 pm):
- [x] `claude mcp remove supabase -s project` ejecutado en `~/Developer/loxos/inmogrid.cl`.
- [x] `claude mcp add --transport http --scope project supabase "https://mcp.supabase.com/mcp?project_ref=<SUPABASE_PROJECT_REF>"` ejecutado. `.mcp.json` verificado — sin PAT.
- [ ] Disparar OAuth flow (`claude mcp list` con browser abierto).
- [ ] Confirmar `supabase: ✓ Connected` con transport HTTP.
- [ ] Repetir remove/add en `soymona.cl` y `gabrielpantoja.cl`.
- [ ] Limpiar PAT de `~/.claude.json` (scope user) y `~/.config/Claude/claude_desktop_config.json`.
- [ ] Revocar el PAT en Supabase Dashboard → account/tokens.

### 1.4 Google OAuth Client Secrets

Tres Client Secrets expuestos:
- Proyecto GCP `degux-cl` → **eliminar cliente OAuth entero** (proyecto abandonado).
- Proyecto GCP `pantojapropiedades-cl` → idem.
- Proyecto GCP `inmogrid` → **rotar**. Actualizar Supabase Auth → Providers → Google.

### 1.5 NEXTAUTH_SECRET legacy

inmogrid.cl migró a Supabase Auth. pantoja y degux están inactivos. → **no requiere rotación**, solo documentar verificación.

---

## Fase 2 — Limpieza de legacy

### 2.1 Pre-flight — validación

Antes de cualquier DROP:

- [x] Bloque 2 alternativo ejecutado (ver §2.1 con conteos exactos).
- [x] Grep de funciones dudosas de Sofia: **0 referencias** — safe DROP de las 6 funciones junto con `documents` si se decide. Pero `documents` se **mantiene** como snapshot (§3.5).
- [x] Sampling de `documents` y `user_google_tokens` hecho (§2.1 D).
- [x] **4 backups individuales** de tablas críticas legacy generados en `~/Developer/infra/privado/inmogrid.cl/sql/backups/` (§3.7).
- [ ] `pg_dump` completo del cluster a `infra/privado/inmogrid.cl/sql/backups/pre-cleanup-2026-04-17.sql.gz` (gitignoreado). Pendiente antes de correr los DROP.

### 2.2 DROP de tablas legacy

SQL completo en [Apéndice B](#apéndice-b--sql-de-limpieza-completo).

### 2.3 DROP de triggers y funciones legacy

SQL completo en [Apéndice B](#apéndice-b--sql-de-limpieza-completo).

### 2.4 Resolver `inmogrid_chat_messages` vs `inmogrid_sofia_messages`

**Resuelto el 2026-04-17**:
- `inmogrid_chat_messages` → **0 filas**. Es el chat legacy OpenAI (`/api/chat`). CLAUDE.md lo marca como "will be removed". Código la referencia en `src/features/chat/lib/persistence.ts` y `src/app/api/delete-account/route.ts:90`.
- `inmogrid_sofia_messages` → **4 filas**. Es el chat nuevo de Sofia RAG (Gemini). Activo.

**Plan**: dropear `inmogrid_chat_messages` **junto con** la eliminación de `/api/chat` legacy (código). Es trabajo de Fase 2 tardía o una limpieza posterior de dead code.

### 2.5 Validación post-limpieza

```sql
-- Esperado: ~16 tablas (las de inmogrid)
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Esperado: solo on_auth_user_created_inmogrid
SELECT tgname FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass AND NOT tgisinternal;

-- Esperado: sin errores de "function does not exist"
SELECT proname FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname IN (
  'handle_new_user_profile', 'create_cotizacion', 'generate_orden_numero'
);
```

---

## Fase 3 — Hardening RLS

Hallazgo de §2.5: 3 tablas de inmogrid con RLS deshabilitado.

### 3.1 `inmogrid_badges` (catálogo público de badges)

```sql
ALTER TABLE public.inmogrid_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges_public_read"
  ON public.inmogrid_badges
  FOR SELECT
  USING (true);

-- Sin INSERT/UPDATE/DELETE public — solo service_role (bypasea RLS).
```

### 3.2 `inmogrid_user_badges` (badges ganados por usuario)

```sql
ALTER TABLE public.inmogrid_user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_badges_own_read"
  ON public.inmogrid_user_badges
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "user_badges_public_profile_read"
  ON public.inmogrid_user_badges
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.inmogrid_profiles p
      WHERE p.id = inmogrid_user_badges.user_id
        AND p.is_public_profile = true
    )
  );
-- No public write. Solo service_role asigna.
```

### 3.3 `inmogrid_points_ledger` (ledger de puntos)

```sql
ALTER TABLE public.inmogrid_points_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "points_own_read"
  ON public.inmogrid_points_ledger
  FOR SELECT
  USING (user_id = auth.uid());
-- Write solo por service_role vía funciones definidas.
```

### 3.4 Auditoría RLS completa

Con la DB ya limpia, verificar RLS en todas las tablas restantes:

```sql
SELECT t.tablename, t.rowsecurity,
       (SELECT COUNT(*) FROM pg_policies
         WHERE schemaname = 'public' AND tablename = t.tablename) AS policies
FROM pg_tables t
WHERE t.schemaname = 'public'
ORDER BY t.tablename;
```

Para cada tabla con `rowsecurity = false` o `policies = 0`, decidir: habilitar + policy mínima, o confirmar que nunca se expone vía PostgREST.

---

## Fase 4 — Migración del schema `posts`

### 4.1 Problema

`public.posts` tiene columnas de la era pantojapropiedades.cl que no coinciden con `prisma/schema.prisma` de inmogrid:

| Prisma (esperado) | DB real (actual) | Estado |
|---|---|---|
| `userId` | `author_id` | renombrar |
| `published: boolean` | `status: text` | cambio de tipo |
| `publishedAt` | *(no existe)* | agregar |
| `coverImageUrl` | `image` | renombrar |
| `tags: text[]` | *(no existe)* | agregar |
| `readTime: int` | *(no existe)* | agregar |
| `updatedAt` | *(no existe)* | agregar |

### 4.2 Archivos afectados (8 endpoints rotos)

Llaman a `prisma.post.*` con el schema esperado — fallan en runtime:

```
src/features/posts/lib/queries.ts
src/app/dashboard/notas/page.tsx
src/app/(public)/[username]/page.tsx
src/app/(public)/[username]/notas/page.tsx
src/app/(public)/[username]/notas/[slug]/page.tsx
src/app/api/delete-account/route.ts
src/app/api/public/health/route.ts
src/app/api/public/profiles/[username]/posts/route.ts
src/app/sitemap.ts
```

Otros 4 archivos ya usan `$queryRaw` como workaround (feed del dashboard, explorar, detalle público, API pública `/posts`).

### 4.3 Migración (Opción A — recomendada)

```sql
BEGIN;

-- 1. Agregar columnas nuevas con defaults seguros
ALTER TABLE public.posts
  ADD COLUMN user_id UUID,
  ADD COLUMN published BOOLEAN DEFAULT false,
  ADD COLUMN published_at TIMESTAMPTZ,
  ADD COLUMN cover_image_url TEXT,
  ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN read_time INTEGER,
  ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Copiar data de columnas viejas a nuevas
UPDATE public.posts
   SET user_id         = author_id,
       published       = (status = 'published'),
       published_at    = CASE WHEN status = 'published' THEN created_at END,
       cover_image_url = image,
       updated_at      = COALESCE(updated_at, created_at);

-- 3. Agregar FK hard a auth.users
ALTER TABLE public.posts
  ADD CONSTRAINT posts_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Hacer user_id NOT NULL (solo después de verificar que todas tienen valor)
-- SELECT COUNT(*) FROM public.posts WHERE user_id IS NULL;
ALTER TABLE public.posts ALTER COLUMN user_id SET NOT NULL;

-- 5. Trigger para mantener updated_at
CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Validar antes de commitear:
-- SELECT id, user_id, published, cover_image_url FROM public.posts;

COMMIT;
```

### 4.4 Limpieza post-migración

Cuando todos los llamadores estén usando las columnas nuevas:

```sql
ALTER TABLE public.posts
  DROP COLUMN author_id,
  DROP COLUMN status,
  DROP COLUMN image,
  DROP COLUMN category;
```

### 4.5 Re-tipar llamadores

`npx prisma db pull && npx prisma generate`. Los 8 archivos pasan a compilar sin `$queryRaw`. Los 4 archivos que ya usan `$queryRaw` pueden quedarse así (no rompe nada) o re-tiparse en el mismo PR.

---

## Fase 5 — FK hard `inmogrid_profiles`

### 5.1 Problema

`public.inmogrid_profiles.id` (UUID) debería matchear `auth.users.id` por convención, pero no hay constraint. Si alguna fila de `auth.users` se borra, el perfil queda huérfano sin cascade.

### 5.2 Pre-check

```sql
-- Detectar huérfanos actuales
SELECT ip.id
FROM public.inmogrid_profiles ip
LEFT JOIN auth.users u ON u.id = ip.id
WHERE u.id IS NULL;
```

Si devuelve filas, decidir: borrar los huérfanos o restaurar el user antes del constraint.

### 5.3 Agregar FK

```sql
ALTER TABLE public.inmogrid_profiles
  ADD CONSTRAINT inmogrid_profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

---

## Fase 6 — Prevención y monitoreo

### 6.1 Habilitar GitHub Secret Scanning

En `github.com/gabrielpantoja-cl/inmogrid` → Settings → Code security:
- Secret scanning → Enable.
- Secret push protection → Enable.

Gratis para repos públicos. Bloquea push que contenga patterns como Supabase PAT, Google Client Secret, AWS keys.

### 6.2 gitleaks pre-commit hook

```bash
npm i -D gitleaks
```

En `.husky/pre-commit`:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
npx gitleaks protect --staged --verbose
```

### 6.3 Política de `.env.*.example`

- **Solo placeholders** (`GOCSPX-REPLACE_ME`, `your-secret-here`).
- Header de warning en cada archivo: `# SOLO TEMPLATE. NO PEGAR VALORES REALES.`
- Valores reales solo en `.env.local` (gitignoreado), Vercel env vars, o Bitwarden.

### 6.4 Monitoreo post-rotación (2 semanas)

- Supabase → Auth Logs: signups desde IPs raras desde 2025-04-17.
- Supabase → Postgres Logs: queries masivas desconocidas.
- Supabase → Storage: archivos inesperados.
- Supabase → Billing/usage: picos de egress o de Edge Functions.

---

## Checklist consolidado

### Fase 0 — Inventario ✅
- [x] Bloques 1, 3, 4 ejecutados (2026-04-17 am).
- [x] Bloque 5 — conteo de usuarios ejecutado.
- [x] Bloque 2 alternativo ejecutado (conteos exactos en §2.1).
- [x] Bloque 5 completo ejecutado (extensiones en §2.4).
- [x] Grep de funciones dudosas de Sofia → 0 referencias.
- [x] Sampling de `documents` (238 filas, KB vieja de Sofia) y `user_google_tokens` (0 filas) hecho.

### Fase 1 — Rotación 🟡
- [x] Inventario de consumidores completo (§1.1).
- [x] Vercel pantojapropiedadescl eliminado.
- [x] Vercel degux confirmado inexistente.
- [x] n8n VPS confirmado NO consumidor activo.
- [x] MCP Supabase removido de `.mcp.json` de inmogrid.
- [x] MCP Supabase hosted (OAuth) agregado con `project_ref`.
- [ ] OAuth flow ejecutado + confirmado Connected.
- [ ] Mismo proceso aplicado a `soymona.cl` y `gabrielpantoja.cl`.
- [ ] PAT limpiado de `~/.claude.json` y `~/.config/Claude/claude_desktop_config.json`.
- [ ] PAT revocado en Supabase Dashboard.
- [ ] JWT secret rotado.
- [ ] Env vars Vercel actualizadas + redeploy OK.
- [ ] Nuevas keys en Bitwarden.
- [ ] DB password rotado.
- [ ] 3 Client Secrets OAuth rotados o eliminados.
- [ ] Google Provider en Supabase con secret nuevo de inmogrid.
- [x] NEXTAUTH_SECRET: verificado que no requiere rotación (no hay NextAuth en el stack).
- [ ] Limpiar `SUPABASE_ANON_KEY` hardcodeada del `~/Developer/infra/vps-oracle/.env` (commit aparte en repo `infra/vps-oracle`).
- [ ] Limpiar workflow `PANTOJA-RESEND` de n8n + quitar envs del `docker-compose.n8n.yml`.

### Fase 2 — Limpieza 🟢 pre-flight parcial
- [x] 4 backups individuales de tablas críticas (§3.7).
- [ ] Backup `pg_dump` completo del cluster guardado en repo privado.
- [x] Sampling de `documents` y `user_google_tokens` hecho.
- [ ] DROP de 24 tablas legacy OK (22 pantoja - `legal_page_versions` mantenida + 2 degux + `user_google_tokens`).
- [ ] DROP de trigger `on_auth_user_created_create_profile` + función.
- [ ] DROP de 15 funciones legacy.
- [x] Resolución de `inmogrid_chat_messages` vs `inmogrid_sofia_messages` (§2.4).
- [ ] DROP de `inmogrid_chat_messages` junto con eliminación de `/api/chat`.
- [ ] Validación post-limpieza: ~17 tablas + 1 trigger esperado (mantenemos `documents` + `legal_page_versions`).

### Fase 3 — RLS
- [ ] RLS habilitado en `inmogrid_badges` + policy read público.
- [ ] RLS habilitado en `inmogrid_user_badges` + policies read propio y perfil público.
- [ ] RLS habilitado en `inmogrid_points_ledger` + policy read propio.
- [ ] Auditoría RLS completa con tablas restantes.

### Fase 4 — Schema posts
- [ ] Migración ejecutada + data copiada.
- [ ] FK `posts.user_id → auth.users.id` agregada.
- [ ] Trigger `set_posts_updated_at` creado.
- [ ] `prisma db pull && prisma generate` OK.
- [ ] 8 archivos re-tipados sin errores.
- [ ] Build de Vercel verde.
- [ ] Drop de columnas legacy (`author_id`, `status`, `image`, `category`).

### Fase 5 — FK profiles
- [ ] Pre-check de huérfanos.
- [ ] FK `inmogrid_profiles.id → auth.users.id ON DELETE CASCADE` agregada.

### Fase 6 — Prevención
- [ ] GitHub Secret Scanning habilitado.
- [ ] Secret Push Protection habilitado.
- [ ] gitleaks instalado + hook funcionando.
- [ ] CONTRIBUTING.md actualizado con política de secrets.
- [ ] Monitoreo semana 1 (Supabase + GCP).
- [ ] Monitoreo semana 2.

---

## Apéndice A — SQL de inventario

### Bloque 1 — Tablas `public` (ya ejecutado)

```sql
SELECT
    c.relname AS tabla,
    pg_size_pretty(pg_total_relation_size(c.oid)) AS tamano,
    c.reltuples::bigint AS filas_estimadas,
    c.relrowsecurity AS rls_enabled,
    (SELECT COUNT(*) FROM pg_policies
      WHERE schemaname = 'public' AND tablename = c.relname) AS policies
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relname;
```

### Bloque 2 alternativo — conteos exactos

> El bloque 2 original con `DO $$ ... RAISE NOTICE` no devuelve resultados en el SQL Editor de Supabase. Esta versión usa `query_to_xml` para obtener rows reales.

```sql
SELECT
    tablename,
    (xpath('/row/c/text()',
        query_to_xml(format('SELECT COUNT(*) AS c FROM public.%I', tablename), false, true, '')
    ))[1]::text::bigint AS filas_exactas
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Bloque 3 — Triggers sobre `auth.users` (ya ejecutado)

```sql
SELECT tgname, tgenabled, pg_get_triggerdef(oid) AS definicion
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass AND NOT tgisinternal
ORDER BY tgname;
```

### Bloque 4 — Funciones `public` (ya ejecutado)

```sql
SELECT p.proname AS funcion, pg_get_function_identity_arguments(p.oid) AS args
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
ORDER BY p.proname;
```

### Bloque 5 — Extensiones y usuarios

```sql
SELECT extname, extversion FROM pg_extension ORDER BY extname;
SELECT COUNT(*) AS total_users FROM auth.users;
```

---

## Apéndice B — SQL de limpieza completo

> **No ejecutar sin antes** haber completado la Fase 0 (inventario), la Fase 1 (rotación) y el pre-flight de la Fase 2 (backup + sampling).

### B.1 DROP de tablas legacy

```sql
BEGIN;

DROP TABLE IF EXISTS
    public.profiles,
    public.cotizaciones,
    public.crm_clientes,
    public.crm_interacciones,
    public.crm_oportunidades,
    public.crm_ordenes_visita,
    public.crm_tareas,
    public.teams,
    public.team_members,
    public.team_notifications,
    public.external_portals,
    public.blog_guidelines_versions,
    -- public.legal_page_versions,  -- MANTENER (§3.6 — reuso para T&C de inmogrid)
    public.property_portal_listings,
    public.property_videos,
    public.property_images,
    public.seo_metrics,
    public.site_daily_stats,
    public.site_page_views,
    public.site_popular_content,
    public.site_session_analytics,
    public.chat_conversations,
    public.chat_messages,
    public.user_notification_preferences,
    public.degux_posts,
    public.inmobloques_scores,
    public.user_google_tokens  -- 0 filas, safe DROP (§2.1 D)
CASCADE;

-- documents se mantiene como snapshot (§3.5) — NO dropear.
-- inmogrid_chat_messages se dropea aparte junto con la eliminación de /api/chat legacy (§2.4).

-- Revisar output. Si todo OK:
COMMIT;
-- Si algo inesperado:
-- ROLLBACK;
```

### B.2 DROP de triggers y funciones legacy

```sql
BEGIN;

-- Trigger y función de pantoja sobre auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_create_profile ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_profile() CASCADE;

-- Funciones legacy de pantoja
DROP FUNCTION IF EXISTS public.create_cotizacion(text, service_type_enum, text, numeric, uuid, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_cotizacion(text, service_type_enum, text, numeric, uuid, text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_new_guideline_version(text) CASCADE;
DROP FUNCTION IF EXISTS public.ensure_sequential_version() CASCADE;
DROP FUNCTION IF EXISTS public.get_next_blog_guidelines_version() CASCADE;
DROP FUNCTION IF EXISTS public.generate_orden_numero() CASCADE;
DROP FUNCTION IF EXISTS public.update_crm_ordenes_visita_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.aggregate_site_daily_stats(date) CASCADE;
DROP FUNCTION IF EXISTS public.update_site_session_analytics() CASCADE;
DROP FUNCTION IF EXISTS public.update_user_notification_preferences_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.reorder_image(uuid, double precision, double precision) CASCADE;
DROP FUNCTION IF EXISTS public.add_message_to_conversation(uuid, text, text, uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.add_message_to_conversation(uuid, text, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.get_conversation_messages(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.store_conversation(text, jsonb) CASCADE;

-- Funciones de Sofia vieja — solo si el grep confirmó que ninguna está en uso
-- DROP FUNCTION IF EXISTS public.match_documents(vector, double precision, integer) CASCADE;
-- DROP FUNCTION IF EXISTS public.match_documents_enhanced(vector, double precision, integer) CASCADE;
-- DROP FUNCTION IF EXISTS public.mark_documents_for_embedding() CASCADE;
-- DROP FUNCTION IF EXISTS public.ingest_existing_content() CASCADE;
-- DROP FUNCTION IF EXISTS public.analyze_similarity_distribution(vector, double precision) CASCADE;
-- DROP FUNCTION IF EXISTS public.get_rag_stats() CASCADE;

-- Si el type enum de pantoja ya no tiene consumidores:
-- DROP TYPE IF EXISTS service_type_enum;

COMMIT;
```

### B.3 Validación final

```sql
-- Tablas restantes (esperado ~16 de inmogrid)
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Triggers en auth.users (esperado solo on_auth_user_created_inmogrid)
SELECT tgname FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass AND NOT tgisinternal;

-- Conteo de funciones en public (esperado ~110 = pgvector + inmogrid)
SELECT COUNT(*) FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public';

-- RLS de todas las tablas restantes
SELECT tablename, rowsecurity,
       (SELECT COUNT(*) FROM pg_policies
         WHERE schemaname = 'public' AND tablename = t.tablename) AS policies
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## Referencias internas

- [`architecture.md`](architecture.md) — stack, estructura del repo, modelo de datos, auth y API
- [`authentication.md`](authentication.md) — flujo OAuth + troubleshooting + triggers de auth
- [`adr/ADR-005-dual-backend-supabase-neon.md`](adr/ADR-005-dual-backend-supabase-neon.md) — por qué dos DBs (Supabase + Neon)
- [`adr/ADR-006-sofia-rag-gemini-integration.md`](adr/ADR-006-sofia-rag-gemini-integration.md) — por qué pgvector + Gemini

Detalle forense del incidente 2026-04-11 y valores de secrets rotados: **repo privado** `infra/privado/inmogrid.cl/`. No en este repo.
