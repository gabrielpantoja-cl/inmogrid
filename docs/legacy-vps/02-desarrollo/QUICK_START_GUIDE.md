# 🚀 Guías de Inicio Rápido - Windows & Linux

---

## 🪟 WINDOWS - Guía de Inicio (Máquina Secundaria)

### Requisitos Previos
- ✅ Node.js v22.15.0 (o v18.17.0)
- ✅ npm 10.9.2+
- ✅ Git instalado
- ✅ (Opcional) Docker Desktop
- ✅ (Opcional) PostgreSQL local o Docker

### Paso 1: Preparar el Ambiente

```powershell
# En PowerShell (ejecutar como usuario normal)

# Navegar al directorio del proyecto
cd c:\Users\gabri\Developer\inmogrid.cl

# Crear archivo de configuración local
Copy-Item .env.local.example .env.local

# Verificar versiones
node --version   # Debe ser >= 18.17.0
npm --version    # Debe ser >= 10.9.0
```

### Paso 2: Instalar Dependencias

```powershell
# Limpiar cache anterior (si existe)
Remove-Item -Path node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path package-lock.json -Force -ErrorAction SilentlyContinue

# Instalar dependencias
npm install

# Generar cliente Prisma
npm run prisma:generate
```

### Paso 3: Configurar Base de Datos

#### Opción A: Usar PostgreSQL local en Docker
```powershell
# Verificar que Docker Desktop está ejecutándose

# Iniciar PostgreSQL local
docker compose -f docker/docker-compose.local.yml up -d

# Verificar que está corriendo
docker ps | findstr inmogrid

# Esperar 10 segundos para que inicialice
Start-Sleep -Seconds 10

# Verificar conexión
npm run api:health
```

#### Opción B: Conectar a BD remota (VPS)
```powershell
# 1. Editar .env.local para usar la BD remota
# Cambiar POSTGRES_PRISMA_URL a la URL remota

# 2. (Opcional) Crear SSH tunnel
# En PowerShell, necesitas una herramienta SSH o usar WSL2
```

### Paso 4: Verificar Instalación

```powershell
# Ejecutar linter
npm run lint

# Ejecutar tests básicos
npm run test

# Verificar API
npm run api:health

# Si todo pasa, ver esta salida:
# ✅ Health check OK
```

### Paso 5: Iniciar Desarrollo

```powershell
# Terminal 1: Iniciar servidor de desarrollo
npm run dev

# Acceder en: http://localhost:3000

# Terminal 2 (nuevo PowerShell): Ver logs de API
npm run api:health-stats

# Terminal 3 (nuevo PowerShell): Tests en watch mode
npm run test:watch
```

### Scripts Útiles en Windows

```powershell
# Desarrollo
npm run dev              # 🔵 Iniciar servidor (Puerto 3000)
npm run build            # 📦 Build de producción
npm run lint             # 🔍 Linting

# Testing
npm run test             # 🧪 Tests unitarios
npm run test:watch       # 👁️ Tests en watch mode
npm run test:e2e         # 🎬 Tests end-to-end
npm run test:e2e:ui      # 🎨 Playwright UI

# API Testing (PowerShell scripts)
npm run api:test:windows # Ejecuta test suite en PowerShell
npm run api:health       # 💚 Health check simple
npm run api:docs         # 📖 Documentación API

# Base de Datos
npm run prisma:studio    # 🗄️ Gestor visual de BD (puerto 5555)

# Limpiar
npm run clean            # Limpiar .next
npm run clean:cache      # Limpiar .next + cache
npm run clean:full       # Limpiar TODO (node_modules, .next, cache)
```

### Problemas Comunes en Windows

#### ❌ "npm: No se reconoce como comando"
```powershell
# Verificar que Node.js está instalado
node --version

# Si no funciona, reinstalar Node.js desde nodejs.org
# Reiniciar PowerShell después de instalar
```

#### ❌ "Port 3000 is already in use"
```powershell
# Encontrar proceso en puerto 3000
netstat -ano | findstr :3000

# Matar proceso (ejemplo PID 12345)
taskkill /PID 12345 /F

# O usar puerto diferente
npm run dev -- -p 3001
```

