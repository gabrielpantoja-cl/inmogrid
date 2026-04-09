# Plan de Mejora: inmogrid.cl → INMOGRID
### Hoja de ruta técnica concreta para transformar el repo actual en la plataforma del ecosistema

**Repo base:** `C:\Users\gabri\Developer\personal\inmogrid.cl`
**Deadline crítico:** 16 de abril de 2026 (vencimiento pantojapropiedades.cl)
**Última actualización:** abril 2026

---

## Estado actual del repo (pre-mejora)

```
✅ Funciona hoy                          ❌ No existe aún
─────────────────────────────────────    ─────────────────────────────────────
Next.js 15.5 App Router                  Identidad INMOGRID (landing, branding)
Perfiles públicos /{username}            Modelo Event (agenda)
Blog/notas por usuario                   Directorio de tasadores/corredores
Google OAuth (NextAuth)                  Profesiones del sector inmobiliario
Chatbot GPT-4o-mini con streaming        Lógica free/pagado para eventos
Sistema de conexiones (modelo listo)     Supabase como base de datos
Página /explorar con datos reales        Redirect pantojapropiedades.cl
Middleware de protección de rutas
Cookie consent + GA4 condicional
API pública con CORS
```

---

## FASE 0 — MVP (antes del 16 de abril 2026)

> Objetivo: tener inmogrid.cl publicado y pantojapropiedades.cl redirigiendo antes de que venza el dominio.

---

### TAREA 0.1 — Reutilizar proyecto Supabase de pantojapropiedades.cl

**Esfuerzo:** 2-3 horas | **Prioridad:** BLOQUEANTE

#### Contexto: por qué no crear un proyecto nuevo

El free tier de Supabase permite **máximo 2 proyectos activos**. La cuenta ya tiene los 2 ocupados:
- `gabrielpantoja.cl` → mantener
- `pantojapropiedades.cl` → **reproponer para INMOGRID**

No se puede crear un tercero sin pagar. Y no hace falta: `pantojapropiedades.cl` es exactamente el proyecto que INMOGRID reemplaza.

#### Plan paso a paso

**Paso 1 — Respaldar datos importantes de pantojapropiedades.cl**
```bash
# Desde Supabase Dashboard → Settings → Database → Connection string (direct)
# O desde el VPS Oracle con pg_dump:
pg_dump "postgresql://postgres.[ref]:[pass]@db.[ref].supabase.co:5432/postgres" \
  --schema=public \
  --file=backup_pantojapropiedades_$(date +%Y%m%d).sql
```
Guardar el backup en el VPS antes de tocar nada.

**Paso 2 — Obtener los connection strings de pantojapropiedades.cl**
```
Supabase Dashboard → pantojapropiedades.cl → Settings → Database
→ Connection string → URI mode (Direct): para DATABASE_URL
→ Connection string → URI mode (Pooler): para POSTGRES_PRISMA_URL
```

**Paso 3 — Actualizar `.env.local` del repo inmogrid.cl**
```bash
# Reemplazar el PostgreSQL viejo del VPS Digital Ocean:
# POSTGRES_PRISMA_URL="postgresql://inmogrid_user:...@VPS_IP_REDACTED:5432/inmogrid"

# Por el Supabase de pantojapropiedades (que pasará a ser INMOGRID):
POSTGRES_PRISMA_URL="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DATABASE_URL="postgresql://postgres.[ref]:[pass]@db.[ref].supabase.co:5432/postgres"
```

**Paso 4 — Limpiar schema antiguo de pantojapropiedades**

Las tablas de pantojapropiedades no son compatibles con el schema de INMOGRID (Prisma). Opciones:

- **Opción A (recomendada):** hacer un reset completo del schema público y empezar limpio
  ```sql
  -- En Supabase Dashboard → SQL Editor:
  DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  GRANT ALL ON SCHEMA public TO postgres;
  GRANT ALL ON SCHEMA public TO public;
  ```
- **Opción B:** dejar las tablas viejas y solo agregar las nuevas (más seguro si hay datos a conservar)

**Paso 5 — Aplicar schema INMOGRID**
```bash
cd C:/Users/gabri/Developer/proptech/inmogrid.cl
npx prisma db push        # crea todas las tablas del schema INMOGRID
npx prisma generate       # regenera el cliente TypeScript
```

