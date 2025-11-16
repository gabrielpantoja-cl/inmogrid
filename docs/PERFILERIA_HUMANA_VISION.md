# PERFILERÍA HUMANA - Visión de degux.cl

**Fecha**: 2025-11-16
**Autor**: Gabriel Pantoja
**Estado**: Diseño Conceptual

---

## 🌱 La Idea Central

degux.cl evoluciona de ser "una plataforma de datos inmobiliarios" a convertirse en **un ecosistema de perfiles humanos auténticos**, donde cada persona tiene su espacio digital minimalista, profesional y libre del ruido de las redes sociales tradicionales.

### URLs Personales
Cada usuario tendría su propia URL amigable:
- `degux.cl/gabrielpantoja`
- `degux.cl/mona`
- `degux.cl/nombre-de-usuario`

### Contenido Multimodal
Dentro de cada perfil:
- ✅ Foto de perfil y portada
- ✅ Descripción auténtica y personal
- ✅ Proyectos y emprendimientos
- ✅ Artículos estilo Medium/Substack
- ✅ Colecciones temáticas
- ✅ Links a redes sociales o negocios
- ✅ Catálogo personal (si venden algo)
- ✅ Etiquetas de identidad (vegano, topógrafo, artista, etc.)

---

## 🌿 Casos de Uso Reales

### Mona - Vivero Mapu
**URL**: `degux.cl/mona`

**Perfil Principal**:
```
"Amante de las plantas, la ecología y la vida simple.
Emprendo con cariño desde el sur de Chile."
```

**Secciones**:
- 🌱 **Plantas favoritas**: Colección curada de plantas especiales
- 🌼 **Vivero Mapu** (`/mona/vivero`): Catálogo de plantas para venta
  - Fotos, descripción, cuidados
  - Precio de compra y venta
  - Stock disponible
- 🏡 **PantojaPropiedades**: Link a negocio inmobiliario familiar
- 📖 **Notas**: Blog personal sobre plantas, ecología, vida simple
- 💬 **Contacto**: WhatsApp directo

### Gabriel - Perito Tasador & Developer
**URL**: `degux.cl/gabrielpantoja`

**Secciones**:
- 🏢 **Mi trabajo como perito**: Portfolio de peritajes (sin datos sensibles)
- 📊 **Topografía & Webmapping**: Proyectos de mapas interactivos
- 💼 **PantojaPropiedades.cl**: Link a empresa familiar
- 📝 **Notas técnicas**: Blog sobre desarrollo web y PropTech
- 🗺️ **Casos reales**: Estudios de caso anonimizados
- 🔗 **Links**: GitHub, LinkedIn, contacto profesional

---

## 🧠 ¿Por qué esta idea es brillante?

### ✅ Producto Unificador
- No 10 proyectos dispersos con estrés
- **Un solo producto hermoso** que crece contigo

### ✅ Emocional
- Mona tendría su página propia, minimalista, profesional, limpia
- Ella queda fascinada y empoderada

### ✅ Escalable
El backend de degux ya tiene arquitectura seria:
- Next.js 15 + Prisma + PostgreSQL + PostGIS
- Multiusuario desde el diseño
- Infraestructura VPS robusta

### ✅ Monetizable
Modelos de negocio futuros:
- Suscripciones estilo Substack (contenido premium)
- Perfiles Premium para emprendedores
- Ventas de productos locales (marketplace)
- Directorio de especialistas verificados
- Páginas verificadas con badge
- Catálogos profesionales

### ✅ Minimalista
- No requiere mil features
- "Tu propio Instagram profesional" sin algoritmos tóxicos
- Enfoque en autenticidad y propósito

---

## 🏗️ Arquitectura Técnica Propuesta

### Stack Tecnológico (sin cambios)
- **Backend**: Next.js 15 App Router
- **Database**: PostgreSQL + PostGIS (VPS actual)
- **ORM**: Prisma
- **Auth**: NextAuth.js (Google OAuth) + posible expansión
- **Storage**: Digital Ocean Spaces (S3-compatible) para imágenes
- **Frontend**: Tailwind CSS + Shadcn/UI

### Nuevos Modelos de Datos

#### 1. User (evolución)
```prisma
model User {
  // ... campos existentes ...

  // 🆕 NUEVOS CAMPOS PARA PERFILERÍA
  username         String?  @unique  // URL amigable: degux.cl/username
  bio              String?           // Descripción personal
  coverImageUrl    String?           // Portada del perfil
  tagline          String?           // Frase corta (ej: "Amante de las plantas")
  location         String?           // Ubicación libre (ej: "Sur de Chile")
  identityTags     String[]          // ["vegano", "ecologista", "artista"]
  externalLinks    Json?             // { instagram: "...", linkedin: "..." }
  isPublicProfile  Boolean  @default(true)
  customCss        String?           // CSS personalizado (premium feature)

  // Relaciones
  posts            Post[]
  plants           Plant[]
  collections      Collection[]
}
```

#### 2. Post (Blog/Artículos)
```prisma
model Post {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  title           String
  slug            String   @unique  // URL: /username/posts/slug
  content         String   // Markdown o rich text
  excerpt         String?  // Resumen corto
  coverImageUrl   String?

  published       Boolean  @default(false)
  publishedAt     DateTime?

  tags            String[] // ["plantas", "ecología"]
  readTime        Int?     // Minutos de lectura estimado

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId, published])
  @@index([slug])
}
```

