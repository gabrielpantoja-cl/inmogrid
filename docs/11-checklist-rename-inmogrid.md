# Checklist: Finalizar el cambio de nombre degux → inmogrid

> Generado el 9 de abril de 2026. El código fuente ya fue actualizado completamente. Lo que sigue son los pasos manuales de infraestructura que no puede hacer Claude.

---

## 1. Registrar el dominio `inmogrid.cl`

- [ ] Ir a [clientes.nic.cl](https://clientes.nic.cl)
- [ ] Buscar `inmogrid.cl` → registrar (disponible, verificado abril 2026)
- [ ] Registrar también `www.inmogrid.cl` como alias si NIC lo permite, o configurar en DNS

---

## 2. Renombrar las tablas en Supabase

> **Hacer ANTES del próximo deploy a producción.** El código ya usa los nombres nuevos (`inmogrid_*`). Si las tablas siguen llamándose `degux_*`, la app se rompe.

Ir a **Supabase → SQL Editor** y ejecutar:

```sql
-- Renombrar tablas principales
ALTER TABLE degux_profiles              RENAME TO inmogrid_profiles;
ALTER TABLE degux_connections           RENAME TO inmogrid_connections;
ALTER TABLE degux_events                RENAME TO inmogrid_events;
ALTER TABLE degux_professional_profiles RENAME TO inmogrid_professional_profiles;
ALTER TABLE degux_audit_logs            RENAME TO inmogrid_audit_logs;
ALTER TABLE degux_chat_messages         RENAME TO inmogrid_chat_messages;
```

> La tabla `posts` no tiene prefijo degux — no requiere cambio.

Verificar que las políticas RLS y los índices se hayan arrastrado con el rename (en Supabase, `RENAME TABLE` preserva todo). Si algo falla, revisar en **Table Editor → [tabla] → Policies**.

---

## 3. Actualizar Supabase Auth — Redirect URLs

> Sin este paso, el login con Google seguirá redirigiendo a `pantojapropiedades.cl`.

Ir a **Supabase → Authentication → URL Configuration**:

- [ ] Agregar en **Redirect URLs**:
  - `https://inmogrid.cl/auth/callback`
  - `https://www.inmogrid.cl/auth/callback`
- [ ] Opcionalmente actualizar **Site URL** a `https://inmogrid.cl` cuando el dominio esté activo

> Google Cloud Console **no requiere cambios** — sus redirect URIs apuntan al callback de Supabase, no al dominio de la app.

---

## 4. Renombrar el repositorio en GitHub

- [ ] Ir a `github.com/gabrielpantoja-cl/degux.cl` → Settings → Repository name
- [ ] Cambiar a `inmogrid.cl`
- [ ] GitHub crea un redirect automático desde la URL antigua — el repo sigue accesible mientras no se cree otro con el nombre viejo
- [ ] Actualizar el remote local:
  ```bash
  git remote set-url origin https://github.com/gabrielpantoja-cl/inmogrid.cl.git
  ```

---

## 5. Actualizar el proyecto en Vercel

- [ ] Ir a Vercel → proyecto `degux-cl` (o como se llame) → Settings → General
- [ ] Cambiar el nombre del proyecto a `inmogrid-cl`
- [ ] En **Domains**: agregar `inmogrid.cl` y `www.inmogrid.cl`
- [ ] Verificar que las variables de entorno `NEXT_PUBLIC_BASE_URL` etc. apunten a `https://inmogrid.cl`
- [ ] Una vez que el DNS de inmogrid.cl esté activo, remover `degux.cl` de los dominios Vercel (o mantenerlo con redirect 301 durante la transición)

---

## 6. Configurar DNS en Cloudflare para `inmogrid.cl`

Una vez registrado el dominio en NIC.cl, agregarlo a Cloudflare y crear los registros:

| Tipo | Nombre | Valor | Proxy |
|------|--------|-------|-------|
| A | `@` | `76.76.21.21` | OFF |
| CNAME | `www` | `cname.vercel-dns.com` | OFF |

> Usar los mismos valores que `degux.cl`. Proxy OFF (igual que el dominio anterior) para que Vercel maneje los certificados SSL.

---

## 7. Transición de `degux.cl` → redirect 301

Una vez que `inmogrid.cl` esté activo en Vercel:

- [ ] En Vercel, mantener `degux.cl` como dominio adicional
- [ ] Configurar redirect 301 de `degux.cl` → `inmogrid.cl` desde Vercel (Settings → Domains → Redirect)
- [ ] Mantener el redirect activo al menos 12 meses
- [ ] `degux.cl` vence en **octubre 2026** — decidir antes si renovar 1 año más solo para el redirect, o dejar expirar

---

## 8. Renombrar la carpeta local (opcional, cosmético)

La carpeta en tu máquina sigue siendo `C:\Users\gabri\Developer\proptech\degux.cl\`. Esto no afecta al código ni al deploy, pero si quieres:

```bash
# Desde C:\Users\gabri\Developer\proptech\
mv degux.cl inmogrid.cl
```

> Si haces esto, la sesión de Claude Code en esa carpeta quedará con la ruta vieja en memoria. Simplemente abre una nueva sesión apuntando a la nueva ruta.

---

## Orden recomendado

```
1. Supabase: renombrar tablas   ← bloquea el deploy
2. Registrar inmogrid.cl        ← bloquea DNS
3. Supabase: Redirect URLs      ← bloquea login
4. Vercel: agregar dominio      ← después de tener el dominio
5. Cloudflare: DNS inmogrid.cl  ← después de tener el dominio
6. GitHub: renombrar repo       ← en cualquier momento
7. degux.cl → redirect 301      ← después de que inmogrid esté activo
```