**Paso 6 — Verificar conexión**
```bash
npx prisma studio         # debe abrir con las tablas INMOGRID vacías y limpias
```

**Paso 7 — Renombrar el proyecto en Supabase**

> **¿Se puede renombrar un proyecto Supabase? Sí.**
>
> `Supabase Dashboard → pantojapropiedades.cl → Settings → General → Project name`
> → Cambiar a **"INMOGRID"**
>
> **Lo que NO cambia al renombrar:**
> - El `project_ref` (ID único) — permanece igual
> - La URL: `https://[ref].supabase.co` — no cambia
> - Las API keys — no cambian
> - Los datos — no se tocan
>
> **Cuándo hacerlo:** justo antes del deploy de INMOGRID en Vercel. No antes, para no confundir mientras pantojapropiedades.cl sigue activo.

**Archivos afectados:**
- `.env.local` del repo `proptech/inmogrid.cl` (nunca commitear)
- `.env.example` → actualizar comentarios con nombres de keys correctos

---

### TAREA 0.2 — Limpiar schema: eliminar lo irrelevante

**Esfuerzo:** 1 hora | **Prioridad:** BLOQUEANTE

**Editar `prisma/schema.prisma`:**

**Eliminar** los siguientes modelos completos:
- `model Plant` — vivero, completamente irrelevante
- `model Collection` — colecciones abstractas, no aplica

**Eliminar** en `model User`:
- `Plant Plant[]`
- `Collection Collection[]`
- Campo `customCss` — no necesario por ahora

**Reemplazar** el enum `ProfessionType` completo:

```prisma
// ANTES (creadores digitales):
enum ProfessionType {
  CREADOR_CONTENIDO
  DISENADOR
  DESARROLLADOR
  FOTOGRAFO
  ESCRITOR
  ARTISTA
  EMPRENDEDOR
  EDUCADOR
  VIVERISTA
  JARDINERO
  BOTANICO
  OTRO
}

// DESPUÉS (sector inmobiliario chileno):
enum ProfessionType {
  TASADOR_PERITO
  PERITO_JUDICIAL
  CORREDOR_PROPIEDADES
  ADMINISTRADOR_PROP
  ABOGADO_INMOBILIARIO
  ARQUITECTO
  INGENIERO_CIVIL
  ACADEMICO
  FUNCIONARIO_PUBLICO
  INVERSIONISTA
  PROPIETARIO
  OTRO
}
```

Luego ejecutar:
```bash
npx prisma db push
npx prisma generate
```

---

### TAREA 0.3 — Agregar modelo Event al schema

**Esfuerzo:** 1 hora | **Prioridad:** BLOQUEANTE

**Agregar en `prisma/schema.prisma`:**

```prisma
model Event {
  id              String        @id @default(cuid())
  title           String
  description     String
  organizerName   String
  organizerType   OrganizerType
  eventType       EventType
  startDate       DateTime
  endDate         DateTime?
  location        String?
  isOnline        Boolean       @default(false)
  onlineUrl       String?
  coverImageUrl   String?
  registrationUrl String?
  isFree          Boolean       @default(true)
  isCommercial    Boolean       @default(false)
  isPaid          Boolean       @default(false)
  price           Float?
  status          EventStatus   @default(PENDING)
  publishedAt     DateTime?
  region          String?
  commune         String?
  userId          String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  User            User?         @relation(fields: [userId], references: [id])

  @@index([status, startDate])
  @@index([region, status])
}

enum OrganizerType {
  MUNICIPAL
  UNIVERSITARIO
  GREMIAL
  GUBERNAMENTAL
  COMERCIAL
  INDEPENDIENTE
}

enum EventType {
  TALLER
  SEMINARIO
  CHARLA
  CURSO
  CONGRESO
  OPEN_HOUSE
  LANZAMIENTO
  WEBINAR
  OTRO
}

enum EventStatus {
  PENDING
  PUBLISHED
  REJECTED
  EXPIRED
}
```

Agregar relación en `model User`:
```prisma
Event Event[]
```

