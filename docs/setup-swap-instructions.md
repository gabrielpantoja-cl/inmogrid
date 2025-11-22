# Instrucciones para Configurar Swap en VPS

## Problema
Los builds de Next.js fallan en el VPS con error "Killed" porque se queda sin memoria RAM.

## Solución
Agregar 2GB de swap para tener ~6GB totales (4GB RAM + 2GB swap).

## Pasos a Ejecutar (Requiere SSH Manual)

### 1. Conectar al VPS
```bash
ssh gabriel@167.172.251.27
```

### 2. Copiar y pegar TODOS estos comandos (requiere contraseña sudo):

```bash
# Crear archivo swap de 2GB
sudo fallocate -l 2G /swapfile

# Permisos correctos (solo root puede leer/escribir)
sudo chmod 600 /swapfile

# Formatear como swap
sudo mkswap /swapfile

# Activar swap
sudo swapon /swapfile

# Verificar que está activo
free -h
swapon --show

# Hacer permanente (sobrevive a reinicios)
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verificación final
echo ""
echo "✅ Configuración completada!"
echo ""
echo "📊 Memoria disponible:"
free -h
```

### 3. Verificar Resultado Esperado

Deberías ver algo como:
```
              total        used        free      shared  buff/cache   available
Mem:           3.8Gi       1.8Gi       1.0Gi        36Mi       1.0Gi       1.8Gi
Swap:          2.0Gi          0B       2.0Gi
                ↑
         2GB de swap activo
```

---

## ¿Por qué esto soluciona el problema?

- **Antes**: Solo 4GB RAM → Build usa ~3-4GB → Se queda sin memoria → "Killed"
- **Después**: 4GB RAM + 2GB Swap = 6GB total → Build tiene suficiente espacio

---

## Nota Importante

El swap usa el disco SSD, así que los builds serán **un poco más lentos** que con RAM pura, pero **no fallarán**.

- Build sin swap: ~2 min (pero puede fallar)
- Build con swap: ~3-4 min (pero siempre completa)

---

## Verificar si ya está configurado

```bash
ssh gabriel@167.172.251.27 "free -h"
```

Si ves `Swap: 0B`, entonces necesitas configurarlo.

---

## Para Remover el Swap (si es necesario)

```bash
sudo swapoff /swapfile
sudo rm /swapfile
# Editar /etc/fstab y remover la línea que dice /swapfile
```
