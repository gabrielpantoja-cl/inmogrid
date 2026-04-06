# Arquitectura Técnica
### Stack definitivo, base de código y decisiones de ingeniería

---

## Veredicto: Base de código

### `personal/degux.cl` — **ES el proyecto. Usar desde hoy.**

Después de auditar los 4 repositorios candidatos, la respuesta es inequívoca.

| Repo | Next.js 15 | Comunidad | Perfiles | Networking | Auth | Decisión |
|------|-----------|-----------|---------|-----------|------|----------|
| `personal/degux.cl` | ✅ 15.5.10 | ✅ Sí | ✅ [username] routes | ✅ Modelo listo | ✅ Google OAuth | ✅ **USAR** |
| `proptech/referenciales.cl` | ✅ 15.x | ❌ Solo datos | ❌ No | ❌ No | ✅ Google OAuth | Referencia técnica |
| `proptech/pantojapropiedades.cl` | ❌ Vite+React | ✅ Parcial | ❌ No | ❌ No | ✅ Supabase | Migrar features |
| `proptech/gabrielpantoja.cl` | ❌ Vite+React | ❌ Blog solo | ❌ No | ❌ No | ✅ Supabase | No relevante |

### Por qué `personal/degux.cl`

1. **Es literalmente el mismo proyecto** — mismo nombre, mismo dominio, misma visión de comunidad. No es coincidencia: fue el intento anterior de construir DEGUX.

2. **Next.js 15.5.10 con App Router** — el único candidato que cumple el requisito arquitectónico principal. React 19. TypeScript 5.2. Todo actualizado.

3. **Infraestructura de comunidad ya construida y probada:**
   - `[username]` routes — perfiles públicos dinámicos por usuario
   - Modelo `Connection` — networking entre profesionales
   - Modelo `Post` — blog/notas por usuario
   - Sistema de roles (user / admin / superadmin)
   - 1.820 commits de historia — no es código nuevo, es código maduro

4. **Lo que se elimina** — el modelo `Plant` y toda la lógica de "vivero/marca personal". Se descarta limpiamente reemplazando por el modelo `Event`.

5. **Lo que viene de `pantojapropiedades.cl`** — migrar selectivamente: chatbot Sofia (RAG), módulo CRM, lógica de propiedades. No reescribir: copiar e integrar.

---

## Stack tecnológico definitivo

### Frontend / Framework

| Capa | Tecnología | Versión | Por qué |
|------|-----------|---------|---------|
| **Framework** | Next.js | 15.5.10 | App Router, SSR/SSG para SEO, Server Components, API routes integradas |
| **Runtime** | React | 19.2.3 | Última versión estable, concurrent features |
| **Lenguaje** | TypeScript | 5.2.2 | Strict mode obligatorio |
| **Build** | Turbopack | (integrado) | `next dev --turbo` — más rápido que Webpack |

**Por qué Next.js 15 sobre React+Vite:**
- Las páginas de eventos y el directorio necesitan SSR para ser indexadas por Google sin JS
- Server Components reducen el bundle del cliente y mejoran LCP
- API routes eliminan un backend separado para operaciones simples
- `generateMetadata()` nativa para SEO por ruta
- Mismo framework que `referenciales.cl` → patrones consistentes en el ecosistema

### UI y Estilos

| Capa | Tecnología | Versión | Por qué |
|------|-----------|---------|---------|
| **CSS Framework** | Tailwind CSS | 3.4.17 | Consistente en todo el ecosistema |
| **Componentes** | shadcn/ui | (vía primitives/) | Accesibles, sin licencias, customizables |
| **Primitivos** | Radix UI | 2.x | Base de shadcn/ui |
| **Iconos** | Lucide React | 0.407.0 | Consistente con gabrielpantoja.cl |
| **Animaciones** | tailwindcss-animate | 1.0.7 | Micro-interacciones sin overhead |

**Nota:** El repo tiene MUI instalado (@mui/material 6.4.0) — se eliminará para reducir bundle. shadcn/ui + Tailwind es suficiente y más liviano.

