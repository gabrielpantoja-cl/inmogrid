# ADR-002: Proyecto Google Cloud dedicado para OAuth

**Estado**: Aceptado
**Fecha**: 2026-04-11
**Decisores**: Gabriel Pantoja
**Contexto de ejecución**: Migración del OAuth Client de `degux-cl` a un proyecto GCP propio para inmogrid

---

## Contexto

Hasta 2026-04-11 la autenticación Google de inmogrid.cl usaba el OAuth Client del proyecto Google Cloud `degux-cl` (project number `<OLD_GCP_PROJECT_NUMBER>`), heredado del ecosistema ancestor. Consecuencias observadas:

1. **Branding incorrecto en la consent screen**. Google mostraba un hostname técnico (`<SUPABASE_PROJECT_REF>.supabase.co`) o el nombre de proyectos vecinos en el diálogo "Acceder con Google" cuando el usuario venía de inmogrid.cl.
2. **Cliente con warning en GCP Console**. El "Cliente web degux.cl" aparecía con triángulo amarillo — deuda técnica heredada de una configuración previa.
3. **OAuth Consent Screen único por proyecto**. Cada proyecto GCP tiene un solo consent screen; rebrandearlo a "inmogrid" habría roto la experiencia de los otros sitios que compartían el mismo Client ID.
4. **Project ID inmutable**. No se puede renombrar el Project ID (`degux-cl` queda para siempre, solo el display name se puede editar).
5. **Bug funcional de redirect**. Después del login, el usuario terminaba en `https://www.pantojapropiedades.cl/?code=<uuid>` en vez de `inmogrid.cl/dashboard`. El origen era el **Site URL** del proyecto Supabase apuntando a pantojapropiedades.cl, combinado con una allowlist de **Redirect URLs** que no contenía a inmogrid. Supabase hacía fallback al Site URL.
6. **Desalineamiento semántico**. Tener el OAuth Client de inmogrid en un proyecto llamado `degux-cl` forzaba a reconstruir el mapping mental cada vez que se abría la consola.

Adicionalmente, los dominios `degux.cl` y `pantojapropiedades.cl` no serán renovados y dejan de ser load-bearing en días — por lo que reutilizar sus OAuth Clients era una solución temporal con costo creciente.

## Decisión

Crear un proyecto Google Cloud **dedicado exclusivamente a inmogrid.cl**, con su propio OAuth Consent Screen y OAuth Client. El proyecto Supabase **sigue siendo compartido** con pantojapropiedades.cl durante un período breve de transición, pero su `Site URL` y `Redirect URLs` fueron limpiados para servir únicamente a inmogrid.

Parámetros de la decisión:

- **Proyecto GCP**:
  - Display name: `inmogrid`
  - Organización: (ver repo privado)
- **OAuth Consent Screen**:
  - Audience: **External**
  - App name: `inmogrid`
  - Authorized domain: `inmogrid.cl`
  - App home / privacy / terms: `https://inmogrid.cl`, `/privacy`, `/terms`
- **OAuth Client** (tipo Web application):
  - JavaScript origins: `https://inmogrid.cl`, `https://www.inmogrid.cl`
  - Redirect URIs: `https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
- **Supabase URL Configuration** (proyecto `<SUPABASE_PROJECT_REF>`):
  - Site URL: `https://www.inmogrid.cl`
  - Redirect URLs allowlist: `https://www.inmogrid.cl/**`, `https://inmogrid.cl/**`, `http://localhost:3000/auth/callback`

Los IDs numéricos (Project ID, Client ID, Client Secret) no se documentan en este ADR por ser operativos / sensibles — ver `docs/authentication.md` y el repo privado.

## Consecuencias

### Positivas

- **Branding consistente**. La consent screen muestra "inmogrid" en vez de un hostname de Supabase o el nombre de un proyecto muerto.
- **Ownership claro**. El OAuth Client vive en un proyecto GCP cuyo nombre coincide con el producto.
- **Sin deuda heredada**. Partimos de cero, sin advertencias, sin configuraciones obsoletas.
- **Resiliente a la muerte de degux/pantoja**. No depende de ningún proyecto GCP que vaya a ser eliminado.
- **Auditoría simple**. `inmogrid → Credenciales → Supabase Auth Client - inmogrid` es autoexplicativo.
- **Bug de redirect resuelto**. Usuarios autenticados terminan en `https://www.inmogrid.cl/dashboard` como se espera.

### Negativas

- **Ruptura intencional de auth en pantojapropiedades.cl y degux.cl**. Al reasignar el Site URL y limpiar la allowlist, estos sitios dejan de poder loguearse contra el proyecto Supabase compartido. Tradeoff aceptado: estos dominios serán dados de baja en días.
- **El Client Secret del OAuth Client viejo de `degux-cl` sigue siendo técnicamente válido** hasta que se elimine manualmente. No representa riesgo porque ya nadie lo usa, pero queda como tarea de limpieza cuando se elimine el proyecto `degux-cl`.
- **La separación de Supabase queda pendiente**. inmogrid todavía comparte el proyecto Supabase `<SUPABASE_PROJECT_REF>`. Cuando se cree un proyecto Supabase propio de inmogrid, hay que actualizar el redirect URI del OAuth Client para apuntar al nuevo hostname.

## Alternativas consideradas

### 1. Reutilizar el OAuth Client de `degux-cl`

- **Rechazada**. Project ID inmutable, branding incorrecto, warning heredado, y `degux.cl` será dado de baja.

### 2. Renombrar el display name del proyecto `degux-cl` a "inmogrid"

- **Rechazada**. El Project ID sigue siendo `degux-cl` para siempre, y no resuelve el branding ni el warning.

### 3. Esperar a tener un proyecto Supabase propio para inmogrid antes de crear el proyecto GCP

- **Rechazada**. Bloquea la fix del bug por días. La separación de Supabase se puede hacer después sin afectar este OAuth Client — solo requiere actualizar el redirect URI cuando cambie el hostname.

### 4. Mantener `Site URL` de Supabase en pantojapropiedades.cl y solo agregar inmogrid a los Redirect URLs

- **Rechazada**. El Site URL es el fallback cuando falla el match de la allowlist — cualquier error de configuración en un cliente futuro volvería a mandar usuarios a un dominio que ya no existe. El Site URL debe reflejar el producto vivo.

## Relacionados

- Doc operativa del setup actual: [`docs/authentication.md`](../authentication.md)
- Secretos del proyecto GCP `inmogrid`: repo privado `infra/privado/inmogrid.cl/README.md`
- Timeline detallado de la migración 2026-04-11: repo privado `infra/privado/inmogrid.cl/oauth-migration-2026-04-11.md`
- Código del flujo de auth: `src/app/auth/login/LoginCard.tsx`, `src/app/auth/callback/route.ts`, `src/shared/lib/supabase/`
