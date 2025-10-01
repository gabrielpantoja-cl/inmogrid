# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**IMPORTANT**: Nexus Core is an open data initiative that democratizes access to real estate information in Chile. We believe that property transaction data, being of public origin (Conservador de Bienes Raíces), should remain accessible to the entire community. Our platform uses modern technology and free software principles to ensure that this vital information is not concentrated in the hands of a few, but serves the informed development of the Chilean real estate market and the exercise of citizen rights.

**Nexus Core - Ecosistema Digital Colaborativo** is a comprehensive Next.js 15 platform for the Chilean real estate ecosystem. It features:

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

**Full details**: See `docs/01-introduccion/Plan_Trabajo_Ecosistema_Digital_V3.md`

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

**VPS Services:**
```
VPS Digital Ocean (VPS_IP_REDACTED)
├─ Nginx (Ports 80/443) - Reverse proxy + SSL
├─ N8N Stack (Isolated)
│  ├─ N8N Web (Port 5678)
│  ├─ N8N PostgreSQL (Port 5432)
│  └─ N8N Redis
├─ Nexus Core Stack
│  ├─ Nexus DB PostgreSQL (Port 5433) ← DEDICATED
│  └─ Nexus App (Port 3000) - To deploy
└─ Portainer (Port 9443) - Docker management
```

**Database Isolation:**
- **Port 5432**: N8N database (workflows, scrapers) - ISOLATED
- **Port 5433**: Nexus Core database (app data) - DEDICATED
- No cross-database dependencies for failure isolation

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

**Database Connection:**
```env
# Local development (if using local PostgreSQL)
POSTGRES_PRISMA_URL="postgresql://user:pass@localhost:5432/nexus_dev?schema=public"

# VPS PostgreSQL dedicated (production/staging)
POSTGRES_PRISMA_URL="postgresql://nexus_user:PASSWORD@VPS_IP_REDACTED:5433/nexus_core?schema=public&sslmode=require"
```

**Migration Guidelines:**
- Use `npx prisma db push` for development
- Use `npx prisma migrate dev` for production migrations
- **CRITICAL**: Maintain lowercase relation names (`user`, not `User`) for NextAuth compatibility
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
2. Run `npm run prisma:push` (development) or create migration (production)
3. **CRITICAL**: Maintain lowercase relation names (`user`, not `User`) for NextAuth compatibility
4. Run `npm run prisma:generate` to update client

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

**PDF Report Structure:**
- Page 1: Executive summary and main chart (portrait)
- Page 2: Complete property table for CBR review (landscape)
- Page 3: Additional information and field explanations (portrait)

For detailed documentation, see `docs/ADVANCED_STATISTICS_MODULE_GUIDE.md`

## Environment Variables

### Required Variables
```env
# Database (VPS PostgreSQL dedicated)
POSTGRES_PRISMA_URL=postgresql://nexus_user:PASSWORD@VPS_IP_REDACTED:5433/nexus_core?schema=public&sslmode=require

# NextAuth.js (Google OAuth)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=https://referenciales.cl
NEXTAUTH_SECRET=your_secure_random_secret  # min 32 chars

# Google Maps API (Geocoding)
GOOGLE_MAPS_API_KEY=your_maps_api_key

# N8N Webhooks (optional, for bulk imports)
N8N_WEBHOOK_URL=http://VPS_IP_REDACTED:5678/webhook/bulk-import
N8N_WEBHOOK_SECRET=your_webhook_secret
```

### Google OAuth Setup
- Authorized redirect URIs must include:
  - `https://referenciales.cl/api/auth/callback/google`
  - `http://localhost:3000/api/auth/callback/google`

### Google Maps API Restrictions
- Restrict to specific domains: `referenciales.cl`, `localhost`
- Restrict to Geocoding API only
- Set daily quota limits

## Specialized Claude Agents

This project uses 7 specialized Claude Code agents for development:

1. **nexus-core-orchestrator**: Master coordinator for multi-agent workflows
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
# Verify database connection
npx prisma studio

# Reset database schema (development only)
npm run prisma:reset

# Check VPS PostgreSQL dedicated (port 5433)
# SSH to VPS and run:
docker exec nexus-db psql -U nexus_user -d nexus_core -c "\dt"
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
- **SSH**: `ssh root@VPS_IP_REDACTED`
- **Docker**: All services run in Docker containers
- **Monitoring**: Portainer at https://VPS_IP_REDACTED:9443

### Service Health Checks
```bash
# Check all Docker containers
docker ps

# Check Nexus Core database
docker exec nexus-db psql -U nexus_user -d nexus_core -c "SELECT version();"

# Check N8N
docker logs n8n

# Check Nginx
sudo nginx -t
sudo systemctl status nginx
```

### Backup Strategy
- **PostgreSQL Nexus Core**: Automated daily backups at 3 AM
- **Retention**: 7 daily, 4 weekly, 6 monthly
- **Location**: `/home/gabriel/vps-do/nexus-core/backups/`
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
- **Project Plan**: `docs/01-introduccion/Plan_Trabajo_Ecosistema_Digital_V3.md` - Complete development roadmap
- **README**: `README.md` - Project overview and setup instructions
- **Authentication**: `docs/AUTHENTICATION_GUIDE.md` - Auth debugging guide
- **Public API**: `docs/PUBLIC_API_GUIDE.md` - API integration guide
- **Advanced Statistics**: `docs/ADVANCED_STATISTICS_MODULE_GUIDE.md` - Statistics module docs
- **Development**: `docs/DEVELOPMENT_GUIDE.md` - Development patterns
- **Database Schema**: `docs/DATABASE_SCHEMA_GUIDE.md` - Schema structure

### Specialized Agents
- **Orchestrator**: `.claude/agents/nexus-core-orchestrator.md`
- **API Development**: `.claude/agents/APIDeveloperAgent.md`
- **Database Management**: `.claude/agents/DatabaseManagerAgent.md`
- **Data Ingestion**: `.claude/agents/DataIngestionAgent.md`
- **Security Auditing**: `.claude/agents/SecurityAuditorAgent.md`
- **Infrastructure**: `.claude/agents/InfrastructureAgent.md`
- **Frontend**: `.claude/agents/FrontendAgent.md`

### VPS Documentation
- **Infrastructure Docs**: `vps-do-docs/` directory
- **Docker Compose**: `/home/gabriel/vps-do/nexus-core/docker-compose.yml` (on VPS)
- **Nginx Config**: `/etc/nginx/sites-available/referenciales.cl` (on VPS)

### External Resources
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js 15**: https://nextjs.org/docs
- **NextAuth.js v4**: https://next-auth.js.org
- **PostGIS**: https://postgis.net/documentation
- **N8N**: https://docs.n8n.io
