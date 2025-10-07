# Plan de Trabajo: P&P Technologies - Ecosistema Digital Colaborativo V2.1

**Fecha:** 01 de Octubre, 2025
**Autores:** Gabriel & Mona
**Versión:** 4.1 - Modelo Sin Suscripciones + Monetización de Blog
**Proyecto:** degux.cl (P&P Technologies / Pantoja & Partners)
**Repositorio:** https://github.com/gabrielpantoja-cl/degux.cl

**Changelog V4.1:**
- ✅ Eliminación total de planes de suscripción recurrentes
- ✅ Capa 2: Licencias perpetuas + soporte on-demand
- ✅ Capa 4: Sistema de créditos prepago (sin expiración)
- ✅ Capa 5 (NUEVA): Blog y contenido premium con sponsorships
- ✅ Proyección de revenue actualizada: $10-14M CLP/mes (18 meses)

---

## 🎯 Visión del Ecosistema Digital Colaborativo (ACTUALIZADA)

Transformar de **PropTech regional** a **InfraTech del mercado inmobiliario chileno**: construir la infraestructura colaborativa y de código abierto que democratice el acceso a datos inmobiliarios, comenzando por Los Ríos y expandiendo a nivel nacional.

### Concepto Clave: **"El GitHub del Sector Inmobiliario Chileno"**

Basados en investigación profunda del mercado (Gemini Deep Research - Oct 2025), validamos que el mercado chileno presenta tres brechas críticas de infraestructura:

1. **Abismo de Colaboración**: Ausencia de un verdadero MLS (Multiple Listing Service) abierto
2. **Frontera Rural**: Asimetría de información en parcelas de agrado
3. **Nicho Experto**: Complejidad en tasaciones de expropiación

### Pilares Estratégicos (Validados por Investigación)

- **Plataforma abierta** donde usuarios suben datos y acceden a análisis gratuitos
- **Crowdsourced data**: Los usuarios aportan datos, todos se benefician del conocimiento colectivo
- **API-first**: Otros desarrolladores pueden construir encima de nuestra infraestructura (integraciones con CRMs existentes como KiteProp, Wasi)
- **Freemium radical**: Core gratuito y open source, monetización vía servicios de valor agregado
- **MLS como estándar de facto**: Posicionar nuestro esquema de datos como el estándar de la industria
- **Datos como activo**: `degux-cl` se convierte en la "Bloomberg del mercado inmobiliario chileno"

### Diferenciador Clave vs Competencia

**No somos otro portal inmobiliario**, somos **infraestructura colaborativa**:

- **Vs. Portal Inmobiliario/Yapo**: Ellos venden visibilidad. Nosotros facilitamos colaboración entre corredores.
- **Vs. KiteProp/Wasi**: Ellos son CRMs cerrados con "MLS" propietario. Nosotros somos protocolo abierto compatible con todos.
- **Vs. Houm**: Ellos son verticales (arriendo/venta). Nosotros somos infraestructura horizontal.

**Nuestra ventaja**: En un mercado con caída del 18% en ventas y desconfianza generalizada hacia corredores, una plataforma **gratuita, abierta y colaborativa** resuelve el problema estructural de fragmentación y crea efectos de red imposibles de replicar.

---

## 🏗️ Infraestructura Actual (✅ YA IMPLEMENTADA)

### 🖥️ VPS - Servidor Productivo
**IP:** [IP_VPS]
**Estado:** ✅ Operativo desde Agosto 2025
**Documentación:** `/vps-do-docs/`

#### Servicios Core Activos:

1. **Nginx Proxy Reverso** ✅
   - Puerto 80/443 expuesto
   - Proxy para todos los servicios web
   - SSL configurado vía Let's Encrypt

2. **Portainer (Gestión Docker)** ✅
   - URL: `https://[URL_PORTAINER]`
   - Panel de administración visual
   - Gestión de contenedores, volúmenes, redes

3. **N8N (Automatización de Workflows)** ✅
   - URL: `http://n8n.degux.cl`
   - PostgreSQL + Redis incluidos
   - **Casos de uso actuales:**
     - Scraping de Portal Inmobiliario
     - Scraping de Mercado Libre
     - Automatización de correos (Gmail configurado)

4. **PostgreSQL (Base de Datos)** ✅
   - Instancia compartida con N8N
   - Usado para persistencia de scraping
   - **Disponible para proyectos adicionales**

#### Filosofía de Infraestructura:
- ✅ **Sostenible y Reproducible** - Todo como código en repositorio
- ✅ **Infraestructura como Código** - Docker Compose + GitHub
- ✅ **Documentación viviente** - vps-do-docs mantiene estado real
- ✅ **Modular** - Servicios independientes, fácil de escalar

---

## 🌐 Arquitectura de Componentes del Sitio Web

### ✅ Componentes YA IMPLEMENTADOS

#### 1. **Mapa con Estadísticas Avanzadas** ✅
- **Ruta:** `/dashboard/estadisticas`
- **Stack:** PostGIS + React Leaflet + Recharts
- **Features:**
  - Selección de áreas con herramienta de círculo
  - Estadísticas en tiempo real (precios, superficies, tendencias)
  - 6 tipos de gráficos: scatter, tendencias, histogramas
  - Generación de reportes PDF para CBR
  - Integración con datos del Conservador de Bienes Raíces

#### 2. **Data Ingestion Automatizada (N8N)** ✅
- **Workflows activos:**
  - Portal Inmobiliario scraping
  - Mercado Libre scraping
  - Notificaciones vía Gmail
- **Base de datos:** PostgreSQL en VPS
- **Frecuencia:** Configurable (diario, semanal, bajo demanda)

#### 3. **Infraestructura VPS** ✅
- Docker + Portainer para gestión visual
- Nginx como gateway único
- Backups automatizados (Vegan-wetlands-backup container)
- Monitoring y logs centralizados

---

### 🔜 Componentes EN DESARROLLO (Fase 1 - Actual)

#### 4. **Sistema de Perfiles Profesionales** 🔜
**Estado:** Schema diseñado, pendiente aplicar a BD
**Prioridad:** ALTA - Base para Networking y CRM

**Modelos Prisma creados:**
```prisma
User {
  // Nuevos campos de perfil
  bio, profession, company, phone
  region, commune, website, linkedin
  isPublicProfile

  // Relaciones
  properties[]
  connectionsInitiated[]
  connectionsReceived[]
}

Property {
  // Propiedades listadas por usuarios
  title, description, propertyType, status
  address, commune, region, lat, lng
  bedrooms, bathrooms, price
  images[], mainImage
}

Connection {
  // Red de networking
  requesterId, receiverId, status, message
}
```

**Rutas a implementar:**
- `/dashboard/perfil` - Editar mi perfil
- `/networking/[userId]` - Perfil público
- `/networking/mis-propiedades` - Mis propiedades

**Decisión pendiente:** Base de datos
- **Opción A:** Neon (serverless PostgreSQL con branching)
- **Opción B:** PostgreSQL self-hosted en VPS (ya disponible)
- **Opción C:** Híbrido (Neon dev, VPS producción)

---

### 🔜 Componentes PLANIFICADOS (Fase 2-5)

#### 5. **Networking - Red de Profesionales** 🔜
**Prioridad:** ALTA
**Dependencia:** Perfiles de Usuario (Fase 1)

- Directorio de profesionales (corredores, tasadores, arquitectos)
- Sistema de conexiones (estilo LinkedIn)
- Foro de discusión por categorías
- Sistema de mensajería privada
- Búsqueda por región/especialidad/servicios

#### 6. **Blog y Centro de Datos** 🔜
**Prioridad:** MEDIA (SEO y educación)

- Blog educativo sobre mercado inmobiliario
- Data stories con visualizaciones interactivas
- Análisis de mercado regional automatizados
- CMS para administradores y autores invitados
- SEO optimizado para captar tráfico orgánico

#### 7. **Sofía - Agente Bot RAG** 🔜
**Prioridad:** MEDIA-ALTA (Diferenciador técnico)
**Base actual:** `/chatbot` con modelo ChatMessage