### Base de Datos y ORM

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| **ORM** | Prisma | 6.6.0 | Type-safe, migraciones versionadas, Prisma Studio para admin |
| **Base de datos** | PostgreSQL 16 + PostGIS | Datos geoespaciales para tasadores por zona |
| **Hosting DB** | Supabase | PostgreSQL gestionado — compatible 100% con Prisma |
| **Schema** | `prisma/schema.prisma` | Versionado en Git |

**La relación Prisma + Supabase:**
Supabase es PostgreSQL gestionado. Prisma se conecta a él con `DATABASE_URL` apuntando al connection string de Supabase. No hay incompatibilidad — es la misma combinación que usa referenciales.cl con Neon (otro PostgreSQL gestionado). El plan es:
1. Crear proyecto Supabase para DEGUX
2. Cambiar `POSTGRES_PRISMA_URL` → connection string Supabase
3. `npx prisma db push` — schema aplicado en minutos
4. Supabase Storage para imágenes de perfil y eventos

**Sobre Supabase Auth vs NextAuth:**
El repo ya tiene NextAuth v4 + Google OAuth funcionando. Migrar a Supabase Auth toma semanas y no aporta valor al MVP. **Decisión: mantener NextAuth para el MVP.** Supabase Auth se evaluará en Fase 2 cuando se necesite autenticación más granular (magic links, OTP para profesionales).

### Autenticación

| Aspecto | Implementación |
|---------|----------------|
| **Proveedor** | NextAuth v4.24.11 |
| **OAuth** | Google OAuth 2.0 (único proveedor) |
| **Adapter** | @next-auth/prisma-adapter — persistencia automática en BD |
| **Strategy** | JWT (24h) + auto-refresh |
| **Username** | Auto-asignado al primer login desde nombre/email |
| **Roles** | `user` / `admin` / `superadmin` |
| **Protección** | Middleware Next.js — rutas protegidas declarativamente |

### IA y Chatbot

| Aspecto | Implementación |
|---------|----------------|
| **Modelo** | GPT-4o-mini (OpenAI) |
| **SDK** | @ai-sdk/openai 1.3.9 + ai 4.3.4 |
| **Modo** | Streaming de respuestas en tiempo real |
| **Guardado** | Historial en PostgreSQL (modelo ChatMessage) |
| **FAQs** | Hardcoded para respuestas instantáneas sin consumir tokens |

En Fase 2: migrar a RAG con pgvector + embeddings de referenciales.cl y normativa SII/CBR.

### Mapas y Geoespacial

| Aspecto | Implementación |
|---------|----------------|
| **Librería** | Leaflet 1.9.4 + React Leaflet 5.0 |
| **PostGIS** | Extensión habilitada en el schema Prisma |
| **Uso** | Mapa de tasadores por zona, referenciales embebidos vía API referenciales.cl |

### Infraestructura y Despliegue

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| **Hosting web** | Vercel | Deploy automático desde Git, CDN global, gratis hasta escala real |
| **Dominio** | `degux.cl` | Ya registrado por Gabriel, vence oct 2026 |
| **VPS** | Oracle Cloud ARM (159.112.138.229) | Scrapers, n8n, servicios sin costo variable |
| **Orquestación** | n8n (VPS) | Scheduling, webhooks, automatizaciones |
| **Storage** | Supabase Storage | Imágenes de perfil, eventos, documentos |
| **Email** | Resend | Transaccional — ya configurado en el repo |
| **Analytics** | Google Analytics 4 | Ya integrado condicionalmente (cookie consent) |

---

## Schema de base de datos — DEGUX

### Modelos existentes que se CONSERVAN (del repo degux.cl)

```prisma
User        // Perfil profesional — actualizar ProfessionType para sector inmobiliario
Account     // OAuth accounts (NextAuth)
Session     // NextAuth sessions
Post        // Blog/contenido por usuario — REUTILIZAR tal cual
Connection  // Networking entre profesionales — REUTILIZAR tal cual
ChatMessage // Historial chatbot — REUTILIZAR tal cual
AuditLog    // Log de acciones — REUTILIZAR tal cual
```