#### 3. Plant (Vivero Mapu - Catálogo de Plantas)
```prisma
model Plant {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  name            String
  slug            String   @unique  // URL: /username/vivero/slug
  scientificName  String?
  description     String?
  careInstructions String? // Cuidados específicos

  imageUrls       String[] @default([])
  mainImageUrl    String?

  // Inventario
  inStock         Boolean  @default(true)
  stockQuantity   Int?
  priceBuying     Int?     // Precio de compra (CLP)
  priceSelling    Int?     // Precio de venta (CLP)

  // Metadata
  category        String?  // "Suculenta", "Cactus", "Ornamental"
  difficulty      String?  // "Fácil", "Media", "Difícil"
  sunlight        String?  // "Sol directo", "Semi-sombra", "Sombra"
  watering        String?  // "Poco", "Moderado", "Frecuente"

  featured        Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId, inStock])
  @@index([slug])
}
```

#### 4. Collection (Colecciones Temáticas)
```prisma
model Collection {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  name            String
  slug            String   @unique  // URL: /username/collections/slug
  description     String?
  coverImageUrl   String?

  // Elementos de la colección (flexible JSON)
  items           Json     // Array de { type, id, title, imageUrl, description }

  isPublic        Boolean  @default(true)
  featured        Boolean  @default(false)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId, isPublic])
  @@index([slug])
}
```

### Rutas Dinámicas Next.js

```
app/
├── [username]/
│   ├── page.tsx                    # Perfil principal
│   ├── layout.tsx                  # Layout compartido con sidebar
│   ├── posts/
│   │   ├── page.tsx                # Lista de artículos
│   │   └── [slug]/
│   │       └── page.tsx            # Artículo específico
│   ├── vivero/
│   │   ├── page.tsx                # Catálogo de plantas
│   │   └── [slug]/
│   │       └── page.tsx            # Detalle de planta
│   ├── collections/
│   │   ├── page.tsx                # Lista de colecciones
│   │   └── [slug]/
│   │       └── page.tsx            # Colección específica
│   └── links/
│       └── page.tsx                # Página de enlaces externos
├── dashboard/
│   ├── perfil/
│   │   ├── editar/                 # Editar perfil
│   │   ├── posts/                  # Gestión de posts
│   │   ├── vivero/                 # Gestión de plantas (Mona)
│   │   └── collections/            # Gestión de colecciones
│   └── ... (rutas existentes)
```

### APIs Privadas

```
/api/
├── users/
│   ├── profile/username           # Verificar disponibilidad
│   └── profile/update             # Actualizar perfil
├── posts/
│   ├── /                          # GET (listar), POST (crear)
│   ├── [id]                       # GET, PUT, DELETE
│   └── [id]/publish               # POST (publicar/despublicar)
├── plants/
│   ├── /                          # GET, POST
│   ├── [id]                       # GET, PUT, DELETE
│   └── [id]/images                # POST (upload)
└── collections/
    ├── /                          # GET, POST
    └── [id]                       # GET, PUT, DELETE
```

---

## 🎨 Diseño Visual (Principios)

### Paleta de Colores
- **Neutros**: Blanco, grises suaves, negro profundo
- **Acento**: Verde natural (plantas, vida, crecimiento)
- **Secundario**: Terracota suave (tierra, raíces, autenticidad)

### Tipografía
- **Headings**: Lusitana (actual de degux) - Elegante y profesional
- **Body**: Inter o System UI - Legible y moderna
- **Mono**: JetBrains Mono - Para código o datos técnicos

### Componentes Clave
1. **Hero Section**: Portada + foto de perfil + tagline
2. **Bio Card**: Descripción personal con markdown
3. **Grid de Proyectos**: Cards minimalistas con hover effects
4. **Blog Posts**: Estilo Medium con buena tipografía
5. **Catálogo de Plantas**: Grid con filtros y búsqueda
6. **Links Sociales**: Botones elegantes con iconos

---

## 📊 Comparación: Antes vs Después

### ANTES (Estado Actual)
- degux.cl como "plataforma de datos CBR"
- Enfoque técnico en referenciales inmobiliarios
- Usuario anónimo o profesional genérico
- Sin identidad personal visible
- Proyectos fragmentados (PantojaPropiedades, Vivero, Blog separados)

### DESPUÉS (Visión Perfilería Humana)
- degux.cl como "ecosistema de personas auténticas"
- Datos CBR **al servicio de perfiles humanos**
- Cada persona con URL propia y presencia digital
- Identidad rica y multidimensional
- Proyectos integrados en un solo perfil coherente

---

## 🚀 Próximos Pasos

1. **Prototipo Visual**: Diseño HTML/CSS del perfil de Mona
2. **Pitch para Mona**: Documento no-técnico que explique el valor
3. **MVP del Vivero**: Primera implementación funcional
4. **Migración de Schema**: Añadir nuevos modelos sin romper lo existente
5. **Rutas Dinámicas**: Implementar `[username]` y subsecciones
6. **Dashboard de Gestión**: Panel para editar perfil, posts, plantas
7. **Lanzamiento Beta**: Invitar a Mona como primera usuaria real

---

## 💡 Filosofía del Proyecto

> "No más ruido tóxico de redes sociales.
> No más algoritmos que deciden qué ves.
> Solo personas reales, con historias reales,
> compartiendo lo que aman de forma auténtica."

**degux.cl** se convierte en un refugio digital donde:
- La autenticidad prevalece sobre la viralidad
- El propósito supera a la vanidad métrica
- La comunidad se construye desde la confianza
- Cada perfil es una obra de arte personal

---

**Documentos Relacionados**:
- `PERFILERIA_PROTOTIPO_MONA.html` - Mockup visual del perfil de Mona
- `PERFILERIA_PITCH_MONA.md` - Pitch no-técnico para Mona
- `PERFILERIA_PLAN_IMPLEMENTACION.md` - Roadmap incremental
