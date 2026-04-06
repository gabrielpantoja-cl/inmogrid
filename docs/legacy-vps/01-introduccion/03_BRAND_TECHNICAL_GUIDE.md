# Guía Técnica de Imagen Corporativa - Pantoja Propiedades

## Índice
1. [Introducción](#introducción)
2. [Paleta de Colores](#paleta-de-colores)
3. [Tipografía](#tipografía)
4. [Variables CSS](#variables-css)
5. [Configuración de Z-Index](#configuración-de-z-index)
6. [Componentes de UI](#componentes-de-ui)
7. [Aplicación Práctica](#aplicación-práctica)
8. [Instrucciones para Desarrolladores](#instrucciones-para-desarrolladores)

---

## Introducción

Esta guía técnica documenta todos los aspectos visuales de la marca **Pantoja Propiedades** implementados en el código. Está diseñada para desarrolladores que necesiten modificar estilos, agregar nuevos componentes o mantener la consistencia visual del proyecto.

### Stack Tecnológico Visual
- **Framework CSS**: Tailwind CSS
- **Sistema de Componentes**: Shadcn UI (basado en Radix UI)
- **Tipografía**: Google Fonts (Poppins para todo el sitio)
- **Variables**: CSS Custom Properties + Clases de Tailwind

---

## Paleta de Colores

### Colores Primarios de Marca
Los colores principales están definidos en `tailwind.config.ts`:

```typescript
colors: {
  // === COLORES DE MARCA PRINCIPALES ===
  'brand-primary': '#EFB810',           // Dorado Principal
  'brand-secondary': '#FFCB2B',         // Dorado Medio  
  'brand-accent': '#FFE5AD',            // Dorado Pálido/Crema
  'brand-background-light': '#F8F2E8',  // Beige Claro (Fondo)
  'brand-text': '#424242',              // Gris Oscuro (Texto)
  'brand-black': '#000000',             // Negro
}
```

### Códigos de Color por Uso

| Color | Hex | Uso Principal | Clases Tailwind |
|-------|-----|---------------|-----------------|
| **Dorado Principal** | `#EFB810` | Botones, CTA, enlaces activos | `bg-brand-primary`, `text-brand-primary` |
| **Dorado Medio** | `#FFCB2B` | Elementos secundarios, hover states | `bg-brand-secondary`, `text-brand-secondary` |
| **Dorado Pálido** | `#FFE5AD` | Fondos sutiles, bordes | `bg-brand-accent`, `border-brand-accent` |
| **Beige Claro** | `#F8F2E8` | Fondo principal del sitio | `bg-brand-background-light` |
| **Gris Oscuro** | `#424242` | Texto principal | `text-brand-text` |
| **Negro** | `#000000` | Texto destacado, contraste | `text-brand-black` |

### Colores Semánticos (Shadcn UI)
Estos colores usan variables CSS y se adaptan automáticamente:

```typescript
// Definidos como variables HSL para mayor flexibilidad
primary: "hsl(var(--primary))",           // Mapea a brand-primary
secondary: "hsl(var(--secondary))",       // Mapea a brand-secondary  
accent: "hsl(var(--accent))",             // Mapea a brand-accent
background: "hsl(var(--background))",     // Mapea a brand-background-light
foreground: "hsl(var(--foreground))",     // Mapea a brand-text
```

---

## Tipografía

### Fuentes Principales
Definidas en `src/index.css`:

```css
/* Importación desde Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
```

### Configuración en Tailwind
```typescript
fontFamily: {
  sans: ['Poppins', 'sans-serif'],      // Fuente por defecto para el cuerpo
  heading: ['Poppins', 'sans-serif'],   // Fuente para encabezados (también Poppins)
}
```

### Jerarquía Tipográfica

| Elemento | Fuente | Peso | Uso | Clases CSS |
|----------|--------|------|-----|------------|
| **H1-H6** | Poppins | 300-800 | Títulos principales | `font-heading` |
| **Cuerpo** | Poppins | 300-700 | Texto general | `font-sans` (default) |
| **Navegación** | Poppins | 500, 600 | Enlaces del navbar | `font-medium`, `font-semibold` |

### Pesos de Fuente Disponibles

#### Poppins (font-sans y font-heading)
- **300** - Light: `font-light`
- **400** - Regular: `font-normal` 
- **500** - Medium: `font-medium`
- **600** - SemiBold: `font-semibold`
- **700** - Bold: `font-bold`
- **800** - ExtraBold: `font-extrabold`

### Aplicación Automática
```css
/* En src/index.css */
body {
  font-family: 'Poppins', sans-serif; /* Fuente por defecto */
}

h1, h2, h3, h4, h5, h6 {
  @apply font-heading; /* Aplica Poppins automáticamente para encabezados */
}
```

---

## Variables CSS

### Variables de Color (HSL)
Definidas en `src/index.css`:

```css
:root {
  /* Fondo principal y texto */
  --background: 40 33% 94%;        /* #F8F2E8 - Beige claro */
  --foreground: 0 0% 26%;          /* #424242 - Gris oscuro */
  
  /* Colores primarios */
  --primary: 45 87% 50%;           /* #EFB810 - Dorado principal */
  --primary-foreground: 0 0% 0%;   /* #000000 - Negro */
  
  /* Colores secundarios */
  --secondary: 48 100% 58%;        /* #FFCB2B - Dorado medio */
  --secondary-foreground: 0 0% 0%; /* #000000 - Negro */
  
  /* Colores de acento */
  --accent: 40 100% 84%;           /* #FFE5AD - Dorado pálido */
  --accent-foreground: 0 0% 26%;   /* #424242 - Gris oscuro */
  
  /* Elementos de interfaz */
  --border: 40 100% 84%;           /* #FFE5AD - Para bordes */
  --input: 40 100% 84%;            /* #FFE5AD - Para inputs */
  --ring: 45 87% 50%;              /* #EFB810 - Para focus rings */
  
  /* Configuración adicional */
  --radius: 0.5rem;               /* Radio de bordes por defecto */
}
```

---

## Configuración de Z-Index

### Variables Z-Index
Definidas en `src/styles/z-index.css`:

```css
:root {
  --z-index-cookie-banner: 9999;   /* Banner de cookies */
  --z-index-cookie-modal: 10000;   /* Modal de cookies */
  --z-index-admin-modal: 2000;     /* Modales de admin */
  --z-index-modal: 1000;           /* Modales generales */
  --z-index-dropdown: 1050;        /* Dropdowns */
  --z-index-drawer: 950;           /* Chat drawer */
  --z-index-navbar: 900;           /* Barra de navegación */
  --z-index-overlay: 500;          /* Overlays */
  --z-index-popup: 400;            /* Popups */
  --z-index-controls: 300;         /* Controles */
  --z-index-content: 100;          /* Contenido general */
  --z-index-default: 1;            /* Por defecto */
  --z-index-below: -1;             /* Debajo del contenido */
}
```

### Clases de Z-Index Disponibles

```css
.z-navbar     { z-index: var(--z-index-navbar); }
.z-dropdown   { z-index: var(--z-index-dropdown); }
.z-drawer     { z-index: var(--z-index-drawer); }
.z-overlay    { z-index: var(--z-index-overlay); }
.z-content    { z-index: var(--z-index-content); }
.z-controls   { z-index: var(--z-index-controls); }
```

---

## Componentes de UI

### Botones (Button Component)
Ubicación: `src/components/ui/button.tsx`

#### Variantes Disponibles
```typescript
variant: {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
}
```

#### Tamaños Disponibles
```typescript
size: {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8", 
  icon: "h-10 w-10",
}
```

### Cards (Card Component)
Ubicación: `src/components/ui/card.tsx`

```typescript
// Componentes disponibles
Card          // Contenedor principal
CardHeader    // Encabezado con padding
CardTitle     // Título (h3) con estilos predefinidos
CardDescription // Descripción con text-muted-foreground
CardContent   // Contenido principal
CardFooter    // Pie con flexbox
```

---

## Aplicación Práctica

### Navbar (Ejemplo de Implementación)
Ubicación: `src/components/Navbar.tsx`

```typescript
// Clases de marca aplicadas
const baseNavLinkClasses = "font-medium text-brand-text hover:text-brand-primary transition-colors duration-200";
const activeNavLinkClasses = "text-brand-primary font-bold";

// Aplicación en componente
<nav className="bg-white py-4 z-navbar">
  <span className="text-2xl font-heading font-bold text-brand-text">
    Pantoja Propiedades
  </span>
</nav>
```

### Footer (Ejemplo de Implementación)
Ubicación: `src/components/Footer.tsx`

```typescript
// Uso de colores semánticos
<footer className="bg-foreground text-background">
  <h3 className="font-heading text-xl font-bold mb-4 text-background">
    Pantoja Propiedades
  </h3>
  <p className="text-background/80">
    Descripción con opacidad
  </p>
</footer>
```

---

## Instrucciones para Desarrolladores

### 1. Cambiar Colores de Marca

**Para cambiar el color primario:**
```typescript
// En tailwind.config.ts
'brand-primary': '#NUEVO_COLOR',

// También actualizar la variable CSS en src/index.css
--primary: [nuevo-hue] [nueva-saturación]% [nueva-luminosidad]%;
```

### 2. Agregar Nuevos Pesos de Fuente

**Modificar la importación en `src/index.css`:**
```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
```

**Agregar clases en Tailwind si es necesario:**
```typescript
// En tailwind.config.ts si se requieren pesos específicos
fontWeight: {
  'extra-bold': '800',
}
```

### 3. Crear Nuevos Componentes con Marca

**Estructura recomendada:**
```typescript
import { cn } from "@/lib/utils";

const MiComponente = () => {
  return (
    <div className="bg-brand-background-light p-6">
      <h2 className="font-heading text-brand-text mb-4">
        Título
      </h2>
      <Button variant="default" className="bg-brand-primary hover:bg-brand-primary/90">
        Acción Principal
      </Button>
    </div>
  );
};
```

### 4. Usar Variables CSS en Lugar de Colores Directos

**Recomendado:**
```css
.mi-clase {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}
```

**O usando clases de Tailwind:**
```html
<div class="bg-primary text-primary-foreground">
  Contenido
</div>
```

### 5. Z-Index para Nuevos Componentes

**Para elementos flotantes:**
```css
.mi-componente-flotante {
  z-index: var(--z-index-popup);
}
```

**O usando clases predefinidas:**
```html
<div class="z-overlay">
  Mi overlay
</div>
```

### 6. Responsive y Mobile-First

**Aplicar los colores de marca responsivamente:**
```html
<div class="bg-brand-background-light md:bg-white lg:bg-brand-accent">
  Fondo que cambia según el breakpoint
</div>
```

### 7. Estados de Hover y Interacción

**Usar opacidades para estados:**
```html
<button class="bg-brand-primary hover:bg-brand-primary/90 active:bg-brand-primary/80">
  Botón con estados
</button>
```

---

## Archivos Clave de Configuración

### Ubicaciones de Archivos Importantes

| Archivo | Propósito | 
|---------|-----------|
| `tailwind.config.ts` | Configuración principal de colores y tipografía |
| `src/index.css` | Variables CSS, importación de fuentes, estilos base |
| `src/styles/z-index.css` | Gestión de capas y z-index |
| `src/components/ui/` | Componentes base de Shadcn UI |
| `src/components/Navbar.tsx` | Implementación de navegación con marca |
| `src/components/Footer.tsx` | Implementación de pie de página |

### Comandos Útiles

**Regenerar tipos de Tailwind:**
```bash
npx tailwindcss -i ./src/index.css -o ./dist/output.css --watch
```

**Verificar configuración:**
```bash
npm run build
```

---

## Notas de Mantenimiento

### Consideraciones Importantes

1. **Variables CSS vs Clases Tailwind**: Preferir variables CSS para componentes que necesiten cambios dinámicos
2. **Z-Index**: Siempre usar las variables predefinidas en lugar de valores hardcodeados
3. **Tipografía**: Los encabezados y el cuerpo del texto usan Poppins, aplicado automáticamente mediante `font-heading` y `font-sans` en `src/index.css`
4. **Colores de Marca**: Mantener consistencia usando las clases `brand-*` en lugar de colores arbitrarios
5. **Performance**: Las fuentes Google están configuradas con `display=swap` para optimizar la carga

### Futuras Expansiones

Para agregar nuevos colores o pesos de fuente:
1. Actualizar `tailwind.config.ts`
2. Añadir variables CSS correspondientes en `src/index.css` si se usan con Shadcn UI
3. Documentar en esta guía
4. Probar en todos los componentes existentes

**Nota**: El sitio ahora usa exclusivamente Poppins para mantener consistencia tipográfica.

---

*Última actualización: Enero 2025 - Cambio a tipografía unificada Poppins*
*Versión del proyecto: Compatible con React 18 + Vite 5 + Tailwind CSS 3*