**Mejoras planificadas:**
- Integrar Anthropic Claude con RAG
- Vector DB (Supabase pgvector o Pinecone)
- Contexto sobre:
  - Base de datos de referenciales
  - Documentos legales CBR/SII
  - Preguntas frecuentes
  - Datos de mercado en tiempo real
- Widget flotante disponible globalmente

#### 8. **CRM Inmobiliario Completo** 🔜
**Prioridad:** MEDIA
**Target:** Profesionales del sector

**Features:**
- Gestión de clientes y leads
- Pipeline de ventas visual (Kanban)
- Automatización de tareas y recordatorios
- Integración con propiedades de usuario
- Reportes de desempeño
- Sistema de notas y documentos

---

### ❌ Componentes EXCLUIDOS de la Plataforma

#### 1. **Página de Propiedades Dedicada (Estilo Portal Tradicional)**
- **Eliminado:** No habrá sección `/propiedades` con listado centralizado
- **Alternativa:** Las propiedades se visualizan en el perfil de cada usuario/corredor
- **Razón:** Modelo descentralizado donde cada profesional gestiona su propio showcase
- **Ventaja:** Fomenta networking y visibilidad de profesionales, no solo de propiedades

#### 2. **Página "Quiénes Somos"**
- **Eliminado:** No habrá página institucional tradicional "About Us"
- **Alternativa:** Información de la plataforma integrada en landing page y FAQ
- **Razón:** Plataforma colaborativa, no empresa tradicional
- **Ventaja:** Foco en comunidad y datos, no en la empresa detrás

---

## 🎯 Filosofía de Diseño del Ecosistema

**Modelo Descentralizado:**
- Cada usuario/profesional tiene su **perfil showcase** con sus propiedades
- La plataforma es el **conector**, no el portal
- Datos abiertos + herramientas + comunidad = ecosistema colaborativo

**Ejemplo de flujo de usuario:**
```
Usuario busca propiedad en Valdivia
  → Usa mapa con estadísticas (✅ implementado)
  → Encuentra áreas de interés
  → Ve propiedades en perfiles de corredores locales (🔜 Fase 1)
  → Contacta corredor vía networking (🔜 Fase 2)
  → Consulta con Sofía sobre tasaciones (🔜 Fase 3)
  → Corredor gestiona lead en CRM (🔜 Fase 4)
```

---

## 📊 Arquitectura de Datos y Base de Datos

### 🤔 Decisión Estratégica: ¿Qué Base de Datos Usar?

**Situación actual:**
- ✅ PostgreSQL operativo en VPS (usado por N8N)
- ✅ PostGIS disponible
- ✅ Backups configurados
- 🔜 MCP Neon configurado (serverless PostgreSQL)

**Opciones evaluadas:**

#### **Opción A: Neon (Serverless PostgreSQL)**
✅ Pros:
- Database branching (ramas de BD como Git)
- Autoscaling automático
- Free tier: 500MB + 5GB transfer
- PostGIS incluido
- Zero mantenimiento
- MCP ya configurado en Claude Code

⚠️ Contras:
- Vendor lock-in suave
- Costo post-free: ~$20-30/mes (10GB)
- Dependencia externa

#### **Opción B: PostgreSQL Self-hosted (VPS Actual)**
✅ Pros:
- Ya disponible y operativo
- Control total de datos
- Costo fijo ($0 adicional, VPS ya pagado)
- Filosofía 100% open source
- Compliance directo (datos en Chile)

⚠️ Contras:
- Mantenimiento manual
- Sin database branching
- Escalabilidad requiere trabajo
- DevOps time

#### **Opción C: Híbrido (Neon Dev + VPS Prod)**
✅ Pros:
- Branching para desarrollo
- Control en producción
- Mejor de ambos mundos

⚠️ Contras:
- Complejidad de setup
- Dos ambientes distintos
- Workflow más elaborado

---

### ✅ Decisión Final: PostgreSQL Dedicado en VPS

**Después de evaluación, se decidió:**
→ **PostgreSQL Dedicado Self-hosted en VPS**

#### **Razones de la Decisión:**

1. **Maximizar uso del VPS** - Ya pagado, capacidad disponible
2. **Aislamiento total** - Separado de N8N (seguridad y estabilidad)
3. **Costo cero adicional** - Solo ~300MB RAM extra
4. **Control total** - Optimización específica para degux
5. **Filosofía open source** - 100% auto-gestionado
6. **Compliance directo** - Datos en infraestructura propia
7. **Escalabilidad futura** - Fácil agregar replicas cuando sea necesario

#### **Arquitectura Implementada:**

```yaml
# Docker Compose en VPS
services:
  degux-db:
    image: postgis/postgis:15-3.4
    container_name: degux-db
    ports:
      - "5433:5432"  # Puerto independiente
    volumes:
      - degux_db_data:/var/lib/postgresql/data
      - ./backups:/backups
    environment:
      POSTGRES_DB: degux
      POSTGRES_USER: degux_user
      POSTGRES_PASSWORD: ${DEGUX_DB_PASSWORD}
    networks:
      - degux-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U degux_user"]
      interval: 10s
```

#### **Características:**

- ✅ **PostGIS incluido** - Soporte geoespacial nativo
- ✅ **Puerto dedicado (5433)** - No conflicto con N8N (5432)
- ✅ **Backups automáticos** - Cron diario a las 3 AM
- ✅ **Health checks** - Monitoreo de salud del contenedor
- ✅ **Volúmenes persistentes** - Datos seguros
- ✅ **Network aislada** - Red Docker independiente

#### **Ubicación Física:**

```
VPS Digital Ocean (VPS_IP_REDACTED)
  ├─ N8N Stack (puerto 5432)
  │  ├─ n8n-db (PostgreSQL)
  │  ├─ n8n (workflow engine)
  │  └─ n8n-redis
  │
  └─ degux Stack (puerto 5433)
     ├─ degux-db (PostgreSQL + PostGIS) ← NUEVO
     └─ degux-app (Next.js) ← Por desplegar
```

#### **Recursos Utilizados:**

| Recurso | Uso Adicional | Total Estimado |
|---------|---------------|----------------|
| RAM | ~300MB | N8N: 500MB + degux DB: 300MB = 800MB |
| Disco | ~2GB inicial | Crece con datos |
| CPU | Mínima en idle | Picos en queries |

#### **Ventajas vs Alternativas:**

**vs Neon:**
- ✅ $0 costo (vs $20-30/mes post-free)
- ✅ Control total de datos
- ✅ Sin dependencia externa
- ❌ Sin database branching (trade-off aceptable)

**vs Compartir DB con N8N:**
- ✅ Aislamiento y seguridad
- ✅ Sin riesgo de conflictos
- ✅ Escalamiento independiente

**vs Supabase Self-hosted:**
- ✅ Simple: 1 contenedor vs 12
- ✅ Recursos: 300MB vs 1.5GB
- ✅ Ya tienes NextAuth.js (no necesitas Supabase Auth)

#### **Plan de Backups:**

```bash
# Script ejecutado diariamente (3 AM)
/home/gabriel/vps-do/degux/backup.sh

# Retiene últimos 7 días
/backups/degux_backup_YYYYMMDD_HHMMSS.sql.gz
```

#### **Connection String:**

```env
# Local development (desde tu máquina)
POSTGRES_PRISMA_URL="postgresql://degux_user:[PASSWORD]@[IP_VPS]:5433/degux?schema=public"

# Production (dentro del VPS)
POSTGRES_PRISMA_URL="postgresql://degux_user:[PASSWORD]@degux-db:5432/degux?schema=public"
```

---

## 🔍 Validación de Mercado y Oportunidades Estratégicas

### Contexto Macroeconómico (Q1 2025)

**Mercado en Contracción** - Paradójicamente, una oportunidad:
- Ventas de viviendas cayeron 18% (Q1 2025)
- Precios a la baja: -4.3% departamentos RM, -3.5% casas
- Sobreoferta: 36 meses para agotar stock nacional
- **Implicación**: Corredores buscan eficiencias operativas y reducir costos → **momento perfecto para adopción de herramientas gratuitas**

