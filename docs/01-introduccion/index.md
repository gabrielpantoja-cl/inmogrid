# Introducción - Nexus Core

Este documento proporciona una visión general de **Nexus Core - Ecosistema Digital Colaborativo**, una iniciativa de datos abiertos diseñada para democratizar el acceso a información inmobiliaria en Chile.

## Propósito

**Nexus Core** es un ecosistema digital colaborativo y de código abierto donde profesionales del sector inmobiliario chileno pueden conectarse, compartir conocimiento, gestionar propiedades y acceder a datos transparentes del mercado. La plataforma integra múltiples herramientas profesionales en un solo lugar, fomentando la colaboración y el desarrollo informado del sector.

### Nuestra Filosofía

Creemos que los datos sobre transacciones de propiedades, siendo de origen público (Conservador de Bienes Raíces), deben permanecer accesibles para toda la comunidad. Nuestra plataforma utiliza tecnología moderna y principios de software libre para garantizar que esta información vital no quede concentrada en manos de pocos, sino que sirva al desarrollo informado del mercado inmobiliario chileno y al ejercicio de derechos ciudadanos.

**Principios Fundamentales:**
- **Transparencia Radical:** Todos los datos públicos son accesibles sin barreras económicas
- **Colaboración Abierta:** La comunidad es el verdadero propietario de la información
- **Tecnología Liberadora:** Software libre que permite auditabilidad y confianza
- **API Abierta:** Datos exportables y reutilizables por cualquier desarrollador o investigador
- **Modelo Freemium:** Herramientas básicas gratuitas, premium para profesionales avanzados

## Componentes del Ecosistema

Nexus Core se desarrolla en **5 fases** progresivas:

### ✅ Fase 0: Infraestructura (COMPLETADA - Ago 2025)
- VPS Digital Ocean con 7+ servicios activos
- PostgreSQL dedicado + PostGIS (port 5433)
- N8N workflows para scraping automatizado
- Nginx + SSL (Let's Encrypt)
- Backups automatizados

### 🔄 Fase 1: User Profiles (EN PROGRESO - 50%)
**Prioridad**: ALTA | **Duración**: Sept-Oct 2025

- **Perfiles Profesionales:** Bio, profesión, empresa, contacto, LinkedIn
- **Gestión de Propiedades:** Publicación multi-tenant de propiedades
- **Sistema de Conexiones:** Networking entre profesionales del sector
- **APIs Privadas:** `/api/users/profile`, `/api/properties`, `/api/connections`

### 🔜 Fase 2: Networking (Oct-Nov 2025)
- Directorio profesional con filtros avanzados
- Mensajería 1-to-1 entre conexiones
- Foro de discusión por categorías
- Sistema de notificaciones (N8N)

### 🔜 Fase 3: Blog & Data Center (Nov-Dec 2025)
- CMS para blog con MDX
- Data stories con visualizaciones interactivas
- Reportes automatizados de mercado
- SEO optimization

### 🔜 Fase 4: Sofía - AI Bot RAG (Dic 2025-Ene 2026)
- Asistente AI con Anthropic Claude
- Vector database (pgvector)
- RAG sobre referenciales + blog + docs legales
- Widget flotante global

### 🔜 Fase 5: Real Estate CRM (Feb-Mar 2026)
- Gestión de clientes y leads
- Pipeline Kanban de ventas
- Automatización de tareas
- Reportes de performance

## Funcionalidades Clave (Fase 1)

### Sistema de Autenticación
- Google OAuth exclusivo (NextAuth.js v4)
- Sesiones JWT con 24 horas de expiración
- Middleware de protección de rutas

### Gestión de Perfiles
- Información profesional completa
- Privacidad configurable (perfil público/privado)
- Avatar y enlaces sociales (LinkedIn, sitio web)
- Ubicación (región y comuna)

### Gestión de Propiedades
- CRUD completo de propiedades
- Upload de imágenes múltiples
- Datos estructurados (superficie, habitaciones, precio)
- Estados: disponible, reservado, vendido, inactivo
- Aislamiento multi-tenant (users solo ven sus propiedades)

### Sistema de Networking
- Solicitudes de conexión con mensaje personalizado
- Estados: pendiente, aceptado, rechazado, bloqueado
- Directorio de profesionales públicos
- Visualización de perfiles públicos

### Referenciales CBR (Existente)
- Gestión de transacciones del Conservador de Bienes Raíces
- Visualización en mapa interactivo
- Módulo de estadísticas avanzadas
- Exportación a XLSX y PDF
- PostGIS para consultas espaciales

### API Pública
- Endpoints sin autenticación para integraciones externas
- Datos geoespaciales del mapa
- Exclusión de información sensible
- CORS habilitado

## Arquitectura Técnica

### Stack Tecnológico
- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Base de Datos:** PostgreSQL 15 + PostGIS (self-hosted VPS, port 5433)
- **Autenticación:** NextAuth.js v4 (Google OAuth)
- **Automatización:** N8N workflows (scraping, notificaciones)
- **Infraestructura:** Docker Compose en VPS Digital Ocean
- **Web Server:** Nginx con SSL/TLS (Let's Encrypt)

### Infraestructura VPS
```
VPS Digital Ocean ([IP_VPS])
├─ Nginx (80/443) - Reverse proxy + SSL
├─ N8N Stack (port 5432 - Aislado)
├─ Nexus Core DB (port 5433 - Dedicado)
├─ Nexus App (port 3000 - Por desplegar)
└─ Portainer (9443) - Docker management
```

## Documentación Principal

Para entender el proyecto completo, **consulta el documento fundamental**:

### 📋 [Plan de Trabajo V3.0](./Plan_Trabajo_Ecosistema_Digital_V3.md)
**Documento maestro del proyecto** que incluye:
- Visión y transformación de degux.cl a Nexus Core
- Detalle completo de las 6 fases de desarrollo (0-5)
- Arquitectura de infraestructura (VPS, Docker, N8N)
- Decisiones técnicas clave (PostgreSQL dedicado, NextAuth, etc.)
- Modelo de negocio y estrategia de monetización
- Roadmap temporal con milestones
- Métricas de éxito (KPIs) por fase

## Documentación Técnica Adicional

### Guías de Arquitectura
- **[Arquitectura General](./arquitectura-general.md)** - Overview técnico del sistema
- **[Tecnologías](./tecnologias.md)** - Stack tecnológico detallado

### Guías de Desarrollo
- **[Guía de Desarrollo](../02-desarrollo/DEVELOPMENT_GUIDE.md)** - Patrones y convenciones
- **[Guía de Autenticación](../02-desarrollo/AUTHENTICATION_GUIDE.md)** - Debugging NextAuth.js
- **[Guía de Base de Datos](../02-desarrollo/DATABASE_SCHEMA_GUIDE.md)** - Schema Prisma + PostGIS

### APIs y Módulos
- **[Guía de API Pública](../04-api/PUBLIC_API_GUIDE.md)** - Integración con endpoints públicos
- **[Módulo de Estadísticas Avanzadas](../05-modulos/ADVANCED_STATISTICS_MODULE_GUIDE.md)** - Análisis espacial y reportes PDF

### Investigación de Mercado
- **[Research & Market Analysis](../09-research/README.md)** - Informes de Gemini Deep Research

## Agentes Especializados Claude

El proyecto utiliza **7 agentes especializados** para desarrollo:

1. **nexus-core-orchestrator** - Coordinador maestro
2. **api-developer-agent** - Diseño de APIs REST
3. **database-manager-agent** - PostgreSQL + PostGIS
4. **data-ingestion-agent** - N8N workflows + validación de datos chilenos
5. **security-auditor-agent** - OWASP + leyes chilenas
6. **infrastructure-agent** - VPS, Docker, Nginx
7. **frontend-agent** - Next.js 15, React 19, Tailwind

**Documentación**: Ver `.claude/agents/` en la raíz del proyecto

## Estado Actual del Proyecto

**Fase Actual:** Fase 1 - User Profiles (50% completado)

**Próximos Hitos:**
1. Completar PostgreSQL dedicado en VPS
2. Implementar APIs de User Profile
3. Desarrollar interfaces de Property Management
4. Lanzar directorio profesional público

**Repositorio:** [gabrielpantoja-cl/new-project-nexus-core](https://github.com/gabrielpantoja-cl/new-project-nexus-core)

---

**Fecha de última actualización:** Octubre 2025
**Versión del documento:** 2.0 - Actualizado para Nexus Core Ecosystem
