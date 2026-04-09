# 🏗️ Arquitectura General - inmogrid.cl

## 📋 Visión Arquitectónica

inmogrid.cl está construido siguiendo principios de arquitectura moderna web, con énfasis en escalabilidad, performance y mantenibilidad. La aplicación utiliza Next.js 15 con App Router como framework principal, integrando tecnologías especializadas para manejo geoespacial y análisis de datos.

---

## 🎯 Arquitectura de Alto Nivel

### 📊 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Public Pages  │  │   Dashboard     │  │   Admin Panel   │ │
│  │                 │  │   (Protected)   │  │   (RBAC)        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Public API    │  │   Private API   │  │   WebSockets    │ │
│  │   (No Auth)     │  │   (Protected)   │  │   (Real-time)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Referenciales │  │   Spatial       │  │   Analytics     │ │
│  │   Service       │  │   Service       │  │   Service       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   PostgreSQL    │  │   PostGIS       │  │   Redis Cache   │ │
│  │   (Primary DB)  │  │   (Spatial)     │  │   (Optional)    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Google OAuth  │  │   Google Maps   │  │   OpenAI API    │ │
│  │   (Auth)        │  │   (Geocoding)   │  │   (Chatbot)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 🔧 Principios Arquitectónicos

#### 1. Separation of Concerns
- **Frontend**: UI/UX y presentación
- **API Layer**: Lógica de negocio y validación
- **Data Layer**: Persistencia y consultas
- **External Services**: Integraciones de terceros

#### 2. Escalabilidad Horizontal
- **Stateless APIs**: Fácil escalado horizontal
- **Database optimization**: Índices y queries optimizadas
- **Caching strategy**: Redis para datos frecuentes
- **CDN ready**: Assets estáticos optimizados

#### 3. Security by Design
- **Authentication**: OAuth 2.0 exclusivamente
- **Authorization**: RBAC granular
- **Input validation**: Zod schemas en todas las capas
- **SQL injection protection**: Prisma ORM

---

## 🏛️ Patrones Arquitectónicos

### 🎯 MVC Modernizado

#### Model (Prisma + PostGIS)
```typescript
// Modelo de datos con validación integrada
model Referencial {
  id              String    @id @default(cuid())
  
  // Datos inmobiliarios
  fojas           String?
  numero          Int?
  anio            Int?
  cbr             String?
  predio          String?
  comuna          String?
  rol             String?   
  
  // Datos espaciales (PostGIS)
  lat             Float?
  lng             Float?
  geometry        String?   // PostGIS POINT
  
  // Relaciones
  creadoPor       String
  user            User      @relation(fields: [creadoPor], references: [id])
  
  // Auditoría automática
  creadoEn        DateTime  @default(now())
  actualizadoEn   DateTime  @updatedAt
  
  @@map("referenciales")
  @@index([lat, lng])        // Spatial queries
  @@index([comuna, anio])    // Business queries
}
```

#### View (React Components)
```typescript
// Componentes especializados por dominio
const ReferencialDashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <ReferencialFilters />      {/* Filtros inteligentes */}
      <ReferencialTable />        {/* Tabla con paginación */}
      <ReferencialMap />          {/* Mapa interactivo */}
      <StatisticsPanel />         {/* Analytics en tiempo real */}
    </DashboardLayout>
  );
};
```

#### Controller (API Routes)
```typescript
// API route con validación y business logic
export async function POST(request: Request) {
  try {
    // 1. Validación de entrada
    const body = await request.json();
    const validatedData = referencialSchema.parse(body);
    
    // 2. Business logic
    const geocodedData = await geocodeAddress(validatedData.direccion);
    
    // 3. Persistencia
    const referencial = await prisma.referencial.create({
      data: {
        ...validatedData,
        ...geocodedData,
        creadoPor: session.user.id
      }
    });
    
    // 4. Response estandarizada
    return NextResponse.json({
      success: true,
      data: referencial
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### 🔄 Repository Pattern

#### Base Repository
```typescript
// Abstracción para operaciones CRUD comunes
abstract class BaseRepository<T> {
  constructor(protected model: any) {}
  
  async findMany(filters: any): Promise<T[]> {
    return await this.model.findMany({
      where: this.buildWhereClause(filters),
      orderBy: this.defaultOrderBy()
    });
  }
  
  async findById(id: string): Promise<T | null> {
    return await this.model.findUnique({ where: { id } });
  }
  
  abstract buildWhereClause(filters: any): any;
  abstract defaultOrderBy(): any;
}
```

#### Specialized Repository
```typescript
// Repository específico con lógica espacial
class ReferencialRepository extends BaseRepository<Referencial> {
  constructor() {
    super(prisma.referencial);
  }
  
