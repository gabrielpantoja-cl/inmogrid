# 🗄️ Configuración de Base de Datos Local

Guía para configurar y trabajar con PostgreSQL local para desarrollo en degux.cl.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración Inicial](#configuración-inicial)
3. [Comandos Útiles](#comandos-útiles)
4. [Sincronización con Producción](#sincronización-con-producción)
5. [Mejores Prácticas](#mejores-prácticas)
6. [Solución de Problemas](#solución-de-problemas)

---

## Requisitos Previos

- **Docker Desktop** instalado y corriendo
- **Node.js** v18+ con npm
- Acceso SSH al VPS (para sincronización)

---

## Configuración Inicial

### 1. Copiar Variables de Entorno

```bash
cp .env.local.example .env.local
```

Editar `.env.local` y ajustar si es necesario:
```env
POSTGRES_PRISMA_URL="postgresql://degux_user:degux_local_password@localhost:5432/degux_dev?schema=public"
```

### 2. Levantar PostgreSQL Local

```bash
./scripts/db-local-start.sh
```

Este script:
- ✅ Levanta PostgreSQL con PostGIS en Docker
- ✅ Levanta Adminer (GUI web) en http://localhost:8080
- ✅ Aplica el schema de Prisma
- ✅ Verifica que todo esté funcionando

### 3. Verificar Instalación

```bash
# Ver contenedores corriendo
docker compose -f docker-compose.local.yml ps

# Abrir Prisma Studio (GUI para ver/editar datos)
npx prisma studio
```

---

## Comandos Útiles

### Gestión de Contenedores

```bash
# Iniciar base de datos
./scripts/db-local-start.sh

# Ver estado
docker compose -f docker-compose.local.yml ps

# Ver logs en tiempo real
docker compose -f docker-compose.local.yml logs -f postgres-local

# Detener (mantiene datos)
docker compose -f docker-compose.local.yml down

# Detener y borrar datos (⚠️ CUIDADO)
docker compose -f docker-compose.local.yml down -v
```

### Gestión de Schema con Prisma

```bash
# Generar cliente de Prisma
npx prisma generate

# Aplicar cambios del schema a la DB
npx prisma db push

# Crear migración (producción)
npx prisma migrate dev --name nombre_migracion

# Abrir Prisma Studio (GUI)
npx prisma studio

# Ver estado de migraciones
npx prisma migrate status
```

### Acceso Directo a PostgreSQL

```bash
# Shell de PostgreSQL
docker exec -it degux-postgres-local psql -U degux_user -d degux_dev

# Ejecutar query directa
docker exec -it degux-postgres-local psql -U degux_user -d degux_dev -c "SELECT * FROM \"User\" LIMIT 5;"

# Listar tablas
docker exec -it degux-postgres-local psql -U degux_user -d degux_dev -c "\dt"

# Ver estructura de tabla
docker exec -it degux-postgres-local psql -U degux_user -d degux_dev -c "\d \"User\""
```

---

## Sincronización con Producción

### Importar Datos de Producción

```bash
./scripts/db-sync-from-prod.sh
```

Este script:
1. Crea un dump de la DB de producción (VPS)
2. Lo descarga a `./backups/`
3. Lo importa en tu DB local
4. Aplica migraciones pendientes de Prisma

**⚠️ ADVERTENCIA**: Esto sobrescribirá tu base de datos local.

### Sincronización Manual

Si prefieres más control:

```bash
# 1. Crear dump en el VPS
ssh root@167.172.251.27 "docker exec degux-db pg_dump -U degux_user -d degux --clean" > backup.sql

# 2. Importar en local
docker exec -i degux-postgres-local psql -U degux_user -d degux_dev < backup.sql

# 3. Aplicar schema de Prisma
npx prisma db push
```

---

## Mejores Prácticas

### Workflow de Desarrollo Recomendado

```
1. Modificar schema en prisma/schema.prisma
2. Aplicar cambios localmente: npx prisma db push
3. Probar en desarrollo local
4. Crear migración: npx prisma migrate dev
5. Commitear migración al repo
6. Desplegar a producción con migraciones incluidas
```

### Separación de Ambientes

| Ambiente | Base de Datos | Uso |
|----------|---------------|-----|
| **Desarrollo Local** | `localhost:5432` (Docker) | Desarrollo activo, pruebas rápidas |
| **Producción** | `VPS:5433` (Docker en VPS) | Aplicación en producción |

### Reglas de Oro

✅ **HACER:**
- Siempre trabaja en local para desarrollo
- Usa `prisma db push` en desarrollo local
- Crea migraciones antes de producción
- Haz backups antes de sincronizar
- Usa Prisma Studio para explorar datos

❌ **NO HACER:**
- Conectar directamente a producción en desarrollo
- Modificar datos de producción manualmente
- Usar `prisma db push` en producción
- Borrar migraciones commiteadas

---

## Solución de Problemas

### PostgreSQL no inicia

```bash
# Ver logs
docker compose -f docker-compose.local.yml logs postgres-local

# Reiniciar contenedor
docker compose -f docker-compose.local.yml restart postgres-local

# Recrear contenedor (⚠️ borra datos)
docker compose -f docker-compose.local.yml down -v
./scripts/db-local-start.sh
```

### Error de conexión en Prisma

```bash
# Verificar que PostgreSQL esté corriendo
docker ps | grep degux-postgres-local

# Verificar variables de entorno
cat .env.local | grep POSTGRES_PRISMA_URL

# Regenerar cliente de Prisma
npx prisma generate
```

### Conflictos de schema

```bash
# Reset completo del schema (⚠️ borra datos)
npx prisma migrate reset

# O aplicar schema desde cero
npx prisma db push --force-reset
```

### Puerto 5432 ya en uso

Si tienes otro PostgreSQL corriendo localmente:

```bash
# Opción 1: Detener PostgreSQL nativo
sudo systemctl stop postgresql

# Opción 2: Cambiar puerto en docker-compose.local.yml
# Editar: "5433:5432" en vez de "5432:5432"
# Y actualizar .env.local con el nuevo puerto
```

---

## Interfaces Web

### Adminer (Incluido)
- **URL**: http://localhost:8080
- **Sistema**: PostgreSQL
- **Servidor**: postgres-local
- **Usuario**: degux_user
- **Contraseña**: degux_local_password
- **Base de datos**: degux_dev

### Prisma Studio
```bash
npx prisma studio
```
- **URL**: http://localhost:5555
- Interfaz visual para explorar y editar datos

---

## Scripts de Mantenimiento

### Backup Manual

```bash
# Crear backup de DB local
docker exec degux-postgres-local pg_dump -U degux_user -d degux_dev > backups/local_backup_$(date +%Y%m%d).sql

# Restaurar backup
docker exec -i degux-postgres-local psql -U degux_user -d degux_dev < backups/local_backup_20250108.sql
```

### Limpiar Datos de Prueba

```bash
# SQL para limpiar tablas manteniendo estructura
docker exec -it degux-postgres-local psql -U degux_user -d degux_dev -c "
TRUNCATE TABLE \"User\", \"Account\", \"Session\", \"Property\", \"Connection\" CASCADE;
"
```

---

## Recursos Adicionales

- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de PostGIS](https://postgis.net/documentation/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [PostgreSQL 15 Documentation](https://www.postgresql.org/docs/15/)

---

**Última actualización**: 2025-01-08
**Mantenido por**: Gabriel Pantoja