**Ecosistema PropTech Maduro pero Fragmentado**:
- Startups chilenas reconocidas en Latam (Houm, BReal, ComunidadFeliz)
- 65% de inmobiliarias implementando transacciones digitales
- **Brecha**: Innovaciones verticales, pero falta infraestructura colaborativa horizontal

### Tres Oportunidades Estratégicas Identificadas

#### 🥇 **Oportunidad 1: MLS Abierto (PRIORIDAD MÁXIMA)**
**El Abismo de Colaboración**

**Problema**: Chile no tiene un verdadero Multiple Listing Service (MLS)
- KiteProp y Wasi ofrecen "MLS" cerrado solo para sus clientes
- Corredores fragmentados en silos propietarios
- Colaboración ineficiente y manual entre competidores
- Larga cola de corredores independientes desatendidos

**Solución**: "El GitHub del Sector Inmobiliario"
- Base de datos de listados centralizada y gratuita
- APIs abiertas para integración con cualquier CRM
- Sistema de gobernanza y reputación de corredores
- Esquema de datos estandarizado → estándar de facto de la industria

**Por qué es la oportunidad #1**:
- **Efectos de red**: Cada corredor aumenta valor para todos
- **Máximo impacto**: Resuelve problema fundamental del mercado masivo
- **Barrera de entrada**: Una vez lograda masa crítica, imposible de replicar
- **Alineación**: Es infraestructura pura, no aplicación vertical

#### 🥈 **Oportunidad 2: Parcelas Rurales (NICHO EXPANSIÓN)**
**La Frontera Rural**

**Problema**: Boom de parcelas de agrado con alta asimetría de información
- Subdivisiones en zona gris legal (Artículo 55 LGUC)
- Falta de servicios básicos (APR, electricidad, internet)
- Problemas ambientales no supervisados
- Fraude sobre condiciones legales

**Solución**: "Zillow para el Chile Rural"
- Motor de debida diligencia y verificación
- Mapeo de acceso a servicios (APR, electricidad, fibra)
- Verificación de permisos SAG y normativas CONAF
- Marketplace de expertos locales verificados

**Enfoque**: Fase 3-4, post-consolidación MLS urbano

#### 🥉 **Oportunidad 3: Tasaciones Expropiación (NICHO EXPERTO)**
**El Nicho Experto**

**Problema**: Desequilibrio de poder en expropiaciones
- Proceso complejo regido por DL 2.186
- Estado con procesos estandarizados y expertos
- Propietarios sin conocimiento para defender indemnización

**Solución**: Herramienta de empoderamiento para propietarios
- Navegador de procesos con alertas de plazos
- Centro de datos de ventas comparables
- Marketplace de peritos independientes
- Gestión documental de caso

**Enfoque**: Fase 5, nicho especializado de alto valor

---

## 🛠️ Roadmap Técnico del Ecosistema (ACTUALIZADO V4)

### ✅ Fase 0: Infraestructura Base (COMPLETADA)
**Duración:** Agosto 2025
**Estado:** ✅ 100% Completado

- [x] VPS Digital Ocean configurado
- [x] Nginx + SSL con Let's Encrypt
- [x] Portainer para gestión Docker
- [x] N8N + PostgreSQL + Redis
- [x] Workflows de scraping Portal Inmobiliario
- [x] Workflows de scraping Mercado Libre
- [x] Backups automatizados
- [x] Documentación en vps-do-docs

**Resultado:** Infraestructura productiva con 7 servicios activos

---

### 🔄 Fase 1: Perfiles + MLS Core (EN PROGRESO - AMPLIADA)
**Duración:** Septiembre-Octubre 2025 (3-4 semanas)
**Prioridad:** CRÍTICA
**Estado:** 🔄 40% Completado

**CAMBIO ESTRATÉGICO**: Integrar MLS abierto desde Fase 1, no como feature posterior

#### ✅ Tareas Completadas:
- [x] Diseño de modelos Prisma (User, Property, Connection)
- [x] Enums para ProfessionType, PropertyType, PropertyStatus
- [x] Schema validado y generado con Prisma
- [x] **Decisión de Base de Datos** → PostgreSQL Dedicado en VPS
- [x] Diseño de arquitectura Docker para degux-db
- [x] Diseño de script de backups automáticos

#### 🔄 Tareas en Progreso:
- [ ] **Setup PostgreSQL dedicado en VPS** (docker-compose + .env)
- [ ] Aplicar schema de Prisma a nueva BD
- [ ] Configurar backups automáticos (cron)
- [ ] Actualizar connection string en proyecto local

#### 🔜 Tareas Pendientes (ACTUALIZADAS):

**A. Backend - Perfiles (Gabriel):**
- [ ] Crear API endpoints:
  - `GET /api/users/profile` - Obtener perfil actual
  - `PUT /api/users/profile` - Actualizar perfil
  - `GET /api/users/[userId]` - Perfil público
  - `GET /api/properties` - Listar propiedades de usuario
  - `POST /api/properties` - Crear propiedad
  - `PUT /api/properties/[id]` - Editar propiedad
  - `DELETE /api/properties/[id]` - Eliminar propiedad

**B. Backend - MLS Core (Gabriel) - NUEVO:**
- [ ] **API de Colaboración MLS:**
  - `GET /api/mls/listings` - Listado completo MLS (filtrable)
  - `POST /api/mls/listings` - Publicar en MLS
  - `PUT /api/mls/listings/[id]` - Actualizar listado MLS
  - `GET /api/mls/collaboration-offers` - Ver ofertas de comisión
  - `POST /api/mls/collaboration-requests` - Solicitar colaboración
  - `GET /api/mls/my-collaborations` - Mis colaboraciones activas

- [ ] **Modelos Prisma MLS adicionales:**
  ```prisma
  MLSListing {
    id, propertyId, ownerId
    commissionOffer, commissionType (percentage, flat)
    collaborationRules, status (open, in_collaboration, closed)
    visibility (public, network, private)
  }

  CollaborationRequest {
    id, listingId, requesterId, status
    proposedTerms, message
  }
  ```

**C. Frontend - Perfiles (Mona + Gabriel):**
- [ ] Página `/dashboard/perfil` - Editar mi perfil
  - Formulario con bio, profesión, empresa, contacto
  - Upload de avatar
  - Toggle de perfil público/privado
  - **Sección "Mi Reputación MLS"** (historial, calificaciones)

- [ ] Página `/networking/[userId]` - Perfil público
  - Vista read-only del perfil
  - Listado de propiedades del usuario
  - Botón "Conectar"
  - **Badge de reputación MLS** (transacciones completadas, rating)

**D. Frontend - MLS Hub (Mona + Gabriel) - NUEVO:**
- [ ] Página `/mls` - Hub principal MLS
  - Vista grid/lista de todos los listados MLS
  - Filtros avanzados (región, tipo, rango precio, comisión)
  - Indicador de "Ofertas de colaboración disponibles"
  - Búsqueda por corredor/agencia

- [ ] Página `/mls/[id]` - Detalle de listado MLS
  - Info completa de propiedad
  - Oferta de comisión del owner
  - Botón "Solicitar colaboración"
  - Historial de solicitudes (si eres owner)

- [ ] Sección `/dashboard/mis-propiedades`
  - CRUD completo de propiedades
  - Upload de imágenes (múltiples)
  - Mapa para seleccionar ubicación
  - **Toggle "Publicar en MLS"** con config de comisión

**E. Sistema de Reputación (Gabriel):**
- [ ] Rating system post-transacción
- [ ] Perfil público con badges y métricas
- [ ] Sistema de reportes de mala conducta

**Integración:**
- [ ] Actualizar navegación del dashboard (agregar "MLS Hub")
- [ ] Testing de flujo completo (perfil + MLS + colaboración)
- [ ] Documentación completa de APIs públicas MLS

**Entregables Fase 1 (Ampliados):**
- ✅ Sistema funcional de perfiles profesionales
- ✅ Usuarios pueden publicar y gestionar propiedades
- ✅ Perfiles públicos accesibles vía URL
- 🆕 **MLS abierto operativo con colaboración entre corredores**
- 🆕 **APIs públicas MLS documentadas para integraciones externas**
- 🆕 **Sistema de reputación básico funcionando**

