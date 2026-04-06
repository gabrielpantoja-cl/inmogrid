# Migración DB: pantojapropiedades.cl → DEGUX

**Fecha de análisis:** 2026-04-06  
**Supabase project ref:** `SUPABASE_PROJECT_REF`  
**Estrategia:** Opción B — tablas nuevas via SQL manual, `prisma generate` para el cliente TypeScript. No se usa `prisma db push` sobre este proyecto para evitar conflictos con referencias cross-schema (`auth.users`).

---

## Contexto

El proyecto Supabase de `pantojapropiedades.cl` se reutiliza como base de datos de DEGUX. pantojapropiedades.cl sigue activo hasta que venza el dominio. **Nunca borrar tablas ni datos existentes.**

DEGUX es pantojapropiedades 2.0 — mismo Supabase, nuevas tablas, datos existentes preservados.

---

## Estado actual del schema (2026-04-06)

### Inventario completo de tablas

| Tabla | Filas | Origen | Decisión DEGUX |
|-------|-------|--------|----------------|
| `site_page_views` | 5.671 | Analytics | Ignorar — no relevante para DEGUX |
| `site_session_analytics` | 1.447 | Analytics | Ignorar |
| `documents` | 238 | ❓ Investigar | Pendiente — ver estructura |
| `site_daily_stats` | 83 | Analytics | Ignorar |
| `property_images` | 79 | Propiedades | ✅ Reutilizar en Fase 1 |
| `site_popular_content` | 76 | Analytics | Ignorar |
| `chat_messages` | 68 | Chatbot Sofia | ✅ Reutilizar — historial Sofia |
| `team_notifications` | 48 | Equipos | Ignorar por ahora |
| `chat_conversations` | 21 | Chatbot Sofia | ✅ Reutilizar — historial Sofia |
| `posts` | 15 | Blog | ✅ **MIGRAR** — blog completo a DEGUX |
| `external_portals` | 9 | Portales | Ignorar |
| `properties` | 7 | Propiedades | ✅ Reutilizar en Fase 1 |
| `crm_clientes` | 6 | CRM | ✅ Reutilizar en Fase 5 |
| `crm_clientes_estadisticas` | 6 | CRM | ✅ Reutilizar en Fase 5 |
| `profiles` | 4 | Auth | ⚠️ Incompatible — usa Supabase Auth (auth.users), DEGUX usa NextAuth |
| `property_videos` | 4 | Propiedades | ✅ Reutilizar en Fase 1 |
| `blog_guidelines_versions` | 3 | CMS | ⚠️ **Bloquea Prisma** — tiene FK a auth.users |
| `inmobloques_scores` | 3 | ❓ Desconocido | Investigar |
| `legal_page_versions` | 3 | Legal | Ignorar |
| `cotizaciones` | 2 | Ventas | Ignorar por ahora |
| `crm_oportunidades` | 2 | CRM | ✅ Reutilizar en Fase 5 |
| `team_members` | 2 | Equipos | Ignorar |
| `user_google_tokens` | 2 | Auth | Ignorar — DEGUX usa NextAuth |
| `user_notification_preferences` | 2 | Notificaciones | Ignorar por ahora |
| `crm_ordenes_visita` | 1 | CRM | ✅ Reutilizar en Fase 5 |
| `teams` | 1 | Equipos | Ignorar |
| `conversion_events` | 0 | Analytics | Ignorar — vacía |
| `crm_interacciones` | 0 | CRM | ✅ Reutilizar en Fase 5 (vacía, schema útil) |
| `crm_tareas` | 0 | CRM | ✅ Reutilizar en Fase 5 (vacía, schema útil) |
| `notification_views` | 0 | Notificaciones | Ignorar — vacía |
| `property_portal_listings` | 0 | Portales | Ignorar — vacía |
| `seo_metrics` | 0 | Analytics | Ignorar — vacía |

---

## Estructura de tablas clave

### `posts` — Blog (15 filas, REUTILIZAR)

| Columna | Tipo | Nullable | Default |
|---------|------|----------|---------|
| `id` | uuid | NO | gen_random_uuid() |
| `created_at` | timestamptz | NO | timezone('utc', now()) |
| `title` | text | NO | — |
| `content` | text | NO | — |
| `author_id` | uuid | NO | — |
| `status` | text | NO | 'draft' |
| `category` | text | YES | — |
| `image` | text | YES | — |
| `excerpt` | text | YES | — |
| `slug` | text | YES | — |

**Compatibilidad con DEGUX:** Alta. El modelo `Post` en el schema de DEGUX tiene campos similares. Mapear `author_id` al sistema NextAuth requiere una tabla de correspondencia o migración de IDs.