### Modelos que se ELIMINAN

```prisma
Plant       // Vivero — irrelevante para DEGUX inmobiliario
Collection  // Colecciones abstractas — reemplazar por algo más específico si se necesita
```

### Modelos que se AGREGAN

```prisma
// Agenda de eventos — el quick win
model Event {
  id              String      @id @default(cuid())
  title           String
  description     String
  organizerName   String
  organizerType   OrganizerType  // MUNICIPAL, UNIVERSITARIO, GREMIAL, COMERCIAL
  eventType       EventType      // TALLER, SEMINARIO, CHARLA, CURSO, OPEN_HOUSE, LANZAMIENTO
  startDate       DateTime
  endDate         DateTime?
  location        String?
  isOnline        Boolean    @default(false)
  onlineUrl       String?
  coverImageUrl   String?
  registrationUrl String?
  isFree          Boolean    @default(true)   // true = gratis para asistentes
  isCommercial    Boolean    @default(false)  // true = el organizador paga por publicar
  isPaid          Boolean    @default(false)  // true = el evento cobra entrada
  price           Float?                      // precio de la entrada si aplica
  status          EventStatus @default(PENDING) // PENDING | PUBLISHED | REJECTED | EXPIRED
  publishedAt     DateTime?
  region          String?    // Los Ríos, Biobío, etc.
  commune         String?
  userId          String?    // si fue publicado por un usuario registrado
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  User            User?      @relation(fields: [userId], references: [id])

  @@index([status, startDate])
  @@index([region, status])
  @@index([isCommercial, status])
}

// Directorio de profesionales verificados (Fase 1b)
model ProfessionalProfile {
  id              String           @id @default(cuid())
  userId          String           @unique
  specialty       String[]         // ['tasacion', 'peritaje_judicial', 'expropiaciones']
  certifications  String[]
  regions         String[]         // regiones donde opera
  yearsExperience Int?
  isVerified      Boolean          @default(false)
  verifiedAt      DateTime?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  User            User             @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Enum ProfessionType — actualizar para sector inmobiliario

```prisma
// REEMPLAZAR el enum actual (orientado a creadores) por:
enum ProfessionType {
  TASADOR_PERITO       // Tasador / Perito Tasador
  PERITO_JUDICIAL      // Perito Judicial
  CORREDOR_PROPIEDADES // Corredor de Propiedades
  ADMINISTRADOR_PROP   // Administrador de Propiedades
  ABOGADO_INMOBILIARIO // Abogado especialista
  ARQUITECTO           // Arquitecto
  INGENIERO_CIVIL      // Ingeniero Civil
  ACADEMICO            // Académico / Investigador
  FUNCIONARIO_PUBLICO  // Municipio / MINVU / SII / CBR
  INVERSIONISTA        // Inversionista
  PROPIETARIO          // Propietario / Particular
  OTRO
}
```

---

## Rutas del App Router — DEGUX

### Rutas que se CONSERVAN (del repo)

```
/                          → Landing DEGUX (reescribir contenido)
/auth/signin               → Login Google OAuth ✅
/[username]                → Perfil público de profesional ✅
/[username]/notas          → Posts del profesional ✅
/[username]/notas/[slug]   → Post individual ✅
/dashboard                 → Dashboard del usuario ✅
/dashboard/perfil          → Editar perfil ✅
/dashboard/notas           → Gestión de posts ✅
/dashboard/notas/crear     → Crear post ✅
/chatbot                   → Chat con IA ✅
/privacy, /terms           → Legal ✅
```

### Rutas que se AGREGAN

```
/eventos                   → Directorio público de eventos
/eventos/[id]              → Detalle de evento
/eventos/nuevo             → Formulario publicar evento (auth requerida para premium)
/directorio                → Directorio de tasadores/corredores verificados
/directorio/[username]     → Perfil extendido profesional (alias de /[username])
/dashboard/eventos         → Gestión de eventos publicados por el usuario
/dashboard/comunidad       → Directorio y networking (ya existe como placeholder)
/dashboard/networking      → Conexiones (ya existe como placeholder)
/api/public/events         → API pública de eventos (CORS abierto)
/api/events                → CRUD privado de eventos
```

### Rutas que se ELIMINAN

```
/[username]/plantas        → Vivero — irrelevante
/[username]/plantas/[slug] → Vivero — irrelevante
/dashboard/plantas         → Vivero — irrelevante
/dashboard/plantas/crear   → Vivero — irrelevante
```

---

## El ecosistema completo de proyectos

```
gabrielpantoja.cl (blog personal Gabriel)
    ↓ enlaza a
