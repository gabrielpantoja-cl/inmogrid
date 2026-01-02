# degux.cl - Tu Ecosistema Digital para Crear y Conectar

**degux.cl** lienzo digital para tu marca personal. Un espacio libre y abierto donde puedes construir tu perfil, publicar tu trabajo, compartir tus ideas y conectar con una comunidad de creadores y profesionales.

Imagina una mezcla entre **Substack**, **Behance** y **Linktree**, con un fuerte sentido de comunidad local.

## La Visión: Un Ecosistema Colaborativo

En un mundo digital saturado, degux.cl nace como un refugio para la autenticidad. Creemos en un internet donde el control creativo pertenece al usuario. Nuestra misión es ofrecerte las herramientas para que diseñes tu propio espacio, cuentes tu historia sin algoritmos que te limiten y construyas conexiones genuinas.

- **Para el Creador:** Publica artículos, muestra tu portafolio, comparte tus proyectos.
- **Para el Profesional:** Consolida tu presencia online, desde tu biografía hasta tus enlaces más importantes.
- **Para la Comunidad:** Descubre perfiles fascinantes, sigue el trabajo de otros y participa en un ecosistema basado en el respeto y la colaboración.

## Características Principales

- **Perfiles Públicos y Configurables:** Tu espacio, tus reglas. Diseña un perfil que realmente te represente (`degux.cl/tu-nombre`).
- **Libertad de Publicación:** Comparte lo que quieras, desde un ensayo profundo hasta una galería de imágenes o tu último proyecto de código.
- **Descubrimiento Orgánico:** Explora una red de perfiles sin la interferencia de algoritmos de recomendación. La curiosidad es tu única guía.
- **Inicio de Sesión Simple y Seguro:** Crea tu perfil de forma segura utilizando tu cuenta de Google. Solo es necesario para empezar a crear; el resto del ecosistema es abierto para todos.
- **Hecho con Tecnología Moderna:** Una plataforma rápida, robusta y de código abierto construida para el futuro.

## Stack Tecnológico

- **Framework:** Next.js 15 (App Router)
- **Lenguaje:** TypeScript
- **Base de Datos:** PostgreSQL con PostGIS
- **ORM:** Prisma
- **Autenticación:** NextAuth.js (Google Provider)
- **UI:** Tailwind CSS
- **Despliegue:** Docker en nuestro VPS

## Empezando con el Desarrollo

¿Interesado en contribuir? ¡Genial! Sigue estos pasos:

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/degux.cl.git
    cd degux.cl
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Configura tus variables de entorno:**
    Copia `.env.example` a `.env.local` y añade tus claves (Google OAuth, base de datos).
    ```bash
    cp .env.example .env.local
    ```

4.  **Inicia el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

### Comandos Esenciales

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Compila la aplicación para producción.
- `npm run test`: Ejecuta las pruebas con Jest.
- `npm run lint`: Revisa el código con ESLint.
- `npm run prisma:generate`: Genera el cliente de Prisma.
- `npm run prisma:push`: Aplica el schema de Prisma a la base de datos.

## Estado del Proyecto

**Fase Actual: Renacimiento.** Estamos en pleno desarrollo del núcleo de la plataforma: los perfiles de usuario y el sistema de publicación. La base tecnológica es sólida, y ahora estamos construyendo la experiencia de usuario que definirá a degux.cl.

## ¿Cómo Contribuir?

Este es un proyecto comunitario en su corazón. Todas las contribuciones son bienvenidas.

1.  Abre un **Issue** para discutir tu idea.
2.  Haz un **Fork** del repositorio.
3.  Crea una nueva **rama** para tu feature.
4.  Envía un **Pull Request**.

---

**Únete a nosotros en la construcción de un internet más personal y colaborativo.**
