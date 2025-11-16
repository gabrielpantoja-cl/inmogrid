# 🌱 Perfiles Públicos en degux.cl

**Última actualización**: 2025-11-16

---

## 📦 Lo que se ha implementado

### 1. Schema de Base de Datos ✅
- **Nuevos modelos**: `Post`, `Plant`, `Collection`
- **Campos de perfil en User**: `username`, `tagline`, `coverImageUrl`, `location`, `identityTags`, `externalLinks`, `customCss`
- **Archivo**: `prisma/schema.prisma`

### 2. APIs Públicas ✅
- `GET /api/public/profiles/[username]` - Obtener perfil público
- `GET /api/public/profiles/[username]/plants` - Plantas del usuario
- `GET /api/public/profiles/[username]/posts` - Posts publicados del usuario

### 3. Componentes UI ✅
- `ProfileHero` - Hero section con portada y foto
- `ProfileBio` - Biografía y detalles
- `SocialLinks` - Enlaces externos (WhatsApp, Instagram, LinkedIn, etc.)
- `PlantCard` - Card para mostrar plantas

### 4. Rutas Públicas ✅
- `/{username}` - Perfil completo del usuario
- `/{username}/plantas` - Colección de plantas
- **NO requieren autenticación** para ver

### 5. Seed de Datos ✅
- Script con datos de ejemplo para **Mona** y **Gabriel**
- Incluye plantas, posts y perfiles completos
- **Archivo**: `prisma/seed-profiles.ts`

---

## 🚀 Cómo probar en localhost

### Paso 1: Aplicar cambios a la base de datos

```bash
# Generar cliente Prisma con nuevos modelos
npm run prisma:generate

# Aplicar schema a base de datos (requiere conexión a DB)
npm run prisma:push
```

**Nota**: Si la base de datos local no está corriendo, puedes usar la del VPS mediante túnel SSH (ver más abajo).

### Paso 2: Poblar con datos de ejemplo

```bash
# Ejecutar seed de perfiles
npx tsx prisma/seed-profiles.ts
```

Este comando creará:
- ✅ Usuario `mona` con 6 plantas y 1 post
- ✅ Usuario `gabrielpantoja` con 1 post
- ✅ Perfiles públicos listos para ver

### Paso 3: Iniciar servidor de desarrollo

```bash
# Iniciar Next.js
npm run dev
```

### Paso 4: Ver los perfiles