**Nota:** `author_id` referencia `auth.users` de Supabase (UUID). DEGUX usa NextAuth con IDs tipo `cuid`. Al integrar el blog en DEGUX, los posts existentes se mostrarán correctamente si se mantiene la tabla original y se accede via Supabase client, o se migran los IDs en una segunda etapa.

### `documents` — (238 filas, PENDIENTE)

> **TODO:** Ejecutar en Supabase Studio y documentar aquí:
> ```sql
> SELECT column_name, data_type, is_nullable
> FROM information_schema.columns
> WHERE table_schema = 'public' AND table_name = 'documents'
> ORDER BY ordinal_position;
> ```

---

## Problema: FK cross-schema bloquea Prisma

### Síntoma

```
Error: P4002 — Cross schema references are only allowed when the target schema 
is listed in the schemas property of your datasource.
`public.blog_guidelines_versions` points to `auth.users` in constraint 
`blog_guidelines_versions_created_by_fkey`.
```

`prisma db push` y `prisma db pull` fallan porque `blog_guidelines_versions` tiene una foreign key a `auth.users` (schema `auth` de Supabase). Prisma no puede hacer introspección con referencias cross-schema sin configuración adicional.

### Solución elegida: eliminar solo el constraint FK

No se borra la tabla ni los datos (3 filas). Solo se elimina la referencia de integridad que bloquea a Prisma.

```sql
-- Ejecutar en Supabase Studio → SQL Editor
-- SOLO elimina el constraint FK, no toca datos ni tabla
ALTER TABLE public.blog_guidelines_versions 
DROP CONSTRAINT IF EXISTS blog_guidelines_versions_created_by_fkey;
```

**Estado:** ⏳ Pendiente de aplicar

**Post-aplicación:** Verificar con:
```sql
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'blog_guidelines_versions' 
AND constraint_type = 'FOREIGN KEY';
```
Debe retornar 0 filas.

---

## Plan de migración DEGUX — SQL scripts

Una vez resuelto el constraint FK, aplicar los siguientes scripts en orden via Supabase Studio.

### Script 001 — Nuevas tablas DEGUX (Fase 0 MVP)

> **Estado:** ⏳ Pendiente de escribir  
> **Aplica:** Después de resolver el constraint FK  
> **Tablas nuevas:** `events`, `professional_profiles`  
> **Enums nuevos:** Actualizar `ProfessionType` para sector inmobiliario

```sql
-- TODO: completar con schema final de Event y ProfessionalProfile
-- Ver prisma/schema.prisma para la definición de modelos
```

### Script 002 — NextAuth tables (si no existen)

DEGUX usa NextAuth v4 con Prisma Adapter. Las tablas necesarias son:
`Account`, `Session`, `User`, `VerificationToken`

> **Estado:** ⏳ Verificar si ya existen en el schema actual  
> **Query de verificación:**
> ```sql
> SELECT table_name FROM information_schema.tables
> WHERE table_schema = 'public'
> AND table_name IN ('Account', 'Session', 'User', 'VerificationToken', 'users', 'accounts', 'sessions');
> ```

---

## Workflow establecido

```
Prisma schema (fuente de verdad TypeScript)
  → SQL migration script (versionado en docs/sql-migrations/)
    → aplicar manualmente en Supabase Studio SQL Editor
      → npm run prisma:generate (genera client TypeScript)
        → deploy en Vercel
```

**Por qué no usamos `prisma db push`:**
- El DB tiene tablas legacy de pantojapropiedades con referencias a `auth.users`
- `db push` requiere introspección completa → falla con cross-schema FK
- El approach manual con SQL explícito da más control y trazabilidad

**Scripts de Prisma actualizados en package.json:**
```json
"prisma:generate": "dotenv -e .env.local -- npx prisma generate",
"prisma:push":     "dotenv -e .env.local -- npx prisma db push",
"prisma:studio":   "dotenv -e .env.local -- npx prisma studio"
```
> `prisma:push` queda disponible para uso futuro en proyectos limpios.

---

## Pendientes

- [ ] Documentar estructura de tabla `documents` (238 filas)
- [ ] Investigar tabla `inmobloques_scores` (3 filas, origen desconocido)
- [ ] Eliminar FK constraint de `blog_guidelines_versions`
- [ ] Verificar si tablas NextAuth (`Account`, `Session`, `User`) ya existen
- [ ] Escribir Script 001 — nuevas tablas DEGUX
- [ ] Aplicar Script 001 en Supabase Studio
- [ ] Ejecutar `npm run prisma:generate`
- [ ] Configurar variables de entorno en Vercel
- [ ] Deploy