DEGUX (degux.cl) — plataforma de comunidad
    ↓ consume vía API pública
referenciales.cl — base de datos de transacciones
    ↑ alimentada por
scraper-chile-dashboard (Oracle VPS) — ingesta CBR/Descubro
```

| Proyecto | URL | Stack | Repositorio | Rol en el ecosistema |
|---------|-----|-------|------------|---------------------|
| **DEGUX** | degux.cl | **Next.js 15 + Prisma + Supabase** | `personal/degux.cl` | Plataforma de comunidad — **el nuevo proyecto** |
| **referenciales.cl** | referenciales.cl | Next.js 15 + Prisma + Neon | `proptech/referenciales.cl` | Datos abiertos de transacciones — proyecto hermano autónomo |
| **gabrielpantoja.cl** | gabrielpantoja.cl | React+Vite + Supabase | `proptech/gabrielpantoja.cl` | Blog/marca personal Gabriel |
| **scraper** | (VPS interno) | Python + FastAPI + Docker | `proptech/scraper-chile-dashboard` | Pipeline ingesta CBR → Neon |
| **VPS** | 159.112.138.229 | Docker + Nginx + n8n | `infra/vps-do` | Infraestructura: scrapers, orquestación |

### Stacks diferenciados — por qué importa

| Proyecto | DB | ORM | Auth | Por qué es diferente |
|---------|-----|-----|------|---------------------|
| DEGUX | Supabase (PostgreSQL) | Prisma | NextAuth + Google | Comunidad multi-actor, Storage para imágenes |
| referenciales.cl | Neon (PostgreSQL) | Prisma | NextAuth + Google | El scraper ya escribe directo a Neon — no mover |
| gabrielpantoja.cl | Supabase | Supabase client | Supabase Auth | Blog simple, sin necesidad de Prisma |

---

## Infraestructura cloud — triada $0/mes

DEGUX opera sobre tres servicios gratuitos complementarios:

```
Vercel (Hobby)       Supabase (Free)      Oracle VPS (Free Tier)
──────────────       ───────────────      ──────────────────────
Next.js 15 SSR       PostgreSQL 500MB     4 OCPU ARM / 24GB RAM
CDN global           Auth 50k MAU         n8n workflows
100 deploys/día      Storage 1GB          Scrapers Python
100GB bandwidth      5GB bandwidth        Ollama (embeddings)
$0/mes               $0/mes               $0/mes permanente
```

### Vercel Hobby — límites relevantes para DEGUX

| Límite | Valor | Estado |
|--------|-------|--------|
| Proyectos | 200 | ✅ Actualmente 3, DEGUX será el 4° |
| Build minutes/mes | 6.000 | ✅ ~1.200 builds de Next.js |
| Bandwidth/mes | 100 GB | ✅ Suficiente al inicio |
| Funciones serverless | 60s máx | ⚠️ Chatbot streaming: usar Edge Runtime |
| Builds simultáneos | 1 | ✅ Ok para desarrollo individual |

### Supabase Free — situación actual y decisión

**Proyectos actuales en la cuenta:**

| Proyecto | Estado | Decisión |
|---------|--------|----------|
| `gabrielpantoja.cl` | Activo | Mantener — blog personal |
| `pantojapropiedades.cl` | Activo → **reutilizar** | **Convertir en DEGUX** |

**El free tier permite solo 2 proyectos activos** — no es posible crear un tercero sin pagar o pausar uno existente.

**Decisión: reutilizar el proyecto Supabase de `pantojapropiedades.cl` para DEGUX.**

Razones:
- `pantojapropiedades.cl` deja de existir el 16 de abril de 2026 (vence el dominio)
- DEGUX es su sucesor directo — mismo propósito, misma audiencia, mismo equipo
- No se pierde ningún proyecto free: simplemente se repropone el slot
- La infraestructura PostgreSQL ya está creada y funcionando
- Las variables de entorno de pantojapropiedades.cl en Vercel se actualizan al nuevo proyecto

### ¿Se puede renombrar un proyecto en Supabase?

**Sí — el nombre del proyecto es editable desde el dashboard.**

```
Supabase Dashboard → Settings → General → Project name
→ Cambiar "pantojapropiedades.cl" por "DEGUX"
```

**Lo que cambia:** solo el nombre visible en el dashboard de Supabase.

**Lo que NO cambia:**
- El `project_ref` (ID único del proyecto) — permanece igual
- La URL del proyecto: `https://[ref].supabase.co` — no cambia
- Las API keys (anon key, service role key) — no cambian
- La conexión a la base de datos — no cambia
- Los datos existentes — no se tocan

