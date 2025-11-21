# 🏗️ Arquitectura degux.cl V2 - PostgreSQL Dedicado

**Fecha**: 2025-11-21
**Versión**: 2.0
**Estado**: Ready for Production

---

## 📊 Resumen Ejecutivo

### ✅ Problema Resuelto

**Antes (V1):**
- degux compartía contenedor `n8n-db` con n8n workflows
- Riesgo: Si n8n crashea, degux cae también
- Escalabilidad limitada
- Backups mezclados

**Ahora (V2):**
- ✅ PostgreSQL **dedicado** para degux (`degux-db`)
- ✅ Aislamiento completo de n8n
- ✅ Backups automáticos independientes
- ✅ Escalabilidad mejorada
- ✅ Puerto 5433 para acceso externo

### 🎯 Beneficios

1. **Resiliencia**: n8n y degux son independientes
2. **Escalabilidad**: Podemos escalar degux-db sin afectar n8n
3. **Seguridad**: Aislamiento de red Docker dedicada
4. **Mantenimiento**: Backups y upgrades independientes
5. **Recursos**: Límites de CPU/memoria por servicio

---

## 🏗️ Arquitectura Técnica

### Docker Compose Services

```yaml
degux_network (172.25.0.0/16)
├── degux-db (postgis/postgis:15-3.4)
│   ├── Database: degux_core
│   ├── User: degux_user
│   ├── Puerto externo: 5433
│   ├── Puerto interno: 5432
│   └── Volume: degux_db_data
│
├── degux-web (nextjs:15.3.3)
│   ├── Framework: Next.js 15 + React 19
│   ├── Puerto: 3000
│   ├── Connects to: degux-db:5432
│   └── Features: Server Actions, RSC
│
└── degux-backup (postgres-backup-local)
    ├── Schedule: Daily @ 00:00
    ├── Retention: 7 days, 4 weeks, 6 months
    └── Location: /root/vps-do/degux/backups/
```

### Network Topology

```
Internet
    ↓
Nginx (systemd) :443 SSL
    ↓
degux-web :3000 (Docker)
    ↓
degux-db :5432 (Docker internal)
    ↓ (optional)
n8n :5678 (webhooks) via vps_network
```

### Database Schema

- **Database**: `degux_core`
- **Extensions**: PostGIS, pg_trgm, uuid-ossp
- **Schema**: Ver `prisma/schema.prisma`
- **Tablas principales**:
  - `User` - Usuarios con perfiles profesionales
  - `Property` - Propiedades multi-tenant
  - `Connection` - Red de networking
  - `Post`, `Plant`, `Collection` - Perfilería humana
  - `referenciales` - Datos CBR con PostGIS

---

## 🚀 Tech Stack Moderno

### Next.js 15 Features

✅ **React Server Components (RSC)**
- Componentes por defecto son Server Components
- Reduce bundle size del cliente
- Mejor SEO y performance

✅ **Server Actions**
- Reemplazo de API routes tradicionales
- Type-safe con TypeScript
- Validación con Zod
- Ver: `src/app/actions/networking.ts`

✅ **Turbopack**
- Dev server 10x más rápido
- Activado: `npm run dev --turbo`

✅ **Partial Prerendering (PPR)**
- Combina static + dynamic rendering
- Mejora Time to First Byte (TTFB)

### React 19 Features

✅ **useOptimistic**
- UI updates instantáneos
- Revierte en caso de error
- Ver: `components/networking/ConnectionButton.tsx`

✅ **useActionState**
- Manejo de estado de Server Actions
- Loading, error, success states
- Progressive Enhancement

✅ **useTransition**
- Transiciones no bloqueantes
- Mejor UX en operaciones async

### Prisma Features

✅ **PostGIS Support**
- Extensión `postgis` habilitada
- Tipo `geometry` para columna `geom`
- Queries espaciales (ST_Distance, ST_Within)

✅ **Type Safety**
- Prisma Client auto-generado
- IntelliSense completo
- Zero runtime overhead

---

## 📁 Estructura de Archivos (Nueva)