Ejecutar:
```bash
npx prisma db push
npx prisma generate
```

---

### TAREA 0.4 — Reescribir la landing page

**Esfuerzo:** 3-4 horas | **Prioridad:** ALTA

**Archivo:** `src/app/page.tsx`

**Estado actual:** landing de "marca personal creativa" con logo AcmeLogo, framing de Substack/Behance.

**Qué reescribir:**
- Eliminar framing de "marca personal" / "creadores digitales"
- Eliminar el checkbox de términos y el flujo de login en la landing
- Nueva sección hero: qué es INMOGRID, a quién sirve
- Sección de módulos: Agenda de Eventos / Directorio de Profesionales / Conocimiento abierto
- CTA claro: "Ver eventos" → `/eventos` | "Unirte" → `/auth/signin`
- Mantener el login Google OAuth pero como botón secundario en navbar

**Componentes a crear:**
```
src/components/marketing/HeroSection.tsx
src/components/marketing/FeaturesSection.tsx
src/components/marketing/StatsSection.tsx    (cuando haya datos)
src/components/marketing/CTASection.tsx
```

**Referencia de tono:** el manifiesto en `09-manifiesto.md` — usar ese lenguaje.

---

### TAREA 0.5 — Eliminar rutas de plantas

**Esfuerzo:** 30 min | **Prioridad:** MEDIA

**Eliminar completamente:**
```
src/app/[username]/plantas/
src/app/[username]/plantas/[slug]/
src/app/dashboard/plantas/
src/app/dashboard/plantas/crear/
src/components/ui/profile/PlantCard.tsx
```

**Limpiar referencias en:**
- `src/components/ui/dashboard/nav-links.tsx` — eliminar link "Plantas"
- `src/components/ui/profile/` — eliminar imports de PlantCard

---

### TAREA 0.6 — Módulo de Eventos (el quick win)

**Esfuerzo:** 3-4 días | **Prioridad:** ALTA — es el core del MVP

**Estructura a crear:**

```
src/app/eventos/
├── page.tsx                    # Lista pública de eventos (SSR, filtros por región/tipo)
├── [id]/
│   └── page.tsx                # Detalle de evento
└── nuevo/
    └── page.tsx                # Formulario publicar evento (requiere auth)

src/app/dashboard/eventos/
├── page.tsx                    # Gestión de eventos propios
└── [id]/editar/
    └── page.tsx                # Editar evento publicado

src/app/api/events/
├── route.ts                    # GET (paginado, filtros) / POST (crear)
└── [id]/
    └── route.ts                # GET / PATCH / DELETE

src/app/api/public/events/
└── route.ts                    # GET público con CORS (para embedder externo)

src/components/events/
├── EventCard.tsx               # Tarjeta de evento para listing
├── EventDetail.tsx             # Vista detalle
├── EventForm.tsx               # Formulario crear/editar
├── EventFilters.tsx            # Filtros: región, tipo, fecha, gratis/pagado
└── EventBadge.tsx              # Badge "Gratuito" / "Comercial" / "Pagado"
```

**Lógica de negocio crítica en `EventForm.tsx`:**
```typescript
// Si OrganizerType es COMERCIAL O isPaid === true → isCommercial = true → COBRAR
// Si OrganizerType es MUNICIPAL/UNIVERSITARIO/GREMIAL/GUBERNAMENTAL Y isFree === true → gratis

const isCommercialEvent = 
  organizerType === 'COMERCIAL' || 
  isPaid === true;
```

**API `/api/public/events/route.ts`:**
```typescript
// Sin autenticación, CORS abierto
// Parámetros: ?region=&type=&from=&to=&limit=&page=
// Retorna: eventos con status=PUBLISHED y startDate >= hoy
```

---

### TAREA 0.7 — Actualizar identidad en navbar y metadata

**Esfuerzo:** 1 hora | **Prioridad:** ALTA

**Archivos a editar:**

`src/app/layout.tsx`:
```typescript
// Cambiar metadata global:
export const metadata: Metadata = {
  title: 'INMOGRID — Ecosistema Abierto de Conocimiento Inmobiliario',
  description: 'Plataforma de comunidad para tasadores, peritos y corredores de propiedades en Chile.',
  // ...
}
```