Esto significa que si `pantojapropiedades.cl` en Vercel apunta al mismo proyecto Supabase, esas conexiones siguen funcionando sin cambiar nada — ideal para hacer la transición sin downtime.

### ¿Cuándo renombrar el proyecto Supabase?

**Momento correcto: inmediatamente antes del deploy de DEGUX en Vercel.**

Secuencia exacta:
```
1. Limpiar schema pantojapropiedades: DROP tablas irrelevantes
2. Ejecutar: npx prisma db push (schema DEGUX sobre Supabase PostgreSQL)
3. Verificar que los datos críticos de pantojapropiedades están migrados o respaldados
4. Renombrar en Supabase dashboard: "pantojapropiedades.cl" → "DEGUX"
5. Crear proyecto Vercel apuntando a personal/degux.cl
6. Configurar variables de entorno con las keys del mismo proyecto Supabase
7. Deploy → degux.cl en línea
8. Configurar redirect 301 pantojapropiedades.cl → degux.cl en Vercel
```

**No renombrar antes** — mientras pantojapropiedades.cl sigue activo, mantener el nombre para no confundir el historial.

### Oracle VPS — complemento permanente

El VPS Oracle Free Tier (IP: 159.112.138.229) es permanentemente gratuito y maneja lo que Vercel + Supabase no pueden hacer sin costo:

| Servicio en VPS | Propósito para DEGUX |
|-----------------|---------------------|
| **n8n** | Ping keep-alive a Supabase cada 5 días (evita pausing) |
| **n8n** | Scrapers CBR → Neon (referenciales.cl) |
| **Ollama** | Embeddings locales para chatbot RAG (alternativa a OpenAI) |
| **FastAPI** | Dashboard de scrapers |
| **pg_dump cron** | Backups automáticos de Supabase → disco VPS |

### Keep-alive para Supabase (crítico)

Los proyectos free se pausan tras **7 días sin actividad**. Solución con n8n:

```
n8n workflow (ya instalado en VPS):
  Cron: cada 5 días a las 10:00
  → GET https://degux.cl/api/public/health
  → Supabase recibe la request → no se pausa
  Costo: $0
```

### Cuándo salir del free tier

| Señal | Acción | Costo |
|-------|--------|-------|
| Usuarios activos diarios (riesgo de pausing irrelevante) | Supabase Pro | $25/mes |
| Bandwidth Vercel > 100GB/mes | Vercel Pro | $20/mes |
| Chatbot con alto volumen | Ollama en VPS reemplaza OpenAI | $0 |

Con 2-3 eventos comerciales al mes a precio razonable, Supabase Pro se paga solo con los ingresos de DEGUX.

---

## Plan de migración y lanzamiento MVP

### Fase 0 — MVP para el 16 de abril de 2026

