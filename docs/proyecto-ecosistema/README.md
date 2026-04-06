# Proyecto: Ecosistema Abierto de Conocimiento Inmobiliario
### Mona & Gabriel — Abril 2026

Carpeta de trabajo estratégico para el nuevo proyecto que reemplazará a pantojapropiedades.cl.

---

## Documentos

| Archivo | Contenido |
|---------|-----------|
| `01-vision-y-principios.md` | Qué somos, qué no somos, por qué existimos |
| `02-la-tesis-de-la-confianza.md` | El insight central: por qué ningún portal chileno tiene confianza — y cómo nosotros la construimos |
| `03-mercado-y-competencia.md` | Mapa del PropTech chileno, brechas y oportunidades |
| `04-modulos-y-producto.md` | Módulos posibles, quick wins, roadmap de producto |
| `05-modelo-de-negocio.md` | Cómo se financia sin vender propiedades |
| `06-nombre-y-marca.md` | Exploración de nombre, dominio y identidad |
| `07-arquitectura-tecnica.md` | Repositorio GitHub, stack tecnológico, Oracle VPS, hoja de ruta técnica |
| `08-nombre-y-dominio.md` | Candidatos de nombre, disponibilidad verificada en NIC.cl, recomendación degux.cl |
| `09-manifiesto.md` | Manifiesto público del proyecto — el texto fundacional |
| `10-plan-de-mejora-degux.md` | Hoja de ruta técnica concreta: tareas, archivos, esfuerzo, deadlines |

---

## Decisiones resueltas (abril 2026)

| Decisión | Respuesta |
|----------|-----------|
| Comunidad inicial | **Tasadores y corredores primero** — Fase 2: ciudadanos y propietarios |
| Relación con gabrielpantoja.cl | **Plataformas separadas** — DEGUX es proyecto aparte |
| Marcas personales | **Separadas** — Gabriel mantiene gabrielpantoja.cl; Mona desarrolla su propia marca |
| Rol de Mona en DEGUX | **Marca y validación** |
| referenciales.cl | **Separado y autónomo** — DEGUX lo consume vía API pública |
| Deadline de lanzamiento | **16 de abril de 2026** — vencimiento de pantojapropiedades.cl |
| Stack tecnológico | **Next.js 15 + Prisma + Supabase PostgreSQL + Vercel** |
| Escritura del nombre | **DEGUX** (todo mayúsculas) |
| Cobro de eventos comerciales | **Desde el día 1** |
| Competidores de referencia | **Descubro Data y HousePricing** |

## Preguntas aún abiertas

| Pregunta | Estado |
|----------|--------|
| ¿Alianzas fundacionales concretas? (colegios profesionales, municipios, universidades) | Abierta — ninguna institución identificada aún |
| ¿Dominio de marca personal de Mona? | Abierta |

---

## Base de código y backend

**Repositorio:** `C:\Users\gabri\Developer\personal\degux.cl`
**Backend Supabase:** proyecto `pantojapropiedades.cl` → renombrar a `DEGUX` (mismo ref, mismas keys)
**Deploy:** Vercel Hobby (4° proyecto, límite es 200)

El free tier de Supabase permite solo 2 proyectos activos. Como `pantojapropiedades.cl` deja de existir el 16 de abril, su slot Supabase se repropone directamente para DEGUX — sin crear proyecto nuevo, sin pagar. El project ref y las API keys no cambian al renombrar. Ver estrategia completa en `07-arquitectura-tecnica.md` y `10-plan-de-mejora-degux.md`.

---

*Documento vivo. Actualizar con cada sesión estratégica.*
*Versión anterior (supersedida): `docs/proyecto-ecosistema/VISION-ECOSISTEMA-ABIERTO2.md`*