---

### 🔜 Fase 2: Networking y Conexiones (Oct-Nov 2025)
**Duración:** 2-3 semanas
**Prioridad:** ALTA
**Dependencia:** Fase 1 completada

#### Funcionalidades:

**Sistema de Conexiones:**
- [ ] Enviar solicitudes de conexión
- [ ] Aceptar/rechazar solicitudes
- [ ] Ver lista de mis conexiones
- [ ] Notificaciones de nuevas solicitudes

**Directorio de Profesionales:**
- [ ] Página `/networking` con listado
- [ ] Filtros: región, profesión, servicios
- [ ] Búsqueda por nombre/empresa
- [ ] Vista de grid y lista

**Mensajería Básica:**
- [ ] Chat 1-a-1 entre conexiones
- [ ] Notificaciones de mensajes nuevos
- [ ] Historial de conversaciones

**Foro de Discusión:**
- [ ] Modelo ForumPost, ForumComment
- [ ] Categorías: Tasaciones, Legal, Mercado, Técnico
- [ ] Sistema de likes/votes
- [ ] Moderación básica (admin)

#### Integraciones:
- [ ] N8N workflow: notificaciones de conexión vía email
- [ ] N8N workflow: digest semanal de actividad del foro

---

### 🔜 Fase 3: Blog, Centro de Datos y Monetización de Contenido (Nov-Dic 2025)
**Duración:** 3-4 semanas
**Prioridad:** ALTA (Revenue stream clave)
**Objetivo:** SEO, educación y generación de ingresos

#### Funcionalidades Core:

**Blog Sistema:**
- [ ] Modelo BlogPost con MDX support
- [ ] CMS para autores (admin + invited)
- [ ] Sistema de tags y categorías
- [ ] SEO metadata por post
- [ ] Sitemap automático
- [ ] Sistema de comentarios (Disqus o custom)

**Data Stories:**
- [ ] Integración con datos de referenciales
- [ ] Gráficos interactivos (Recharts)
- [ ] Reportes de mercado automatizados (N8N)
- [ ] Export a PDF de análisis

**Contenido Inicial Gratuito:**
- [ ] 15 posts educativos base
- [ ] 5 data stories sobre mercado Los Ríos
- [ ] Guía completa de tasaciones MOP
- [ ] Serie "Introducción al Mercado Inmobiliario" (5 capítulos)

#### Funcionalidades de Monetización (NUEVO):

**Sistema de Contenido Premium:**
- [ ] Modelo ContentProduct (eBooks, webinars, reportes)
- [ ] Integración con Flow o Transbank para pagos
- [ ] Sistema de descargas protegidas (PDF con watermark)
- [ ] Acceso temporal a contenido premium (links con expiración)

**eBooks y Guías:**
- [ ] Editor MDX to PDF (automático)
- [ ] Templates profesionales para eBooks
- [ ] Sistema de preventa (early access con descuento)
- [ ] 3 eBooks iniciales:
  - "Guía Completa de Tasaciones MOP"
  - "Manual del Corredor Moderno"
  - "Inversión en Parcelas de Agrado"

**Webinars y Masterclasses:**
- [ ] Integración con Zoom o Google Meet
- [ ] Sistema de registro y pagos
- [ ] Grabaciones protegidas (streaming con DRM básico)
- [ ] Certificados de asistencia automatizados

**Newsletter System:**
- [ ] Modelo Newsletter + Subscriber
- [ ] Integración con N8N para envío masivo
- [ ] Sistema de sponsors en newsletter
- [ ] Templates HTML responsivos
- [ ] Analytics de apertura y clicks

**Sistema de Sponsorships:**
- [ ] Panel de administración de sponsors
- [ ] Gestión de contratos y renovaciones
- [ ] Placement automático de logos/menciones
- [ ] Reportes de métricas para sponsors (views, clicks)

**Lead Generation:**
- [ ] Formularios de contacto especializados
- [ ] CTA estratégicos en posts (tasaciones, estudios custom)
- [ ] Sistema de scoring de leads
- [ ] Integración con N8N para follow-up automático

#### Integraciones:

**Pagos:**
- [ ] Flow API para Chile (eBooks, webinars)
- [ ] Webhooks para confirmación de pagos
- [ ] Panel de ventas y reportes

**Analytics:**
- [ ] Google Analytics 4
- [ ] Heatmaps (Hotjar o similar)
- [ ] Conversión tracking (free to paid)

**Marketing:**
- [ ] Meta Pixel (Facebook/Instagram ads)
- [ ] LinkedIn Insight Tag
- [ ] Email marketing (Mailchimp o Brevo)

#### Métricas de Éxito:

**6 meses post-lanzamiento:**
- [ ] 10,000+ suscriptores newsletter
- [ ] 50,000+ pageviews/mes
- [ ] 20+ ventas de contenido premium/mes
- [ ] 2-3 sponsors activos
- [ ] $1.5M+ CLP/mes en revenue del blog

---

### 🔜 Fase 4: Sofía - Bot RAG (Dic 2025-Ene 2026)
**Duración:** 3-4 semanas
**Prioridad:** MEDIA-ALTA
**Base:** `/chatbot` existente

#### Mejoras Técnicas:

**RAG Implementation:**
- [ ] Vector DB setup (Supabase pgvector o Pinecone)
- [ ] Embeddings de:
  - Todos los referenciales
  - Posts del blog
  - Documentación legal CBR/SII
  - FAQs

- [ ] Integración Anthropic Claude API
- [ ] Context window optimization
- [ ] Sistema de fuentes/citations

**UX Improvements:**
- [ ] Widget flotante global (todas las páginas)
- [ ] Historial de conversaciones por usuario
- [ ] Modo "Explicación simple" vs "Técnico"
- [ ] Sugerencias contextuales
- [ ] Rate limiting por usuario

**Casos de Uso:**
- "¿Cuál es el precio promedio de casas en Valdivia Centro?"
- "Explica cómo hacer una tasación MOP"
- "¿Qué documentos necesito del CBR para vender?"
- "Muéstrame propiedades similares a [dirección]"

---

### 🔜 Fase 5: CRM Inmobiliario (Feb-Mar 2026)
**Duración:** 4-5 semanas
**Prioridad:** MEDIA
**Target:** Profesionales activos

#### Funcionalidades Core:

**Gestión de Clientes:**
- [ ] Modelos: CrmClient, CrmDeal, CrmNote, CrmTask
- [ ] CRUD completo de clientes
- [ ] Historial de interacciones
- [ ] Sistema de tags personalizados

**Pipeline de Ventas:**
- [ ] Vista Kanban (drag & drop)
- [ ] Etapas customizables
- [ ] Probabilidad de cierre
- [ ] Valor estimado del deal
- [ ] Fecha estimada de cierre

**Automatizaciones:**
- [ ] Tareas automáticas según etapa
- [ ] Recordatorios vía email (N8N)
- [ ] Notificaciones de deals estancados
- [ ] Follow-ups programados

**Reportes:**
- [ ] Dashboard de métricas
- [ ] Tasa de conversión por etapa
- [ ] Valor del pipeline
- [ ] Tiempo promedio de cierre
- [ ] Performance por corredor

**Integraciones:**
- [ ] Conexión con Property model
- [ ] Vincular deals a propiedades
- [ ] N8N workflows para emails automáticos

---

## 💰 Modelo de Monetización Multicapa SIN SUSCRIPCIONES (ACTUALIZADO V4)

**Filosofía Central**: El core del MLS debe ser **gratuito y open source** para lograr adopción masiva y convertirse en el estándar de facto. Monetización a través de servicios de valor agregado construidos sobre la infraestructura gratuita, **sin planes de suscripción recurrentes**.

### Estrategia de 5 Capas (Validada por Investigación)

#### **Capa 1: Plataforma Central - MLS Abierto** 🆓
**Estado**: GRATUITO Y OPEN SOURCE (NO NEGOCIABLE)

**Componentes:**
- Base de datos de listados centralizada
- APIs abiertas para integración
- Interfaz web básica para corredores
- Sistema de perfiles y reputación
- Colaboración básica entre corredores