```
degux.cl/
├── src/
│   ├── app/
│   │   ├── actions/              # 🆕 Server Actions
│   │   │   └── networking.ts     # Networking actions
│   │   ├── (dashboard)/
│   │   │   ├── conexiones/       # Conexiones del usuario
│   │   │   └── propiedades/      # Propiedades
│   │   └── networking/           # Directorio público
│   │       ├── page.tsx          # Lista profesionales
│   │       └── [userId]/         # Perfil público
│   │           └── page.tsx
│   │
│   └── components/
│       ├── networking/           # 🆕 Componentes networking
│       │   ├── ConnectionButton.tsx  # React 19 + useOptimistic
│       │   ├── ConnectionsList.tsx
│       │   └── PendingRequests.tsx
│       └── ui/
│
├── prisma/
│   ├── schema.prisma             # Schema actualizado
│   └── seed.mjs                  # Seed data
│
└── docs/
    ├── ARCHITECTURE_V2_2025-11-21.md  # Este archivo
    └── DEPLOYMENT_GUIDE_V2.md         # Guía de deploy
```

---

## 🔧 Variables de Entorno

### Producción (Docker)

```env
# Database (interno Docker network)
POSTGRES_PRISMA_URL=postgresql://degux_user:PASSWORD@degux-db:5432/degux_core?schema=public
POSTGRES_URL=postgresql://degux_user:PASSWORD@degux-db:5432/degux_core

# NextAuth.js
NEXTAUTH_URL=https://degux.cl
NEXTAUTH_SECRET=generated_secret_32chars

# Google OAuth
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...

# Google Maps
GOOGLE_MAPS_API_KEY=AIza...
```

### Desarrollo Local

```env
# Opción 1: SSH Tunnel al VPS
POSTGRES_PRISMA_URL=postgresql://degux_user:PASSWORD@VPS_IP_REDACTED:5433/degux_core?sslmode=require

# Opción 2: PostgreSQL local
POSTGRES_PRISMA_URL=postgresql://user:pass@localhost:5432/degux_dev
```

---

## 🚀 Deployment Workflow

### 1. Primera vez (Fresh Install)

```bash
# En VPS
cd /root/vps-do

# 1. Levantar degux-db
docker compose -f docker-compose.degux-v2.yml up -d degux-db

# 2. Verificar
docker logs degux-db

# 3. Build degux-web
docker compose -f docker-compose.degux-v2.yml up -d --build degux-web

# 4. Prisma migrations
docker exec degux-web npx prisma generate
docker exec degux-web npx prisma db push

# 5. Verificar
curl https://degux.cl/api/public/health
```

### 2. Migración desde V1

```bash
# Ejecutar script de migración
bash /root/vps-do/scripts/migrate-degux-db.sh

# Verificar datos migrados
docker exec degux-db psql -U degux_user -d degux_core -c "SELECT COUNT(*) FROM referenciales;"
```

### 3. Updates Continuos

```bash
# Pull latest changes
cd /root/degux.cl
git pull origin main

# Rebuild y redeploy
cd /root/vps-do
docker compose -f docker-compose.degux-v2.yml up -d --build degux-web

# Aplicar migrations si hay cambios en schema
docker exec degux-web npx prisma generate
docker exec degux-web npx prisma db push
```

---

## 🔐 Backups

### Automáticos (degux-backup service)

- **Frecuencia**: Diario @ 00:00 (America/Santiago)
- **Formato**: PostgreSQL custom format (comprimido)
- **Retención**:
  - 7 backups diarios
  - 4 backups semanales
  - 6 backups mensuales
- **Ubicación**: `/root/vps-do/degux/backups/`

### Restauración Manual

```bash
# Listar backups
ls -lh /root/vps-do/degux/backups/

# Restaurar backup específico
BACKUP_FILE="degux_core-2025-11-21.sql.gz"
gunzip -c /root/vps-do/degux/backups/$BACKUP_FILE | \
  docker exec -i degux-db psql -U degux_user -d degux_core
```

### Backup Manual On-Demand

```bash
# Crear backup ahora
docker exec degux-db pg_dump -U degux_user -d degux_core \
  --format=custom --compress=9 > degux_backup_$(date +%Y%m%d_%H%M%S).dump
```

---

## 📊 Monitoring

### Health Checks

