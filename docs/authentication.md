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
│ inmogrid.cl  ├────────────────▶│  SUPABASE_PROJECT_REF.          │
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
| Proyecto Supabase | `SUPABASE_PROJECT_REF` (compartido con pantojapropiedades.cl durante la transición) | [supabase.com/dashboard](https://supabase.com/dashboard) |
| Google provider en Supabase | Enabled, con Client ID/Secret del OAuth Client de arriba | Supabase → Authentication → Sign In / Providers → Google |
| Site URL | `https://www.inmogrid.cl` | Supabase → Authentication → URL Configuration |
| Redirect URLs allowlist | `https://www.inmogrid.cl/**`, `https://inmogrid.cl/**`, `http://localhost:3000/auth/callback` | Supabase → Authentication → URL Configuration |

Los valores sensibles (Project ID completo, Client ID, ubicación del Client Secret) están en el repositorio privado `infra/privado/inmogrid.cl/`.

## Authorized redirect URIs del OAuth Client de Google

El OAuth Client de Google solo debe tener **una** entrada en "Authorized redirect URIs":

```
https://SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
```

Esto es intencional. Google no redirige directamente al dominio de la app: redirige al callback de Supabase, y Supabase a su vez redirige al `redirect_to` que le pasamos (validado contra la allowlist de Supabase). Por eso la allowlist vive en Supabase, no en Google.

Si algún día se crea un proyecto Supabase propio para inmogrid, hay que **actualizar este redirect URI** para apuntar al hostname nuevo.

## Dev local

En local corremos con `npm run dev` (puerto 3000 por default). Para que el login funcione:

1. El OAuth Client de Google debe tener `http://localhost:3000` en **Authorized JavaScript origins**. (Actualmente **no** lo tiene — agregarlo cuando empecemos a testear login en local.)
2. La allowlist de Supabase Redirect URLs ya tiene `http://localhost:3000/auth/callback` desde la limpieza del 2026-04-11.
3. Las variables de entorno en `.env.local` deben apuntar al proyecto Supabase correcto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SUPABASE_PROJECT_REF.supabase.co
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
Supabase project host: SUPABASE_PROJECT_REF.supabase.co
provider:               google
redirect_to:            https://www.inmogrid.cl/auth/callback

client_id:    546723795340-<resto>.apps.googleusercontent.com
redirect_uri: https://SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
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
