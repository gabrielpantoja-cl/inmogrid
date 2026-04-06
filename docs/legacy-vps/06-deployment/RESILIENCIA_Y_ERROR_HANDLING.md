# Arquitectura de Resiliencia y Manejo de Errores - degux.cl

**Guía completa de estrategias de resiliencia, error boundaries y recuperación de fallos.**

---

## 📖 Índice
- [Introducción](#-introducción)
- [Error Boundaries en Next.js 15](#-error-boundaries-en-nextjs-15)
- [Estrategias de Recuperación](#-estrategias-de-recuperación)
- [Monitoreo y Alertas](#-monitoreo-y-alertas)
- [Mejores Prácticas](#-mejores-prácticas)

---

## 🎯 Introducción

### Contexto

El 01 de enero de 2026, degux.cl experimentó un incidente crítico de disponibilidad causado por un error de JavaScript no capturado que provocó que el contenedor Docker entrara en estado "unhealthy". La ausencia de error boundaries globales impidió la recuperación automática de la aplicación.

**Lección aprendida**: Una aplicación de producción robusta requiere múltiples capas de defensa contra errores inesperados.

### Arquitectura de Resiliencia en Capas

```
┌─────────────────────────────────────────────────────────────┐
│              USUARIO / NAVEGADOR WEB                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           CAPA 1: INFRAESTRUCTURA                           │
│  • Nginx Reverse Proxy (health checks, timeouts)           │
│  • Docker Container Health Checks                          │
│  • VPS Resource Monitoring (CPU, RAM, Disk)                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           CAPA 2: APLICACIÓN - ERROR BOUNDARIES             │
│  • global-error.tsx (captura errores en root layout)       │
│  • error.tsx (captura errores en cualquier ruta)           │
│  • error.tsx locales (errores específicos por sección)     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           CAPA 3: CÓDIGO DEFENSIVO                          │
│  • Optional chaining (?.) - 168 usos en codebase           │
│  • Nullish coalescing (??)                                 │
│  • Type safety con TypeScript strict mode                  │
│  • Validación de entrada con Zod schemas                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           CAPA 4: LOGGING Y TELEMETRÍA                      │
│  • Console logging estructurado                             │
│  • Error reporting (futuro: Sentry)                        │
│  • Performance monitoring                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Error Boundaries en Next.js 15

### Jerarquía de Error Boundaries

Next.js 15 con App Router proporciona un sistema de error boundaries que captura errores en diferentes niveles:

#### 1. `global-error.tsx` - Error Boundary Global Crítico

**Ubicación**: `src/app/global-error.tsx`

**Propósito**: Captura errores que ocurren en el `layout.tsx` raíz, incluyendo errores durante la renderización del layout mismo.

**Características**:
- ⚠️ DEBE incluir etiquetas `<html>` y `<body>` propias
- Reemplaza completamente el root layout cuando se activa
- Último recurso antes de que la aplicación falle completamente
- Solo se activa en producción (desarrollo muestra overlay de error)

**Ejemplo de uso**:
```typescript
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body>
        <h1>Error Crítico</h1>
        <button onClick={reset}>Intentar de nuevo</button>
      </body>
    </html>
  );
}
```

#### 2. `error.tsx` - Error Boundary Raíz

**Ubicación**: `src/app/error.tsx`

**Propósito**: Captura errores en cualquier parte de la aplicación que no esté cubierta por error boundaries más específicos.

**Características**:
- Hereda el layout raíz (`layout.tsx`)
- Puede usar componentes de UI del proyecto
- Se activa para errores en páginas y componentes
- NO captura errores en el layout raíz (esos van a `global-error.tsx`)

**Ejemplo de uso**:
```typescript
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main>
      <h2>Algo salió mal</h2>
      <button onClick={reset}>Intentar de nuevo</button>
    </main>
  );
}
```

#### 3. Error Boundaries Locales

**Ubicación**: `src/app/[ruta]/error.tsx` (ejemplo: `src/app/dashboard/referenciales/error.tsx`)

**Propósito**: Manejo específico de errores para una sección de la aplicación.

**Ventajas**:
- Error UI personalizado para el contexto específico
- Aislamiento de errores (no afecta otras secciones)
- Mensajes más específicos y útiles para el usuario

### Flujo de Captura de Errores

```
Error en componente
    ↓
¿Hay error.tsx local en la ruta?
    ├─ SÍ → Capturado por error.tsx local
    └─ NO → ↓
           ¿Hay error.tsx en ruta padre?
               ├─ SÍ → Capturado por error.tsx padre
               └─ NO → ↓
                      ¿Hay error.tsx raíz?
                          ├─ SÍ → Capturado por app/error.tsx
                          └─ NO → ↓
                                 ¿Error en layout raíz?
                                     ├─ SÍ → Capturado por global-error.tsx
                                     └─ NO → Crash completo 💥
```

---

## 🔧 Estrategias de Recuperación

### Recuperación a Nivel de Aplicación

#### 1. Función `reset()` en Error Boundaries

Todos los error boundaries reciben una función `reset()` que permite reintentar la renderización:

```typescript
<button onClick={() => reset()}>
  Intentar de nuevo
</button>
```

**Cómo funciona**:
- Limpia el estado de error del boundary
- Re-renderiza los componentes dentro del boundary
- Útil para errores transitorios (fallos de red, timeouts)

#### 2. Navegación como Recuperación

```typescript
import { useRouter } from 'next/navigation';

function ErrorComponent({ error, reset }) {
  const router = useRouter();

  return (
    <>
      <button onClick={reset}>Intentar de nuevo</button>
      <button onClick={() => router.push('/')}>Volver al inicio</button>
    </>
  );
}
```

### Recuperación a Nivel de Contenedor

#### Reinicio Manual (Rápido)

```bash
# Desde VPS
cd /home/gabriel/vps-do
docker compose -f docker-compose.yml -f docker-compose.degux.yml restart degux-web
```

**Tiempo de recuperación**: ~15 segundos

#### Rebuild Completo (Si hay problemas persistentes)

```bash
# Desde VPS
cd /home/gabriel/vps-do
docker compose -f docker-compose.yml -f docker-compose.degux.yml down degux-web
docker compose -f docker-compose.yml -f docker-compose.degux.yml build --no-cache degux-web
docker compose -f docker-compose.yml -f docker-compose.degux.yml up -d degux-web
```

**Tiempo de recuperación**: ~3-5 minutos

---

## 📊 Monitoreo y Alertas

### Health Checks Actuales

#### 1. Docker Container Health Check

```yaml
# docker-compose.degux.yml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

**Estados posibles**:
- `healthy`: Contenedor funcionando correctamente
- `unhealthy`: Health check fallando (indica problema en aplicación)
- `starting`: Esperando el `start_period` inicial

#### 2. API Health Endpoint

**Endpoint**: `GET /api/health`

```typescript
// Respuesta exitosa
{
  "status": "ok",
  "timestamp": "2026-01-01T12:00:00.000Z",
  "service": "degux.cl",
  "database": "connected"
}
```

**Verificación manual**:
```bash
curl https://degux.cl/api/health
```

### Logging Estructurado

#### Patrón de Logging en Error Boundaries

```typescript
useEffect(() => {
  console.error('🚨 [APP_ERROR]', {
    message: error.message,
    digest: error.digest,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    // Contexto adicional útil
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
  });
}, [error]);
```

**Beneficios**:
- Logs estructurados fáciles de buscar
- Información contextual rica
- Preparado para integración con servicios de logging

### Monitoreo Futuro (Roadmap)

#### Corto Plazo (Q1 2026)
- [ ] **Sentry Integration**: Error reporting y tracking automático
- [ ] **Uptime Monitoring**: UptimeRobot o Pingdom para alertas externas
- [ ] **Slack Alerts**: Notificaciones cuando contenedor pasa a unhealthy

#### Mediano Plazo (Q2 2026)
- [ ] **Custom Metrics**: Prometheus + Grafana dashboard
- [ ] **Log Aggregation**: Loki o ELK stack
- [ ] **Performance Monitoring**: Web Vitals tracking

#### Largo Plazo (Q3-Q4 2026)
- [ ] **Distributed Tracing**: OpenTelemetry implementation
- [ ] **Anomaly Detection**: ML-based alerting
- [ ] **Chaos Engineering**: Controlled failure testing

---

## ✅ Mejores Prácticas

### 1. Desarrollo de Componentes Defensivo

#### ✅ HACER

```typescript
// Usar optional chaining y nullish coalescing
const userName = user?.name ?? 'Usuario';
const email = user?.email ?? 'No disponible';

// Validar datos antes de usarlos
if (!data || !Array.isArray(data.items)) {
  return <ErrorState message="Datos inválidos" />;
}

// Proveer valores por defecto en destructuring
const { items = [], total = 0 } = apiResponse ?? {};
```

#### ❌ EVITAR

```typescript
// Acceso directo sin verificación
const userName = user.name; // 💥 Crash si user es undefined

// Asumir estructura de datos
const firstItem = data.items[0]; // 💥 Crash si items no existe o está vacío

// Sin manejo de casos edge
apiResponse.map(item => item.value); // 💥 Crash si apiResponse es null
```

### 2. Manejo de Errores en Server Components

```typescript
// app/page.tsx (Server Component)
export default async function Page() {
  try {
    const data = await fetchData();

    if (!data) {
      return <NotFound />;
    }

    return <Content data={data} />;
  } catch (error) {
    // El error será capturado por el error boundary más cercano
    throw error;
  }
}
```

### 3. Manejo de Errores en Client Components

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function ClientComponent() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <NoDataMessage />;

  return <DataDisplay data={data} />;
}
```

### 4. Testing de Error Boundaries

```typescript
// __tests__/error-boundary.test.tsx
import { render, screen } from '@testing-library/react';
import Error from '@/app/error';