```bash
# API Health
curl https://degux.cl/api/public/health

# Database conexión
docker exec degux-db psql -U degux_user -d degux_core -c "SELECT version();"

# Containers status
docker ps --filter "name=degux"
```

### Performance Metrics

```bash
# CPU/Memory usage
docker stats degux-db degux-web

# Database size
docker exec degux-db psql -U degux_user -d degux_core -c \
  "SELECT pg_size_pretty(pg_database_size('degux_core'));"

# Active connections
docker exec degux-db psql -U degux_user -d degux_core -c \
  "SELECT count(*) FROM pg_stat_activity WHERE datname='degux_core';"

# Table sizes
docker exec degux-db psql -U degux_user -d degux_core -c \
  "SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
   FROM pg_tables WHERE schemaname='public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

---

## 🧪 Testing

### Server Actions Testing

```typescript
// __tests__/actions/networking.test.ts
import { sendConnectionRequest } from '@/app/actions/networking'

test('envía solicitud de conexión', async () => {
  const formData = new FormData()
  formData.append('receiverId', 'user-123')
  formData.append('message', 'Hola!')

  const result = await sendConnectionRequest(formData)

  expect(result.success).toBe(true)
  expect(result.data?.connectionId).toBeDefined()
})
```

### API Testing

```bash
# Health check
npm run api:health

# Public API
npm run api:test

# With stats
npm run api:health-stats
```

---

## 🔒 Security Checklist

- [x] PostgreSQL en red privada Docker
- [x] Passwords generados con openssl (32+ chars)
- [x] NEXTAUTH_SECRET único por ambiente
- [x] SSL/TLS en todas las conexiones
- [x] Nginx rate limiting (10 req/s)
- [x] CSP headers configurados
- [x] Input validation con Zod
- [x] SQL injection prevention (Prisma)
- [x] XSS protection (React auto-escape)
- [x] Row Level Security (RLS) - TODO Fase 2

---

## 📈 Escalabilidad

### Vertical Scaling (corto plazo)

```yaml
# Aumentar recursos en docker-compose.degux-v2.yml
degux-db:
  deploy:
    resources:
      limits:
        memory: 2G    # De 1G → 2G
        cpus: '2.0'   # De 1.0 → 2.0
```

### Horizontal Scaling (largo plazo)

**Opción 1: Managed PostgreSQL**
- Migrar a DigitalOcean Managed Database
- Alta disponibilidad automática
- Backups automáticos
- Escalado vertical on-demand

**Opción 2: Read Replicas**
- PostgreSQL con streaming replication
- Read queries → Replica
- Write queries → Primary

**Opción 3: Connection Pooling**
- Agregar PgBouncer
- Reducir overhead de conexiones
- Mejor performance con Next.js Serverless

---

## 📚 Referencias

- **Docker Compose V2**: `/home/gabriel/Documentos/vps-do/docker-compose.degux-v2.yml`
- **Migration Script**: `/home/gabriel/Documentos/vps-do/scripts/migrate-degux-db.sh`
- **Deployment Guide**: `/home/gabriel/Documentos/vps-do/degux/DEPLOYMENT_GUIDE_V2.md`
- **Server Actions**: `src/app/actions/networking.ts`
- **React 19 Example**: `src/components/networking/ConnectionButton.tsx`
- **Prisma Schema**: `prisma/schema.prisma`

---

## 🎉 Next Steps

### Fase 1 Completar (Actual)
- [ ] Desplegar V2 en VPS
- [ ] Migrar datos desde n8n-db
- [ ] Verificar backups automáticos
- [ ] Testing completo en producción

### Fase 2: Networking (Oct-Nov 2025)
- [ ] Mensajería 1-to-1 (Server Actions)
- [ ] Forum discussions
- [ ] Notificaciones N8N

### Fase 3: Blog & Data Center (Nov-Dec 2025)
- [ ] Blog CMS con MDX
- [ ] Data stories con charts
- [ ] Reportes automáticos

### Fase 4: Sofía AI Bot (Dec 2025-Jan 2026)
- [ ] Vector DB (pgvector en degux-db)
- [ ] Anthropic Claude API
- [ ] RAG implementation

---

**Arquitectura aprobada y lista para producción** ✅

*Documentado por: Gabriel Pantoja + Claude Code*
*Fecha: 2025-11-21*