  async findInRadius(lat: number, lng: number, radiusKm: number) {
    return await prisma.$queryRaw`
      SELECT *, 
             ST_Distance(
               ST_MakePoint(${lng}, ${lat})::geography,
               ST_MakePoint(lng, lat)::geography
             ) / 1000 as distance_km
      FROM referenciales 
      WHERE ST_DWithin(
        ST_MakePoint(${lng}, ${lat})::geography,
        ST_MakePoint(lng, lat)::geography,
        ${radiusKm * 1000}
      )
      ORDER BY distance_km
    `;
  }
  
  buildWhereClause(filters: ReferencialFilters) {
    const where: any = {};
    
    if (filters.comuna) where.comuna = filters.comuna;
    if (filters.anio) where.anio = filters.anio;
    if (filters.minMonto) where.montoNumerico = { gte: filters.minMonto };
    
    return where;
  }
  
  defaultOrderBy() {
    return { creadoEn: 'desc' };
  }
}
```

### 🎭 Service Layer Pattern

#### Business Logic Encapsulation
```typescript
// Servicio con lógica de negocio específica
class ReferencialService {
  constructor(
    private referencialRepo: ReferencialRepository,
    private geocodingService: GeocodingService,
    private auditService: AuditService
  ) {}
  
  async createReferencial(data: CreateReferencialInput, userId: string) {
    // 1. Validación business rules
    await this.validateBusinessRules(data);
    
    // 2. Enrichment de datos
    const geocodedData = await this.geocodingService.geocode(data.direccion);
    const enrichedData = { ...data, ...geocodedData };
    
    // 3. Persistencia
    const referencial = await this.referencialRepo.create({
      ...enrichedData,
      creadoPor: userId
    });
    
    // 4. Audit trail
    await this.auditService.log('CREATE_REFERENCIAL', {
      referencialId: referencial.id,
      userId
    });
    
    return referencial;
  }
  
  private async validateBusinessRules(data: CreateReferencialInput) {
    // ROL único por CBR y año
    if (data.rol && data.cbr && data.anio) {
      const existing = await this.referencialRepo.findMany({
        rol: data.rol,
        cbr: data.cbr,
        anio: data.anio
      });
      
      if (existing.length > 0) {
        throw new BusinessError('ROL ya existe para este CBR y año');
      }
    }
  }
}
```

---

## 🔐 Arquitectura de Seguridad

### 🛡️ Capas de Seguridad

#### 1. Network Level
- **HTTPS obligatorio** en producción
- **CORS configurado** para API pública
- **Rate limiting** (planeado)
- **DDoS protection** via Vercel

#### 2. Application Level
```typescript
// Middleware de autenticación
export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // Rutas protegidas
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }
  
  // API privada requiere autenticación
  if (request.nextUrl.pathname.startsWith('/api/private')) {
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }
  
  return NextResponse.next();
}
```

#### 3. Data Level
```typescript
// Row Level Security conceptual (via Prisma)
const getReferenciales = async (userId: string, filters: any) => {
  const user = await getCurrentUser(userId);
  
  // Usuarios normales solo ven sus propios datos
  if (user.role === 'USER') {
    filters.creadoPor = userId;
  }
  
  // Admins ven todos los datos
  return await referencialRepo.findMany(filters);
};
```

### 🔑 OAuth 2.0 Flow

#### Authentication Flow
```
1. User clicks "Login with Google"
2. Redirect to Google OAuth endpoint
3. User authorizes application
4. Google redirects with authorization code
5. NextAuth exchanges code for tokens
6. JWT created with user info
7. User session established
8. Access granted to protected routes
```

#### Token Management
```typescript
// JWT configuration
const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  session: { 
    strategy: "jwt",
    maxAge: 24 * 60 * 60 // 24 horas
  },
  callbacks: {
    jwt: ({ token, user, account }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    }
  }
};
```

---

## 📊 Arquitectura de Datos

### 🗃️ Database Design

#### Principios de Diseño
- **Normalización**: 3NF para evitar redundancia
- **Desnormalización selectiva**: Para performance crítica
- **Spatial indexing**: GiST indices para PostGIS
- **Audit trails**: Timestamp automático en todas las entidades

#### Schema Relationships
```
User (1) ────── (N) Referencial
User (1) ────── (N) AuditLog
User (1) ────── (N) ChatMessage
```

#### Spatial Data Handling
```sql
-- Índices espaciales para performance
CREATE INDEX idx_referenciales_location 
ON referenciales 
USING GIST (ST_MakePoint(lng, lat));

-- Consultas espaciales típicas
SELECT *, ST_Distance(
  ST_MakePoint(-70.6693, -33.4489)::geography,
  ST_MakePoint(lng, lat)::geography
) / 1000 as distance_km
FROM referenciales 
WHERE ST_DWithin(
  ST_MakePoint(-70.6693, -33.4489)::geography,
  ST_MakePoint(lng, lat)::geography,
  5000  -- 5km radius
);
```

### 🚀 Performance Strategy

#### Database Optimization
- **Connection pooling**: Prisma connection management
- **Query optimization**: Selective field loading
- **Indexing strategy**: Compound indices for common queries
- **Caching layer**: Redis for frequent operations

#### Frontend Optimization
```typescript
// Lazy loading de componentes pesados
const ReferencialMap = lazy(() => import('./ReferencialMap'));