`src/components/ui/common/AcmeLogo.tsx`:
- Reemplazar logo genérico por "INMOGRID" en tipografía correcta

`src/components/ui/dashboard/nav-links.tsx`:
- Cambiar links: Inicio / Eventos / Directorio / Explorar / Mis Notas / Perfil
- Eliminar link "Plantas" y "Documentación"

---

### TAREA 0.8 — Deploy en Vercel + redirect pantojapropiedades.cl

**Esfuerzo:** 2 horas | **Prioridad:** BLOQUEANTE para el 16/abril

**Pasos:**
1. Crear proyecto en Vercel apuntando a `gabrielpantoja-cl/inmogrid.cl`
2. Configurar dominio `inmogrid.cl` en Vercel (cambiar DNS en NIC.cl)
3. Agregar todas las variables de entorno en Vercel Dashboard
4. Verificar deploy funciona en `inmogrid.cl`
5. En proyecto Vercel de `pantojapropiedades.cl`: agregar redirect 301

```json
// vercel.json de pantojapropiedades.cl:
{
  "redirects": [
    {
      "source": "/(.*)",
      "destination": "https://inmogrid.cl/$1",
      "statusCode": 301
    }
  ]
}
```

6. No renovar el dominio `pantojapropiedades.cl` — dejar que expire.

---

## FASE 1 — Comunidad profesional (post 16 abril)

> Objetivo: activar las funcionalidades de networking y directorio para tasadores y corredores.

---

### TAREA 1.1 — Completar sistema de networking

**Esfuerzo:** 3-4 días

**Estado actual:** modelo `Connection` en schema ✅, `ConnectionButton.tsx` parcial, páginas `/dashboard/networking` y `/dashboard/comunidad` son placeholders.

**Qué implementar:**

`src/app/api/connections/route.ts`:
```typescript
// POST → crear solicitud (requesterId + receiverId)
// GET  → listar conexiones del usuario autenticado (accepted)
```

`src/app/api/connections/[id]/route.ts`:
```typescript
// PATCH → aceptar / rechazar solicitud
// DELETE → eliminar conexión
```

`src/app/dashboard/networking/page.tsx` — reemplazar placeholder con:
- Tab "Solicitudes recibidas" (status: pending, receiverId = userId)
- Tab "Mis conexiones" (status: accepted)
- Tab "Solicitudes enviadas" (status: pending, requesterId = userId)

`src/app/dashboard/explorar/page.tsx` — ya tiene base real, mejorar:
- Agregar filtro por `profession` (tasador, corredor, etc.)
- Agregar filtro por `region`
- Mostrar botón "Conectar" en cada perfil via `ConnectionButton`

---

### TAREA 1.2 — Perfil profesional extendido

**Esfuerzo:** 2 días

**Agregar modelo en schema:**
```prisma
model ProfessionalProfile {
  id              String    @id @default(cuid())
  userId          String    @unique
  specialties     String[]  // ['tasacion_suelo', 'peritaje_judicial', 'expropiaciones']
  certifications  String[]
  regions         String[]
  yearsExperience Int?
  isVerified      Boolean   @default(false)
  verifiedAt      DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  User            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Actualizar `src/app/dashboard/perfil/page.tsx`:**
- Agregar sección "Perfil Profesional" con campos: especialidades, regiones donde opera, años de experiencia, certificaciones

**Actualizar `src/app/[username]/page.tsx`:**
- Si el usuario tiene ProfessionalProfile → mostrar sección "Perfil Profesional" en la vista pública

---

### TAREA 1.3 — Directorio público de profesionales

**Esfuerzo:** 2 días

**Crear:**
```
src/app/directorio/
├── page.tsx          # Listing con filtros: profesión, región, años de experiencia
└── loading.tsx       # Skeleton

src/app/api/public/directorio/
└── route.ts          # GET público con CORS, filtros, paginado
```

**Filtros:**
- Tipo de profesional (tasador/perito/corredor/etc.)
- Región de Chile
- Solo verificados (toggle)

**Ordenamiento:** verificados primero → luego por fecha de registro.

---

### TAREA 1.4 — Actualizar chatbot al contexto INMOGRID

**Esfuerzo:** 2-3 horas

**Archivo:** `src/app/api/chat/route.ts`

**Cambiar el system prompt:**
```typescript
// ANTES:
"Eres un asistente virtual para inmogrid.cl, plataforma de marca personal..."

