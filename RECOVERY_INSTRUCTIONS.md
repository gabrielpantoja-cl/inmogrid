# 🚨 Instrucciones de Recuperación de degux.cl

## 📊 Estado Actual
- **Sitio**: degux.cl
- **Estado**: ❌ NO ACCESIBLE (timeout)
- **Diagnóstico**: El contenedor Docker probablemente está caído o no responde

---

## 🚀 Solución Rápida (Opción 1 - Recomendada)

### Método A: Desde tu máquina local

1. **Abre tu terminal** y ejecuta:
   ```bash
   ssh gabriel@167.172.251.27 'bash -s' < scripts/quick-fix-vps.sh
   ```

   Esto ejecutará el script de recuperación automática en el VPS.

### Método B: Conectándote directamente al VPS

1. **Conéctate al VPS por SSH**:
   ```bash
   ssh gabriel@167.172.251.27
   ```

2. **Ejecuta estos comandos** (copiar y pegar todo junto):
   ```bash
   cd /home/gabriel/vps-do

   # Ver estado actual
   docker ps -a | grep degux-web

   # Reiniciar el contenedor
   docker compose -f docker-compose.yml -f docker-compose.degux.yml stop degux-web
   docker compose -f docker-compose.yml -f docker-compose.degux.yml up -d degux-web

   # Esperar 15 segundos
   sleep 15

   # Verificar que esté corriendo
   docker ps | grep degux-web
   docker logs degux-web --tail 20
   ```

3. **Verifica que el sitio esté funcionando**:
   ```bash
   curl -I https://degux.cl
   ```

   Deberías ver `HTTP/2 200` en la respuesta.

---

## 🔧 Solución Completa (Opción 2 - Si la Opción 1 no funciona)

### Desde tu máquina local:

```bash
./scripts/emergency-recovery.sh
```

Este script interactivo te guiará a través de:
1. **Diagnóstico completo** del sistema
2. **Opciones de recuperación**:
   - Reinicio simple (rápido)
   - Rebuild completo con código actualizado
   - Reinicio de todos los servicios
3. **Verificación automática** del health del sitio

---

## 🔍 Diagnóstico Manual

Si quieres investigar qué está pasando antes de reiniciar:

```bash
ssh gabriel@167.172.251.27
```

### Ver estado de contenedores:
```bash
docker ps -a
```

### Ver logs de degux-web:
```bash
docker logs degux-web --tail 100
```

### Ver logs en tiempo real:
```bash
docker logs -f degux-web
```

### Verificar recursos del sistema:
```bash
df -h              # Espacio en disco
free -h            # Memoria RAM
docker stats       # Uso de recursos por contenedor
```

---

## 📋 Problemas Comunes y Soluciones

### 1. Contenedor caído (Exited)
**Síntoma**: `docker ps -a` muestra degux-web como "Exited"
**Solución**:
```bash
cd /home/gabriel/vps-do
docker compose -f docker-compose.yml -f docker-compose.degux.yml up -d degux-web
```

### 2. Contenedor reiniciándose constantemente
**Síntoma**: `docker ps` muestra "Restarting" en el status
**Solución**: Ver logs para identificar el error:
```bash
docker logs degux-web --tail 100
```
Luego ejecutar rebuild:
```bash
cd /home/gabriel/vps-do
docker compose -f docker-compose.yml -f docker-compose.degux.yml down degux-web
docker compose -f docker-compose.yml -f docker-compose.degux.yml up -d --build degux-web
```

### 3. Error de Out of Memory (OOM)
**Síntoma**: Logs muestran errores de memoria
**Solución**: Reiniciar contenedor y revisar límites de memoria:
```bash
docker restart degux-web
docker stats degux-web
```

### 4. Error de base de datos
**Síntoma**: Logs muestran errores de conexión a PostgreSQL
**Solución**:
```bash
# Verificar que degux-db esté corriendo
docker ps | grep degux-db

# Si no está corriendo, iniciarlo
cd /home/gabriel/vps-do
docker compose -f docker-compose.yml -f docker-compose.degux.yml up -d degux-db

# Esperar 10 segundos y reiniciar degux-web
sleep 10
docker compose -f docker-compose.yml -f docker-compose.degux.yml restart degux-web
```

### 5. Error de nginx-proxy (problema SSL/HTTPS)
**Síntoma**: HTTP funciona pero HTTPS no
**Solución**:
```bash
docker restart nginx-proxy
sleep 10
docker restart degux-web
```

### 6. Disco lleno
**Síntoma**: `df -h` muestra 100% en `/dev/vda1`
**Solución**:
```bash
# Limpiar imágenes Docker no usadas
docker image prune -a -f

# Limpiar contenedores detenidos
docker container prune -f

# Limpiar volúmenes no usados
docker volume prune -f

# Limpiar build cache
docker builder prune -f
```

---

## 🎯 Verificación Post-Recuperación

Después de cualquier acción de recuperación, verifica:

1. **Estado del contenedor**:
   ```bash
   docker ps | grep degux-web
   ```
   Debe mostrar "Up" en el status.

2. **Health check de la API**:
   ```bash
   curl https://degux.cl/api/health
   ```
   Debe responder con: `{"status":"ok"}`

3. **Página principal**:
   ```bash
   curl -I https://degux.cl
   ```
   Debe mostrar: `HTTP/2 200`

4. **Acceso desde navegador**:
   Abre https://degux.cl en tu navegador

---

## 📞 Escalación

Si ninguna de las soluciones anteriores funciona:

1. **Revisar logs completos**:
   ```bash
   ssh gabriel@167.172.251.27
   docker logs degux-web > /tmp/degux-web-logs.txt
   docker logs nginx-proxy > /tmp/nginx-proxy-logs.txt
   docker logs degux-db > /tmp/degux-db-logs.txt
   ```

2. **Verificar archivos de configuración**:
   ```bash
   cat /home/gabriel/vps-do/docker-compose.degux.yml
   cat /home/gabriel/degux.cl/.env.local
   ```

3. **Rebuild completo desde cero**:
   ```bash
   cd /home/gabriel/degux.cl
   git pull origin main

   cd /home/gabriel/vps-do
   docker compose -f docker-compose.yml -f docker-compose.degux.yml down degux-web
   docker compose -f docker-compose.yml -f docker-compose.degux.yml build --no-cache degux-web
   docker compose -f docker-compose.yml -f docker-compose.degux.yml up -d degux-web
   ```

4. **Contactar soporte de Digital Ocean**:
   - Dashboard: https://cloud.digitalocean.com
   - Verificar estado del VPS
   - Revisar métricas de CPU, RAM, disco

---

## 📚 Recursos Adicionales

- **Portainer (Dashboard Docker)**: https://167.172.251.27:9443
- **Logs de N8N**: `docker logs n8n`
- **Documentación completa**: `/home/user/degux.cl/docs/06-deployment/`

---

## ✅ Checklist de Recuperación

- [ ] Verificar conectividad SSH al VPS
- [ ] Revisar estado de contenedores Docker
- [ ] Leer logs de degux-web
- [ ] Reiniciar contenedor degux-web
- [ ] Verificar health check (`/api/health`)
- [ ] Confirmar acceso desde navegador
- [ ] Revisar logs post-recuperación
- [ ] Documentar causa raíz del problema

---

**Última actualización**: 2025-12-29
**Mantenedor**: Gabriel Pantoja
**VPS**: 167.172.251.27 (Digital Ocean)
