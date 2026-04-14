# Autenticación

inmogrid.cl usa **Supabase Auth con Google OAuth** como único proveedor de identidad. Este documento describe la arquitectura del flujo, los recursos externos que lo componen, cómo reproducirlo en local, y el troubleshooting del bug histórico que dio origen a la configuración actual.

Para la decisión de tener un proyecto Google Cloud dedicado ver [ADR-002](adr/ADR-002-google-oauth-dedicated-gcp-project.md).

---

## Visión general del flujo

```
                                    ┌───────────────────────────┐
                                    │  Google OAuth Consent     │
                                    │  (proyecto GCP: inmogrid) │
                                    └─────────────▲─────────────┘
                                                  │
                                     2. 302 a accounts.google.com
                                                  │
┌──────────────┐  1. click       ┌────────────────┴───────────────┐
│ inmogrid.cl  ├────────────────▶│  <SUPABASE_PROJECT_REF>.          │
│ /auth/login  │  signInWith     │  supabase.co/auth/v1/authorize  │
└──────┬───────┘     OAuth       └────────────────┬───────────────┘
       │                                          │
       │                          3. Google valida │
       │                          y redirige a     │
       │                                          ▼
       │                          ┌────────────────────────────────┐
       │                          │  supabase.co/auth/v1/callback  │
       │                          │  ?code=<google_code>           │
       │                          └────────────────┬───────────────┘
       │                                           │
       │                                4. Supabase │
       │                                recupera     │
       │                                redirect_to  │
       │                                y valida     │
       │                                contra       │
       │                                allowlist    │
       │                                           ▼
       │                          ┌────────────────────────────────┐
       │                          │  www.inmogrid.cl/auth/callback │
       │                          │  ?code=<pkce_uuid>              │
       │                          └────────────────┬───────────────┘
       │                                           │
       │                                5. exchangeCodeForSession │
       │                                + upsert inmogrid_profiles │
       │                                           │
       ▼                                           ▼
┌───────────────────────────────────────────────────────┐
│         https://www.inmogrid.cl/dashboard             │
│         (sesión Supabase establecida)                 │
└───────────────────────────────────────────────────────┘
```

## Componentes

### Código de la app (este repo)

| Archivo | Rol |
|---|---|
| `src/app/auth/login/LoginCard.tsx` | Botón "Continuar con Google" que llama a `supabase.auth.signInWithOAuth` |
| `src/app/auth/callback/route.ts` | Endpoint que recibe el code PKCE, lo cambia por sesión, y hace upsert del Profile en `inmogrid_profiles` |
| `src/shared/lib/supabase/client.ts` | `createBrowserClient` para componentes cliente |
| `src/shared/lib/supabase/server.ts` | `createServerClient` para Server Components / Route Handlers |
| `src/shared/lib/supabase/middleware.ts` | `updateSession` para refrescar cookies en cada request |
| `src/middleware.ts` | Lista de rutas públicas/protegidas |

El `redirectTo` que el cliente pasa a Supabase es siempre `${window.location.origin}/auth/callback`, lo cual resuelve dinámicamente a `https://www.inmogrid.cl/auth/callback` en producción y `http://localhost:3000/auth/callback` en dev.

### Recursos externos

