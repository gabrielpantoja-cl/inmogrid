# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**degux.cl** somos un lienzo digital para tu marca personal. Un espacio libre y abierto donde puedes construir tu perfil, publicar tu trabajo, compartir tus ideas y conectar con una comunidad de creadadores y profesionales.

Imagina una mezcla entre **Substack**, **Behance** y **Linktree**, con un fuerte sentido de comunidad local.

**degux - Ecosistema Digital Colaborativo** is a comprehensive Next.js 15 platform for the Chilean real estate ecosystem. It features:

- **Public API**: Unauthenticated endpoints for external integrations (geospatial data, market statistics)
- **User Profiles**: Professional profiles with bio, profession, company, networking capabilities
- **Property Management**: User-owned property listings with multi-tenant isolation
- **Networking System**: Connection requests, professional directory, messaging, forum (Phase 2)
- **Blog & Data Center**: Market insights, data stories with interactive charts (Phase 3)
- **Sofía AI Bot**: RAG-based assistant for real estate queries (Phase 4)
- **Real Estate CRM**: Client management, deals pipeline, task automation (Phase 5)
- **Advanced Statistics Module**: Interactive maps with area selection and comprehensive PDF reports
- **Google OAuth**: Exclusive authentication via Google accounts
- **PostGIS Integration**: Spatial data management with PostgreSQL + PostGIS
- **N8N Automation**: Data scraping workflows (Portal Inmobiliario, Mercado Libre)

## Development Phases

**Current State**: Phase 1 (User Profiles) - 50% Complete

