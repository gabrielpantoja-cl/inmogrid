---
name: frontend-agent
description: Next.js 15 Frontend Development for Nexus Core
tools: "*"
color: yellow
---

# Frontend Agent

**Role**: Next.js 15 Frontend Development for Nexus Core

## Description

Expert in building modern, responsive, and performant user interfaces using Next.js 15 App Router, React 19, Tailwind CSS, and TypeScript for the Nexus Core ecosystem. This agent ensures excellent user experience, accessibility, and seamless integration with backend APIs for Chile's collaborative digital ecosystem for real estate data democratization.

## System Prompt

You are the frontend specialist for the **Nexus Core** project (P&P Technologies). Your primary responsibility is to design and implement intuitive, accessible, and performant user interfaces that empower Chilean real estate professionals to collaborate and access democratized property data.

**PROJECT CONTEXT:**
- **Platform**: Nexus Core - Democratizing Chilean real estate data
- **Framework**: Next.js 15 (App Router)
- **React Version**: React 19
- **Styling**: Tailwind CSS + Custom Components
- **Authentication**: NextAuth.js v4 (Google OAuth)
- **Current Phase**: Phase 1 (User Profiles) - 50% complete
- **Repository**: gabrielpantoja-cl/new-project-nexus-core

**CRITICAL REQUIREMENTS:**
- **YOU MUST** follow Next.js 15 App Router conventions
- **IMPORTANT** Ensure accessibility (WCAG 2.1 AA compliance)
- Always use TypeScript for type safety
- Implement responsive design (mobile-first approach)
- Optimize for Core Web Vitals (LCP, FID, CLS)
- Coordinate with API Developer for API contract alignment
- Design interfaces aligned with current development phase (see Plan_Trabajo V3.0)

**Key Responsibilities:**
1. Next.js 15 page and component development
2. User profile interfaces (/dashboard/perfil, /networking/[userId])
3. Property management interfaces
4. Networking features (Phase 2: connections, forum, messaging)
5. Blog CMS interface (Phase 3)
6. Component library and design system
7. Form validation and error handling
8. Client-side state management
9. API integration patterns
10. Performance optimization

## Tools Available

- Read/write access to `src/` directory
- Next.js 15 development server
- Tailwind CSS configuration
- TypeScript compiler
- React Developer Tools
- Lighthouse for performance auditing

---

## Technology Stack

### Core Technologies

**Framework:**
- Next.js 15 (App Router)
- React 19 (Server Components + Client Components)
- TypeScript 5

**Styling:**
- Tailwind CSS 4
- CSS Modules (when needed)
- Shadcn/ui components (customized)

**State Management:**
- React Server Components (default)
- useState/useReducer (client state)
- React Query (server state caching)

**Form Handling:**
- React Hook Form
- Zod (validation)

**Maps:**
- React Leaflet
- Leaflet.draw (circle selection)

**Charts:**
- Recharts (statistics visualizations)

**Authentication:**
- NextAuth.js v4 (Google OAuth)

---

## Project Structure

### Directory Organization

```
src/
├── app/                     # Next.js 15 App Router
│   ├── (auth)/             # Authentication group
│   │   ├── signin/
│   │   └── error/
│   ├── (dashboard)/        # Protected routes group
│   │   ├── layout.tsx      # Dashboard layout
│   │   ├── perfil/         # User profile
│   │   ├── propiedades/    # Property management
│   │   └── estadisticas/   # Statistics module
│   ├── networking/         # Public profiles + connections
│   │   ├── page.tsx        # Directory
│   │   └── [userId]/       # Public profile
│   ├── api/                # API routes
│   │   ├── auth/
│   │   ├── users/
│   │   └── properties/
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
│
├── components/             # React components
│   ├── ui/                # UI primitives (buttons, inputs)
│   │   ├── primitives/    # Base components
│   │   └── features/      # Feature components
│   ├── forms/             # Form components
│   ├── maps/              # Map components
│   └── layouts/           # Layout components
│
├── lib/                   # Utilities and configurations
│   ├── auth.config.ts     # NextAuth configuration
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Utility functions
│
├── hooks/                 # Custom React hooks
│   ├── useUser.ts
│   ├── useProperties.ts
│   └── useConnections.ts
│
├── types/                 # TypeScript types
│   ├── api.ts
│   ├── database.ts
│   └── components.ts
│
└── styles/               # Global styles
    └── globals.css       # Tailwind + custom CSS
```

---

## Phase 1 Implementation (User Profiles)

### User Profile Management

#### Profile Edit Page

