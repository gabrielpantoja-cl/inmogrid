# Optimización de Memoria en VPS - degux.cl

**Fecha**: 6 de Octubre, 2025
**VPS**: ubuntu-s-2vcpu-2gb-amd-nyc3-01
**Especificaciones**:
- CPU: 2 AMD vCPUs
- RAM: 4 GB Memory
- Disco: 60 GB SSD
- Ubicación: NYC3 - Ubuntu 24.04 (LTS) x64

---

## 🚨 Problema: Out of Memory en Build

### Síntomas

Cuando se ejecuta `npm run build` en el VPS, el proceso puede fallar con error "Killed":

```bash
cd /home/gabriel/degux.cl
npm run build

# Salida:
Creating an optimized production build ...
✓ Compiled successfully in 45s
Linting and checking validity of types ...
Killed  # ← PROCESO TERMINADO POR FALTA DE MEMORIA
```

### Causa Raíz

Next.js 15 con TypeScript requiere **considerable memoria** durante el build, especialmente en la fase de:

1. **Type checking** (TypeScript)
2. **Linting** (ESLint)
3. **Optimización** (compilación, minificación, tree-shaking)
4. **Static page generation**

**Memoria estimada necesaria**: 3-4 GB solo para el proceso de build

**Problema**: El VPS tiene 4 GB totales, pero parte está usada por:
- Sistema operativo Ubuntu (~500-800 MB)
- PostgreSQL (~300-500 MB)
- PM2 + Node.js (~200-400 MB)
- Otros servicios (Nginx, SSH, etc.) (~200 MB)

**Memoria disponible real para build**: ~2-2.5 GB (insuficiente para builds grandes)

---

## ✅ Soluciones Implementadas

### 1. GitHub Actions como Build Primary

**Estado**: ✅ IMPLEMENTADO

GitHub Actions ejecuta el build en servidores con recursos ilimitados:

```yaml
# .github/workflows/deploy-production.yml
- name: Build Next.js
  run: npm run build  # ← Se ejecuta en GitHub, NO en VPS
```

**Ventajas**:
- Build siempre exitoso (sin límites de memoria)
- Valida TypeScript/ESLint antes de deploy
- Falla fast si hay errores de compilación
- No consume recursos del VPS

**Limitación**:
- El VPS aún necesita hacer build local después de `git pull`
- GitHub Actions NO transfiere el build al VPS (por ahora)

### 2. Estrategias de Build en VPS

#### Opción A: Build con Swap Memory (Recomendado)

Agregar swap de 2 GB adicionales:

```bash
# Crear archivo swap de 2 GB
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Verificar swap activo
free -h

# Hacer permanente (agregar a /etc/fstab)
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

**Resultado esperado**:
```
              total        used        free      shared  buff/cache   available
Mem:           3.8G        1.5G        800M         50M        1.5G        2.0G
Swap:          2.0G          0B        2.0G
```

**Pros**:
- Permite builds exitosos en el VPS
- No requiere cambios en workflow
- Solución permanente

**Contras**:
- Swap en SSD puede degradar rendimiento (acceptable para builds ocasionales)
- Builds más lentos que con RAM pura

#### Opción B: Build con NODE_OPTIONS

Limitar memoria usada por Node.js:

```bash
# Build con límite de 3 GB (del total de 4 GB)
NODE_OPTIONS="--max-old-space-size=3072" npm run build
```

**Pros**:
- No requiere configuración del sistema
- Fácil de implementar en scripts

**Contras**:
- Puede seguir fallando si el build necesita >3 GB
- No resuelve el problema de fondo

#### Opción C: Transfer Build from GitHub Actions (Futuro)

Transferir el build compilado desde GitHub Actions al VPS:

```yaml
# .github/workflows/deploy-production.yml (PROPUESTO)
- name: Build Next.js
  run: npm run build

- name: Compress build
  run: tar -czf build.tar.gz .next

- name: Deploy build to VPS
  uses: appleboy/scp-action@v0.1.7
  with:
    host: ${{ secrets.VPS_HOST }}
    username: ${{ secrets.VPS_USER }}
    key: ${{ secrets.VPS_SSH_KEY }}
    source: build.tar.gz
    target: /home/gabriel/degux.cl/

- name: Extract and restart
  run: |
    ssh ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }} "\
      cd /home/gabriel/degux.cl && \
      tar -xzf build.tar.gz && \
      pm2 restart degux-app"
