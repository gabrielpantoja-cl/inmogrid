# inmogrid.cl - Ecosistema Digital Colaborativo 🏗️

[![Project Status: Active Development](https://img.shields.io/badge/status-active%20development-brightgreen)](https://github.com/gabrielpantoja-cl/inmogrid.cl)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![API Status](https://img.shields.io/badge/API%20P%C3%BAblica-Disponible-success)](#-api-pública)
[![Statistics Module](https://img.shields.io/badge/Estadísticas%20Avanzadas-Completo-brightgreen)](#-módulo-de-estadísticas-avanzadas)
[![Infrastructure](https://img.shields.io/badge/VPS-Digital%20Ocean-blue)](#%EF%B8%8F-infraestructura-actual)

**Plataforma colaborativa de datos inmobiliarios abiertos para Chile, con foco en la región del Sur**

Ecosistema digital que democratiza el acceso a información inmobiliaria de origen público, construyendo la infraestructura base de datos del mercado inmobiliario del sur de Chile y expandiendo gradualmente a nivel nacional.

---

## 🎯 Visión del Proyecto

**De PropTech regional a InfraTech nacional**: Transformarnos en la infraestructura base de datos inmobiliarios para Valdivia, Los Ríos y zona sur, siendo la "Bloomberg del mercado inmobiliario chileno".

### Filosofía Core:
- 🌐 **Datos Abiertos**: Información de origen público accesible para todos
- 🤝 **Crowdsourcing**: Los usuarios aportan datos, todos se benefician
- 🔌 **API-First**: Otros desarrolladores pueden construir sobre nuestra infraestructura
- 💰 **Freemium Radical**: Tasaciones gratuitas, monetización vía servicios enterprise
- 🚀 **Open Source**: Herramientas libres y conocimiento compartido

---

## 📋 Tabla de Contenidos

- [Estado del Proyecto](#-estado-del-proyecto)
- [Infraestructura Actual](#%EF%B8%8F-infraestructura-actual)
- [Componentes del Ecosistema](#-componentes-del-ecosistema)
- [API Pública](#-api-pública)
- [Módulo de Estadísticas Avanzadas](#-módulo-de-estadísticas-avanzadas)
- [Tech Stack](#-tech-stack)
- [Roadmap](#-roadmap)
- [Instalación](#-instalación-y-configuración)
- [Contribuciones](#-contribuciones)

---

## 🚀 Estado del Proyecto

### ✅ Funcionalidades Completadas (Fase 0)

#### Infraestructura Productiva
- ✅ **VPS Digital Ocean** - 7 servicios activos, 99%+ uptime
- ✅ **Nginx Proxy** - Gateway con SSL automático (Let's Encrypt)
- ✅ **Portainer** - Gestión visual de Docker
- ✅ **N8N Automation** - Workflows de scraping y notificaciones
- ✅ **PostgreSQL + PostGIS** - Base de datos geoespacial

#### Aplicación Core
- ✅ **API Pública** - REST endpoints sin autenticación, CORS habilitado
- ✅ **Estadísticas Avanzadas** - Análisis interactivo con reportes PDF para CBR
- ✅ **Autenticación Google OAuth** - Sistema seguro y estable
- ✅ **Gestión CRUD Referenciales** - Interfaz optimizada para tasadores
- ✅ **Data Ingestion Automatizada** - Scraping de Portal Inmobiliario y Mercado Libre

### 🔄 En Desarrollo (Fase 1)

- 🔄 **Sistema de Perfiles Profesionales** - 40% completado (schema diseñado)
- 🔜 **Gestión de Propiedades por Usuario** - Modelo descentralizado
- 🔜 **Base de datos escalable** - Decisión entre Neon vs VPS PostgreSQL

### 📅 Planificado (Fases 2-5)

- 🔜 **Networking** - Red de profesionales + foro + mensajería
- 🔜 **Blog & Data Stories** - Centro de contenido educativo
- 🔜 **Sofía (Bot RAG)** - Asistente IA con contexto de mercado
- 🔜 **CRM Inmobiliario** - Pipeline de ventas para corredores

---

## 🖥️ Infraestructura Actual

### VPS Digital Ocean (Productivo desde Agosto 2025)

**IP:** VPS_IP_REDACTED
**Documentación:** `/vps-do-docs/`
**Estado:** ✅ Operativo - 7 servicios activos

#### Servicios Core:

| Servicio | Puerto | Estado | Descripción |
|----------|--------|--------|-------------|
| **Nginx** | 80/443 | ✅ Running | Proxy reverso con SSL |
| **Portainer** | 9443 | ✅ Running | Panel de admin Docker |
| **N8N** | 5678 | ✅ Healthy | Automatización workflows |
| **PostgreSQL** | Interno | ✅ Healthy | Base de datos principal |
| **Redis** | Interno | ✅ Healthy | Cache N8N |

#### Arquitectura:
```
Internet
  ↓
Nginx Proxy (80/443)
  ├─ N8N (N8N_HOST_REDACTED)
  ├─ inmogrid.cl App (en desarrollo)
  └─ Otros servicios

Portainer (9443) → Gestión independiente
```

### Filosofía de Infraestructura:
- ✅ **Sostenible y Reproducible** - Todo como código (Docker Compose)
- ✅ **Infraestructura como Código** - Repositorio `vps-do`
- ✅ **Documentación Viviente** - `vps-do-docs` con estado real
- ✅ **Modular** - Servicios independientes, fácil escalamiento

---

## 🌐 Componentes del Ecosistema

### ✅ Implementados

#### 1. **Mapa con Estadísticas Avanzadas** ✅
**Ruta:** `/dashboard/estadisticas`

- Mapa interactivo con PostGIS + React Leaflet
- Selección de áreas con herramienta de círculo
- 6 tipos de gráficos (scatter, tendencias, histogramas)
- Reportes PDF de 3 páginas para CBR
- Integración completa con datos del Conservador

**[Ver documentación completa →](docs/ADVANCED_STATISTICS_MODULE_GUIDE.md)**

#### 2. **Data Ingestion Automatizada (N8N)** ✅

- ✅ Scraping Portal Inmobiliario
- ✅ Scraping Mercado Libre
- ✅ Notificaciones Gmail
- ✅ Persistencia en PostgreSQL
- ✅ Frecuencia configurable

#### 3. **API Pública** ✅

REST API sin autenticación para integración externa:

```javascript
fetch('https://inmogrid.cl/api/public/map-data?comuna=valdivia')
  .then(res => res.json())
  .then(data => console.log(data));
```

**[Ver documentación de API →](#-api-pública)**

---

### 🔜 En Desarrollo (Fase 1)

#### 4. **Sistema de Perfiles Profesionales** 🔄
**Prioridad:** ALTA (Base para todo lo demás)

**Modelos diseñados:**
- `User` - Perfil extendido con bio, profesión, empresa, región
- `Property` - Propiedades listadas por usuarios
- `Connection` - Red de networking entre profesionales

**Rutas planificadas:**
- `/dashboard/perfil` - Editar mi perfil
- `/networking/[userId]` - Perfil público
- `/networking/mis-propiedades` - Mis propiedades

**Estado:** Schema diseñado, pendiente decisión de BD y API implementation

---

### 🔜 Planificados (Fases 2-5)

#### 5. **Networking - Red de Profesionales** 🔜
**Fase 2 (Oct-Nov 2025)**

- Directorio de profesionales (corredores, tasadores, arquitectos)
- Sistema de conexiones (LinkedIn-style)
- Foro de discusión por categorías
- Mensajería privada entre conexiones
- Búsqueda por región/especialidad

#### 6. **Blog y Centro de Datos** 🔜
**Fase 3 (Nov-Dic 2025)**

- Blog educativo con MDX support
- Data stories con visualizaciones interactivas
- Reportes de mercado automatizados (vía N8N)
- SEO optimizado para captar tráfico orgánico
- CMS para administradores y autores invitados

#### 7. **Sofía - Agente Bot RAG** 🔜
**Fase 4 (Dic 2025-Ene 2026)**

- RAG sobre base de datos de referenciales
- Vector DB (Supabase pgvector o Pinecone)
- Contexto sobre tasaciones, documentos CBR/SII, mercado
- Widget flotante disponible globalmente
- Casos de uso: consultas de mercado, explicación legal, búsqueda de propiedades

#### 8. **CRM Inmobiliario** 🔜
**Fase 5 (Feb-Mar 2026)**

- Gestión de clientes y leads
- Pipeline visual (Kanban drag & drop)
- Automatización de tareas y recordatorios
- Reportes de desempeño
- Integración con propiedades de usuario

---

### ❌ Componentes Excluidos (Filosofía Descentralizada)

#### No habrá página de propiedades dedicada
- ❌ Sin listado centralizado `/propiedades`
- ✅ Propiedades visibles en perfil de cada usuario/corredor
- **Razón:** Fomenta networking y visibilidad de profesionales

#### No habrá página "Quiénes Somos"
- ❌ Sin página institucional tradicional
- ✅ Información integrada en landing + FAQ
- **Razón:** Foco en comunidad, no en la empresa

---

## 🔌 API Pública

### Acceso Rápido

```javascript
// Obtener datos del mapa
fetch('https://inmogrid.cl/api/public/map-data')
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      console.log('Referencias:', result.data);
    }
  });
```

### Endpoints Disponibles

| Endpoint | Método | Descripción | Parámetros |
|----------|--------|-------------|------------|
| `/api/public/map-data` | GET | Datos de referenciales | `comuna`, `anio`, `limit` |
| `/api/public/map-config` | GET | Metadatos de la API | - |
| `/api/public/health` | GET | Health check | `stats` (opcional) |
| `/api/public/docs` | GET | Documentación completa | - |

### Características

- ✅ **Sin autenticación** - Completamente pública
- ✅ **CORS habilitado** - Funciona desde cualquier dominio
- ✅ **Datos en tiempo real** - Directamente desde PostgreSQL
- ✅ **Filtros disponibles** - Comuna, año, límite
- ✅ **PostGIS integrado** - Datos geoespaciales precisos

### Ejemplo React + Leaflet

```tsx
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';

const ReferencialMap = () => {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    fetch('https://inmogrid.cl/api/public/map-data')
      .then(res => res.json())
      .then(result => {
        if (result.success) setPoints(result.data);
      });
  }, []);

  return (
    <MapContainer center={[-39.8196, -73.2452]} zoom={10}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {points.map(point => (
        <CircleMarker key={point.id} center={[point.lat, point.lng]}>
          <Popup>
            <div>
              <h3>{point.predio}</h3>
              <p><strong>Comuna:</strong> {point.comuna}</p>
              <p><strong>Monto:</strong> ${point.monto?.toLocaleString()}</p>
              <p><strong>Superficie:</strong> {point.superficie} m²</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};
```

**[Ver más ejemplos →](docs/integration-examples/)**

---

## 📊 Módulo de Estadísticas Avanzadas

### Características Principales

- 🗺️ **Mapa Interactivo** - Selección de áreas mediante círculos
- 📈 **Análisis en Tiempo Real** - 6 tipos de gráficos diferentes
- 📊 **Estadísticas Siempre Visibles** - Métricas clave permanentes
- 📄 **Reportes PDF Completos** - 3 páginas optimizado para CBR

### Estructura del Reporte PDF

| Página | Formato | Contenido |
|--------|---------|-----------|
| **1** | Vertical | Resumen ejecutivo + gráfico principal |
| **2** | Horizontal | Tabla completa para CBR (fojas, número, año, ROL) |
| **3** | Vertical | Información adicional y guía de campos |

### Integración con Conservador de Bienes Raíces (CBR)

El reporte PDF incluye **todos los campos requeridos**:

- ✅ Fojas, Número, Año
- ✅ CBR correspondiente
- ✅ ROL de avalúo fiscal
- ✅ Fecha de escritura
- ✅ Comuna, Superficie, Monto

### Acceso

```
Dashboard → Estadísticas → /dashboard/estadisticas
```

1. Seleccionar área dibujando círculo
2. Revisar estadísticas actualizadas
3. Cambiar tipo de gráfico
4. Generar PDF completo
5. Imprimir listado optimizado

**[Documentación completa →](docs/ADVANCED_STATISTICS_MODULE_GUIDE.md)**

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15.2.0 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **UI:** React 19
- **Mapas:** React Leaflet
- **Gráficos:** Recharts
- **PDF:** jsPDF + html2canvas

### Backend
- **Database:** PostgreSQL 15 + PostGIS
- **ORM:** Prisma
- **Auth:** NextAuth.js v4 (Google OAuth)
- **API:** Next.js API Routes (REST)

### Infraestructura
- **VPS:** Digital Ocean Droplet
- **Container:** Docker + Docker Compose
- **Proxy:** Nginx + Let's Encrypt SSL
- **Automation:** N8N
- **Monitoring:** Portainer
- **Cache:** Redis

### DevOps
- **CI/CD:** GitHub Actions (planificado)
- **Registry:** GitHub Container Registry
- **Backups:** Automatizados vía Docker volumes
- **Docs:** Markdown + GitHub

---

## 📅 Roadmap

### ✅ Fase 0: Infraestructura Base (COMPLETADA - Agosto 2025)

- [x] VPS Digital Ocean configurado
- [x] Nginx + SSL automático
- [x] Portainer para gestión Docker
- [x] N8N + PostgreSQL + Redis
- [x] Workflows de scraping Portal Inmobiliario
- [x] Workflows de scraping Mercado Libre
- [x] Backups automatizados
- [x] Documentación en vps-do-docs

**Resultado:** Infraestructura productiva con 7 servicios activos

---

### 🔄 Fase 1: Perfiles de Usuario (EN PROGRESO - Sept-Oct 2025)
**Duración:** 1-2 semanas | **Prioridad:** ALTA | **Estado:** 40% completado

#### ✅ Completado:
- [x] Diseño de modelos Prisma (User, Property, Connection)
- [x] Enums (ProfessionType, PropertyType, PropertyStatus)
- [x] Schema validado y generado

#### 🔄 En Progreso:
- [ ] **Decisión de Base de Datos** (Neon vs VPS PostgreSQL)
- [ ] Aplicar schema a BD elegida
- [ ] Migración de datos existentes

#### 🔜 Pendiente:
- [ ] APIs de perfil (GET, PUT /api/users/profile)
- [ ] APIs de propiedades (CRUD /api/properties)
- [ ] Página `/dashboard/perfil`
- [ ] Página `/networking/[userId]`
- [ ] Sección `/networking/mis-propiedades`

**Entregables:**
- Sistema funcional de perfiles profesionales
- Usuarios pueden publicar y gestionar propiedades
- Perfiles públicos accesibles vía URL

---

### 🔜 Fase 2: Networking y Conexiones (Oct-Nov 2025)
**Duración:** 2-3 semanas | **Prioridad:** ALTA

- [ ] Sistema de conexiones (solicitudes, aceptar/rechazar)
- [ ] Directorio de profesionales con filtros
- [ ] Mensajería básica 1-a-1
- [ ] Foro de discusión con categorías
- [ ] Notificaciones vía N8N

---

### 🔜 Fase 3: Blog y Centro de Datos (Nov-Dic 2025)
**Duración:** 2 semanas | **Prioridad:** MEDIA

- [ ] Blog sistema con MDX support
- [ ] CMS para autores (admin + invited)
- [ ] Data stories con gráficos interactivos
- [ ] Reportes de mercado automatizados (N8N)
- [ ] 10 posts educativos iniciales

---

### 🔜 Fase 4: Sofía - Bot RAG (Dic 2025-Ene 2026)
**Duración:** 3-4 semanas | **Prioridad:** MEDIA-ALTA

- [ ] Vector DB setup (Supabase pgvector o Pinecone)
- [ ] Embeddings de referenciales + blog + docs
- [ ] Integración Anthropic Claude API
- [ ] Widget flotante global
- [ ] Historial de conversaciones por usuario

**Casos de uso:**
- "¿Cuál es el precio promedio en Valdivia Centro?"
- "Explica cómo hacer una tasación MOP"
- "¿Qué documentos necesito del CBR?"

---

### 🔜 Fase 5: CRM Inmobiliario (Feb-Mar 2026)
**Duración:** 4-5 semanas | **Prioridad:** MEDIA

- [ ] Modelos: CrmClient, CrmDeal, CrmNote, CrmTask
- [ ] Pipeline Kanban (drag & drop)
- [ ] Automatizaciones de tareas
- [ ] Reportes de métricas
- [ ] Integración con Property model

---

## 💰 Modelo de Monetización

### Revenue Streams Actuales (Mantener)
1. **Tasaciones MOP** - Contratos gubernamentales
2. **Tasaciones privadas** - Clientes particulares
3. **Corretaje tradicional** - Propiedades en venta

### Nuevos Revenue Streams (Escalables)

#### 1. Freemium Tasaciones
- **Free:** Tasaciones automáticas (contribuyendo datos)
- **Pro:** Tasaciones certificadas ($20k-50k CLP)
- **Enterprise:** API access para bancos

#### 2. Suscripciones CRM (Post Fase 5)
- **Free:** Hasta 10 clientes
- **Profesional:** $15k CLP/mes - Clientes ilimitados
- **Equipo:** $40k CLP/mes - Multi-usuario + reportes

#### 3. Data Services B2B
- Licencias de datos agregados
- Reports de mercado zona sur ($100k-300k CLP)
- Consultoría en automatización

#### 4. Featured Listings (Post Fase 1)
- Propiedades destacadas: $5k CLP/mes
- Destacado en directorio: $10k CLP/mes

---

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js v18+
- npm o yarn
- Git
- PostgreSQL 15+ con PostGIS

### Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/gabrielpantoja-cl/inmogrid.cl.git
cd inmogrid.cl
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

4. **Sincronizar schema de base de datos:**
```bash
npx prisma db push
npx prisma generate
```

5. **Iniciar servidor de desarrollo:**
```bash
npm run dev
```

6. **Probar API pública:**
```bash
./scripts/test-api-public.sh
```

### Variables de Entorno

```env
# Database
POSTGRES_PRISMA_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Auth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_random_secret"

# Optional
NEXT_PUBLIC_CALLBACK_URL="http://localhost:3000/api/auth/callback/google"
```

---

## 🧪 Scripts Útiles

```bash
# Desarrollo
npm run dev               # Servidor de desarrollo con Turbo
npm run build             # Build de producción

# Testing
npm run test              # Jest tests completos
npm run test:watch        # Jest en modo watch
npm run test:public-api   # Tests de API pública

# Base de datos
npm run prisma:generate   # Generar cliente Prisma
npm run prisma:push       # Aplicar schema a DB
npm run prisma:studio     # Abrir Prisma Studio
npm run prisma:reset      # Reset completo

# Validación
npm run lint              # ESLint
npx tsc --noEmit         # TypeScript check
```

---

## 📊 Métricas de Éxito (6 meses)

### Infraestructura ✅
- [x] VPS 99%+ uptime
- [x] 7 servicios activos
- [x] Backups automatizados

### Datos
- **Objetivo:** 5,000+ propiedades Los Ríos
- **Actual:** ~1,000+ (Portal + Mercado Libre)
- **Gap:** Implementar CBR + SII + crowdsourcing

### Producto (Fase 1-2)
- [ ] 100+ usuarios registrados
- [ ] 50+ propiedades listadas
- [ ] 20+ conexiones activas
- [ ] 5+ posts blog (>100 visitas c/u)

### Negocio
- Mantener tasaciones MOP (revenue base)
- $2M+ CLP/mes revenue total
- 3+ clientes B2B
- 2+ suscripciones CRM (post Fase 5)

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas!

### Para Desarrolladores

1. **Fork el proyecto**
2. **Crea una rama** (`git checkout -b feature/AmazingFeature`)
3. **Commit cambios** (`git commit -m 'Add AmazingFeature'`)
4. **Push a la rama** (`git push origin feature/AmazingFeature`)
5. **Abre un Pull Request**

### Para Integraciones Externas

Si quieres integrar la API pública:

1. **Revisa la documentación**: [API Docs](#-api-pública)
2. **Usa los ejemplos**: Disponibles en [`docs/integration-examples/`](docs/integration-examples/)
3. **Módulo de estadísticas**: [`docs/ADVANCED_STATISTICS_MODULE_GUIDE.md`](docs/ADVANCED_STATISTICS_MODULE_GUIDE.md)
4. **Reporta issues**: Si encuentras problemas

---

## 📝 Reportar Problemas

¿Encontraste un bug o tienes una sugerencia?

### GitHub Issues
- 🐛 **Bugs**: Incluye pasos para reproducir
- 💡 **Mejoras**: Nuevas funcionalidades
- ❓ **Preguntas**: Sobre uso o integración
- 📊 **Estadísticas**: Problemas con análisis o PDFs
- 🌐 **API**: Problemas de integración externa

**[Crear nuevo issue →](https://github.com/gabrielpantoja-cl/inmogrid.cl/issues/new)**

---

## 📚 Documentación Adicional

### Guías Técnicas
- **[Plan de Trabajo V3](docs/01-introduccion/Plan_Trabajo_Ecosistema_Digital_V3.md)** - Roadmap completo
- **[Guía de Autenticación](docs/GUIA-DEFINITIVA-AUTENTICACION.md)** - Debugging OAuth
- **[Estadísticas Avanzadas](docs/ADVANCED_STATISTICS_MODULE_GUIDE.md)** - Módulo completo
- **[Guía de Integración API](docs/integration-examples/integration-guide.md)** - Ejemplos externos

### Infraestructura
- **[VPS Guide](vps-do-docs/guides/vps-guide.md)** - Gestión del servidor
- **[N8N Guide](vps-do-docs/services/n8n/n8n-guide.md)** - Automatización workflows
- **[Scraping Portal](vps-do-docs/projects/portalinmobiliario-complete-guide.md)** - Data ingestion

---

## 👥 Equipo

**Gabriel** - Tech Lead (Backend, Infraestructura, Data)
**Mona** - Product Lead (Frontend, UX/UI, Estrategia)

### Organización
- **GitHub Org:** pp-technologies (en configuración)
- **Repositorio actual:** inmogrid.cl
- **Repositorio infra:** vps-do (privado)
- **Docs:** vps-do-docs

---

## 📄 Licencia

Este proyecto está licenciado bajo la [Licencia MIT](https://opensource.org/licenses/MIT).

---

## 🌟 ¿Usas inmogrid.cl?

Si estás integrando la API pública o usando el módulo de estadísticas, ¡nos encantaría saberlo!

### Enlaces
- **API Pública:** `/api/public`
- **Estadísticas:** `/dashboard/estadisticas`
- **GitHub:** [inmogrid.cl](https://github.com/gabrielpantoja-cl/inmogrid.cl)
- **VPS Status:** [vps-status.md](vps-do-docs/reports/vps-status-20250908.md)

### Contacto
- **Issues:** Para reportar problemas
- **Discussions:** Para compartir casos de uso
- **Ejemplos:** Contribuye con ejemplos
- **Feedback:** Comparte tu experiencia

---

*Proyecto en desarrollo activo - Última actualización: Septiembre 2025*