#### ❌ "Docker daemon is not running"
```powershell
# Abrir Docker Desktop desde el menú de inicio
# Esperar a que inicie (puede tardar 1-2 minutos)

# Verificar que Docker funciona
docker --version
```

#### ❌ "EADDRINUSE: address already in use :::5432" (Base de datos)
```powershell
# El puerto 5432 está en uso
# El docker-compose usa puerto 15432, intenta:

# Detener contenedores previos
docker compose -f docker/docker-compose.local.yml down

# Reiniciar
docker compose -f docker/docker-compose.local.yml up -d
```

#### ❌ "Module not found" en tests
```powershell
# Regenerar Prisma client
npm run prisma:generate

# Limpiar cache
npm run clean:cache

# Reintentar tests
npm run test
```

### Tips para Desarrollo en Windows

1. **Usar PowerShell Core** (más rápido que cmd.exe)
   ```powershell
   # Instalar de https://github.com/PowerShell/PowerShell
   pwsh
   ```

2. **Integrar con VS Code**
   - Instalar "PowerShell" extension
   - Terminal integrada: Ctrl + `

3. **Git en Windows**
   - Instalar "Git for Windows"
   - Configurar `core.autocrlf`:
   ```powershell
   git config --global core.autocrlf input
   ```

4. **Debugger en VS Code**
   - Instalar "Debugger for Chrome"
   - Crear `.vscode/launch.json` con configuración Next.js

---

## 🐧 LINUX - Guía de Inicio (Máquina Principal)

### Requisitos Previos
- ✅ Node.js 18.17.0 LTS (recomendado)
- ✅ npm 10.9.2+
- ✅ Git instalado
- ✅ Docker y Docker Compose
- ✅ PostgreSQL 15+ (vía Docker recomendado)
- ✅ Bash shell

### Paso 1: Preparar el Ambiente

```bash
#!/bin/bash

# Navegar al directorio del proyecto
cd ~/Developer/inmogrid.cl
# o donde esté el proyecto

# Crear archivo de configuración local
cp .env.local.example .env.local

# Verificar versiones
node --version   # Debe ser 18.17.0 o superior
npm --version    # Debe ser 10.9.0 o superior
```

### Paso 2: Instalar Dependencias

```bash
#!/bin/bash

# Limpiar instalaciones previas (si existe)
rm -rf node_modules package-lock.json

# Instalar dependencias
npm install

# Generar cliente Prisma
npm run prisma:generate

# Verificar que no hay errores
npm run lint --max-warnings 0
```

### Paso 3: Configurar Base de Datos

#### Opción A: PostgreSQL Local en Docker (Recomendado)
```bash
#!/bin/bash

# Asegurarse que Docker está corriendo
sudo systemctl start docker

# Iniciar servicios de desarrollo
docker compose -f docker/docker-compose.local.yml up -d

# Verificar que los servicios están corriendo
docker ps | grep inmogrid

# Esperar a que PostgreSQL esté listo
echo "Esperando que PostgreSQL esté listo..."
sleep 10

# Verificar conexión
npm run api:health

echo "✅ Base de datos lista"
```

#### Opción B: PostgreSQL en la Máquina (Sin Docker)
```bash
#!/bin/bash

# Instalar PostgreSQL si no está instalado
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib postgis

# Iniciar servicio
sudo systemctl start postgresql

# Crear usuario y base de datos
sudo -u postgres createuser -P inmogrid_user
sudo -u postgres createdb -O inmogrid_user inmogrid_dev

# Habilitar PostGIS
sudo -u postgres psql -d inmogrid_dev -c "CREATE EXTENSION postgis;"

# Actualizar .env.local
# POSTGRES_PRISMA_URL="postgresql://inmogrid_user:PASSWORD@localhost:5432/inmogrid_dev?schema=public"
```

### Paso 4: Verificar Instalación

```bash
#!/bin/bash

echo "🔍 Verificando instalación..."

# Linting
echo "1️⃣ Ejecutando linter..."
npm run lint

# Tests
echo "2️⃣ Ejecutando tests..."
npm run test

# API Health
echo "3️⃣ Verificando API..."
npm run api:health

echo "✅ Todas las verificaciones pasaron!"
```

### Paso 5: Iniciar Desarrollo

```bash
#!/bin/bash