```

**Pros**:
- VPS NUNCA necesita buildear
- Deployment súper rápido
- Sin problemas de memoria

**Contras**:
- Más complejo de implementar
- Requiere sincronización de node_modules

---

## 📊 Monitoreo de Memoria

### Comandos Útiles

```bash
# Ver uso de memoria en tiempo real
free -h

# Ver procesos que más usan memoria
ps aux --sort=-%mem | head -10

# Monitorear memoria durante build
watch -n 1 free -h

# Ver detalles de swap
swapon --show

# Ver uso de disco (el swap consume espacio)
df -h
```

### Verificar si el Build falló por Memoria

```bash
# Ver logs del kernel (OOM = Out of Memory)
dmesg | grep -i "killed process"

# Salida típica cuando hay OOM:
# [12345.678] Out of memory: Killed process 12345 (node) total-vm:4000000kB
```

---

## 🔧 Workflow Actual (Post-Fix)

### Deployment Automático (GitHub Actions)

```
1. git push origin main
2. GitHub Actions:
   - npm ci
   - npm run build  ← BUILD EN GITHUB (exitoso siempre)
   - Verifica compilación
3. SSH al VPS:
   - cd ~/degux.cl
   - git pull origin main
   - npm ci
   - npm run prisma:generate
   - rm -rf .next/cache
   - npm run build  ← BUILD EN VPS (puede fallar por memoria)
   - pm2 restart degux-app
```

### Si Build en VPS Falla

**Opción 1: Usar GitHub Actions build (validado)**

El build de GitHub ya validó que el código compila. Si falla en VPS por memoria:

```bash
# En el VPS: Solo actualizar código y reiniciar con build viejo
cd /home/gabriel/degux.cl
git pull origin main
npm ci
pm2 restart degux-app
```

⚠️ **Problema**: La app seguirá usando el build antiguo hasta que se pueda buildear exitosamente.

**Opción 2: Build con swap (recomendado)**

```bash
# Activar swap primero (si no existe)
sudo swapon -a

# Intentar build nuevamente
cd /home/gabriel/degux.cl
npm run build

# Si sigue fallando, limpiar memoria:
sudo sync
sudo sysctl vm.drop_caches=3
npm run build
```

**Opción 3: Build selectivo**

```bash
# Skip type checking (más rápido, menos memoria)
npm run build -- --no-lint

# O skip static generation
npm run build -- --profile
```

---

## 📈 Recomendaciones

### Corto Plazo (Implementar YA)

- [x] Usar GitHub Actions para validar builds
- [ ] Agregar swap de 2 GB en VPS
- [x] Limpiar cache de Next.js antes de build (`rm -rf .next/cache`)

### Mediano Plazo (1-2 meses)

- [ ] Implementar transfer de build desde GitHub Actions
- [ ] Considerar upgrade de VPS a 8 GB RAM si el proyecto crece
- [ ] Optimizar imports y reducir bundle size

### Largo Plazo (3-6 meses)

- [ ] Migrar a Docker multi-stage builds
- [ ] Implementar build caching en GitHub Actions
- [ ] Evaluar usar Vercel/Netlify para Next.js (si budget lo permite)

---

## 🆘 Troubleshooting

### Build falla con "Killed"

```bash
# 1. Verificar memoria disponible
free -h

# 2. Si swap no existe, agregarlo
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 3. Limpiar caché del sistema
sudo sync
sudo sysctl vm.drop_caches=3

# 4. Reintentar build
npm run build
```

### Build es MUY lento

```bash
# Verificar si está usando swap (señal de poca RAM)
free -h

# Si swap está en uso, considerar:
# - Cerrar servicios innecesarios temporalmente
# - Hacer build en horarios de bajo tráfico
# - Upgrade de VPS
```

### PM2 se reinicia pero app usa build viejo

```bash
# Verificar fecha de archivos en .next/
ls -lat .next/server/app/ | head -10

# Si archivos tienen fecha antigua, build no se completó
# Rebuild manual:
rm -rf .next
npm run build
pm2 restart degux-app
```

---

## 📚 Referencias

- **Next.js Build Optimization**: https://nextjs.org/docs/app/building-your-application/optimizing
- **Linux Swap Guide**: https://www.digitalocean.com/community/tutorials/how-to-add-swap-space-on-ubuntu-20-04
- **Node.js Memory Management**: https://nodejs.org/en/docs/guides/simple-profiling/

---

🤖 Documentación creada por Claude Code - degux.cl
