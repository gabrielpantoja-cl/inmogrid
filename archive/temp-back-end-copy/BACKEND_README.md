# 🚀 Instrucciones para el Equipo de Backend - inmogrid.cl

**Última actualización**: 2025-10-06
**Versión**: 1.0.0

---

## 📋 Resumen Ejecutivo

Este documento proporciona instrucciones paso a paso para diagnosticar y resolver problemas de autenticación en producción para inmogrid.cl.

**Problema actual**: La autenticación de Google OAuth no está funcionando en producción.

**Objetivo**: Dejar la autenticación funcionando HOY MISMO en https://inmogrid.cl

---

## 🎯 Checklist Rápido (15 minutos)

Ejecuta estos pasos en orden:

```bash
# 1. Conectar al VPS
ssh gabriel@VPS_IP_REDACTED

# 2. Ir al directorio del proyecto
cd ~/inmogrid.cl

# 3. Ejecutar script de verificación de variables
./scripts/check-env.sh

# 4. Ejecutar script de verificación de BD
./scripts/check-db.sh vps

# 5. Ejecutar script de test de autenticación
./scripts/test-auth.sh vps

# 6. Ver logs en tiempo real
docker logs inmogrid-web --tail 100 -f
```

Si todos los scripts pasan ✅, la autenticación debería funcionar.

---

## 📚 Documentación Completa

### 1. Guía Principal de Deployment

📄 **Archivo**: `docs/BACKEND_AUTH_DEPLOYMENT_GUIDE.md`

Esta guía contiene:
- Diagnóstico rápido de problemas comunes
- Configuración completa de variables de entorno
- Verificación de base de datos PostgreSQL
- Configuración de Google OAuth
- Deployment con Docker
- Troubleshooting detallado

### 2. Scripts de Diagnóstico

Todos los scripts están en `scripts/`:

| Script | Propósito | Uso |
|--------|-----------|-----|
| `check-env.sh` | Verifica variables de entorno | `./scripts/check-env.sh` |
| `check-db.sh` | Diagnóstico de PostgreSQL | `./scripts/check-db.sh vps` |
| `test-auth.sh` | Test de autenticación | `./scripts/test-auth.sh vps` |

---

## 🔧 Solución de Problemas Más Comunes

### Problema 1: "NEXTAUTH_SECRET is missing"

**Solución**:
```bash
# Generar secret
openssl rand -base64 32

# Agregar a .env en VPS
ssh gabriel@VPS_IP_REDACTED
cd ~/inmogrid.cl
echo 'NEXTAUTH_SECRET="TU_SECRET_GENERADO_AQUI"' >> .env

# Restart container
docker restart inmogrid-web
```

---

### Problema 2: Login redirige en loop a `/auth/signin`

**Causa**: El middleware está bloqueando en producción.

**Solución temporal** (para diagnosticar):

```bash
# En VPS
ssh gabriel@VPS_IP_REDACTED
cd ~/inmogrid.cl

# Editar middleware para deshabilitar auth en producción
# Cambiar línea 12-15 en src/middleware.ts
nano src/middleware.ts

# Cambiar:
# if (process.env.NODE_ENV === 'development') {
# Por:
# if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') {

# Rebuild y restart
docker exec inmogrid-web npm run build
docker restart inmogrid-web
```

⚠️ **IMPORTANTE**: Esta es una solución temporal para diagnosticar. NO dejar así en producción.

---

### Problema 3: "relation User does not exist"

**Causa**: Las tablas de NextAuth no existen en PostgreSQL.

**Solución**:
```bash
# En VPS
ssh gabriel@VPS_IP_REDACTED

# Conectar al contenedor de la app
docker exec -it inmogrid-web sh

# Aplicar schema de Prisma
npx prisma db push

# Verificar
npx prisma studio
```

---

### Problema 4: Google OAuth "redirect_uri_mismatch"

**Causa**: URL de callback no autorizada en Google Console.

**Solución**:

1. Ir a https://console.cloud.google.com/apis/credentials
2. Seleccionar el OAuth 2.0 Client ID de inmogrid
3. En "Authorized redirect URIs" agregar:
   ```
   https://inmogrid.cl/api/auth/callback/google
   ```
4. Guardar cambios
5. Esperar 1-2 minutos para que se propague
6. Probar login nuevamente

---

## 🗄️ Acceso Directo a PostgreSQL

### Conectar a la Base de Datos

```bash
# Desde VPS
ssh gabriel@VPS_IP_REDACTED

# Conectar a PostgreSQL
docker exec -it inmogrid-db psql -U inmogrid_user -d inmogrid
```

### Comandos Útiles SQL

```sql
-- Listar tablas
\dt

-- Ver estructura de tabla User
\d "User"

-- Ver usuarios
SELECT id, email, name, role FROM "User";

-- Ver cuentas OAuth
SELECT u.email, a.provider
FROM "Account" a
JOIN "User" u ON a."userId" = u.id;

-- Crear usuario admin manualmente (si es necesario)
UPDATE "User"
SET role = 'admin'
WHERE email = 'tu_email@gmail.com';

-- Salir
\q
```

---

## 🐳 Comandos Docker Útiles

### Ver Estado de Contenedores

```bash
# Ver todos los contenedores
docker ps

# Ver logs de inmogrid-web
docker logs inmogrid-web --tail 100 -f

# Ver logs de inmogrid-db
docker logs inmogrid-db --tail 50

# Restart contenedor
docker restart inmogrid-web

# Entrar al contenedor
docker exec -it inmogrid-web sh
```