// DESPUÉS:
`Eres el asistente de INMOGRID, la plataforma de conocimiento inmobiliario abierto para Chile.
Ayudas a tasadores, peritos, corredores y ciudadanos con:
- Cómo publicar eventos en la agenda
- Cómo completar el perfil profesional
- Información sobre el mercado inmobiliario chileno
- Cómo conectar con otros profesionales del sector
- Qué son los referenciales y cómo consultarlos en referenciales.cl
Responde en español, con lenguaje claro y profesional.`
```

**Actualizar FAQs hardcoded:**
```typescript
"¿Qué es INMOGRID?" → descripción ecosistema abierto
"¿Cómo publico un evento?" → explicar ruta /eventos/nuevo
"¿Qué es un referencial?" → definición + link referenciales.cl
"¿Cómo verifico mi perfil?" → proceso de verificación profesional
```

---

### TAREA 1.5 — SEO por ruta

**Esfuerzo:** 1 día

**Todas las rutas principales deben tener `generateMetadata()`:**

```
/eventos          → "Agenda de Eventos Inmobiliarios Chile | INMOGRID"
/eventos/[id]     → título del evento dinámico
/directorio       → "Directorio de Tasadores y Corredores Chile | INMOGRID"
/[username]       → nombre + profesión del usuario
/[username]/notas → "Artículos de {nombre} | INMOGRID"
```

**Agregar `robots.txt` y `sitemap.xml` dinámico:**
```
src/app/robots.ts     → Next.js genera robots.txt automáticamente
src/app/sitemap.ts    → genera sitemap con eventos + perfiles públicos
```

---

## FASE 2 — Datos, IA y escala (mayo-junio 2026)

---

### TAREA 2.1 — Integrar API de referenciales.cl

**Esfuerzo:** 1-2 días

**En perfiles de tasadores — mostrar mapa de referenciales de su zona:**

```typescript
// src/app/[username]/page.tsx
// Si el usuario es TASADOR_PERITO y tiene región → fetch API pública referenciales.cl
const referenciales = await fetch(
  `https://referenciales.cl/api/public/map-data?region=${user.region}&limit=20`
);
```

**Crear componente:**
```
src/components/referenciales/ReferencialesMap.tsx   # Mapa Leaflet embebido
src/components/referenciales/ReferencialesStats.tsx  # Stats básicas de la zona
```

---

### TAREA 2.2 — Chatbot RAG sobre datos inmobiliarios

**Esfuerzo:** 1 semana

**Stack:**
- `pgvector` como extensión PostgreSQL (Supabase lo soporta nativamente)
- Embeddings: `text-embedding-3-small` (OpenAI) o `nomic-embed-text` (local via Ollama en VPS)
- Fuentes de conocimiento: normativa SII, guías CBR, artículos del blog

**Nuevo modelo en schema:**
```prisma
model KnowledgeChunk {
  id        String   @id @default(cuid())
  content   String
  source    String   // URL o nombre del documento
  embedding Unsupported("vector(1536)")?
  createdAt DateTime @default(now())
}
```

**Flujo:**
```
Pregunta usuario → embed → pgvector similarity search → top 5 chunks → GPT-4o-mini
```

---

### TAREA 2.3 — Migrar features de pantojapropiedades.cl

**Esfuerzo:** 2-3 semanas (selectivo)

**Features a migrar en orden de prioridad:**

| Feature | Repo origen | Prioridad | Esfuerzo |
|---------|------------|----------|---------|
| Sofía chatbot RAG | pantojapropiedades.cl/src/features/chatbot | Alta | 3 días |
| Módulo de reportes PDF | pantojapropiedades.cl/src/features/reports | Media | 2 días |
| Estadísticas de mercado | pantojapropiedades.cl/src/features/analytics | Media | 2 días |
| CRM básico de contactos | pantojapropiedades.cl/src/features/crm | Baja | 1 semana |

**Estrategia de migración:** copiar `src/features/[feature]/` completo, actualizar imports, adaptar al schema de Prisma de INMOGRID.

---

### TAREA 2.4 — API pública v1

**Esfuerzo:** 2 días

**Endpoints a publicar con documentación:**

```
GET /api/public/events              # Agenda pública
GET /api/public/events/[id]         # Evento específico
GET /api/public/directorio          # Directorio profesional
GET /api/public/directorio/[username] # Perfil profesional
GET /api/public/health              # Health check (ya existe ✅)
```

**Agregar:**
- Rate limiting: 100 req/min por IP
- Documentación en `/api/public/docs` (ya existe estructura)
- Headers: `X-INMOGRID-Version: 1.0`

---

### TAREA 2.5 — Eliminar dependencias pesadas innecesarias

**Esfuerzo:** 2-3 horas

**Desinstalar del `package.json`:**

```bash
npm uninstall @mui/material @emotion/react @emotion/styled
# MUI pesa ~300kb y no se usa con shadcn/ui