```
SEMANA 1 (6-10 abril)
├── Conectar POSTGRES_PRISMA_URL → Supabase nuevo proyecto DEGUX
├── Eliminar modelos Plant y Collection del schema
├── Agregar modelo Event al schema
├── Actualizar enum ProfessionType para sector inmobiliario
├── npx prisma db push → schema en Supabase
├── Reescribir landing page (/) con identidad DEGUX
└── Eliminar rutas /[username]/plantas y /dashboard/plantas

SEMANA 2 (11-16 abril)
├── UI de /eventos — lista pública con filtros por región y tipo
├── UI de /eventos/[id] — detalle del evento
├── UI de /eventos/nuevo — formulario publicar evento
├── Integrar lógica de cobro (evento comercial → pago requerido)
├── Redirección 301 pantojapropiedades.cl → degux.cl (configurar en Vercel)
└── Deploy en Vercel desde repositorio personal/degux.cl
```

### Fase 1 — Comunidad profesional (post 16 abril)

```
├── Actualizar perfiles: especialidades, regiones, certificaciones
├── Activar /directorio con filtros por tipo de profesional y región
├── Completar /dashboard/networking y /dashboard/comunidad
├── ProfessionalProfile model — directorio verificado
└── Integración API referenciales.cl en perfiles de tasadores
```

### Fase 2 — Datos y escala (mayo-junio 2026)

```
├── RAG para chatbot: pgvector + embeddings de normativa CBR/SII
├── API pública v1: eventos, directorio profesional
├── Migrar features relevantes de pantojapropiedades.cl
│   ├── Sofía chatbot RAG (ya existe allá)
│   ├── Módulo reportes (PDF, Excel)
│   └── Estadísticas de mercado
└── Supabase Auth — evaluar migración desde NextAuth
```

---

## Variables de entorno requeridas

```bash
# Base de datos (Supabase)
POSTGRES_PRISMA_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="openssl rand -base64 32"
NEXTAUTH_URL="https://degux.cl"
GOOGLE_CLIENT_ID="...apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."

# IA
OPENAI_API_KEY="sk-..."

# Supabase (para Storage)
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# Email
RESEND_API_KEY="re_..."

# Analítica
NEXT_PUBLIC_GA4_ID="G-..."

# Públicas
NEXT_PUBLIC_BASE_URL="https://degux.cl"
NEXT_PUBLIC_REFERENCIALES_API="https://referenciales.cl/api/public"
```

---

## Decisiones técnicas que NO se cambian en el MVP

| Decisión | Justificación |
|----------|---------------|
| **Mantener NextAuth** (no migrar a Supabase Auth) | Migración toma 2+ semanas — no hay tiempo antes del 16/abril |
| **Mantener Prisma** (no migrar a Supabase client) | Prisma+Supabase PostgreSQL = compatible 100%, zero riesgo |
| **No fusionar referenciales.cl** | El scraper escribe directo a Neon — mover rompería la pipeline operativa |
| **No migrar pantojapropiedades.cl** | Reescritura en Next.js desde cero = meses. Migrar features selectivamente = días |
| **Eliminar MUI (@mui/material)** | Agrega 300kb al bundle sin valor incremental sobre shadcn/ui + Tailwind |

---

## Próximos pasos técnicos — orden de ejecución

```
INMEDIATO (esta semana)
├── 1. Crear proyecto en Supabase → obtener connection strings
├── 2. Clonar/abrir personal/degux.cl → cambiar DATABASE_URL
├── 3. Editar schema.prisma → eliminar Plant/Collection, agregar Event
├── 4. Actualizar ProfessionType enum
├── 5. npx prisma db push
├── 6. Verificar que login y perfiles funcionan con nueva BD
└── 7. Reescribir src/app/page.tsx con landing DEGUX

DÍAS 3-7
├── 8. Implementar /eventos con CRUD completo
├── 9. Integrar lógica free/pagado en formulario de eventos
├── 10. Eliminar código de plantas
└── 11. Deploy en Vercel → degux.cl

DÍA 10 (16 abril)
└── 12. Configurar redirect 301 pantojapropiedades.cl → degux.cl
```
