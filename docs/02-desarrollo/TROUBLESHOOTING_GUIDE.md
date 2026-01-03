# 🆘 Guía de Troubleshooting - degux.cl

**Última actualización:** 2 de enero de 2026

---

## 🎯 Tabla de Contenidos

1. [Problemas Comunes de Instalación](#problemas-comunes-de-instalación)
2. [Errores de Base de Datos](#errores-de-base-de-datos)
3. [Errores de Autenticación](#errores-de-autenticación)
4. [Problemas de Testing](#problemas-de-testing)
5. [Errores de Build](#errores-de-build)
6. [Problemas de Docker](#problemas-de-docker)
7. [Errores de Performance](#errores-de-performance)
8. [Diferencias Windows/Linux](#diferencias-windowslinux)

---

## 1. Problemas Comunes de Instalación

### ❌ "npm: not found" o "npm command not found"

#### En Windows
```powershell
# Verificar si Node.js está instalado
node --version

# Si no sale versión, descargar e instalar
# https://nodejs.org/ → Descargar LTS 18.x o 20.x

# Después de instalar, reiniciar PowerShell
# y verificar nuevamente
node --version
npm --version
```

#### En Linux
```bash
# Usar NVM (Node Version Manager) recomendado
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recargar shell
source ~/.bashrc

# Instalar Node.js
nvm install 18.17.0
nvm use 18.17.0

# Verificar
node --version  # v18.17.0
npm --version
```

---

### ❌ "npm ERR! code ERESOLVE"

**Causa:** Conflicto de dependencias

```powershell
# Windows
npm install --legacy-peer-deps

# Linux
npm install --legacy-peer-deps
```

**Nota:** Ya está configurado en `.npmrc`, pero si falla:

```bash
# Limpiar completamente y reintentar
rm -rf node_modules package-lock.json
npm install
```

---

### ❌ "Cannot find module '@next-auth/prisma-adapter'"

```bash
# 1. Eliminar node_modules
rm -rf node_modules

# 2. Limpiar cache de npm
npm cache clean --force

# 3. Reinstalar
npm install

# 4. Generar Prisma client
npm run prisma:generate
```

---

### ❌ "permission denied" en instalación (Linux)

```bash
# No usar sudo con npm
# En lugar de: sudo npm install

# Usar:
npm install

# Si persiste el error:
npm cache clean --force
npm install --verbose
```

---

## 2. Errores de Base de Datos

### ❌ "Error: connect ECONNREFUSED 127.0.0.1:5432"

**Problema:** PostgreSQL no está corriendo

#### Si usas Docker
```bash
# Linux
docker compose -f docker-compose.local.yml up -d

# Windows (PowerShell)
docker compose -f docker-compose.local.yml up -d

# Verificar que esté corriendo
docker ps | grep degux

# Si no aparece, ver logs
docker compose -f docker-compose.local.yml logs postgres-local

# Esperar 10-15 segundos para que inicie PostgreSQL
sleep 10  # Linux
Start-Sleep -Seconds 10  # Windows
```

#### Si usas PostgreSQL local (Linux)
```bash
# Iniciar servicio
sudo systemctl start postgresql

# Verificar estado
sudo systemctl status postgresql

# Si no está instalado, instalar
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib
```

---

### ❌ "POSTGRES_PRISMA_URL is missing"

**Problema:** Variable de entorno no configurada

```bash
# 1. Verificar que .env.local existe
ls -la .env.local  # Linux
dir .env.local     # Windows

# 2. Si no existe, crear desde ejemplo
cp .env.local.example .env.local

# 3. Editar .env.local y actualizar:
# POSTGRES_PRISMA_URL="postgresql://degux_user:degux_local_password@localhost:5432/degux_dev?schema=public"

# 4. Verificar que el archivo contiene la variable
grep POSTGRES_PRISMA_URL .env.local  # Linux
findstr POSTGRES_PRISMA_URL .env.local  # Windows

# 5. Si el contenedor no tiene la contraseña correcta, actualizar docker-compose.local.yml
```

---

### ❌ "role \"degux_user\" does not exist"

```bash
# 1. Conectar a PostgreSQL
docker compose -f docker-compose.local.yml exec postgres-local psql -U postgres -d postgres

# 2. Crear usuario (dentro de psql)
CREATE USER degux_user WITH PASSWORD 'degux_local_password';

# 3. Crear base de datos
CREATE DATABASE degux_dev OWNER degux_user;

# 4. Habilitar PostGIS
\\c degux_dev
CREATE EXTENSION postgis;
CREATE EXTENSION \"uuid-ossp\";

# 5. Salir
\\q

# 6. Reiniciar contenedor
docker compose -f docker-compose.local.yml restart postgres-local
```

---

### ❌ "Prisma syntax error in schema.prisma"

```bash
# 1. Validar esquema
npx prisma validate

# 2. Ver errores detallados
npx prisma db validate

# 3. Regenerar client
npx prisma generate

# 4. Si persiste, resetear migraciones
npx prisma migrate reset
```

---

### ❌ "Can't reach database server"

```bash
# Verificar conexión
# Linux
psql "postgresql://degux_user:degux_local_password@localhost:5432/degux_dev"

# Windows (con psql instalado)
psql -h localhost -U degux_user -d degux_dev -W

# Si no tienes psql, usar Prisma Studio
npm run prisma:studio
# Acceder en http://localhost:5555
```

---

## 3. Errores de Autenticación

### ❌ "Google OAuth: Invalid redirect_uri"

**Problema:** URL de callback no autorizada en Google Cloud Console

```bash
# 1. Ir a Google Cloud Console
# https://console.cloud.google.com/

# 2. Proyecto → APIs y servicios → Credenciales

# 3. Editar credencial OAuth 2.0

# 4. Agregar URIs autorizados:
# http://localhost:3000/api/auth/callback/google
# http://localhost:3001/api/auth/callback/google
# https://degux.cl/api/auth/callback/google
# https://www.degux.cl/api/auth/callback/google

# 5. Guardar cambios

# 6. Actualizar .env.local con las credenciales correctas
# GOOGLE_CLIENT_ID=xxx
# GOOGLE_CLIENT_SECRET=xxx
```

---

### ❌ "NextAuth Secret is missing or invalid"

```bash
# 1. Generar un secreto nuevo
# En cualquier shell:
openssl rand -base64 32

# 2. Copiar el resultado y actualizar .env.local
# NEXTAUTH_SECRET="el_resultado_anterior"

# 3. En Windows (sin openssl):
# Usar: https://www.lastpass.com/password-generator
# O generar en: https://1password.com/password-generator/
```

---

### ❌ "Session error: Account not found"

```bash
# 1. Verificar tablas de NextAuth
npm run prisma:studio

# 2. Buscar en tabla Account si existe registro

# 3. Si la BD está vacía, resetear
npm run prisma:migrate reset

# 4. Limpiar cookies del navegador
# Ctrl+Shift+Del en Chrome/Edge/Firefox

# 5. Intentar login nuevamente
```

---

## 4. Problemas de Testing

### ❌ "Cannot find module 'jest'" en tests

```bash
# 1. Instalar dependencias de testing
npm install

# 2. Verificar jest.config.js existe
ls jest.config.js

# 3. Ejecutar tests nuevamente
npm run test
```

---

### ❌ "ENOENT: no such file or directory, open '.env.local'"

```bash
# 1. Crear .env.local desde .env.local.example
cp .env.local.example .env.local  # Linux/Mac
Copy-Item .env.local.example .env.local  # Windows

# 2. Actualizar valores en .env.local

# 3. Reintentar tests
npm run test
```

---

### ❌ "Test timeout exceeded"

**Problema:** Tests tardando más de 30 segundos

```bash
# 1. En jest.config.js ya está configurado:
testTimeout: 30000

# 2. Aumentar si es necesario (pero revisa por qué está lento)
testTimeout: 60000  # 60 segundos

# 3. Ejecutar test específico con verbose
npm run test -- --testNamePattern="nombreDelTest" --verbose

# 4. Optimizar:
# - Reducir datos de seed
# - Usar mocks para llamadas externas
# - Paralelizar tests
```

---

### ❌ "playwright test timeout"

```bash
# En playwright.config.ts, aumentar timeout
use: {
  timeout: 60 * 1000,  // 60 segundos
}

# O para test específico
test.setTimeout(120 * 1000);  // 120 segundos
```

---

## 5. Errores de Build

### ❌ "npm ERR! code ELIFECYCLE"

```bash
# 1. Ver el error completo
npm run build 2>&1 | tail -50

# 2. Limpiar y reintentar
npm run clean:full
npm install
npm run build

# 3. Si es error de TypeScript
npx tsc --noEmit

# 4. Si es error de Prisma
npm run prisma:generate
npm run build
```

---

### ❌ "Error: ENOMEM: Out of memory"

**Problema:** No hay suficiente memoria RAM

```bash
# Aumentar memory limit
NODE_OPTIONS=--max_old_space_size=4096 npm run build

# O más directo (Windows)
$env:NODE_OPTIONS='--max_old_space_size=4096'; npm run build

# O en Linux
export NODE_OPTIONS=--max_old_space_size=4096
npm run build
```

---

### ❌ "Module parse failed: Unexpected token" 

```bash
# Problema: Archivo JavaScript/TypeScript no puede ser parseado

# 1. Verificar que no hay caracteres especiales
grep -r "[^[:ascii:]]" src/  # Linux
Get-ChildItem src/ -Recurse | Select-String "[^[:ascii:]]" # Windows

# 2. Validar TypeScript
npx tsc --noEmit

# 3. Limpiar y reintentar
npm run clean
npm run build
```

---

## 6. Problemas de Docker

### ❌ "Docker daemon is not running"

#### En Windows
```powershell
# Abrir Docker Desktop desde el menú de inicio
# Esperar a que inicie (puede tardar 1-2 minutos)

# Verificar que está corriendo
docker --version

# Si sigue sin funcionar, reiniciar Docker Desktop
# Menú Windows → Docker Desktop → Restart
```

#### En Linux
```bash
# Iniciar Docker daemon
sudo systemctl start docker

# Verificar estado
sudo systemctl status docker

# Si falla, ver logs
sudo journalctl -u docker.service -n 50
```

---

### ❌ "permission denied while trying to connect to Docker daemon"

**Problema:** Tu usuario no está en el grupo docker

```bash
# Linux
# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Aplicar cambios sin logout
newgrp docker

# O hacer logout/login

# Verificar
docker ps
```

---

### ❌ "Cannot start service postgres-local: driver failed programming external connectivity"

```bash
# 1. El puerto 5432 o 15432 está en uso
# Linux
lsof -i :5432
lsof -i :15432

# Windows
netstat -ano | findstr :5432
netstat -ano | findstr :15432

# 2. Matar el proceso (cambiar PID)
# Linux
kill -9 <PID>

# Windows
taskkill /PID <PID> /F

# 3. O cambiar puerto en docker-compose.local.yml
# De:  "15432:5432"
# A:   "25432:5432"

# 4. Reiniciar Docker
docker compose -f docker-compose.local.yml down
docker compose -f docker-compose.local.yml up -d
```

---

### ❌ "health check failed"

```bash
# Ver logs del contenedor
docker compose -f docker-compose.local.yml logs postgres-local

# Esperar más tiempo (puede tardar)
sleep 30

# Verificar nuevamente
docker compose -f docker-compose.local.yml ps

# Si sigue fallando, resetear
docker compose -f docker-compose.local.yml down -v
docker compose -f docker-compose.local.yml up -d
```

---

### ❌ "docker-compose: command not found"

```bash
# En versiones recientes de Docker, usar:
docker compose  # en lugar de docker-compose

# Si aún así no funciona, actualizar Docker Desktop
# Windows/Mac: Descargar desde https://www.docker.com/products/docker-desktop
# Linux: sudo apt-get update && sudo apt-get upgrade docker-ce
```

---

## 7. Errores de Performance

### ❌ "npm run dev" es muy lento

```bash
# 1. Está usando Turbo, pero puede optimizarse
# En next.config.js, habilitar experimental features si no está

# 2. Limpiar caches
npm run clean:cache
npm run clean:full

# 3. Desabilitar Tailwind JIT si es muy lento
# tailwind.config.ts → cambiar modo

# 4. Usar npm run build en lugar de npm run dev para testeo final
npm run build
npm run start
```

---

### ❌ "npm run test es muy lento"

```bash
# 1. Ejecutar tests en paralelo (default)
npm run test -- --maxWorkers=4

# 2. Ejecutar solo tests específicos
npm run test -- --testPathPattern="utils"

# 3. Sin coverage (si lo necesitas)
npm run test -- --no-coverage

# 4. Watch mode solo para archivos cambiados
npm run test:watch
```

---

### ❌ "Prisma Studio es lento"

```bash
# 1. Puede deberse a muchos registros
# En localhost:5555, filtrar datos

# 2. O conectar directamente a psql
psql "postgresql://degux_user:degux_local_password@localhost:5432/degux_dev"

# 3. Ver tablas grandes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 8. Diferencias Windows/Linux

### 🪟 Windows - Problemas Específicos

#### Line Endings (CRLF vs LF)
```powershell
# Git está configurado en .gitignore
# Pero si hay problemas:
git config --global core.autocrlf true

# Convertir archivos bash a LF
# En VS Code: Click "CRLF" en la esquina inferior derecha → "LF"
```

#### Paths con espacios
```powershell
# Si la ruta tiene espacios, quoted
npm run dev
# Debería funcionar, pero si no:
cd "c:\ruta con espacios\degux.cl"
npm run dev
```

#### PowerShell ExecutionPolicy
```powershell
# Si un script PowerShell no ejecuta:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Verificar política actual
Get-ExecutionPolicy
```

---

### 🐧 Linux - Problemas Específicos

#### Permisos de archivo
```bash
# Si script bash no tiene permiso de ejecución:
chmod +x scripts/check-db.sh
./scripts/check-db.sh

# O ejecutar directamente con bash:
bash scripts/check-db.sh
```

#### Bash vs Sh
```bash
# Asegurar que usa bash (no sh)
# Primer línea de script debe ser:
#!/bin/bash
# No: #!/bin/sh
```

#### Sudo vs sin sudo
```bash
# No usar sudo con npm
# ❌ sudo npm install

# ✅ npm install

# Si necesitas privilegios para Docker:
sudo usermod -aG docker $USER
newgrp docker
```

---

### 🔄 Sincronización Windows ↔ Linux

#### Conflictos de línea final
```bash
# En Linux, después de git pull desde Windows:
git config core.autocrlf input

# En Windows, después de git pull desde Linux:
git config core.autocrlf true
```

#### Diferencias en path
```javascript
// ❌ Malo - no funciona en Windows
const path = '/home/user/project/file.txt';

// ✅ Bueno - funciona en ambas plataformas
const path = require('path').join(__dirname, 'file.txt');
```

---

## 🛠️ Quick Fix Scripts

### Script de Recuperación Completa (Linux)

```bash
#!/bin/bash
# File: quick-recovery.sh

echo "🔄 Iniciando recuperación completa..."

# 1. Limpiar completamente
rm -rf node_modules .next dist coverage
rm package-lock.json

# 2. Reinstalar
npm install

# 3. Generar Prisma
npm run prisma:generate

# 4. Resetear BD (CUIDADO: borra datos)
docker compose -f docker-compose.local.yml down -v
docker compose -f docker-compose.local.yml up -d
sleep 20

# 5. Aplicar migraciones
npm run prisma:push

# 6. Verificar
npm run lint
npm run test

echo "✅ Recuperación completada"
```

---

### Script de Recuperación Completa (Windows)

```powershell
# File: quick-recovery.ps1

Write-Host "🔄 Iniciando recuperación completa..."

# 1. Limpiar completamente
Remove-Item -Path node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path .next -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path dist -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path coverage -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path package-lock.json -Force -ErrorAction SilentlyContinue

# 2. Reinstalar
npm install

# 3. Generar Prisma
npm run prisma:generate

# 4. Resetear BD (CUIDADO: borra datos)
docker compose -f docker-compose.local.yml down -v
docker compose -f docker-compose.local.yml up -d
Start-Sleep -Seconds 20

# 5. Aplicar migraciones
npm run prisma:push

# 6. Verificar
npm run lint
npm run test

Write-Host "✅ Recuperación completada"
```

---

## 📞 Si Nada Funciona

1. **Recopilar información:**
   ```bash
   node --version
   npm --version
   npm list (primeras 50 líneas)
   git status
   docker --version (si usas Docker)
   docker compose version
   ```

2. **Ver logs detallados:**
   ```bash
   npm run dev 2>&1 | head -100  # Primeras 100 líneas
   npm run test --verbose
   npm run build 2>&1
   ```

3. **Búsquedas online:**
   - Copiar el mensaje de error exacto
   - Buscar en Stack Overflow
   - Buscar en GitHub issues del proyecto
   - Buscar en Discord communities

4. **Opción nuclear - Resetear completamente:**
   ```bash
   # CUIDADO: Esto elimina TODO
   rm -rf .git node_modules .next package-lock.json
   
   # Volver a clonar
   git clone <repository-url>
   cd degux.cl
   npm install
   npm run prisma:generate
   ```

---

## 📝 Reporte de Errores

Si encuentras un error no listado aquí:

1. Documentarlo en un archivo `.md`
2. Incluir:
   - Pasos para reproducir
   - Mensajes de error exactos
   - Versiones (Node, npm, Docker)
   - Sistema operativo
   - Solución (si encontraste una)

3. Compartirlo en el repositorio o documentación

---

**Última actualización:** 2 de enero de 2026  
**Si este documento no resuelve tu problema, crear un issue en GitHub** 🚀