# Terminal 1: Iniciar servidor Next.js
npm run dev
# Acceder en http://localhost:3000

# Terminal 2: Ver estadísticas
npm run api:health-stats

# Terminal 3: Tests en watch mode
npm run test:watch

# Terminal 4: Monitorear BD (opcional)
npm run dev:api-monitor
```

### Scripts Útiles en Linux

```bash
#!/bin/bash

# 🔵 Desarrollo
npm run dev              # Iniciar servidor (Puerto 3000, Turbo mode)
npm run build            # Build de producción
npm run start            # Iniciar servidor de producción
npm run lint             # Linting (ESLint)

# 🧪 Testing
npm run test             # Tests unitarios (Jest)
npm run test:watch       # Tests en watch mode
npm run test:ci          # Tests con coverage (CI/CD)
npm run test:e2e         # E2E tests (Playwright)
npm run test:e2e:ui      # Playwright UI

# 📡 API Testing (Bash scripts)
npm run api:test         # Test suite completa (Bash)
npm run api:health       # Health check
npm run api:health-stats # Health con estadísticas
npm run api:docs         # Documentación API
npm run api:config       # Configuración de mapas

# 🗄️ Base de Datos
npm run prisma:studio    # Prisma Studio (Puerto 5555)
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:push      # Aplicar migraciones
npm run seed             # Ejecutar seed scripts
npm run seed:profiles    # Seed de perfiles

# 🧹 Limpiar
npm run clean            # Limpiar .next
npm run clean:cache      # Limpiar .next + cache
npm run clean:full       # Limpiar TODO

# 🐳 Docker
docker compose -f docker/docker-compose.local.yml up -d    # Iniciar
docker compose -f docker/docker-compose.local.yml down     # Detener
docker compose -f docker/docker-compose.local.yml logs -f  # Ver logs
```

### Optimización en Linux

```bash
#!/bin/bash

# Usar NVM para manejar versiones de Node
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Instalar Node.js exacta versión del proyecto
nvm install 18.17.0
nvm use 18.17.0

# Hacer default
nvm alias default 18.17.0
```

### Problemas Comunes en Linux

#### ❌ "Permission denied" en Docker
```bash
# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Aplicar cambios (requiere logout/login)
newgrp docker

# O ejecutar con sudo
sudo docker compose -f docker/docker-compose.local.yml up -d
```

#### ❌ "Port 3000 is already in use"
```bash
# Encontrar proceso
lsof -i :3000

# Matar proceso
kill -9 <PID>

# O usar puerto diferente
npm run dev -- -p 3001
```

#### ❌ "Connection refused" a Base de Datos
```bash
# Verificar que Docker está corriendo
docker ps

# Reiniciar contenedor PostgreSQL
docker compose -f docker/docker-compose.local.yml restart postgres-local

# Esperar a que esté listo
sleep 10

# Verificar conexión
psql postgresql://inmogrid_user:inmogrid_local_password@localhost:5432/inmogrid_dev
```

#### ❌ "Module not found" en tests
```bash
# Limpiar node_modules
rm -rf node_modules package-lock.json

# Reinstalar
npm install

# Regenerar Prisma
npm run prisma:generate

# Reintentar
npm run test
```

#### ❌ "pg_isready" fails
```bash
# Verificar que PostgreSQL inició
docker compose -f docker/docker-compose.local.yml logs postgres-local

# Esperar más tiempo
sleep 30

# Reiniciar
docker compose -f docker/docker-compose.local.yml down
docker compose -f docker/docker-compose.local.yml up -d
```

### Tips para Desarrollo en Linux

1. **Crear script de inicio rápido**
   ```bash
   #!/bin/bash
   # File: ~/start-inmogrid.sh
   
   cd ~/Developer/inmogrid.cl
   docker compose -f docker/docker-compose.local.yml up -d
   npm run dev
   ```

2. **Alias útiles en ~/.bashrc**
   ```bash
   alias inmogrid="cd ~/Developer/inmogrid.cl"
   alias inmogrid:dev="cd ~/Developer/inmogrid.cl && npm run dev"
   alias inmogrid:test="cd ~/Developer/inmogrid.cl && npm run test:watch"
   alias inmogrid:db="docker compose -f docker/docker-compose.local.yml up -d"
   ```

3. **Usar tmux para múltiples terminales**
   ```bash
   tmux new-session -d -s inmogrid \
     "npm run dev" \; \
     split-window -h "npm run test:watch" \; \
     split-window -v "npm run api:health-stats"
   ```

4. **Monitorar cambios de archivos**
   ```bash
   # Instalar watchman
   sudo apt-get install watchman
   
   # O usar inotify-tools
   sudo apt-get install inotify-tools
   ```

---

## 🔀 Sincronización Windows ↔️ Linux

### Flujo Recomendado

```
Windows (Secundario)
    ↓ (Programar)
    ↓ (Git push)
  GitHub
    ↓ (Git pull)
    ↓ (Deploy)
