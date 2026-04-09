# 🧹 Análisis de Limpieza de Raíz del Proyecto

**Fecha**: 2026-01-03
**Total archivos en raíz**: 37 (13 carpetas + 24 archivos)

---

## 📊 Categorización de Archivos

### ✅ NECESARIOS - Configuración Estándar (18 archivos)

**JavaScript/TypeScript/Node:**
- ✅ `package.json` - npm dependencies
- ✅ `package-lock.json` - lock file
- ✅ `tsconfig.json` - TypeScript config
- ✅ `tsconfig.seed.json` - TypeScript para seeds

**Next.js:**
- ✅ `next.config.js` - Next.js config
- ✅ `next-env.d.ts` - Next.js types (auto-generado)

**Styling:**
- ✅ `tailwind.config.ts` - Tailwind config
- ✅ `postcss.config.js` - PostCSS config

**Testing:**
- ✅ `jest.config.js` - Jest config (NECESARIO en raíz)
- ✅ `jest.setup.js` - Jest setup (NECESARIO, referenciado por jest.config.js)
- ✅ `playwright.config.ts` - Playwright E2E config

**Docker:**
- ✅ `Dockerfile` - Docker image config
- ✅ `docker-compose.local.yml` - Local dev environment

**Documentación:**
- ✅ `README.md` - Principal del proyecto
- ✅ `LICENSE` - Licencia
- ✅ `CLAUDE.md` - AI prompt (usado por Claude Code)
- ✅ `GEMINI.md` - AI prompt (usado por Gemini)

**TypeScript:**
- ✅ `global.d.ts` - Global type definitions

**Dotfiles:**
- ✅ `.dockerignore` - Docker ignore
- ✅ `.env.example` - Example env
- ✅ `.env.local.example` - Local env example
- ✅ `.env.test.local.example` - Test env example
- ✅ `.eslintignore` - ESLint ignore
- ✅ `.eslintrc.json` - ESLint config
- ✅ `.gitignore` - Git ignore
- ✅ `.mcp.json` - MCP config
- ✅ `.npmrc` - npm config
- ✅ `.nvmrc` - Node version

---

### ❌ ELIMINAR - Archivos Obsoletos/Temporales (4 archivos)

#### 1. babel.config.js.backup (181 bytes)
**Tipo**: Backup obsoleto
**Acción**: ❌ ELIMINAR
**Razón**: Next.js maneja Babel automáticamente, no necesitamos config de Babel

#### 2. temp-output.css (61K)
**Tipo**: Archivo temporal
**Acción**: ❌ ELIMINAR
**Razón**: Archivo temporal generado, no debe estar en git

#### 3. temp-back-end-copy/ (carpeta)
**Tipo**: Carpeta temporal
**Acción**: ❌ ELIMINAR completamente
**Razón**: Copia temporal de backend, no debe estar en repo

#### 4. Captura de pantalla de 2026-01-02 13-18-02.png (239K)
**Tipo**: Imagen suelta
**Acción**: 🔄 MOVER a `docs/assets/screenshots/` (si es útil) o ELIMINAR
**Pregunta**: ¿Qué contiene esta captura? ¿Es importante?

---

### 🔄 MOVER - Archivos Mal Ubicados (4 archivos/carpetas)

#### 5. nginx-inmogrid.conf (976 bytes)
**Ubicación actual**: Raíz
**Acción**: 🔄 MOVER a `docs/06-deployment/configs/nginx-inmogrid.conf`
**Razón**: Es configuración de deployment, no debe estar en raíz

#### 6. prisma-studio-production.sh (1.4K)
**Ubicación actual**: Raíz
**Acción**: 🔄 MOVER a `scripts/prisma-studio-production.sh`
**Razón**: Es un script, debe estar en scripts/

#### 7. archive/ (carpeta)
**Contenido**: legacy-docs/, README.obsoleto.md
**Acción**: 🔄 MOVER a `docs/07-maintenance/archive/`
**Razón**: Archivos archivados de documentación

#### 8. ERD/ (carpeta)
**Contenido**: Diagramas de base de datos
- codeviz-diagram-2025-01-09T17-15-38.drawio
- dbdiagram.io
- diagrama_sistema.png (249K)
**Acción**: 🔄 MOVER a `docs/03-arquitectura/diagrams/`
**Razón**: Diagramas de arquitectura, pertenecen a docs de arquitectura

---

### ✅ CONSERVAR - Carpetas Necesarias (13 carpetas)

- ✅ `node_modules/` - Dependencies
- ✅ `src/` - Source code
- ✅ `public/` - Static assets
- ✅ `prisma/` - Database schema
- ✅ `scripts/` - Utility scripts
- ✅ `docs/` - Documentation
- ✅ `__tests__/` - Tests
- ✅ `__mocks__/` - Test mocks
- ✅ `config/` - Config files
- ✅ `examples/` - Example code
- ✅ `workers/` - Worker scripts

---

## 🎯 Plan de Acción

### Paso 1: ELIMINAR (4 archivos)
```bash
# Eliminar backups obsoletos
rm babel.config.js.backup

# Eliminar archivos temporales
rm temp-output.css

# Eliminar carpeta temporal
rm -rf temp-back-end-copy/

# Decidir sobre captura de pantalla
# ¿Mover o eliminar?
```

