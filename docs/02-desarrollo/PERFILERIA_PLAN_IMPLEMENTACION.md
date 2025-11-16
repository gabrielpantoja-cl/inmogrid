# Plan de Implementación: Perfilería Humana en degux.cl

**Fecha**: 2025-11-16
**Proyecto**: degux.cl - Perfiles Personales
**Versión**: 1.0
**Estado**: Diseño Aprobado

---

## 🎯 Objetivo

Implementar sistema de perfiles personales en degux.cl, comenzando con **Vivero Mapu (Mona)** como proyecto piloto y luego escalando a otros usuarios.

---

## 📋 Fases de Implementación

### **FASE 0: Preparación y Diseño** ✅ COMPLETADO
**Duración**: 1 día
**Estado**: Completado (2025-11-16)

**Entregables**:
- [x] Documento de visión (`PERFILERIA_HUMANA_VISION.md`)
- [x] Prototipo visual HTML (`PERFILERIA_PROTOTIPO_MONA.html`)
- [x] Pitch no-técnico para Mona (`PERFILERIA_PITCH_MONA.md`)
- [x] Este plan de implementación

---

### **FASE 1: Arquitectura Base** 🔨
**Duración estimada**: 3-4 días
**Prioridad**: ALTA

#### 1.1 Evolución del Schema Prisma
**Archivos a modificar**: `prisma/schema.prisma`

**Nuevos modelos**:
```prisma
model Post {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  title           String
  slug            String   @unique
  content         String
  excerpt         String?
  coverImageUrl   String?

  published       Boolean  @default(false)
  publishedAt     DateTime?

  tags            String[]
  readTime        Int?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId, published])
  @@index([slug])
}

model Plant {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  name            String
  slug            String   @unique
  scientificName  String?
  description     String?
  careInstructions String?

  imageUrls       String[] @default([])
  mainImageUrl    String?

  inStock         Boolean  @default(true)
  stockQuantity   Int?
  priceBuying     Int?
  priceSelling    Int?

  category        String?
  difficulty      String?
  sunlight        String?
  watering        String?

  featured        Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId, inStock])
  @@index([slug])
}

model Collection {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  name            String
  slug            String   @unique
  description     String?
  coverImageUrl   String?

  items           Json     // Flexible array de items

  isPublic        Boolean  @default(true)
  featured        Boolean  @default(false)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId, isPublic])
  @@index([slug])
}
```

**Evolución del modelo User**:
```prisma
model User {
  // ... campos existentes ...

  // 🆕 NUEVOS CAMPOS
  username         String?  @unique
  tagline          String?
  coverImageUrl    String?
  location         String?
  identityTags     String[]
  externalLinks    Json?
  customCss        String?

  // 🆕 NUEVAS RELACIONES
  posts            Post[]
  plants           Plant[]
  collections      Collection[]
}
```

**Comandos**:
```bash
npx prisma db push
npx prisma generate
```

#### 1.2 Configuración de Storage (Digital Ocean Spaces)
**Propósito**: Almacenar imágenes de perfiles, plantas, posts

**Variables de entorno**:
```env
DO_SPACES_KEY=your_spaces_key
DO_SPACES_SECRET=your_spaces_secret
DO_SPACES_ENDPOINT=https://sfo3.digitaloceanspaces.com
DO_SPACES_BUCKET=degux-media
DO_SPACES_REGION=sfo3
```

**Dependencia**:
```bash
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage
```

**Archivo a crear**: `src/lib/storage.ts`

---

### **FASE 2: MVP Vivero Mapu** 🌱
**Duración estimada**: 5-7 días
**Prioridad**: ALTA
**Usuario piloto**: Mona

#### 2.1 Perfil Público de Usuario
**Rutas a crear**:
- `app/[username]/page.tsx` - Perfil principal
- `app/[username]/layout.tsx` - Layout con navegación

**Componentes**:
- `ProfileHero.tsx` - Sección hero con portada y foto
- `ProfileBio.tsx` - Biografía y descripción
- `ProfileNav.tsx` - Navegación del perfil
- `SocialLinks.tsx` - Enlaces externos

**APIs**:
- `GET /api/public/profiles/[username]` - Obtener perfil público

#### 2.2 Catálogo de Plantas (Vivero)
**Rutas a crear**:
- `app/[username]/vivero/page.tsx` - Catálogo de plantas
- `app/[username]/vivero/[slug]/page.tsx` - Detalle de planta

**Componentes**:
- `PlantCard.tsx` - Card de planta en grid
- `PlantDetail.tsx` - Vista detallada de planta
- `PlantFilters.tsx` - Filtros por categoría, stock, precio
- `PlantGrid.tsx` - Grid responsive de plantas

**APIs**:
- `GET /api/public/profiles/[username]/plants` - Listar plantas públicas
- `GET /api/public/profiles/[username]/plants/[slug]` - Detalle de planta

#### 2.3 Plantas Favoritas (Colección)
**Rutas a crear**:
- `app/[username]/favoritas/page.tsx` - Colección de plantas favoritas

**Componentes**:
- `FavoritePlantsCollection.tsx` - Muestra colección especial

