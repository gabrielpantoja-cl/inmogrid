# Módulos y Producto
### Qué construimos — en qué orden y por qué

---

## ⚠️ Deadline crítico: 16 de abril de 2026

`pantojapropiedades.cl` vence el **16 de abril de 2026** — quedan ~10 días desde la fecha de esta decisión.

**La decisión:** en lugar de renovar `pantojapropiedades.cl`, lanzar `inmogrid.cl` con un MVP funcional antes de esa fecha. Esto convierte el vencimiento del dominio en un hito de lanzamiento, no en un problema.

**MVP mínimo para el 16 de abril:**
- Landing pública de INMOGRID con identidad y manifiesto
- Agenda de eventos funcional (aunque empiece con 0 eventos publicados)
- Formulario para publicar eventos (free/pagado)
- Redirección 301 de `pantojapropiedades.cl` → `inmogrid.cl`

**Stack del MVP:** Next.js 15 + Supabase + Vercel. Ver `07-arquitectura-tecnica.md`.

---

## Principio de diseño de producto

Cada módulo debe pasar este filtro antes de construirse:

> *"¿Este módulo requiere que alguien pague por aparecer o por acceder a información básica?"*

Si la respuesta es sí — no va. O va en formato premium claramente separado del conocimiento base.

---

## Quick Win: Agenda de Eventos Inmobiliarios

**Por qué empezar aquí:**
- Cero competidores directos en Chile — nadie lo hace
- Bajo costo de desarrollo inicial (directorio, no marketplace complejo)
- Genera relaciones con instituciones públicas desde el día 1
- Valida el propósito de la plataforma con evidencia concreta
- Crea tráfico recurrente (la gente vuelve a revisar qué eventos hay)

**Cómo funciona:**

| Tipo de evento | Criterio | Costo de publicar | Ejemplos |
|---------------|----------|-------------------|----------|
| Sin fines de lucro | Evento gratuito para asistentes, organizado por entidad pública/académica/gremial | **Gratis** | Talleres municipales, seminarios universitarios, jornadas MINVU/SII, charlas de colegios de tasadores |
| Con fines de lucro | El evento cobra entrada o tiene objetivo comercial explícito | **Pagado** | Lanzamientos inmobiliarios, cursos de inversión, open house, seminarios con ticket |

**Actores que publicarían gratis:** municipios, MINVU, SII, universidades, CChC, colegios de tasadores y corredores, PropTech Chile como asociación
**Actores que pagarían:** inmobiliarias, constructoras, escuelas de inversión, asesores financieros

**Por qué el modelo dual es correcto:** los eventos gratuitos institucionales no son solo tráfico — son certificados de confianza. Cuando un municipio publica en la plataforma, está avalando el espacio implícitamente.

---

## Módulos de la Capa de Conocimiento

### Portal ciudadano de precios
Mapas de referenciales de mercado por zona, actualizados. No para comprar — para entender.
- Precios de arriendo por barrio y tipo de propiedad
- Tendencias históricas básicas
- Comparativas entre zonas

**Estado: YA EXISTE — referenciales.cl**

Este módulo no hay que construirlo desde cero. Gabriel ya tiene operativo `referenciales.cl`: una base de datos colaborativa de referenciales de tasación, construida en Next.js 15 + Neon (PostgreSQL serverless) + Vercel. Actualmente tiene bajo perfil público — sin promoción, sin menciones en redes — pero la infraestructura está funcionando.

La tarea no es crear el portal ciudadano de precios. Es **integrar y abrir referenciales.cl** como la capa de datos del ecosistema.

**Stack de referenciales.cl (distinto al ecosistema principal):**
- Frontend: Next.js 15 (Server Actions, PWA instalable)
- Base de datos: Neon (PostgreSQL serverless — distinto al Supabase del ecosistema principal)
- Deployment: Vercel
- Analytics: Google Analytics + Vercel Analytics

**Decisión pendiente:** ¿Se integra referenciales.cl directamente al nuevo ecosistema (mismo dominio, mismo stack) o se mantiene como proyecto independiente que se alimenta del ecosistema? Ambas opciones son válidas — la segunda preserva la autonomía de referenciales.cl como herramienta específica para tasadores.

### Guías y recursos abiertos
Contenido educativo sobre cómo funciona el mercado inmobiliario chileno:
- Derechos del arrendatario
- Cómo leer un informe de tasación
- Qué es el avalúo fiscal y para qué sirve
- Cómo funciona el CBR
- Qué hacer ante una expropiación

*Estado: parcialmente disponible en gabrielpantoja.cl/blog — migrar y ampliar.*

### Educación abierta
Cursos, artículos y talleres sobre el mercado. Gratuitos en su forma básica.

---

## Módulos de la Capa de Comunidad Profesional

### Red de tasadores
El único directorio verificado de tasadores en Chile:
- Perfil con especialidades, zonas de trabajo, metodologías publicadas
- Sistema de peer review entre profesionales
- Acceso a base de referenciales compartida

*Este módulo resuelve un dolor real: hoy no existe ningún directorio verificado de tasadores independientes en Chile.*

### Comunidad de propietarios
Foro estructurado para propietarios:
- Templates de contratos de arriendo
- Orientación legal básica
- Preguntas frecuentes verificadas por profesionales

### Directorio de profesionales
Tasadores, corredores y otros profesionales del rubro con perfil verificado.
- Sin pago para aparecer en el directorio básico
- Perfil premium opcional para mayor visibilidad

---

## Módulos de Infraestructura

### API pública
Que municipios, investigadores y periodistas puedan construir sobre los datos.
Modelo: libre para uso no comercial, pagado para uso comercial a escala.

---

## Lo que NO construimos

- Listings de propiedades en venta o arriendo
- Motor de búsqueda de propiedades
- Sistema de comisiones por transacción
- Comparador de créditos hipotecarios
- Cualquier cosa que requiera que alguien pague por aparecer primero

---

## Orden de construcción

```
FASE 0 — MVP (antes del 16 abril 2026)
├── Landing INMOGRID con identidad y manifiesto
├── Agenda de eventos (UI funcional, aunque sin eventos aún)
└── Formulario publicación eventos (cobro desde día 1 para comerciales)

FASE 1 — COMUNIDAD PROFESIONAL (tasadores y corredores primero)
├── Directorio de tasadores verificado
├── Red de corredores colaborativa
└── Guías y recursos abiertos (migrar base del blog)

FASE 2 — CIUDADANOS Y PROPIETARIOS
├── Portal ciudadano de precios (vía API referenciales.cl)
└── Comunidad de propietarios (foro + templates)

FASE 3 — DATOS E INFRAESTRUCTURA
├── API pública v1
└── Lo que la comunidad pida
```