npm uninstall puppeteer
# Solo si no se usa para scraping en este repo

npm uninstall csv-parse exceljs
# Solo si no hay features de importación/exportación CSV activas
```

**Revisar bundle:** `npx @next/bundle-analyzer` para identificar chunks pesados.

---

## Resumen de tareas por deadline

### Antes del 16 de abril (obligatorio)

| # | Tarea | Esfuerzo | Bloquea deploy |
|---|-------|---------|---------------|
| 0.1 | Migrar BD a Supabase | 3h | ✅ Sí |
| 0.2 | Limpiar schema (eliminar Plant/Collection) | 1h | ✅ Sí |
| 0.3 | Agregar modelo Event | 1h | ✅ Sí |
| 0.4 | Reescribir landing page | 4h | No |
| 0.5 | Eliminar rutas de plantas | 30min | No |
| 0.6 | Módulo Eventos (lista + detalle + formulario) | 4 días | No |
| 0.7 | Actualizar navbar y metadata | 1h | No |
| 0.8 | Deploy Vercel + redirect 301 | 2h | ✅ Sí |

**Total estimado Fase 0:** ~5 días de trabajo efectivo

---

### Post 16 de abril (Fase 1 — comunidad)

| # | Tarea | Esfuerzo |
|---|-------|---------|
| 1.1 | Completar networking (API + UI) | 4 días |
| 1.2 | Perfil profesional extendido | 2 días |
| 1.3 | Directorio público | 2 días |
| 1.4 | Chatbot → contexto INMOGRID | 3h |
| 1.5 | SEO por ruta + sitemap | 1 día |

**Total estimado Fase 1:** ~10 días

---

### Mayo-junio (Fase 2 — escala)

| # | Tarea | Esfuerzo |
|---|-------|---------|
| 2.1 | Integrar API referenciales.cl | 2 días |
| 2.2 | Chatbot RAG | 1 semana |
| 2.3 | Migrar features pantojapropiedades.cl | 2-3 semanas |
| 2.4 | API pública v1 documentada | 2 días |
| 2.5 | Limpiar dependencias pesadas | 3h |

---

## Lo que NO se toca en el MVP

| Cosa | Por qué no |
|------|-----------|
| Migrar NextAuth → Supabase Auth | Semanas de trabajo, cero ganancia en MVP |
| Reescribir rutas con Supabase client | Prisma+Supabase PostgreSQL = compatible, no hay que cambiar nada |
| Implementar pagos (Stripe/Transbank) | Fase 2 — el MVP cobra "por contacto manual" hasta tener volumen |
| Forum completo con threads | Fase 2 — placeholder de GitHub Discussions está bien por ahora |
| App móvil | No relevante aún |
| Multiidioma | No relevante para mercado chileno |

---

## Comandos de referencia

```bash
# Instalar dependencias
npm install

# Correr en desarrollo
npm run dev

# Actualizar schema en Supabase
npx prisma db push

# Regenerar tipos TypeScript de Prisma
npx prisma generate

# Abrir Prisma Studio (admin visual de BD)
npx prisma studio

# Verificar bundle
npx @next/bundle-analyzer

# Build de producción
npm run build

# Tests
npm run test
npm run test:e2e
```