#### 2.4 Dashboard de Gestión (Mona)
**Rutas protegidas**:
- `app/dashboard/mi-perfil/page.tsx` - Editar perfil
- `app/dashboard/mi-perfil/plantas/page.tsx` - Gestión de plantas
- `app/dashboard/mi-perfil/plantas/nueva/page.tsx` - Crear planta
- `app/dashboard/mi-perfil/plantas/[id]/editar/page.tsx` - Editar planta
- `app/dashboard/mi-perfil/colecciones/page.tsx` - Gestión de colecciones

**Componentes de formularios**:
- `PlantForm.tsx` - Formulario de planta con upload de imágenes
- `ProfileEditForm.tsx` - Editar perfil
- `ImageUploader.tsx` - Upload múltiple de imágenes

**APIs privadas**:
- `POST /api/plants` - Crear planta
- `PUT /api/plants/[id]` - Actualizar planta
- `DELETE /api/plants/[id]` - Eliminar planta
- `POST /api/plants/[id]/images` - Upload de imágenes

---

### **FASE 3: Blog Personal (Posts)** 📝
**Duración estimada**: 3-4 días
**Prioridad**: MEDIA

#### 3.1 Sistema de Posts
**Rutas a crear**:
- `app/[username]/notas/page.tsx` - Lista de posts
- `app/[username]/notas/[slug]/page.tsx` - Post individual

**Componentes**:
- `PostCard.tsx` - Card de post
- `PostDetail.tsx` - Vista de post con markdown
- `PostList.tsx` - Lista paginada de posts

**Dashboard**:
- `app/dashboard/mi-perfil/notas/page.tsx` - Gestión de posts
- `app/dashboard/mi-perfil/notas/nueva/page.tsx` - Crear post
- `app/dashboard/mi-perfil/notas/[id]/editar/page.tsx` - Editar post

**Editor**:
- Markdown simple con preview
- Upload de imágenes en contenido
- Auto-save

**APIs**:
- `GET /api/public/profiles/[username]/posts` - Posts publicados
- `POST /api/posts` - Crear post
- `PUT /api/posts/[id]` - Actualizar post
- `DELETE /api/posts/[id]` - Eliminar post
- `POST /api/posts/[id]/publish` - Publicar/despublicar

---

### **FASE 4: Colecciones Flexibles** 🗂️
**Duración estimada**: 2-3 días
**Prioridad**: BAJA

#### 4.1 Sistema de Colecciones
**Rutas a crear**:
- `app/[username]/colecciones/page.tsx` - Lista de colecciones
- `app/[username]/colecciones/[slug]/page.tsx` - Colección individual

**Componentes**:
- `CollectionCard.tsx` - Card de colección
- `CollectionDetail.tsx` - Vista de colección con items

**Dashboard**:
- `app/dashboard/mi-perfil/colecciones/nueva/page.tsx` - Crear colección
- `app/dashboard/mi-perfil/colecciones/[id]/editar/page.tsx` - Editar colección

**Características**:
- Items de tipo mixto (plantas, posts, links externos)
- Orden personalizable (drag & drop)
- Portada personalizada

---

### **FASE 5: Perfil de Gabriel** 👨‍💻
**Duración estimada**: 2-3 días
**Prioridad**: MEDIA

#### 5.1 Perfil Profesional
**URL**: `degux.cl/gabrielpantoja`

**Secciones**:
- Perito Tasador (portfolio sin datos sensibles)
- Topografía & Webmapping
- PantojaPropiedades.cl
- Notas técnicas (blog)
- Casos reales anonimizados
- Links profesionales

**Sin catálogo de plantas**, pero con estructura similar adaptada.

---

### **FASE 6: Escalabilidad y Pulido** 🚀
**Duración estimada**: 3-5 días
**Prioridad**: MEDIA

#### 6.1 Mejoras de UX
- Sistema de búsqueda global de perfiles
- Directorio público de usuarios
- Perfiles destacados en home
- SEO optimizado por perfil
- Meta tags dinámicos

#### 6.2 Optimizaciones
- Image optimization (Next.js Image)
- Lazy loading de componentes
- Cache de perfiles públicos
- CDN para imágenes (DO Spaces CDN)

#### 6.3 Analytics (opcional)
- Vistas de perfil
- Clics en plantas
- Enlaces más visitados
- Dashboard de estadísticas para usuarios

---

## 🗓️ Timeline Completo

| Fase | Duración | Inicio Estimado | Fin Estimado |
|------|----------|-----------------|--------------|
| Fase 0: Preparación | 1 día | 2025-11-16 | 2025-11-16 ✅ |
| Fase 1: Arquitectura Base | 3-4 días | 2025-11-17 | 2025-11-21 |
| Fase 2: MVP Vivero Mapu | 5-7 días | 2025-11-22 | 2025-11-29 |
| Fase 3: Blog Personal | 3-4 días | 2025-11-30 | 2025-12-04 |
| Fase 4: Colecciones | 2-3 días | 2025-12-05 | 2025-12-08 |
| Fase 5: Perfil Gabriel | 2-3 días | 2025-12-09 | 2025-12-12 |
| Fase 6: Pulido | 3-5 días | 2025-12-13 | 2025-12-18 |