| Recurso | Valor | Dónde se configura |
|---|---|---|
| Proyecto GCP | `inmogrid` | [console.cloud.google.com](https://console.cloud.google.com) — seleccionar en el selector superior |
| OAuth Consent Screen | App name: `inmogrid`, Audience: External | GCP → Google Auth Platform → Información de la marca |
| OAuth Client | Tipo: Web application, nombre: `Supabase Auth Client - inmogrid` | GCP → APIs y servicios → Credenciales |
| Proyecto Supabase | `<SUPABASE_PROJECT_REF>` (compartido con pantojapropiedades.cl durante la transición) | [supabase.com/dashboard](https://supabase.com/dashboard) |
| Google provider en Supabase | Enabled, con Client ID/Secret del OAuth Client de arriba | Supabase → Authentication → Sign In / Providers → Google |
| Site URL | `https://www.inmogrid.cl` | Supabase → Authentication → URL Configuration |
| Redirect URLs allowlist | `https://www.inmogrid.cl/**`, `https://inmogrid.cl/**`, `http://localhost:3000/auth/callback` | Supabase → Authentication → URL Configuration |

Los valores sensibles (Project ID completo, Client ID, ubicación del Client Secret) están en el repositorio privado `infra/privado/inmogrid.cl/`.

## Authorized redirect URIs del OAuth Client de Google

El OAuth Client de Google solo debe tener **una** entrada en "Authorized redirect URIs":

```
https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback
```

Esto es intencional. Google no redirige directamente al dominio de la app: redirige al callback de Supabase, y Supabase a su vez redirige al `redirect_to` que le pasamos (validado contra la allowlist de Supabase). Por eso la allowlist vive en Supabase, no en Google.

Si algún día se crea un proyecto Supabase propio para inmogrid, hay que **actualizar este redirect URI** para apuntar al hostname nuevo.

## Dev local

En local corremos con `npm run dev` (puerto 3000 por default). Para que el login funcione:

1. El OAuth Client de Google debe tener `http://localhost:3000` en **Authorized JavaScript origins**. (Actualmente **no** lo tiene — agregarlo cuando empecemos a testear login en local.)
2. La allowlist de Supabase Redirect URLs ya tiene `http://localhost:3000/auth/callback` desde la limpieza del 2026-04-11.
3. Las variables de entorno en `.env.local` deben apuntar al proyecto Supabase correcto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<SUPABASE_PROJECT_REF>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ver repo privado>
```

## Troubleshooting

### Script de diagnóstico

Hay un script Playwright que reproduce el flujo completo y muestra cada hop, Client ID, `redirect_to`, y consent screen:

```bash
node scripts/diagnose-auth-flow.mjs
```

Salida esperada en un flujo sano:

```
Supabase project host: <SUPABASE_PROJECT_REF>.supabase.co
provider:               google
redirect_to:            https://www.inmogrid.cl/auth/callback

client_id:    <GCP_PROJECT_NUMBER>-<...>.apps.googleusercontent.com
redirect_uri: https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback
```

Si el `client_id` **no** empieza con el project number de `inmogrid`, es que el Google provider en Supabase está apuntando al OAuth Client equivocado.

### Síntoma: "Después del login termino en otro dominio con `?code=<uuid>`"

Es el bug histórico del 2026-04-11. El `code` en formato UUID es un code PKCE de Supabase (no un code de Google). La causa es:

1. El `redirect_to` que pasa el cliente **no está** en la allowlist de Redirect URLs de Supabase, **o**
2. El Site URL del proyecto apunta al dominio incorrecto.

Supabase hace fallback al Site URL cuando falla el match de la allowlist. Verificar:

- Supabase → Authentication → URL Configuration → **Site URL** = `https://www.inmogrid.cl`
- **Redirect URLs** incluye `https://www.inmogrid.cl/**` (con `**`, no `*` — `*` solo matchea un segmento del path)

Nota: el dominio apex `inmogrid.cl` hace 307 a `www.inmogrid.cl`, por lo que en producción `window.location.origin` resuelve a `https://www.inmogrid.cl`. Por eso la allowlist necesita la versión con `www`.

### Síntoma: "La consent screen muestra un hostname de Supabase en vez de 'inmogrid'"

Falta configurar la **Información de la marca** en el proyecto GCP `inmogrid`:

1. Google Cloud Console → Google Auth Platform → Información de la marca.
2. Rellenar App name, App logo, User support email, App home page (`https://inmogrid.cl`), privacy policy y terms of service.
3. En **Authorized domains** agregar `inmogrid.cl` (apex, sin `https://` ni `www.`).
4. Guardar. Google puede tardar unos minutos en propagar.

### Síntoma: `redirectTo` hardcodeado apunta a otro dominio

No debería pasar — el código cliente siempre usa `window.location.origin`:

```ts
// src/app/auth/login/LoginCard.tsx
options: { redirectTo: `${window.location.origin}/auth/callback` }
```

Si alguien lo hardcodea a `https://pantojapropiedades.cl` o similar, rechazar el PR.

## Sign-out — diseño defensivo

El hook `useAuth.signOut` (en `src/shared/hooks/useAuth.ts`) está deliberadamente implementado con **cuatro decisiones defensivas**, cada una respuesta a un bug que ya nos pasó:

```ts
const signOut = async () => {
  const SIGNOUT_TIMEOUT_MS = 500

  try {
    await Promise.race([
      supabase.auth.signOut({ scope: 'local' }),
      new Promise<void>((resolve) => setTimeout(resolve, SIGNOUT_TIMEOUT_MS)),
    ])
  } catch (error) {
    console.error('[useAuth.signOut] Error signing out:', error)
  }

  window.location.href = '/'
}
```

### 1. `scope: 'local'` (no el default `'global'`)

Supabase `signOut()` acepta tres scopes:

| Scope | Comportamiento |
|---|---|
| `global` *(default)* | Revoca **todas** las sesiones del usuario en todos sus dispositivos vía una request HTTP a `/auth/v1/logout`. Bloqueante. |
| `local` | Solo limpia las cookies del browser actual. No hace request HTTP explícito. |
| `others` | Revoca todas menos la actual. |

Usamos `local` porque `global` **puede colgarse indefinidamente** si la API de Supabase está lenta, la sesión ya es inválida (retry loop de 401), o hay problemas de red. Bug histórico: con scope global, el `finally` del handler nunca se ejecutaba y el botón quedaba atascado en `"Cerrando..."` para siempre.

### 2. `Promise.race` contra un timeout de 500 ms

Aún con `scope: 'local'`, el SDK de Supabase hace flushing interno de localStorage + cookies + refresh token cleanup. En edge cases (sesiones stale, storage corrupto, SDK versions anteriores) ese flushing puede tardar **varios segundos o quedar colgado**. El `Promise.race` garantiza que después de 500 ms navegamos igual, ocurra lo que ocurra.

No hay riesgo de dejar al cliente con sesión fantasma: cualquier cookie que haya quedado stale la limpia el middleware al siguiente request — ver [sección siguiente sobre cleanup de cookies huérfanas](#middleware-auto-limpieza-de-cookies-huerfanas).

### 3. Redirect a `/` (no a `/auth/login`)

El patrón del producto es Reddit-style: el feed es visible sin autenticación y el botón "Iniciar sesión con Google" vive en el `PublicHeader` de todas las rutas públicas (ver [ADR-004](adr/ADR-004-public-route-group-and-shared-account-menu.md)). Mandar al usuario a `/auth/login` después de cerrar sesión es un salto innecesario — lo natural es que caiga en el feed público y decida si quiere volver a loguearse.

### 4. `window.location.href` (no `router.push`)

`router.push('/')` es **soft navigation** de Next.js — no garantiza que los componentes se desmonten ni que el middleware corra con estado limpio. `window.location.href` fuerza un **full page reload**, lo que:

- Descarta todo el árbol React y re-renderiza desde cero.
- Corre el middleware con las cookies ya limpias.
- Garantiza que ningún componente del dashboard quede montado con sesión stale.

---

## Middleware — auto-limpieza de cookies huérfanas

`src/shared/lib/supabase/middleware.ts` corre en cada request y refresca la sesión vía `updateSession()`. Adicionalmente detecta **JWTs huérfanos** — el caso donde el browser tiene una cookie `sb-*-auth-token` firmada válida pero el `sub` claim apunta a un `auth.users.id` que ya no existe (típicamente porque el usuario fue eliminado desde el dashboard de Supabase o por una operación destructiva de mantenimiento):

```ts
const { data: { user } } = await supabase.auth.getUser()

const hasSupabaseAuthCookie = request.cookies
  .getAll()
  .some((c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))

if (!user && hasSupabaseAuthCookie) {
  await supabase.auth.signOut({ scope: 'local' })
}
```

Sin este branch, un cliente con sesión stale verá **UI desincronizada**: el navbar (client-side `useAuth()` + `onAuthStateChange`) muestra "Hola, {email}" porque el JWT se decodifica, mientras el server component muestra "Inicia sesión…" porque `supabase.auth.getUser()` hace HTTP a Supabase Auth y obtiene `null`.

El branch captura ese desfase y limpia las cookies en el mismo request. Al siguiente navigate, las dos capas coinciden.

**Nota sobre la condición**: no chequeamos `error` explícitamente porque en algunos casos el SDK retorna `{user: null, error: null}` cuando el JWT decodifica OK localmente pero la validación contra Supabase falla silenciosamente. La heurística robusta es "hay cookies de Supabase + `getUser()` retornó null → limpiar".

### Página de rescate `/auth/force-signout`

Para los casos donde el middleware no alcance (ej. el usuario ya tiene un tab abierto y no navega, así que el middleware no se vuelve a ejecutar), existe la ruta **`/auth/force-signout`** como recovery path manual. Es una página client-side que:

1. Elimina todas las cookies `sb-*` del dominio **directamente vía `document.cookie`**, sin pasar por el SDK ni el server.
2. Limpia `localStorage` y `sessionStorage` de cualquier clave `sb-*` (el SDK persiste los tokens ahí).
3. Llama `supabase.auth.signOut({scope:'local'})` como best-effort extra.
4. Hace hard redirect a `/`.

Es **idempotente y determinístico**: funciona aunque el user no haya estado autenticado nunca, y funciona aunque el user haya sido borrado manualmente desde Supabase Dashboard. No depende de validación contra la DB ni del estado de `auth.users`.

**Cuándo usarla**:

- Un usuario reporta que está stuck con el navbar mostrando un email pero el dashboard diciendo "Inicia sesión" — guiarlo a `https://www.inmogrid.cl/auth/force-signout`.
- Estás debuggeando localmente y querés limpiar todo el estado de Supabase sin tocar DevTools.
- Después de rotar el JWT secret de Supabase (todos los tokens existentes quedan inválidos instantáneamente, todos los usuarios necesitan esta ruta).

**Alternativa manual** equivalente (para usuarios sin acceso a la ruta): DevTools → `Application` → `Storage` → click derecho en el dominio → **`Clear site data`**. Más agresivo — limpia también IndexedDB, cache y service workers. Útil como último recurso.

---

## Triggers de `auth.users` — creación de perfiles en signup

Cada vez que Supabase inserta una fila en `auth.users` (primer login de un usuario), dos triggers `AFTER INSERT` corren **en el mismo statement**:

| Trigger | Función | Tabla destino | Motivo |
|---|---|---|---|
| `on_auth_user_created_create_profile` | `handle_new_user_profile` | `public.profiles` | Legacy — usado por pantojapropiedades.cl mientras comparta la base |
| `on_auth_user_created_inmogrid` | `handle_new_inmogrid_profile` | `public.inmogrid_profiles` | inmogrid.cl necesita la fila de perfil para renderizar dashboard/perfil público |

Ambas funciones corren como `SECURITY DEFINER` (privilegios del owner, no del rol que hace el `INSERT`) y usan `INSERT ... ON CONFLICT DO NOTHING/UPDATE` para ser idempotentes.

**Bug histórico (2026-04-11)**: existía un tercer trigger `trg_on_auth_user_created_degux` que intentaba insertar en `public.degux_profiles` — una tabla de un proyecto hermano discontinuado (`degux.cl`) que **ya no existe en el schema**. Cada `INSERT` nuevo a `auth.users` fallaba con `relation "public.degux_profiles" does not exist`, y Supabase retornaba `server_error: unexpected_failure: Database error saving new user` al callback OAuth, bloqueando cualquier login nuevo en la app. Fix: `DROP TRIGGER` + `DROP FUNCTION` del legacy huérfano, más un trigger nuevo para `inmogrid_profiles` (que antes no existía — los perfiles de inmogrid.cl se creaban vía hook del callback OAuth de forma no confiable).

Regla operativa: **antes de correr operaciones destructivas sobre `auth.users`** (delete masivo, merge de usuarios, rotación de projects), auditar siempre los triggers con:

```sql
SELECT tgname, tgtype, pg_get_triggerdef(oid)
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass AND NOT tgisinternal;
```

Si aparece un trigger que referencia una tabla o schema que no pertenece a este proyecto, es candidato a DROP.

---

## Rotación del Client Secret

Si el Client Secret se compromete:

1. GCP Console → proyecto `inmogrid` → APIs y servicios → Credenciales → abrir el `Supabase Auth Client - inmogrid`.
2. Click en "Reiniciar secreto del cliente". Google genera uno nuevo inmediatamente.
3. Copiar el nuevo secret y pegarlo en Supabase → Authentication → Sign In / Providers → Google → **Client Secret** → Save.
4. El viejo deja de funcionar al instante — cualquier sesión OAuth en progreso va a fallar pero las sesiones ya establecidas siguen válidas (usan JWT, no el secret).
5. Actualizar el JSON en el repo privado (`infra/privado/inmogrid.cl/`).

## Relacionados

- Decisión arquitectónica: [`adr/ADR-002-google-oauth-dedicated-gcp-project.md`](adr/ADR-002-google-oauth-dedicated-gcp-project.md)
- Patrones de código (auth, forms, errors): [`arquitectura/patrones.md`](arquitectura/patrones.md)
- Script de diagnóstico: `scripts/diagnose-auth-flow.mjs`
- CLAUDE.md del repo para el contrato de helpers (`getUser`, `requireAuth`, `useAuth`)