**Objetivo Estratégico:**
- Lograr dominio del mercado (>50% de listados nacionales)
- Convertirse en hub central de datos inmobiliarios
- Establecer esquema de datos como estándar de la industria
- Crear efectos de red insuperables

**Modelo de Ingresos:** $0 (Inversión en adquisición de mercado)

---

#### **Capa 2: Servicios Empresariales Premium (Pay-per-Use)** 💼
**Target**: Grandes corredoras (Fuenzalida, Engel & Völkers, Procasa)

**Servicios:**
- Soporte técnico dedicado 24/7
- Gestión avanzada de usuarios y permisos
- Opciones de despliegue on-premise (datos sensibles)
- White-labeling de la plataforma
- SLA garantizado de uptime
- Capacitación personalizada de equipos
- Integraciones custom con sistemas legacy

**Modelo de Ingresos (SIN SUSCRIPCIONES):**
- **Licencia Perpetua Enterprise**: $2.500.000-5.000.000 CLP (pago único)
  - Incluye: Acceso de por vida, updates de seguridad
  - No incluye: Soporte técnico (se cobra aparte)

- **Paquetes de Soporte (on-demand)**:
  - Support Básico: $50.000 CLP/ticket
  - Support Prioritario: $150.000 CLP/ticket con SLA 4h
  - Capacitación: $300.000 CLP/sesión (hasta 20 personas)

- **Servicios de Integración**:
  - Integración custom: $800.000-2.500.000 CLP (proyecto único)
  - White-labeling setup: $1.500.000 CLP (una vez)
  - Despliegue on-premise: $2.000.000 CLP (setup) + hosting propio

**Timeline:** Fase 2-3 (Q4 2025 - Q1 2026)

---

#### **Capa 3: Marketplace de Servicios B2B** 🛒
**Target**: Todo el ecosistema (corredores, vendedores, compradores)

**Servicios Curados:**
- Fotografía profesional de propiedades
- Tours virtuales 360° y videos drone
- Servicios legales (contratos, due diligence)
- Tasaciones certificadas (bancos/legal)
- Home staging y mejoras pre-venta
- Inspecciones técnicas
- Gestión de documentación CBR/SII

**Modelo de Ingresos (Comisión por Éxito):**
- Comisión del 12-18% por transacción completada
- Fee de verificación de proveedores: $80.000 CLP (anual, por proveedor)
- Featured placement: $150.000 CLP/mes por categoría
- Boost de visibilidad puntual: $30.000 CLP/semana

**Timeline:** Fase 3-4 (Q1-Q2 2026)

---

#### **Capa 4: Inteligencia de Mercado y Datos (Pay-per-Query)** 📊
**Target**: Clientes institucionales (bancos, desarrolladores, fondos, gobierno)

**Productos de Datos:**
- Reportes de tendencias de precios por zona
- Análisis de demanda y tiempo de venta
- Predicciones de valorización de sectores
- Benchmarking de desempeño de corredores
- Datos de mercado en tiempo real (API)
- Estudios de mercado customizados

**Datos Agregados y Anonimizados:**
- Cumplimiento total con Ley 19.628 (protección de datos)
- Sin información personal identificable
- Agregación mínima por zona geográfica

**Modelo de Ingresos (SIN SUSCRIPCIONES):**

**Paquetes de Créditos Prepago (sin expiración):**
- Paquete Starter: $200.000 CLP = 1,000 créditos
- Paquete Professional: $800.000 CLP = 5,000 créditos (+25% bonus)
- Paquete Enterprise: $3.000.000 CLP = 25,000 créditos (+50% bonus)

**Consumo de Créditos por Acción:**
- Query API básica (1 propiedad): 1 crédito
- Query API avanzada (geoespacial): 5 créditos
- Reporte estándar (PDF): 100-300 créditos
- Dataset completo regional: 1,000 créditos
- Estudio custom: 3,000-10,000 créditos (proyecto)

**Reportes Individuales (Pago Único):**
- Reporte de Mercado Comunal: $120.000 CLP
- Análisis de Valorización Sectorial: $250.000 CLP
- Benchmarking de Corredores: $180.000 CLP
- Estudios de mercado custom: $3.500.000-12.000.000 CLP

**Timeline:** Fase 4-5 (Q2-Q3 2026)

---

#### **Capa 5: Blog y Contenido Premium (NUEVA)** 📝
**Target**: Profesionales del sector, inversionistas, público general

**Contenido Gratuito (Lead Generation):**
- Artículos educativos sobre mercado inmobiliario
- Data stories con visualizaciones interactivas
- Análisis de tendencias regionales mensuales
- Guías básicas de tasación y legal
- Noticias del sector

**Contenido Premium (Pago Único):**
- **eBooks y Guías Profesionales**:
  - "Guía Completa de Tasaciones MOP": $25.000 CLP
  - "Manual del Corredor Moderno": $35.000 CLP
  - "Inversión en Parcelas de Agrado": $30.000 CLP

- **Webinars y Masterclasses**:
  - Webinar grabado: $15.000 CLP/acceso
  - Masterclass en vivo: $45.000 CLP/persona
  - Paquete 5 webinars: $60.000 CLP (20% descuento)

- **Reportes de Investigación Exclusivos**:
  - Reporte Trimestral de Mercado Nacional: $80.000 CLP
  - Análisis Deep Dive por Región: $120.000 CLP
  - Pronósticos Anuales: $200.000 CLP

**Modelo de Sponsorships (Ingresos Recurrentes Pasivos):**
- **Sponsor de Newsletter Semanal**: $300.000 CLP/mes
  - Mención en newsletter (10,000+ suscriptores proyectados)
  - 1 artículo sponsor por mes

- **Sponsor de Categoría de Blog**: $200.000 CLP/mes
  - Logo en sección específica (ej: "Financiamiento")
  - 2 artículos sponsor por mes

- **Sponsor de Data Story**: $150.000 CLP/publicación
  - Co-branding en visualización interactiva
  - Mención en redes sociales

**Lead Generation para Revenue Streams Principales:**
- CTA a servicios de tasación (conversión a clientes)
- Formularios de contacto para estudios custom
- Afiliados a servicios del marketplace (comisión 5-10%)

**Timeline:** Fase 3 (Nov-Dic 2025)

**Proyección de Ingresos (6 meses post-lanzamiento):**
- Contenido Premium: $400.000-800.000 CLP/mes
- Sponsorships: $600.000-1.200.000 CLP/mes
- Lead Generation (conversiones): $300.000-600.000 CLP/mes
- **Total Capa Blog**: $1.300.000-2.600.000 CLP/mes

---

### ✅ Revenue Streams Actuales (Mantener y Complementar)

**Base Revenue (Conservadora):**
1. **Tasaciones MOP** - Contratos gubernamentales de expropiación
2. **Tasaciones privadas** - Clientes particulares y empresas
3. **Corretaje tradicional** - Propiedades en venta

**Sinergias con Plataforma:**
- Tasaciones MOP automatizadas parcialmente con datos de plataforma
- Tasaciones privadas usando motor de valuación propio (datos crowdsourced)
- Corretaje potenciado con MLS (mayor alcance)

---

### Proyección de Revenue Streams SIN SUSCRIPCIONES (18 meses)

| Trimestre | Capa 1 (MLS) | Capa 2 (Enterprise) | Capa 3 (Marketplace) | Capa 4 (Datos) | Capa 5 (Blog) | Total Nuevo |
|-----------|--------------|---------------------|----------------------|----------------|---------------|-------------|
| Q4 2025 | $0 | $0 | $0 | $0 | $0 | $0 |
| Q1 2026 | $0 | $500K CLP¹ | $0 | $0 | $800K CLP² | $1.3M CLP |
| Q2 2026 | $0 | $1.2M CLP | $400K CLP | $600K CLP | $1.5M CLP | $3.7M CLP |
| Q3 2026 | $0 | $800K CLP³ | $1.2M CLP | $1.8M CLP | $2.0M CLP | $5.8M CLP |
| Q4 2026 | $0 | $1.5M CLP | $2.5M CLP | $3.2M CLP | $2.4M CLP | $9.6M CLP |