### Ver Variables de Entorno

```bash
# Ver todas las variables
docker exec inmogrid-web printenv

# Ver solo las de Google
docker exec inmogrid-web printenv | grep GOOGLE

# Ver solo las de NextAuth
docker exec inmogrid-web printenv | grep NEXTAUTH
```

---

## 📝 Checklist de Deployment Completo

### Pre-deployment

- [ ] `.env` configurado en VPS con todas las variables
- [ ] `NEXTAUTH_SECRET` generado (min 32 chars)
- [ ] Google OAuth configurado en Cloud Console
- [ ] URLs de callback autorizadas en Google
- [ ] Base de datos PostgreSQL accesible (puerto 5433)
- [ ] Schema de Prisma aplicado (`npx prisma db push`)

### Durante Deployment

- [ ] Build exitoso sin errores
- [ ] Contenedor inicia correctamente
- [ ] Logs no muestran errores críticos
- [ ] Variables de entorno cargadas

### Post-deployment

- [ ] `./scripts/check-env.sh` pasa ✅
- [ ] `./scripts/check-db.sh vps` pasa ✅
- [ ] `./scripts/test-auth.sh vps` pasa ✅
- [ ] Login con Google funciona
- [ ] Dashboard accesible después de login

---

## 🔍 Debugging Avanzado

### Ver Logs de Autenticación

```bash
# Ver solo logs de autenticación
docker logs inmogrid-web 2>&1 | grep -E "\[AUTH-|MIDDLEWARE\]" | tail -50

# Seguir logs en tiempo real
docker logs inmogrid-web -f 2>&1 | grep -E "\[AUTH-|MIDDLEWARE\]"
```

### Test Manual de Login

1. Abrir https://inmogrid.cl en navegador
2. Abrir DevTools (F12)
3. Ir a pestaña Network
4. Intentar acceder a https://inmogrid.cl/dashboard
5. Observar:
   - ¿Se redirige a `/auth/signin`? ✅ Middleware funciona
   - ¿Da error 500? ❌ Revisar logs
   - ¿Muestra página sin login? ❌ Middleware deshabilitado

6. Click en "Sign in with Google"
7. Observar:
   - ¿Aparece popup de Google? ✅ OAuth configurado
   - ¿Error de redirect_uri? ❌ Revisar Google Console
   - ¿Error de servidor? ❌ Revisar logs

---

## 🆘 Contactos de Emergencia

**Desarrollador Principal**: Gabriel Pantoja
**Email**: gabriel@pantojapropiedades.cl

**Acceso VPS**:
- IP: `VPS_IP_REDACTED`
- Usuario: `gabriel`
- Puerto SSH: `22`

**URLs Importantes**:
- Aplicación: https://inmogrid.cl
- Portainer: https://VPS_IP_REDACTED:9443
- Google Console: https://console.cloud.google.com/apis/credentials

---

## 📂 Estructura de Archivos Importantes

```
inmogrid.cl/
├── .env                          # Variables de entorno (VPS)
├── .env.example                  # Plantilla de variables
├── prisma/schema.prisma          # Schema de base de datos
├── src/
│   ├── lib/auth.config.ts       # Configuración de NextAuth
│   └── middleware.ts            # Protección de rutas
├── scripts/
│   ├── check-env.sh             # ✅ Verificar variables
│   ├── check-db.sh              # ✅ Verificar BD
│   └── test-auth.sh             # ✅ Test de auth
└── docs/
    └── BACKEND_AUTH_DEPLOYMENT_GUIDE.md  # 📚 Guía completa
```

---

## 🎓 Flujo de Autenticación (Referencia)

```
1. Usuario visita /dashboard
   ↓
2. Middleware verifica sesión
   ↓
   No autenticado → Redirige a /auth/signin
   ↓
3. Usuario click "Sign in with Google"
   ↓
4. NextAuth redirige a Google OAuth
   ↓
5. Usuario autoriza en Google
   ↓
6. Google redirige a /api/auth/callback/google
   ↓
7. NextAuth verifica token
   ↓
8. NextAuth crea/actualiza User en PostgreSQL
   ↓
9. NextAuth crea Session
   ↓
10. Redirige a /dashboard
    ↓
11. Middleware verifica sesión → ✅ Permite acceso
```

---

## ✅ Siguiente Pasos Después de Resolver Auth

Una vez que la autenticación funcione:

1. **Habilitar middleware correctamente**:
   - Revertir cambio temporal en `src/middleware.ts`
   - Asegurar que solo deshabilita en `development`

2. **Configurar políticas de seguridad**:
   - Row Level Security en PostgreSQL
   - Rate limiting en Nginx
   - Headers de seguridad

3. **Monitoreo**:
   - Configurar alertas de errores
   - Logs centralizados
   - Métricas de autenticación

4. **Backups**:
   - Verificar backups automáticos de BD
   - Probar restore

---

## 📖 Recursos Adicionales

- [NextAuth.js Docs](https://next-auth.js.org/getting-started/introduction)
- [Google OAuth Setup](https://next-auth.js.org/providers/google)
- [Prisma PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Docker Compose](https://docs.docker.com/compose/)

---

**¡Éxito con el deployment! 🚀**

Si tienes dudas, consulta `docs/BACKEND_AUTH_DEPLOYMENT_GUIDE.md` para información más detallada.