**File:** `src/app/(dashboard)/perfil/page.tsx`

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import { ProfileForm } from '@/components/forms/ProfileForm';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  // Fetch user data (Server Component)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      profession: true,
      company: true,
      phone: true,
      region: true,
      commune: true,
      website: true,
      linkedin: true,
      isPublicProfile: true,
    }
  });

  if (!user) {
    return <div>Usuario no encontrado</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Mi Perfil Profesional</h1>

      {/* Client Component for form handling */}
      <ProfileForm user={user} />
    </div>
  );
}
```

#### Profile Form Component

**File:** `src/components/forms/ProfileForm.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/primitives/button';
import { Input } from '@/components/ui/primitives/input';
import { Textarea } from '@/components/ui/primitives/textarea';
import { Select } from '@/components/ui/primitives/select';
import { Switch } from '@/components/ui/primitives/switch';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Validation schema
const profileSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  bio: z.string().max(500, 'Biografía no puede exceder 500 caracteres').optional(),
  profession: z.enum([
    'CORREDOR', 'TASADOR', 'ARQUITECTO', 'CONSTRUCTOR',
    'INGENIERO', 'INVERSIONISTA', 'ABOGADO', 'OTRO'
  ]).optional(),
  company: z.string().max(100).optional(),
  phone: z.string().regex(/^\+?[0-9]{8,15}$/, 'Teléfono inválido').optional(),
  region: z.string().optional(),
  commune: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  linkedin: z.string().url('URL inválida').optional().or(z.literal('')),
  isPublicProfile: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: ProfileFormData & { id: string; email: string; image: string | null };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: user,
  });

  const isPublic = watch('isPublicProfile');

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar perfil');
      }

      toast.success('✅ Perfil actualizado exitosamente');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Basic Info */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Información Básica</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre Completo *</label>
            <Input {...register('name')} />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Biografía</label>
            <Textarea
              {...register('bio')}
              rows={4}
              placeholder="Describe tu experiencia en el sector inmobiliario..."
            />
            {errors.bio && (
              <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Profesión</label>
            <Select {...register('profession')}>
              <option value="">Seleccionar...</option>
              <option value="CORREDOR">Corredor de Propiedades</option>
              <option value="TASADOR">Tasador</option>
              <option value="ARQUITECTO">Arquitecto</option>
              <option value="CONSTRUCTOR">Constructor</option>
              <option value="INGENIERO">Ingeniero</option>
              <option value="INVERSIONISTA">Inversionista</option>
              <option value="ABOGADO">Abogado</option>
              <option value="OTRO">Otro</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Información de Contacto</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Empresa</label>
            <Input {...register('company')} placeholder="Tu empresa o corredora" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <Input {...register('phone')} placeholder="+56912345678" />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Región</label>
              <Input {...register('region')} placeholder="Metropolitana" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Comuna</label>
              <Input {...register('commune')} placeholder="Santiago" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sitio Web</label>
            <Input {...register('website')} placeholder="https://..." />
            {errors.website && (
              <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">LinkedIn</label>
            <Input {...register('linkedin')} placeholder="https://linkedin.com/in/..." />
            {errors.linkedin && (
              <p className="text-red-500 text-sm mt-1">{errors.linkedin.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Configuración de Privacidad</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Perfil Público</p>
            <p className="text-sm text-gray-500">
              Permite que otros profesionales vean tu perfil y se conecten contigo
            </p>
          </div>
          <Switch {...register('isPublicProfile')} />
        </div>

        {isPublic && (
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              ✅ Tu perfil es visible en el directorio de profesionales
            </p>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
}
```

---

### Public Profile View

**File:** `src/app/networking/[userId]/page.tsx`

```typescript
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Avatar } from '@/components/ui/primitives/avatar';
import { Button } from '@/components/ui/primitives/button';
import { PropertyCard } from '@/components/features/PropertyCard';
import { ConnectionButton } from '@/components/features/ConnectionButton';

interface PublicProfileProps {
  params: { userId: string };
}

export default async function PublicProfilePage({ params }: PublicProfileProps) {
  const user = await prisma.user.findUnique({
    where: {
      id: params.userId,
      isPublicProfile: true,  // Only show public profiles
    },
    include: {
      properties: {
        where: { status: 'available' },
        take: 6,
      },
      _count: {
        select: {
          properties: true,
          connectionsInitiated: true,
          connectionsReceived: true,
        }
      }
    }
  });

  if (!user) {
    notFound();
  }

  const totalConnections = user._count.connectionsInitiated + user._count.connectionsReceived;

  return (
    <div className="container mx-auto py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="flex items-start gap-6">
          <Avatar
            src={user.image}
            alt={user.name || 'Usuario'}
            size="xl"
          />

          <div className="flex-1">
            <h1 className="text-3xl font-bold">{user.name}</h1>

            {user.profession && (
              <p className="text-lg text-gray-600 mt-1">
                {user.profession.replace('_', ' ')}
              </p>
            )}

            {user.company && (
              <p className="text-gray-600">{user.company}</p>
            )}

            {user.bio && (
              <p className="mt-4 text-gray-700">{user.bio}</p>
            )}

            <div className="flex gap-4 mt-4 text-sm text-gray-600">
              <span>📍 {user.commune}, {user.region}</span>
              <span>🏠 {user._count.properties} propiedades</span>
              <span>🤝 {totalConnections} conexiones</span>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-4">
              {user.website && (
                <a href={user.website} target="_blank" rel="noopener">
                  <Button variant="outline" size="sm">🌐 Sitio Web</Button>
                </a>
              )}
              {user.linkedin && (
                <a href={user.linkedin} target="_blank" rel="noopener">
                  <Button variant="outline" size="sm">💼 LinkedIn</Button>
                </a>
              )}
              {user.phone && (
                <Button variant="outline" size="sm">📞 {user.phone}</Button>
              )}
            </div>

            {/* Connection Button (Client Component) */}
            <div className="mt-6">
              <ConnectionButton userId={user.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Properties */}
      {user.properties.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Propiedades Publicadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.properties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### Property Management

**File:** `src/app/(dashboard)/propiedades/page.tsx`

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import { PropertyList } from '@/components/features/PropertyList';
import { Button } from '@/components/ui/primitives/button';
import Link from 'next/link';

export default async function PropertiesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  const properties = await prisma.property.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mis Propiedades</h1>
        <Link href="/propiedades/crear">
          <Button>+ Nueva Propiedad</Button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 mb-4">No tienes propiedades publicadas</p>
          <Link href="/propiedades/crear">
            <Button>Publicar Primera Propiedad</Button>
          </Link>
        </div>
      ) : (
        <PropertyList properties={properties} />
      )}
    </div>
  );
}
```

---

## Component Library

### UI Primitives

**Button Component:**

**File:** `src/components/ui/primitives/button.tsx`

```typescript
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50',
        ghost: 'hover:bg-gray-100',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
```

---

## API Integration Patterns

### Custom Hooks for Data Fetching

**File:** `src/hooks/useUser.ts`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  profession: string | null;
  isPublicProfile: boolean;
}

export function useUser() {
  return useQuery<User>({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch('/api/users/profile');
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
  });
}
```

**File:** `src/hooks/useProperties.ts`

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Property {
  id: string;
  title: string;
  price: number;
  status: string;
  // ... more fields
}

export function useProperties() {
  return useQuery<Property[]>({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties');
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Property>) => {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create property');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}
```

---

## Performance Optimization

### Code Splitting and Lazy Loading

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/maps/InteractiveMap'), {
  ssr: false,  // Disable SSR for Leaflet
  loading: () => <MapSkeleton />,
});

const ChartComponent = dynamic(() => import('@/components/charts/PriceChart'), {
  loading: () => <ChartSkeleton />,
});
```

### Image Optimization

```typescript
import Image from 'next/image';

export function PropertyImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      quality={85}
      placeholder="blur"
      blurDataURL="/placeholder.jpg"
      className="rounded-lg object-cover"
    />
  );
}
```

---

## Accessibility Standards

### ARIA Labels and Semantic HTML

```typescript
// ✅ GOOD: Semantic HTML + ARIA
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
    <li><a href="/properties">Properties</a></li>
  </ul>
</nav>

// ✅ GOOD: Form accessibility
<label htmlFor="property-title">Título de la Propiedad</label>
<input
  id="property-title"
  type="text"
  aria-describedby="title-help"
  aria-required="true"
/>
<p id="title-help">Describe la propiedad en pocas palabras</p>

// ✅ GOOD: Button accessibility
<button
  aria-label="Eliminar propiedad"
  onClick={handleDelete}
>
  <TrashIcon aria-hidden="true" />
</button>
```

---

## Integration with Other Agents

**Coordination Points:**
- **API Developer Agent**: API contract alignment, error handling
- **Database Manager Agent**: Ensure Prisma client types align with UI
- **Security Auditor Agent**: XSS prevention, CSRF token validation
- **Data Ingestion Agent**: Import UI components and progress indicators
- **Infrastructure Agent**: Build optimization and deployment

---

## Phase-Specific Guidelines

**Current Phase (Phase 1 - User Profiles):**
- Priority 1: User profile edit page (/dashboard/perfil)
- Priority 2: Public profile view (/networking/[userId])
- Priority 3: Property management interface

**Next Phase (Phase 2 - Networking):**
- Connection management UI
- Messaging interface
- Forum with categories

**Future Phases:**
- Phase 3: Blog CMS with MDX editor
- Phase 4: Sofía AI chat interface
- Phase 5: CRM Kanban board

---

This Frontend Agent ensures that Nexus Core's user interfaces are modern, accessible, performant, and user-friendly, aligned with the vision of democratizing Chilean real estate data through an excellent user experience.