**Notas:**
- ¹ Q1: 1 licencia perpetua vendida ($2.5M one-time) prorrateado
- ² Q1: Lanzamiento blog + primeros sponsors
- ³ Variación natural (pagos únicos no recurrentes)

**Modelo de Ingresos por Capa:**
- **Capa 2**: Pagos únicos (licencias, integraciones, soporte on-demand)
- **Capa 3**: Comisiones por transacción + fees anuales de verificación
- **Capa 4**: Créditos prepago + reportes individuales
- **Capa 5**: Contenido premium + sponsorships (único ingreso mensual recurrente, pero pasivo)

**Ventajas del Modelo Sin Suscripciones:**
- ✅ Menor fricción de adopción (sin compromiso mensual)
- ✅ Pagos únicos más altos por cliente
- ✅ Ingresos más estables vía comisiones (Capa 3)
- ✅ Alineación de incentivos (éxito del cliente = nuestro éxito)
- ✅ Diferenciación clara vs. competencia (KiteProp, Wasi)

**Objetivo conservador 12 meses**: $3-4M CLP/mes en nuevos revenue streams
**Objetivo conservador 18 meses**: $8-10M CLP/mes en nuevos revenue streams

**Revenue base actual (tasaciones)**: ~$2-4M CLP/mes (mantener)
**Revenue total proyectado (18 meses)**: ~$10-14M CLP/mes

**Proyección de Costos de Infraestructura:**
- VPS Digital Ocean: $50 USD/mes (~$45.000 CLP)
- Cloudflare/CDN: $20 USD/mes (~$18.000 CLP)
- Almacenamiento imágenes: $30 USD/mes (~$27.000 CLP)
- APIs externas (geocoding): $50 USD/mes (~$45.000 CLP)
- **Total infraestructura**: ~$135.000 CLP/mes

**Break-even**: Alcanzable en Q1 2026 con blog + primera venta enterprise

---

## 🎯 Estrategia de Crecimiento de Datos

### Fuentes Principales para `degux-cl`:

#### ✅ Ya Implementadas:
1. **Portal Inmobiliario** - Scraping vía N8N
2. **Mercado Libre** - Scraping vía N8N

#### 🔜 Por Implementar:
3. **SII (Servicio Impuestos Internos)** - Apellidos propietarios
4. **CBR Valdivia** - Índice registro propiedad online
5. **Descubro Data** - ROL avalúo, montos, superficie
6. **Crowdsourcing** - Usuarios aportan datos → tasaciones gratuitas

#### Workflow N8N Propuesto:
```
Trigger (diario) →
  ├─ Scrape Portal Inmobiliario
  ├─ Scrape Mercado Libre
  ├─ Scrape yapo.cl (nuevo)
  └─ Consolidar en PostgreSQL
      └─ Geocoding via Google Maps API
          └─ Generar geometría PostGIS
              └─ Trigger notification (Discord/Email)
```

---

## 👥 Estructura de Socios y Organización

### GitHub Organization Setup
- **Nombre organización:** `pp-technologies` o `pantoja-partners`
- **Repositorio actual:** `degux.cl` (main branch configurada)
- **Repositorio infra:** `vps-do` (VPS management)
- **Repositorio docs:** `vps-do-docs` (documentación viviente)
- **Colaboradores:** Gabriel (Owner/Tech Lead) + Mona (Owner/Product Lead)

### División de Responsabilidades

**Gabriel (Tech Lead):**
- Backend + APIs (Next.js API routes + Prisma)
- Infraestructura VPS (Docker, Nginx, N8N)
- Database management (PostgreSQL/PostGIS)
- Integraciones de datos (SII, CBR, Descubro)
- N8N workflows de scraping y automatización

**Mona (Product Lead):**
- Frontend + UX/UI (Next.js App Router + Tailwind)
- Product management (roadmap, priorización)
- Content strategy (blog, documentación)
- User research (entrevistas con corredores)
- Marketing y comunicación externa

**Conjunto:**
- Arquitectura de producto
- Decisiones estratégicas
- Sesiones Platzi (modo dúo)
- Crecimiento orgánico sin funding

---

## 📚 Plan de Aprendizaje Colaborativo Platzi

*(Mantiene contenido original de V2.0 - no modificado)*

---

## 📊 Métricas de Éxito (6 meses) - Bootstrap Mode

### Métricas de Infraestructura ✅
- [x] VPS operativo 99%+ uptime
- [x] 7 servicios activos y monitoreados
- [x] Backups automatizados funcionando

### Métricas de Datos
- **Objetivo:** 5,000+ propiedades región de Los Ríos
- **Actual:** ~1,000+ (Portal Inmobiliario + Mercado Libre scrapers)
- **Gap:** Implementar CBR + SII + crowdsourcing

### Métricas de Producto (Fase 1-2)
- [ ] **100+ usuarios registrados** con perfiles completos
- [ ] **50+ propiedades listadas** por profesionales
- [ ] **20+ conexiones** activas entre profesionales
- [ ] **5+ posts de blog** con >100 visitas cada uno

### Métricas de Negocio (Conservadoras)
- **Mantener tasaciones MOP** (revenue base actual)
- **$2M+ CLP/mes** revenue total (actual + nuevos streams)
- **3+ clientes B2B** usando datos para reports
- **2+ suscripciones CRM** (post Fase 5)

### Métricas de Aprendizaje
- **80%+ cursos Platzi** completados según cronograma
- **2+ certificaciones** por persona
- **1 demo técnico** funcional para potenciales clientes B2B

---

## 🎯 Próximos Pasos Inmediatos (7 días)

### Gabriel (Enfoque Técnico)

#### 1. **Setup PostgreSQL Dedicado en VPS** (DÍA 1)
- [x] ✅ Decisión tomada: PostgreSQL Dedicado en VPS
- [ ] Crear directorio `~/vps-do/degux` en VPS
- [ ] Crear `docker-compose.yml` con servicio degux-db
- [ ] Crear `.env` con password seguro
- [ ] Levantar contenedor `docker-compose up -d`
- [ ] Verificar health check y conectividad
- [ ] Crear script de backup `backup.sh`
- [ ] Configurar cron para backups diarios (3 AM)
- [ ] Aplicar schema Prisma a nueva BD
- [ ] Actualizar `.env` local con connection string

#### 2. **APIs de Perfil** (DÍAS 2-3)
- [ ] Endpoint GET /api/users/profile
- [ ] Endpoint PUT /api/users/profile
- [ ] Endpoint GET /api/users/[userId]
- [ ] Testing con Postman/curl

#### 3. **APIs de Propiedades** (DÍAS 4-5)
- [ ] CRUD completo de Property
- [ ] Upload de imágenes (Cloudinary o S3)
- [ ] Integración con geocoding

### Mona (Enfoque Frontend + Producto)

#### 1. **Diseño de Perfiles** (DÍAS 1-2)
- [ ] Wireframes de `/dashboard/perfil`
- [ ] Wireframes de `/networking/[userId]`
- [ ] Wireframes de `/networking/mis-propiedades`
- [ ] Prototipo en Figma

#### 2. **Research de Mercado** (DÍAS 3-4)
- [ ] Entrevistas con 5 corredores locales
- [ ] Análisis de competencia (Toctoc, Yapo, Portal Inmobiliario)
- [ ] Definir pricing para featured listings

#### 3. **Setup Profesional** (DÍA 5)
- [ ] Crear LinkedIn como Co-founder P&P Technologies
- [ ] Configurar perfil GitHub
- [ ] Unirse a organización GitHub

### Conjunto

#### 1. **Sesión Estratégica** (SÁBADO - 4 horas)
- [x] ✅ Decidir base de datos final → PostgreSQL Dedicado en VPS
- [ ] Revisar progreso setup PostgreSQL
- [ ] Definir roadmap detallado Fase 1
- [ ] Asignar tareas específicas por semana
- [ ] Primera sesión Platzi: "Fundamentos y Validación de Ideas"

#### 2. **Setup Operacional** (DOMINGO)
- [ ] Crear GitHub Organization `pp-technologies`
- [ ] Migrar repos a organización
- [ ] Configurar reunión semanal (lunes 9 AM)
- [ ] Setup dashboard de métricas compartido