// Virtualización para listas largas
const VirtualizedTable = lazy(() => import('./VirtualizedTable'));

// Memoización de componentes caros
const MemoizedStatistics = React.memo(StatisticsPanel);

// Debounced search
const debouncedSearch = useMemo(
  () => debounce(searchFunction, 300),
  [searchFunction]
);
```

---

## 🔄 Patrones de Integración

### 🔌 API Design Patterns

#### RESTful API Structure
```
GET    /api/referenciales          # Lista paginada
GET    /api/referenciales/:id      # Detalle específico  
POST   /api/referenciales          # Crear nuevo
PUT    /api/referenciales/:id      # Actualizar completo
PATCH  /api/referenciales/:id      # Actualización parcial
DELETE /api/referenciales/:id      # Eliminar (soft delete)
```

#### Response Standardization
```typescript
// Estructura de respuesta consistente
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    timestamp: string;
  };
}
```

#### Error Handling Pattern
```typescript
// Manejo centralizado de errores
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
  }
}

const handleApiError = (error: unknown): NextResponse => {
  if (error instanceof ApiError) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: error.statusCode });
  }
  
  // Log unexpected errors
  console.error('Unexpected API error:', error);
  
  return NextResponse.json({
    success: false,
    error: 'Internal server error'
  }, { status: 500 });
};
```

### 🌐 External Service Integration

#### Google Services Integration
```typescript
// Geocoding service abstraction
interface GeocodingService {
  geocode(address: string): Promise<GeocodingResult>;
  reverseGeocode(lat: number, lng: number): Promise<Address>;
}

class GoogleGeocodingService implements GeocodingService {
  async geocode(address: string): Promise<GeocodingResult> {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK') {
      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address
      };
    }
    
    throw new Error(`Geocoding failed: ${data.status}`);
  }
}
```

---

## 🚀 Deployment Architecture

### 🏗️ Production Stack

#### Infrastructure
- **Hosting**: Cloud Hosting (Serverless)
- **Database**: Neon (PostgreSQL + PostGIS)
- **CDN**: Global Edge Network
- **Monitoring**: Application Monitoring
- **Domain**: Custom domain with SSL

#### Environment Separation
```
Development  → Local + Neon Development DB
Staging      → Preview Deployment + Neon Staging DB  
Production   → Production Deployment + Neon Production DB
```

#### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloud Hosting
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - run: deploy-to-cloud-hosting-action@v1
```

---

## 📈 Escalabilidad y Evolución

### 🎯 Arquitectura Evolutiva

#### Current State (v1.x)
- **Monolithic Next.js**: Single application
- **Single database**: PostgreSQL + PostGIS
- **Server-side rendering**: Performance optimized
- **OAuth authentication**: Google only

#### Future State (v2.x)
- **Microservices ready**: Modular architecture
- **Multiple databases**: Read replicas, caching
- **Real-time features**: WebSocket integration
- **Multi-tenant**: Support for multiple organizations

#### Migration Strategy
```typescript
// Feature flags para transiciones graduales
const useFeatureFlag = (flagName: string) => {
  const flags = process.env.FEATURE_FLAGS?.split(',') || [];
  return flags.includes(flagName);
};

// Implementación condicional
const ChatModule = () => {
  if (useFeatureFlag('CHAT_V2')) {
    return <ChatV2 />;
  }
  return <ChatV1 />;
};
```

### 📊 Performance Monitoring

#### Key Metrics
- **Core Web Vitals**: LCP, FID, CLS
- **API Response Times**: P95, P99 percentiles
- **Database Query Performance**: Slow query detection
- **Error Rates**: 4xx, 5xx tracking
- **User Experience**: Session duration, bounce rate

#### Monitoring Strategy
```typescript
// Custom metrics collection
const trackApiCall = async (endpoint: string, duration: number) => {
  await analytics.track('api_call', {
    endpoint,
    duration,
    timestamp: Date.now(),
    user_id: session?.user?.id
  });
};

// Performance budget alerts
const performanceBudget = {
  firstContentfulPaint: 1.5, // seconds
  largestContentfulPaint: 2.5,
  firstInputDelay: 100, // milliseconds
  cumulativeLayoutShift: 0.1
};
```

---

**🏗️ Esta arquitectura está diseñada para evolucionar con las necesidades del proyecto, manteniendo siempre los principios de simplicidad, performance y escalabilidad.**

---

**Última actualización:** 28 de Agosto de 2025  
**Versión:** 2.0  
**Estado:** ✅ Documentación completa y actualizada