### Paso 2: MOVER (4 items)
```bash
# Crear carpetas destino
mkdir -p docs/06-deployment/configs
mkdir -p docs/03-arquitectura/diagrams

# Mover nginx config
mv nginx-inmogrid.conf docs/06-deployment/configs/

# Mover script de prisma
mv prisma-studio-production.sh scripts/

# Mover archive
mv archive docs/07-maintenance/

# Mover diagramas ERD
mv ERD docs/03-arquitectura/diagrams/
```

### Paso 3: ACTUALIZAR referencias
```bash
# Actualizar scripts que referencien archivos movidos
# Buscar referencias a prisma-studio-production.sh
grep -r "prisma-studio-production" .

# Buscar referencias a nginx-inmogrid.conf
grep -r "nginx-inmogrid.conf" .
```

---

## 📊 Resultado Esperado

### ANTES (37 items):
- 24 archivos
- 13 carpetas
- ❌ 4 archivos obsoletos/temporales
- ❌ 4 archivos mal ubicados

### DESPUÉS (29 items):
- 16 archivos ✅ (todos necesarios)
- 13 carpetas ✅ (todas necesarias)
- ✅ 0 archivos obsoletos
- ✅ 0 archivos mal ubicados

**Reducción**: 37 → 29 items (-22%)

---

## ❓ Sobre Jest (Respuesta a tu pregunta)

### ¿Son necesarios 2 archivos para Jest?

**Respuesta**: SÍ, ambos son necesarios ✅

#### jest.config.js
- **Propósito**: Configuración principal de Jest
- **Ubicación**: DEBE estar en raíz (Jest lo busca ahí por defecto)
- **Contenido**: testMatch, testPathIgnorePatterns, moduleNameMapper, etc.

#### jest.setup.js
- **Propósito**: Setup que se ejecuta ANTES de cada test
- **Ubicación**: Raíz (pero podría moverse si actualizamos jest.config.js)
- **Contenido**: Configuración de testing-library, mocks globales, polyfills
- **Referenciado por**: jest.config.js línea 8:
  ```javascript
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
  ```

#### ¿Se pueden consolidar?
**No recomendado** porque:
1. Cumplen funciones diferentes (config vs setup)
2. Es la convención estándar de Jest
3. Mantener separados facilita mantenimiento
4. jest.config.js puede estar en raíz o en carpeta, pero jest.setup.js debe estar donde jest.config.js lo referencie

#### ¿Se pueden mover?
`jest.setup.js` SÍ podría moverse a `__tests__/config/jest.setup.js` si actualizas:
```javascript
// jest.config.js
setupFilesAfterEnv: ['<rootDir>/__tests__/config/jest.setup.js']
```

Pero es más convencional dejarlo en raíz.

---

## 🎨 Estructura Final Propuesta

```
inmogrid.cl/
├── 📄 Archivos de configuración (16 archivos)
│   ├── package.json, package-lock.json
│   ├── next.config.js, next-env.d.ts
│   ├── tsconfig.json, tsconfig.seed.json
│   ├── tailwind.config.ts, postcss.config.js
│   ├── jest.config.js, jest.setup.js
│   ├── playwright.config.ts
│   ├── Dockerfile, docker-compose.local.yml
│   ├── README.md, LICENSE
│   ├── CLAUDE.md, GEMINI.md
│   └── global.d.ts
│
├── 📁 Carpetas principales (13 carpetas)
│   ├── node_modules/
│   ├── src/
│   ├── public/
│   ├── prisma/
│   ├── scripts/
│   │   └── prisma-studio-production.sh  ← MOVIDO
│   ├── docs/
│   │   ├── 03-arquitectura/
│   │   │   └── diagrams/  ← ERD MOVIDO AQUÍ
│   │   ├── 06-deployment/
│   │   │   └── configs/
│   │   │       └── nginx-inmogrid.conf  ← MOVIDO
│   │   └── 07-maintenance/
│   │       └── archive/  ← ARCHIVE MOVIDO AQUÍ
│   ├── __tests__/
│   ├── __mocks__/
│   ├── config/
│   ├── examples/
│   └── workers/
│
└── 🗑️  Eliminados (4 items)
    ├── babel.config.js.backup  ← ELIMINADO
    ├── temp-output.css  ← ELIMINADO
    ├── temp-back-end-copy/  ← ELIMINADO
    └── Captura de pantalla...png  ← DECISIÓN PENDIENTE
```

---

## ✅ Beneficios

**Raíz más Limpia**:
- Solo configuración esencial
- Fácil de navegar
- Mejor primera impresión

**Mejor Organización**:
- Archivos en ubicaciones lógicas
- Scripts en scripts/
- Configs de deployment en docs/deployment/
- Diagramas en docs/arquitectura/

**Mantenibilidad**:
- Más fácil encontrar archivos
- Menos confusión
- Estructura clara

---

## 🚀 Siguiente Paso

**¿Procedo con la limpieza?**

Voy a preguntarte sobre archivos dudosos antes de eliminar:

1. **Captura de pantalla de 2026-01-02 13-18-02.png** (239K)
   - ¿Qué contiene?
   - ¿Es importante?
   - ¿La movemos a docs/assets/ o la eliminamos?

2. **temp-back-end-copy/** (carpeta temporal)
   - ¿Confirmas que podemos eliminarla?

3. **archive/** y **ERD/**
   - ¿Confirmas que podemos moverlas a docs/?

---

**Autor**: Claude Code
**Fecha**: 2026-01-03
**Archivos a limpiar**: 8 items (4 eliminar, 4 mover)