---

## 🚀 Estrategia de Salida al Mercado (Go-to-Market)

### Principio Central: Construir Confianza en un Mercado Escéptico

**Contexto**: Investigación revela desconfianza generalizada hacia corredores (Reddit, foros). Estrategia de código abierto es señal de neutralidad y compromiso con comunidad.

### Fase 1: Construir el Núcleo y Evangelizar (Meses 1-6)
**Objetivo**: MVP + Comunidad fundadora

**Acciones:**
- Desarrollo de MLS Core (Capa 1 completa)
- Evangelización con corredores independientes Los Ríos/Valdivia
- Positioning: "Movimiento para empoderar corredores independientes vs. grandes firmas"
- Eventos locales: Charlas, talleres de adopción tecnológica
- Content marketing: Blog sobre problemas del corretaje actual

**Meta:** 50 corredores fundadores (early adopters)

---

### Fase 2: Apuntar a la "Larga Cola" (Meses 7-12)
**Objetivo**: Alcanzar masa crítica regional

**Target**: Corredores independientes y agencias pequeñas (<10 agentes)
- Segmento más desatendido por CRMs tradicionales
- Mayor beneficio de herramienta colaborativa gratuita
- Casos de éxito = marketing más poderoso

**Acciones:**
- Lanzamiento público plataforma
- Programa de referidos (corredor que invita, gana badges)
- Soporte proactivo y onboarding personalizado
- Videos tutoriales y documentación exhaustiva
- Casos de estudio de corredores exitosos

**Meta:** 200-500 corredores activos, 1000+ propiedades en MLS

**KPI Crítico:** % de listados del mercado Los Ríos en plataforma (>30%)

---

### Fase 3: Alcanzar Masa Crítica y Atraer Grandes (Meses 13-18)
**Objetivo**: Convertirse en indispensable

**Dinámica**: Cuando plataforma contiene % significativo del mercado, grandes corredoras **deben** unirse para tener visibilidad completa.

**Acciones:**
- Expansión a otras regiones (Valparaíso, Biobío, RM)
- Introducir Capa 2 (Servicios Enterprise) para grandes
- Lanzar Capa 3 (Marketplace de Servicios B2B)
- Partnership con asociaciones gremiales (COPROCH, Colegio Inmobiliario)

**Meta:** 1000+ corredores, 5000+ propiedades, 3-5 grandes corredoras

**Milestone:** Ser reconocido como "el MLS de Chile"

---

### Posicionamiento Regulatorio Proactivo

**Oportunidad**: Ausencia de Registro Nacional de Corredores (Ley 18.796 derogada)

**Estrategia:**
1. **Llenar el vacío**: Convertirnos en registro *de facto* basado en mérito
2. **Anticipar futura regulación**: Proyectos de ley en trámite para crear registro formal
3. **Engagement proactivo**: Contactar legisladores y proponer nuestra plataforma como base tecnológica de futuro registro público
4. **Alineación**: Nueva Ley Copropiedad (21.442) muestra impulso gubernamental hacia digitalización

**Resultado**: Convertir potencial amenaza regulatoria en oportunidad estratégica

---

## ❓ Decisiones Pendientes (ACTUALIZADAS)

### ✅ Decisiones Tomadas Recientemente:
1. **Base de datos para Fase 1:** ✅ **RESUELTO** → PostgreSQL Dedicado en VPS
   - Decisión: Self-hosted en contenedor Docker independiente
   - Puerto: 5433 (aislado de N8N en 5432)
   - Beneficios: $0 costo, control total, aislamiento, PostGIS incluido

2. **Estrategia de producto:** ✅ **RESUELTO** → MLS Abierto como core desde Fase 1
   - Validado por investigación Gemini Deep Research
   - Máximo impacto, efectos de red, barrera de entrada insuperable

3. **Modelo de monetización:** ✅ **RESUELTO** → Estrategia de 4 capas
   - Capa 1 gratuita y open source (no negociable)
   - Monetización vía Capas 2-4 (Enterprise, Marketplace, Datos)

### 🔴 Prioridad ALTA (Decidir esta semana):
4. **Nombre definitivo de la plataforma:**
   - Decisión: degux.cl
   - Consideración: ¿Enfatizar "MLS" en el nombre para claridad de propuesta?

5. **Licencia Open Source:**
   - Opciones: MIT (permisiva), AGPL (copyleft), Apache 2.0
   - Consideración: Proteger contra forks comerciales vs. maximizar adopción

### 🟡 Prioridad MEDIA (Decidir próximo mes):
6. **Tech stack long-term:** ✅ **Mantener** React/Next.js (validado)
   - Ecosistema maduro, talento disponible, rápida iteración

7. **Storage de imágenes:** Cloudinary vs S3 vs Supabase Storage
   - Consideración: CDN global, costo escala, transformaciones

8. **Hosting producción app:** VPS actual vs Vercel/Netlify
   - DB en VPS (ya decidido), ¿App también VPS o edge deployment?

9. **Expansión geográfica timing:**
   - ¿Consolidar Los Ríos primero (6 meses) o expandir rápido (3 meses)?
   - Trade-off: Profundidad regional vs. cobertura nacional

### 🟢 Prioridad BAJA (Decidir en 3+ meses):
10. **Legal:** ¿Crear nueva empresa o seguir con estructura actual?
    - Consideración: SpA tecnológica separada vs. línea de negocio dentro P&P

11. **Timeline funding:** ¿Bootstrap indefinido o buscar primera ronda?
    - Milestone para considerar funding: 1000+ corredores activos

12. **Nichos de expansión:** ¿Cuándo atacar Parcelas Rurales y Expropiaciones?
    - Timeline tentativo: Post-Fase 3 (consolidación MLS urbano)

---

## 📈 KPIs de Seguimiento Semanal

### Métricas de Desarrollo
- **Commits al repositorio:** Objetivo 10+/semana
- **Pull requests merged:** Objetivo 2+/semana
- **Tests coverage:** Objetivo 60%+ (post MVP)

### Métricas de Infraestructura
- **VPS uptime:** >99% objetivo
- **Servicios activos:** Mantener 7+
- **Datos scraped:** +200 propiedades/semana

### Métricas de Producto
- **Features completados:** Seguir roadmap
- **Bugs reportados:** Tracking en GitHub Issues
- **User feedback:** Recopilar en cada release

---

## 🔗 Links de Referencia

### Repositorios:
- **degux.cl:** https://github.com/gabrielpantoja-cl/degux.cl
- **VPS Management:** (privado - compartir acceso)
- **VPS Docs:** Local en `/vps-do-docs/`

### Servicios Productivos:
- **VPS:** https://VPS_IP_REDACTED
- **Portainer:** https://VPS_IP_REDACTED:9443
- **N8N:** http://N8N_HOST_REDACTED

### Documentación:
- **VPS Guide:** `/vps-do-docs/guides/vps-guide.md`
- **N8N Guide:** `/vps-do-docs/services/n8n/n8n-guide.md`
- **Scraping Portal:** `/vps-do-docs/projects/portalinmobiliario-complete-guide.md`

---

## 🎉 Logros Recientes (Septiembre-Octubre 2025)

**Septiembre:**
- ✅ Infraestructura VPS completamente operativa
- ✅ N8N + scraping de 2 portales funcionando
- ✅ Schema Prisma Fase 1 diseñado y validado
- ✅ Repositorio degux.cl creado y configurado
- ✅ Plan de Trabajo V3 con progreso real documentado
- ✅ Decisión arquitectónica de base de datos evaluada

**Octubre - Hitos V4:**
- ✅ Investigación profunda de mercado completada (Gemini Deep Research)
- ✅ Validación de 3 oportunidades estratégicas
- ✅ Redefinición como InfraTech (vs PropTech)
- ✅ MLS Abierto identificado como diferenciador clave
- ✅ Modelo de monetización multicapa definido
- ✅ Estrategia Go-to-Market estructurada

---

## 📋 Resumen de Cambios V3 → V4 → V4.1