### Phase 0: Infrastructure ✅ COMPLETED (Aug 2025)
- VPS Digital Ocean with 7+ active services
- Nginx + SSL (Let's Encrypt)
- PostgreSQL dedicated (port 5433)
- N8N workflows (Portal + Mercado Libre scrapers)
- Automated backups

### Phase 1: User Profiles 🔄 IN PROGRESS (Sept-Oct 2025)
**Priority**: HIGH
- User profile management (bio, profession, company, linkedin)
- Property CRUD operations (multi-tenant)
- Connection system (networking between professionals)
- APIs: `/api/users/profile`, `/api/properties`, `/api/connections`

### Phase 2: Networking (Oct-Nov 2025)
- Connection requests and professional directory
- 1-to-1 messaging system
- Discussion forum by categories
- Notifications via N8N

### Phase 3: Blog & Data Center (Nov-Dec 2025)
- Blog CMS with MDX support
- Data stories with interactive charts
- Automated market reports (N8N)

### Phase 4: Sofía - AI Bot RAG (Dec 2025-Jan 2026)
- Vector DB (pgvector)
- Anthropic Claude API integration
- Global floating widget

### Phase 5: Real Estate CRM (Feb-Mar 2026)
- Client and lead management
- Kanban sales pipeline
- Performance reports

**Full details**: See `docs/01-introduccion/Plan_Trabajo_Ecosistema_Digital_V4.md`

## Development Commands

### Essential Commands
```bash
# Development server with turbo
npm run dev

# Build application (includes Prisma generation)
npm run build

# Database operations
npm run prisma:generate    # Generate Prisma client
npm run prisma:push       # Apply schema to database
npm run prisma:studio     # Open database browser

# Testing
npm run test              # Run Jest tests
npm run test:watch        # Watch mode
npm run test:api          # Test API endpoints
npm run test:public-api   # Test public API specifically

# Linting and type checking
npm run lint              # ESLint
npx tsc --noEmit         # TypeScript type checking
```

### Database Management
```bash
# Database reset sequence (use carefully)
npm run prisma:reset     # Generate + push schema
npm run seed             # Populate with sample data

# Health checks
npm run api:health       # Basic API health
npm run api:validate     # Validate public API
```

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15 (App Router)
- **React**: React 19 (Server Components + Client Components)
- **Database**: PostgreSQL 15 + PostGIS (self-hosted on VPS, port 5433)
- **ORM**: Prisma with spatial data support
- **Authentication**: NextAuth.js v4 (Google OAuth only)
- **UI**: Tailwind CSS with custom components
- **Maps**: React Leaflet with PostGIS geometry
- **Charts**: Recharts for statistical visualizations
- **PDF Generation**: jsPDF + html2canvas for comprehensive reports
- **Automation**: N8N workflows (data scraping, notifications)
- **Infrastructure**: Docker Compose on Digital Ocean VPS (VPS_IP_REDACTED)

### Infrastructure Architecture

**IMPORTANT**: All services run in Docker Compose. NO native systemd services are used (e.g., no PM2, no native Nginx). The architecture differs between production (VPS) and local development.

#### Production Architecture (VPS)

**VPS Services (Docker Compose):**
```
Internet → Cloudflare
    ↓
VPS Digital Ocean (VPS_IP_REDACTED)
    ↓
nginx-proxy (Docker) :80, :443 ← Reverse proxy + SSL
    ↓
┌─────────────────────────────────────────────┐
│      Docker Containers (vps_network)        │
├─────────────────────────────────────────────┤
│  degux-web (Port 3000)   ← degux.cl App     │
│  degux-db (Port 5433)    ← degux.cl DB      │
│  n8n (Port 5678)         ← N8N UI           │
│  n8n-db (Port 5432)      ← N8N DB           │
│  n8n-redis (Port 6379)   ← N8N Cache        │
│  portainer (Port 9443)   ← Docker UI        │
└─────────────────────────────────────────────┘
```

**Database Architecture (Production):**
- **degux-db (Port 5433)**: PostgreSQL database for the main `degux.cl` application.
- **n8n-db (Port 5432)**: Separate PostgreSQL database exclusively for `n8n` workflow data.
- Databases are isolated in separate containers for security and failure containment.

#### Local Development Architecture

For local development, a simplified setup is defined in `docker-compose.local.yml`:
- **degux-postgres-local**: A self-contained PostgreSQL container for the application database. It maps port `5432` on the host to the container's port `5432`.
- **degux-adminer-local**: An optional Adminer container for database management, accessible on host port `8080`.

**Deployment Method:**
- Use `scripts/deploy-to-vps.sh` (automated Docker deployment)
- See `docs/06-deployment/DEPLOYMENT_GUIDE.md` for details

### Directory Structure (src/)
```
src/
├── app/                 # Next.js App Router pages
│   ├── (auth)/         # Authentication group
│   │   ├── signin/
│   │   └── error/
│   ├── (dashboard)/    # Protected routes group
│   │   ├── perfil/     # User profile management
│   │   ├── propiedades/ # Property management
│   │   └── estadisticas/ # Advanced Statistics Module
│   ├── networking/     # Public profiles + directory
│   │   ├── page.tsx    # Professional directory
│   │   └── [userId]/   # Public profile view
│   ├── api/            # API routes
│   │   ├── public/     # Public API (no auth required)
│   │   ├── auth/       # NextAuth.js routes
│   │   ├── users/      # User profile APIs
│   │   └── properties/ # Property CRUD APIs
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   │   ├── primitives/ # Base components (buttons, inputs)
│   │   ├── features/   # Feature components
│   │   ├── estadisticas/ # Statistics module components
│   │   └── mapa/      # Map and chart components
│   ├── forms/         # Form components
│   └── layouts/       # Layout components
├── lib/               # Utilities and configurations
│   ├── auth.config.ts # NextAuth configuration
│   └── prisma.ts      # Prisma client
├── hooks/             # Custom React hooks
│   ├── useUser.ts
│   ├── useProperties.ts
│   └── useConnections.ts
├── types/             # TypeScript type definitions
└── middleware.ts      # Route protection and CORS
```

### Import Patterns
Use absolute imports with configured aliases:
```typescript
// ✅ Correct
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/primitives/button'

// ❌ Incorrect
import { authOptions } from '../../../lib/auth.config'
```

## Critical System Components

### Authentication System
- **Provider**: Google OAuth 2.0 only
- **Configuration**: `src/lib/auth.config.ts` (NextAuth v4)
- **Session Strategy**: JWT with 24-hour expiration
- **Protection**: Middleware-based route protection
- **IMPORTANT**: Never modify schema relations from `user` to `User` - breaks NextAuth adapter

### Database Schema (Prisma)

**Phase 1 Models (Current):**
- **User**: NextAuth.js compatible + professional profile fields
  - Basic: name, email, image, role
  - Profile: bio, profession, company, phone, region, commune, website, linkedin
  - Privacy: `isPublicProfile` boolean
- **Property**: Multi-tenant property management
  - Location: address, commune, region, lat, lng
  - Details: bedrooms, bathrooms, parkingSpots, surfaces
  - Pricing: price, currency (CLP)
  - Images: array of image URLs
  - Status: available, reserved, sold, inactive
- **Connection**: Networking between professionals
  - Parties: requesterId, receiverId
  - Status: pending, accepted, rejected, blocked
  - Message: optional connection request message
- **Referenciales**: CBR transaction data (existing)
  - PostGIS geometry for spatial queries

**Future Models:**
- **Phase 2**: Message, ForumPost, ForumReply
- **Phase 3**: BlogPost, BlogTag
- **Phase 4**: ChatConversation, VectorEmbedding (pgvector)
- **Phase 5**: CRMClient, CRMDeal

**Database Connection Examples:**
```env
# Local Development (connects to 'degux-postgres-local' container)
# Credentials from docker-compose.local.yml
POSTGRES_PRISMA_URL="postgresql://degux_user:degux_local_password@localhost:5432/degux_dev?schema=public"

# VPS PostgreSQL dedicated (production/staging)
POSTGRES_PRISMA_URL="postgresql://degux_user:PASSWORD@VPS_IP_REDACTED:5433/degux_core?schema=public&sslmode=require"
```

**Migration Guidelines:**
- Use `npx prisma db push` for development
- Use `npx prisma migrate dev` for production migrations
- **🚨 CRITICAL - NextAuth Prisma Adapter**: Maintain lowercase relation names (`user`, not `User`) for NextAuth compatibility
  - ❌ WRONG: `model Account { User User @relation(...) }`
  - ✅ CORRECT: `model Account { user User @relation(...) }`
  - Affected models: `Account.user`, `Session.user`
  - Breaking this causes: `PrismaClientValidationError: Unknown field 'User'`
  - Reference: `docs/03-arquitectura/GOOGLE_OAUTH_DIAGNOSTICS_RESOLVED.md` (Problema #5)
- **ALWAYS**: Add `@updatedAt` decorator to all `updatedAt` fields for auto-update
- **YOU MUST**: Always validate Chilean property data consistency (ROL, fojas, CBR numbers)
- **IMPORTANT**: Implement Row Level Security (RLS) for multi-tenant data isolation

### API Architecture

**Public API (No Authentication):**
```
/api/public/
├── map-data/       # Geospatial real estate data
├── map-config/     # API metadata and configuration
├── health/         # System health checks
└── docs/          # Interactive API documentation
```

**Private API (Authenticated):**
```
/api/
├── users/
│   ├── profile           # GET/PUT current user profile
│   ├── profile/avatar    # POST upload avatar
│   └── [userId]          # GET public profile
├── properties/
│   ├── /                 # GET/POST properties
│   ├── [id]              # GET/PUT/DELETE property
│   └── [id]/images       # POST upload images
└── connections/
    ├── /                 # GET connections
    ├── request           # POST connection request
    └── [id]              # PUT/DELETE connection
```

### Middleware Configuration
- **Public Routes**: `/api/public/*`, `/api/auth/*`, static assets
- **Protected Routes**: `/dashboard/*`, `/api/users/*`, `/api/properties/*`, `/api/connections/*`
- **CORS**: Enabled for public API endpoints (`*` origin)

## Common Workflows

### Phase 1 Development Tasks

**User Profile Management:**
1. Edit profile: `/dashboard/perfil`
2. View public profile: `/networking/[userId]`
3. API endpoints: `GET/PUT /api/users/profile`

**Property Management:**
1. List properties: `/dashboard/propiedades`
2. Create property: `/dashboard/propiedades/crear`
3. Edit property: `/dashboard/propiedades/[id]/editar`
4. API endpoints: `GET/POST /api/properties`, `PUT/DELETE /api/properties/[id]`

**Networking:**
1. Professional directory: `/networking`
2. Send connection request: Click "Conectar" on user profile
3. API endpoints: `POST /api/connections/request`, `GET /api/connections`

### Adding New Real Estate References
1. Use protected dashboard at `/dashboard/referenciales/create`
2. CSV bulk upload available via `/dashboard/referenciales` page
3. Automatic geocoding via Google Maps API
4. PostGIS geometry automatically generated

### Database Schema Changes
1. Modify `prisma/schema.prisma`
2. **🚨 CRITICAL**: Verify lowercase relation names for NextAuth models (`Account.user`, `Session.user`)
3. Add `@updatedAt` to any new `updatedAt` fields
4. Run `npm run prisma:push` (development) or create migration (production)
5. Run `npm run prisma:generate` to update client
6. Verify tests still pass: `npm run test`

### Testing APIs
```bash
# Public API
curl "http://localhost:3000/api/public/map-data?comuna=santiago&limit=5"
curl "http://localhost:3000/api/public/health?stats=true"

# Private API (requires authentication)
# Use browser with active session or add Authorization header
```

### Using Advanced Statistics Module
1. Access module at `/dashboard/estadisticas`
2. Navigate and search locations on interactive map
3. Use circle tool to select areas for analysis
4. Review real-time statistics and multiple chart types
5. Generate comprehensive PDF reports for CBR review

**Key Features:**
- **Interactive Map**: Circle selection with PostGIS spatial queries
- **Real-time Analytics**: 6 different chart types (scatter, trends, histograms)
- **Always-visible Statistics**: Price metrics, surface analysis, market trends
- **Comprehensive PDF Reports**: 3-page format optimized for property registry review
- **CBR Integration**: Complete field listing (fojas, número, año, CBR, ROL, etc.)

**PDF Report Structure:**.
- Page 1: Executive summary and main chart (portrait)
- Page 2: Complete property table for CBR review (landscape)
- Page 3: Additional information and field explanations (portrait)

For detailed documentation, see `docs/ADVANCED_STATISTICS_MODULE_GUIDE.md`

## Environment Variables

### Required Variables
```env
# Database (VPS PostgreSQL dedicated)
POSTGRES_PRISMA_URL=postgresql://degux_user:PASSWORD@VPS_IP_REDACTED:5433/degux_core?schema=public&sslmode=require

# NextAuth.js (Google OAuth)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=https://degux.cl
NEXTAUTH_SECRET=your_secure_random_secret  # min 32 chars

# Google Maps API (Geocoding)
GOOGLE_MAPS_API_KEY=your_maps_api_key

# N8N Webhooks (optional, for bulk imports)
N8N_WEBHOOK_URL=http://VPS_IP_REDACTED:5678/webhook/bulk-import
N8N_WEBHOOK_SECRET=your_webhook_secret
```

### Google OAuth Setup
- Authorized redirect URIs must include:
  - `https://degux.cl/api/auth/callback/google`
  - `http://localhost:3000/api/auth/callback/google`

### Google Maps API Restrictions
- Restrict to specific domains: `degux.cl`, `localhost`
- Restrict to Geocoding API only
- Set daily quota limits

## Specialized Claude Agents

This project uses 7 specialized Claude Code agents for development:

1. **degux-orchestrator**: Master coordinator for multi-agent workflows
2. **api-developer-agent**: RESTful API design and implementation
3. **database-manager-agent**: PostgreSQL dedicated management, RLS policies
4. **data-ingestion-agent**: N8N workflows and Chilean data validation
5. **security-auditor-agent**: OWASP compliance and Chilean data protection
6. **infrastructure-agent**: VPS, Docker, Nginx, SSL management
7. **frontend-agent**: Next.js 15, React 19, Tailwind CSS development

**Agent Documentation**: See `.claude/agents/` directory

## Troubleshooting

### Authentication Issues
- Check `docs/AUTHENTICATION_GUIDE.md` for comprehensive debugging
- Verify Google Cloud Console redirect URIs match exactly
- Ensure all environment variables are set correctly
- Check middleware isn't blocking auth routes

### Database Connection Issues
```bash
# Verify database connection with Prisma
npx prisma studio

# Check Local Docker DB Status (if running from docker-compose.local.yml)
docker ps | grep degux-postgres-local

# Connect to Local Docker DB
docker exec -it degux-postgres-local psql -U degux_user -d degux_dev

# Check VPS Production DB Status (via SSH)
ssh gabriel@VPS_IP_REDACTED "docker ps | grep degux-db"

# Connect to VPS Production DB (via SSH)
ssh gabriel@VPS_IP_REDACTED "docker exec -it degux-db psql -U degux_user -d degux_core"
```

### Build/Type Errors
```bash
# Clean and regenerate
npx prisma generate
rm -rf .next
npm run dev
```

### Public API CORS Issues
- Public API has CORS enabled for all origins
- Verify middleware configuration in `src/middleware.ts`
- Check API routes are under `/api/public/` path

### N8N Workflow Issues
- Access N8N at http://VPS_IP_REDACTED:5678 (VPN/firewall may be required)
- Check N8N logs: `docker logs n8n`
- Verify webhook endpoints are accessible

## Security Considerations

- **Public API**: No authentication required, but excludes sensitive data (names, amounts)
- **Row Level Security**: Implement RLS for User, Property, Connection tables
- **Multi-tenant Isolation**: Users can only access their own data
- **Rate Limiting**: Nginx configured with rate limiting (10 req/s for API)
- **Data Sanitization**: All public API responses exclude personal information
- **CSP Headers**: Configured in `next.config.js` for security
- **Input Validation**: All API endpoints validate using Zod schemas
- **IMPORTANT**: Follow OWASP Top 10 guidelines
- **YOU MUST**: Regular security audits for Chilean property data protection
- **Compliance**: Adhere to Chilean data protection laws (Ley 19.628)

**Security Agent**: Use `security-auditor-agent` for vulnerability assessments

## VPS Infrastructure

### Access and Management
- **IP**: VPS_IP_REDACTED
- **SSH**: `ssh gabriel@VPS_IP_REDACTED`
- **Docker**: All services run in Docker containers
- **Monitoring**: Portainer at https://VPS_IP_REDACTED:9443

### Service Health Checks
```bash
# Check all Docker containers on VPS
ssh gabriel@VPS_IP_REDACTED "docker ps"

# Check degux database container on VPS
ssh gabriel@VPS_IP_REDACTED "docker logs degux-db"

# Check N8N container on VPS
ssh gabriel@VPS_IP_REDACTED "docker logs n8n"

# Check Nginx proxy container on VPS
ssh gabriel@VPS_IP_REDACTED "docker ps | grep nginx-proxy"
```

### Backup Strategy
- **PostgreSQL degux**: Automated daily backups at 3 AM
- **Retention**: 7 daily, 4 weekly, 6 monthly
- **Location**: `/home/gabriel/vps-do/degux/backups/`
- **Restore**: See `InfrastructureAgent.md` for procedures

**Infrastructure Agent**: Use `infrastructure-agent` for VPS management tasks

## Chilean Real Estate Domain

### Data Standards
- **ROL**: Municipal property identifier (format: `XXXXX-XXXX`)
- **Fojas**: Page number in property registry
- **Número**: Entry number in registry
- **Año**: Registry year (1900-present)
- **CBR**: Conservador de Bienes Raíces office code
- **Commune**: 346 Chilean communes
- **Region**: 16 Chilean regions

### Validation Rules
- ROL format: `/^\d{5}-\d{4}$/`
- Geographic bounds: lat -56.0 to -17.5, lng -76.0 to -66.0
- Price ranges by commune and property type
- Surface area reasonableness checks

**Data Agent**: Use `data-ingestion-agent` for Chilean data validation

## References

### Documentation
- **Project Plan**: `docs/01-introduccion/Plan_Trabajo_Ecosistema_Digital_V4.md` - Complete development roadmap
- **README**: `README.md` - Project overview and setup instructions
- **Deployment**: `docs/06-deployment/DEPLOYMENT_GUIDE.md` - Docker deployment guide
- **VPS Architecture**: `docs/06-deployment/PUERTOS_VPS.md` - Port mapping and container architecture
- **Authentication**: `docs/AUTHENTICATION_GUIDE.md` - Auth debugging guide
- **Public API**: `docs/PUBLIC_API_GUIDE.md` - API integration guide
- **Advanced Statistics**: `docs/ADVANCED_STATISTICS_MODULE_GUIDE.md` - Statistics module docs
- **Development**: `docs/DEVELOPMENT_GUIDE.md` - Development patterns
- **Database Schema**: `docs/DATABASE_SCHEMA_GUIDE.md` - Schema structure

### Specialized Agents
- **Orchestrator**: `.claude/agents/degux-orchestrator.md`
- **API Development**: `.claude/agents/APIDeveloperAgent.md`
- **Database Management**: `.claude/agents/DatabaseManagerAgent.md`
- **Data Ingestion**: `.claude/agents/DataIngestionAgent.md`
- **Security Auditing**: `.claude/agents/SecurityAuditorAgent.md`
- **Infrastructure**: `.claude/agents/InfrastructureAgent.md`
- **Frontend**: `.claude/agents/FrontendAgent.md`

### VPS Documentation
- **Docker Compose Files**: `/home/gabriel/vps-do/docker-compose*.yml` (on VPS)
- **Nginx Configs**: `/etc/nginx/sites-available/` (Nginx nativo systemd)
- **SSL Certificates**: `/etc/letsencrypt/` (Let's Encrypt certbot)
- **Deployment Script**: `scripts/deploy-to-vps.sh` (automated Docker deployment)
- **System Estado Actual**: `docs/06-deployment/SISTEMA_ACTUAL_2025-10-11.md` (documentación completa VPS)
- **Postmortems**: `docs/06-deployment/POSTMORTEM_*.md` (incidentes y lecciones aprendidas)

### External Resources
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js 15**: https://nextjs.org/docs
- **NextAuth.js v4**: https://next-auth.js.org
- **PostGIS**: https://postgis.net/documentation
- **N8N**: https://docs.n8n.io
