# Documentación de `inmogrid.cl`

> Proyecto open source para construir un ecosistema inmobiliario abierto y colaborativo en Chile.

Esta carpeta contiene la documentación pública del proyecto. Si vas a contribuir, empezá por [architecture.md](architecture.md).

---

## Índice

### Fundacional — por qué existe este proyecto

| Documento | Contenido |
|---|---|
| [manifesto.md](manifesto.md) | El texto fundacional — qué creemos, qué hacemos y qué no hacemos |
| [vision.md](vision.md) | Visión, principios y origen del proyecto |

### Técnica — cómo está construido

| Documento | Contenido |
|---|---|
| [architecture.md](architecture.md) | Stack, estructura del repo, modelo de datos, auth y API |
| [authentication.md](authentication.md) | Flujo OAuth Google + Supabase, troubleshooting y rotación de secretos |
| [adr/ADR-001-feature-first-architecture.md](adr/ADR-001-feature-first-architecture.md) | Decisión de arquitectura feature-first |
| [adr/ADR-002-google-oauth-dedicated-gcp-project.md](adr/ADR-002-google-oauth-dedicated-gcp-project.md) | Decisión de usar un proyecto GCP dedicado para OAuth |
| [arquitectura/patrones.md](arquitectura/patrones.md) | Patrones de código — forms, data fetching, auth, errores |
| [arquitectura/ROADMAP-refactor.md](arquitectura/ROADMAP-refactor.md) | Roadmap de refactor hacia la estructura actual |
| [sql-migrations/001_inmogrid_schema.sql](sql-migrations/001_inmogrid_schema.sql) | Schema SQL inicial para Supabase |

---

## Cómo contribuir

Ver [`CONTRIBUTING.md`](../CONTRIBUTING.md) en la raíz del repositorio.

Reglas rápidas:

- Abrí un issue antes de trabajar en cambios grandes
- TypeScript strict — sin `any` implícitos
- Respetá la estructura feature-first descrita en ADR-001
- Corré `npm run lint` y `npm run test` antes de abrir un PR

---

## Glosario

- **CBR** — Conservador de Bienes Raíces. Registro notarial de propiedades en Chile.
- **ROL** — Identificador único de propiedad asignado por el SII. Formato: `NNNNN-AAAA`.
- **Referencial** — Transacción comparable usada para valorar una propiedad.
- **Tasación** — Avalúo de una propiedad. **Peritaje** — Tasación pericial judicial.
- **SII** — Servicio de Impuestos Internos (autoridad tributaria chilena).

---

*Documento vivo. Los PRs que mejoren la documentación son bienvenidos.*