Abre tu navegador en:
- **Mona**: [http://localhost:3000/mona](http://localhost:3000/mona)
- **Gabriel**: [http://localhost:3000/gabrielpantoja](http://localhost:3000/gabrielpantoja)

---

## 🌐 Usar base de datos del VPS (si no tienes PostgreSQL local)

Si no tienes PostgreSQL corriendo localmente, puedes conectarte a la base de datos del VPS:

### Opción 1: Túnel SSH manual

```bash
# En una terminal, crear túnel
ssh -N -L 15432:localhost:5433 gabriel@167.172.251.27

# En otra terminal, ejecutar migraciones y seed
npm run prisma:push
npx tsx prisma/seed-profiles.ts
```

### Opción 2: Script automático

```bash
# Usa el script que ya existe
npm run dev:full
```

**Importante**: Verifica que tu archivo `.env` tenga la variable correcta:
```env
POSTGRES_PRISMA_URL="postgresql://degux_user:PASSWORD@167.172.251.27:5433/degux?schema=public&sslmode=require"
```

---

## 📂 Estructura de Archivos Creados

```
degux.cl/
├── prisma/
│   ├── schema.prisma                        # ✅ Actualizado con Post, Plant, Collection
│   └── seed-profiles.ts                     # ✅ Nuevo - Seed de datos de ejemplo
├── src/
│   ├── app/
│   │   ├── [username]/
│   │   │   ├── page.tsx                     # ✅ Nuevo - Perfil público
│   │   │   └── plantas/
│   │   │       └── page.tsx                 # ✅ Nuevo - Colección de plantas
│   │   └── api/
│   │       └── public/
│   │           └── profiles/
│   │               └── [username]/
│   │                   ├── route.ts         # ✅ Nuevo - API perfil
│   │                   ├── plants/
│   │                   │   └── route.ts     # ✅ Nuevo - API plantas
│   │                   └── posts/
│   │                       └── route.ts     # ✅ Nuevo - API posts
│   └── components/
│       └── ui/
│           └── profile/
│               ├── ProfileHero.tsx          # ✅ Nuevo
│               ├── ProfileBio.tsx           # ✅ Nuevo
│               ├── SocialLinks.tsx          # ✅ Nuevo
│               └── PlantCard.tsx            # ✅ Nuevo
├── docs/
│   ├── 01-introduccion/
│   │   ├── PERFILERIA_HUMANA_VISION.md      # Documentación de visión
│   │   └── PERFILERIA_PITCH_MONA.md         # Pitch para Mona
│   └── 02-desarrollo/
│       ├── PERFILERIA_PLAN_IMPLEMENTACION.md# Plan completo
│       └── PERFILES_README.md               # ✅ Este archivo
```

---

## 🧪 Probar las APIs Públicas

### Obtener perfil de Mona

```bash
curl http://localhost:3000/api/public/profiles/mona | jq
```

### Obtener plantas de Mona

```bash
curl http://localhost:3000/api/public/profiles/mona/plants | jq
```

### Obtener solo plantas favoritas

```bash
curl "http://localhost:3000/api/public/profiles/mona/plants?favorites=true" | jq
```

### Obtener posts de Gabriel

```bash
curl http://localhost:3000/api/public/profiles/gabrielpantoja/posts | jq
```

---

## ✏️ Editar datos de ejemplo

Si quieres modificar los datos de Mona o Gabriel:

1. Abre el archivo `prisma/seed-profiles.ts`
2. Modifica los objetos de usuario, plantas o posts
3. Vuelve a ejecutar el seed:
   ```bash
   npx tsx prisma/seed-profiles.ts
   ```

**Nota**: El seed usa `upsert`, por lo que puedes ejecutarlo múltiples veces sin duplicar datos.

---

## 🎨 Personalizar el diseño

Los componentes UI están en `src/components/ui/profile/`. Puedes modificar:

- **Colores**: Edita las clases de Tailwind CSS
- **Layout**: Modifica la estructura en los componentes
- **Imágenes por defecto**: Cambia las URLs en los componentes

Ejemplo en `ProfileHero.tsx`:
```typescript
const defaultCover = 'linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%)';
```

---

## 🔐 Permisos y Autenticación

### Ver perfiles (Público)
- ❌ **NO requiere autenticación**
- ✅ Cualquiera puede ver perfiles públicos

### Crear/Editar perfil (Privado)
- ✅ **Requiere autenticación**
- Dashboard para gestionar contenido (próximamente)

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"

**Solución 1**: Verifica que PostgreSQL esté corriendo
```bash
sudo systemctl status postgresql
```

**Solución 2**: Usa túnel SSH al VPS
```bash
ssh -N -L 15432:localhost:5433 gabriel@167.172.251.27
```

### Error: "User with email already exists"

**Solución**: El seed usa `upsert`, así que esto no debería pasar. Si ocurre, limpia los datos:
```bash
npx prisma studio
# Eliminar manualmente los usuarios mona@degux.cl y gabriel@degux.cl
```

### Perfil no se muestra (404)

**Verificar**:
1. ¿Ejecutaste el seed? → `npx tsx prisma/seed-profiles.ts`
2. ¿El campo `isPublicProfile` es `true`? → Revisar en Prisma Studio
3. ¿El campo `username` existe? → Debe ser `'mona'` o `'gabrielpantoja'`

### Imágenes no cargan

**Solución**: Las imágenes en el seed usan Unsplash (requiere internet). Si no cargas, puedes:
1. Usar placeholders: `https://ui-avatars.com/api/?name=Nombre`
2. Subir tus propias imágenes (cuando implementes upload)

---

## 📚 Próximos Pasos

### Fase 2: Dashboard de Gestión
- [ ] Crear `/dashboard/mi-perfil` para editar perfil
- [ ] Crear `/dashboard/mi-perfil/plantas` para gestionar plantas
- [ ] Crear `/dashboard/mi-perfil/posts` para gestionar posts
- [ ] Implementar upload de imágenes (Digital Ocean Spaces)

### Fase 3: Funcionalidades Avanzadas
- [ ] Sistema de colecciones temáticas
- [ ] Markdown editor para posts
- [ ] Detalle de planta individual (`/[username]/plantas/[slug]`)
- [ ] Detalle de post individual (`/[username]/notas/[slug]`)

### Fase 4: SEO y Performance
- [ ] Meta tags dinámicos (ya implementados parcialmente)
- [ ] Open Graph images
- [ ] Sitemap dinámico
- [ ] Image optimization con Next.js Image

---

## 📞 Contacto

Si tienes dudas o encuentras errores, revisa:
- **Documentación técnica**: `docs/01-introduccion/PERFILERIA_HUMANA_VISION.md`
- **Plan de implementación**: `docs/02-desarrollo/PERFILERIA_PLAN_IMPLEMENTACION.md`
- **Pitch para Mona**: `docs/01-introduccion/PERFILERIA_PITCH_MONA.md`

---

**Listo para ver `localhost:3000/mona` en acción 🌱**