describe('Error Boundary', () => {
  it('should render error message', () => {
    const error = new Error('Test error');
    const reset = jest.fn();

    render(<Error error={error} reset={reset} />);

    expect(screen.getByText(/algo salió mal/i)).toBeInTheDocument();
  });

  it('should call reset when clicking retry button', () => {
    const error = new Error('Test error');
    const reset = jest.fn();

    render(<Error error={error} reset={reset} />);

    const retryButton = screen.getByRole('button', { name: /intentar/i });
    retryButton.click();

    expect(reset).toHaveBeenCalled();
  });
});
```

### 5. Documentación de Errores Conocidos

Mantener un registro de errores recurrentes y sus soluciones:

```typescript
// docs/KNOWN_ERRORS.md

## TypeError: Cannot read properties of undefined

**Frecuencia**: Raro
**Última ocurrencia**: 2026-01-01
**Causa**: Código minificado accediendo propiedad de objeto undefined
**Solución**: Reinicio de contenedor
**Prevención**: Error boundaries globales implementados
```

---

## 🔗 Referencias

### Documentación Oficial
- [Next.js 15 - Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Docker Health Checks](https://docs.docker.com/engine/reference/builder/#healthcheck)

### Documentación Interna
- [RECOVERY_INSTRUCTIONS.md](./RECOVERY_INSTRUCTIONS.md) - Guía de recuperación rápida
- [POSTMORTEM_2026-01-01_UNHEALTHY_CONTAINER.md](./POSTMORTEM_2026-01-01_UNHEALTHY_CONTAINER.md) - Análisis del incidente
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Guía de deployment

### Código Implementado
- `src/app/error.tsx` - Error boundary raíz
- `src/app/global-error.tsx` - Error boundary global
- `src/app/dashboard/referenciales/error.tsx` - Error boundary local (ejemplo)

---

## 📈 Métricas de Resiliencia

### Objetivos de Disponibilidad (SLOs)

| Métrica | Objetivo | Actual (Q1 2026) |
|---------|----------|------------------|
| **Uptime** | 99.5% (43.8h downtime/año) | TBD |
| **MTTR** (Mean Time To Recovery) | < 30 minutos | 8 minutos ✅ |
| **MTTD** (Mean Time To Detection) | < 5 minutos | 5 horas ❌ (mejorar con alertas) |
| **Error Rate** | < 0.1% requests | TBD |

### Plan de Mejora Continua

**Q1 2026**:
- ✅ Error boundaries globales implementados
- 🔄 Integración con Sentry
- 🔄 Alertas automáticas de unhealthy containers

**Q2 2026**:
- Dashboard de métricas en tiempo real
- Automated recovery scripts
- Chaos engineering tests

**Q3-Q4 2026**:
- Multi-region deployment para alta disponibilidad
- Automated rollback en deployments problemáticos
- 99.9% uptime SLO

---

**Documento creado**: 2026-01-01
**Última actualización**: 2026-01-01
**Autor**: Claude Code + Gabriel Pantoja
**Revisión programada**: Trimestral