### Cambios Estratégicos Fundamentales (V3 → V4):

1. **Visión Ampliada**: De "PropTech regional" a "InfraTech del mercado inmobiliario chileno"
   - Concepto clave: "El GitHub del Sector Inmobiliario"

2. **MLS Abierto como Core**: Elevado de "feature" a "pilar fundamental"
   - Integrado en Fase 1, no como desarrollo posterior
   - Nuevos modelos: MLSListing, CollaborationRequest
   - Nuevas APIs: Colaboración, ofertas de comisión

3. **Modelo de Monetización Multicapa**: De "freemium genérico" a estrategia de 5 capas clara
   - Capa 1: MLS Core (gratuito, open source) - NO NEGOCIABLE
   - Capa 2: Servicios Enterprise (pay-per-use, sin suscripciones)
   - Capa 3: Marketplace B2B (comisiones)
   - Capa 4: Inteligencia de Mercado (créditos prepago)
   - Capa 5: Blog y Contenido Premium (NUEVA - sponsorships + contenido)

4. **Nuevas Oportunidades Identificadas**:
   - Parcelas Rurales (Fase 3-4): "Zillow para el Chile Rural"
   - Tasaciones Expropiación (Fase 5): Herramienta de empoderamiento

5. **Estrategia Go-to-Market Estructurada**: De indefinido a roadmap de 18 meses
   - Meses 1-6: MVP + 50 corredores fundadores
   - Meses 7-12: 200-500 corredores, >30% mercado Los Ríos
   - Meses 13-18: 1000+ corredores, 3-5 grandes corredoras

6. **Posicionamiento Competitivo Claro**: Diferenciación explícita vs competencia
   - No somos portal (vs. Portal Inmobiliario/Yapo)
   - No somos CRM cerrado (vs. KiteProp/Wasi)
   - No somos vertical (vs. Houm)
   - Somos **infraestructura horizontal abierta**

### Cambios Operacionales:

1. **Fase 1 Ampliada**: De 1-2 semanas a 3-4 semanas
   - Scope aumentado: Perfiles + MLS Core + Reputación
   - Estado ajustado: 50% → 40% (scope creció)

2. **Nuevas Decisiones Estratégicas Resueltas**:
   - Estrategia de producto (MLS como core)
   - Modelo de monetización (4 capas)
   - Tech stack long-term (mantener Next.js)

3. **Nuevas Decisiones Pendientes Identificadas**:
   - Licencia open source (MIT vs AGPL)
   - Nombre con énfasis en "MLS"
   - Timing expansión geográfica

### Validación de Mercado:

- ✅ Contexto macroeconómico: Contracción del 18% = momento perfecto para adopción gratuita
- ✅ Problema fragmentación: Validado (KiteProp/Wasi son jardines amurallados)
- ✅ Desconfianza en corredores: Documentada (Reddit, foros)
- ✅ Vacío regulatorio: Oportunidad para ser registro de facto

---

### Cambios Críticos V4 → V4.1 (Modelo Sin Suscripciones):

**Fecha:** 01 de Octubre, 2025 - Revisión del Modelo de Monetización

**Cambios Fundamentales:**

1. **Eliminación TOTAL de Planes de Suscripción**
   - **Antes (V4)**: Suscripciones mensuales en Capa 2 y Capa 4
   - **Ahora (V4.1)**: Modelo 100% sin suscripciones recurrentes

2. **Capa 2 - Servicios Enterprise Rediseñados**
   - Licencias perpetuas (pago único): $2.5M-5M CLP
   - Soporte on-demand: $50K-150K CLP/ticket
   - Integraciones custom: $800K-2.5M CLP (proyecto)
   - **Ventaja**: Pago único más alto, sin fricción de renovaciones

3. **Capa 4 - Datos con Sistema de Créditos Prepago**
   - **Antes**: Suscripción API $500K-2M CLP/mes
   - **Ahora**: Paquetes de créditos sin expiración
     - Starter: $200K = 1,000 créditos
     - Professional: $800K = 5,000 créditos (+25% bonus)
     - Enterprise: $3M = 25,000 créditos (+50% bonus)
   - Reportes individuales: $120K-250K CLP (pago único)

4. **Capa 5 - Blog y Contenido Premium (NUEVA)**
   - **Contenido Premium**: eBooks ($25K-35K CLP), webinars ($15K-45K CLP)
   - **Sponsorships**: Newsletter ($300K/mes), categorías ($200K/mes)
   - **Proyección**: $1.3M-2.6M CLP/mes en 6 meses
   - **Único ingreso recurrente**: Sponsorships (pasivo, no suscripción de usuarios)

5. **Fase 3 Expandida**
   - **Duración**: 2 semanas → 3-4 semanas
   - **Prioridad**: MEDIA → ALTA (revenue stream clave)
   - **Nuevos entregables**: Sistema de pagos, newsletter, sponsorships, lead gen

**Ventajas Estratégicas del Nuevo Modelo:**

✅ **Menor Fricción de Adopción**
- No hay compromisos mensuales que generen resistencia
- Empresas pagan solo por lo que necesitan, cuando lo necesitan

✅ **Mayor Valor por Transacción**
- Licencias perpetuas: $2.5M-5M (vs $200K-1M mensual)
- Pagos únicos más altos = mejor flujo de caja inicial

✅ **Alineación de Incentivos**
- Modelo de comisiones (Capa 3): ganamos cuando el cliente gana
- Créditos prepago: cliente controla su inversión

✅ **Diferenciación Clara vs. Competencia**
- KiteProp/Wasi: suscripciones obligatorias
- degux.cl: pago por uso real, sin lock-in

✅ **Sostenibilidad de Infraestructura**
- Costos fijos: ~$135K CLP/mes
- Break-even alcanzable en Q1 2026 con blog + 1 venta enterprise
- Múltiples revenue streams independientes

**Proyección Actualizada:**
- **12 meses**: $3-4M CLP/mes (vs $2-3M anterior)
- **18 meses**: $8-10M CLP/mes (vs $5-7M anterior)
- **Total proyectado**: $10-14M CLP/mes (vs $7-11M anterior)

**Próximos Pasos Inmediatos:**
1. Validar pricing con 3-5 corredoras grandes (Fase 2)
2. Diseñar sistema de créditos prepago (backend)
3. Planificar contenido premium para blog (Q1 2026)
4. Contactar potenciales sponsors (bancos, desarrolladores)

---

## 📚 Referencias y Fuentes

### Documentación Interna:
- **Plan de Trabajo V3**: Versión anterior (30 Sep 2025)
- **Investigación Gemini**: `docs/09-research/gemini-deep-research/Nichos Inmobiliarios Chile_ PropTech Colaborativo.md`

### Fuentes de Investigación (Informe Gemini):
- Cámara Chilena de la Construcción: Caída 18% ventas Q1 2025
- PropTech Latam: Reconocimiento startups chilenas
- Reddit Chile: Análisis de quejas sobre corredores
- Ley 18.796: Derogación Registro Nacional de Corredores
- Ley 21.442: Nueva Ley Copropiedad (digitalización)
- Multiple Listing Service (Wikipedia, NAR, Investopedia)

### Próximos Pasos de Investigación:
- [ ] Entrevistas con 10 corredores independientes Los Ríos
- [ ] Análisis de competencia: KiteProp, Wasi (pricing, features)
- [ ] Benchmark MLS internacionales (España, Argentina, México)
- [ ] Validación pricing Capa 2 con grandes corredoras

---

**Siguiente Revisión:** 07 de Octubre, 2025
**Responsable Seguimiento:** Gabriel & Mona (alternando weekly)
**Versión del Documento:** 4.1
**Estado del Proyecto:** Fase 1 - 40% Completado

---

*Documento viviente - actualizar conforme progresa el proyecto*

**Historial de Versiones:**
- **V4.1** (01 Oct 2025): Modelo sin suscripciones + monetización de blog
- **V4.0** (01 Oct 2025): Integración investigación Gemini Deep Research
- **V3.0** (30 Sep 2025): Arquitectura técnica completa y roadmap detallado
- **V2.0** (Sep 2025): Primera versión con infraestructura VPS documentada