Linux (Principal/Producción)
```

### Pasos para Sincronizar

```bash
# En Windows (PowerShell)
# 1. Programar cambios
npm run dev

# 2. Verificar cambios
git status

# 3. Commit y push
git add .
git commit -m "Descripción de cambios"
git push origin main

# En Linux
# 1. Actualizar código
git pull origin main

# 2. Reinstalar si hay cambios en package.json
npm install

# 3. Generar Prisma si hay cambios en schema
npm run prisma:generate

# 4. Aplicar migraciones si las hay
npm run prisma:push

# 5. Reiniciar servidor
npm run dev
```

### Evitar Conflictos

1. **Configurar git correctamente:**
   ```bash
   # Linux
   git config --global core.autocrlf input
   
   # Windows
   git config --global core.autocrlf true
   ```

2. **No commitear archivos locales:**
   - `.env.local` (ignorado automáticamente)
   - `node_modules/` (regenerado con npm install)
   - `.next/` (generado en build)

3. **Usar branches para features:**
   ```bash
   # En Windows
   git checkout -b feature/mi-caracteristica
   npm run dev
   
   # ... hacer cambios ...
   
   git push origin feature/mi-caracteristica
   
   # En GitHub: Crear Pull Request
   # En Linux: Revisar y mergear
   ```

---

## 📊 Configuración OAuth Google

### Necesario en ambas plataformas

1. **Ir a Google Cloud Console:**
   https://console.cloud.google.com/

2. **Crear proyecto** (si no existe)

3. **Habilitar APIs:**
   - Google+ API
   - OAuth 2.0

4. **Crear credenciales OAuth 2.0:**
   - Tipo: "Web application"
   - URIs autorizados:
     - `http://localhost:3000/api/auth/callback/google`
     - `http://localhost:3001/api/auth/callback/google`
     - `https://inmogrid.cl/api/auth/callback/google`
     - `https://www.inmogrid.cl/api/auth/callback/google`

5. **Copiar credenciales:**
   ```
   Client ID: 110126794045-9m5e7o7ksvro2kugkbn9po897cu4rkjh.apps.googleusercontent.com
   Client Secret: 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
   ```

6. **Actualizar `.env.local`:**
   ```env
   GOOGLE_CLIENT_ID="110126794045-9m5e7o7ksvro2kugkbn9po897cu4rkjh.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="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"
   ```

---

## ✅ Checklist Final

### En ambas plataformas:

- [ ] Node.js 18.17.0+ instalado
- [ ] npm 10.9.0+ instalado
- [ ] Repositorio clonado
- [ ] `.env.local` creado desde `.env.local.example`
- [ ] `npm install` completado
- [ ] `npm run prisma:generate` ejecutado
- [ ] `npm run lint` sin errores
- [ ] `npm run test` pasando
- [ ] Base de datos accesible
- [ ] `npm run dev` iniciando sin errores
- [ ] http://localhost:3000 accesible

### En Linux adicional:

- [ ] Docker Desktop corriendo
- [ ] docker/docker-compose.local.yml servicios activos
- [ ] PostgreSQL accesible en localhost:5432
- [ ] Scripts Bash ejecutables

### En Windows adicional:

- [ ] PowerShell 5.1+
- [ ] Docker Desktop corriendo (si se usa)
- [ ] Scripts PowerShell accesibles

---

## 🎉 ¡Listo para empezar!

Ahora puedes comenzar a programar en ambas plataformas sin problemas de compatibilidad.

**¡Bienvenido a inmogrid.cl! 🚀**