**Total estimado**: 19-26 días (aproximadamente 1 mes de trabajo)

**Lanzamiento beta**: Finales de Diciembre 2025

---

## 📦 Entregables por Fase

### Fase 1
- [x] Schema Prisma actualizado
- [ ] Migraciones aplicadas
- [ ] Storage S3 configurado
- [ ] Utility functions para upload de imágenes

### Fase 2 (MVP Vivero Mapu)
- [ ] Perfil público `degux.cl/mona` funcional
- [ ] Catálogo de plantas `degux.cl/mona/vivero`
- [ ] Dashboard de gestión para Mona
- [ ] Primera planta real subida
- [ ] Demo en vivo para Mona

### Fase 3
- [ ] Sistema de posts funcionando
- [ ] Editor markdown con preview
- [ ] Primera nota publicada por Mona (opcional)

### Fase 4
- [ ] Colecciones funcionales
- [ ] "Plantas Favoritas" de Mona creada

### Fase 5
- [ ] Perfil `degux.cl/gabrielpantoja` lanzado
- [ ] Portfolio de peritajes integrado

### Fase 6
- [ ] SEO optimizado
- [ ] Performance auditado
- [ ] Directorio público de perfiles
- [ ] Documentación de usuario

---

## 🎨 Assets Necesarios

### Para Mona (Fase 2)
- [ ] Foto de perfil (cuadrada, mínimo 400x400px)
- [ ] Imagen de portada (rectangular, mínimo 1600x400px)
- [ ] 6-10 fotos de plantas para catálogo (buena calidad)
- [ ] Descripciones de plantas (nombre, científico, cuidados, precio)
- [ ] 3-5 fotos de plantas favoritas
- [ ] Texto de biografía (2-3 párrafos)
- [ ] Links externos (WhatsApp, otros)

### Para Gabriel (Fase 5)
- [ ] Foto de perfil profesional
- [ ] Imagen de portada (mapas, topografía, naturaleza)
- [ ] Casos de estudio anonimizados
- [ ] Links profesionales (GitHub, LinkedIn)

---

## 🔒 Consideraciones de Seguridad

1. **Upload de Imágenes**:
   - Validación de tipo de archivo (solo imágenes)
   - Tamaño máximo: 5MB por imagen
   - Sanitización de nombres de archivo
   - Escaneo básico de malware (opcional)

2. **Permisos**:
   - Solo el dueño del perfil puede editar su contenido
   - Middleware de autenticación en todas las rutas de gestión
   - Verificación de ownership en APIs

3. **Contenido Público**:
   - Perfiles públicos por defecto (pero configurable)
   - Opción de ocultar plantas agotadas
   - Opción de despublicar posts

---

## 📊 Métricas de Éxito

### Fase 2 (MVP)
- [x] Mona puede ver su perfil público
- [ ] Mona puede agregar/editar/eliminar plantas
- [ ] Al menos 5 plantas reales en catálogo
- [ ] Primera consulta real vía WhatsApp desde degux.cl/mona

### Fase 3
- [ ] Al menos 1 post publicado
- [ ] Editor markdown fácil de usar

### Lanzamiento
- [ ] 2 perfiles completos (Mona + Gabriel)
- [ ] Al menos 10 plantas en Vivero Mapu
- [ ] Al menos 3 posts entre ambos perfiles
- [ ] Primera venta generada desde degux.cl/mona

---

## 🚧 Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Mona no provee assets a tiempo | Media | Alto | Usar placeholders temporales, comunicación clara de timeline |
| Problemas con storage S3 | Baja | Medio | Tener fallback local temporal, documentación clara de DO Spaces |
| Performance con muchas imágenes | Media | Medio | Implementar lazy loading, optimización Next.js Image desde inicio |
| Schema muy complejo | Baja | Alto | Empezar simple, iterar según necesidad real |

---

## 🎯 Próximo Paso Inmediato

**Acción**: Presentar pitch y prototipo a Mona

1. Abrir `PERFILERIA_PITCH_MONA.md` y leerlo con Mona
2. Mostrar `PERFILERIA_PROTOTIPO_MONA.html` en el navegador
3. Obtener su feedback y confirmación
4. Si aprueba, recopilar assets necesarios
5. Iniciar Fase 1 (Arquitectura Base)

---

## 📚 Documentación Relacionada

- `PERFILERIA_HUMANA_VISION.md` - Visión completa del proyecto
- `PERFILERIA_PROTOTIPO_MONA.html` - Prototipo visual
- `PERFILERIA_PITCH_MONA.md` - Pitch no-técnico
- `CLAUDE.md` - Documentación general de degux.cl
- `prisma/schema.prisma` - Schema actual de base de datos

---

**Notas Finales**:
- Este plan es flexible y puede ajustarse según feedback real de Mona
- Priorizar calidad sobre velocidad
- Mantener comunicación constante con Mona durante desarrollo
- Documentar decisiones importantes
- Celebrar cada hito completado

**Autor**: Gabriel Pantoja
**Última actualización**: 2025-11-16
**Revisión**: v1.0
