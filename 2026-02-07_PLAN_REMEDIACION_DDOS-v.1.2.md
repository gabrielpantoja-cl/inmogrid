# PLAN DE REMEDIACION: Incidente DDoS - React2Shell (CVE-2025-55182)

**Fecha**: 2026-02-07
**Prioridad**: CRITICA
**Version**: 1.2 (actualizado con causa raiz confirmada)
**Referencia**: Ticket DigitalOcean #11599402
**Incidente**: `2026-02-07_INCIDENTE_SEGURIDAD_DDOS_NI8MARE.md`

---

## Causa Raiz Confirmada

**CVE-2025-55182** ("React2Shell") - CVSS 10.0

Vulnerabilidad de deserializacion insegura en el protocolo Flight de React Server
Components. Permite RCE pre-autenticacion via POST requests crafteados.

- **NO** fue CVE-2026-21858 (Ni8mare/n8n) como se sospecho inicialmente
- El vector fue `POST /` directo a la app Next.js, procesado por el protocolo Flight
- Versiones vulnerables: Next.js 15.5.6, React 19.2.0
- Versiones parcheadas: Next.js >= 15.5.7, React >= 19.2.1 (completo: 15.5.10 + 19.2.3)

Referencias oficiales:
- https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components
- https://nvd.nist.gov/vuln/detail/CVE-2025-55182
- https://nextjs.org/blog/CVE-2025-66478
- https://unit42.paloaltonetworks.com/cve-2025-55182-react-and-cve-2025-66478-next/

---

## Estado Actual (Actualizado 2026-02-07)

### Completado - Infraestructura (VPS)
- [x] degux-web detenido, malware eliminado, DDoS parado
- [x] Puertos bound a 127.0.0.1 (3000, 5678, 3002)
- [x] security_opt: no-new-privileges en todos los contenedores
- [x] cap_drop: ALL en todos los contenedores
- [x] Filesystem read-only + tmpfs noexec (neutraliza exploit activo)
- [x] Health check cambiado a node nativo (sin wget)
- [x] Supabase compose eliminado del repo
- [x] Sofia asegurada (127.0.0.1 + security_opt)
- [x] N8N asegurado (127.0.0.1 + security_opt)
- [x] Registro IPs C2: docs/security/BLOCKED_IPS.md
- [x] Agente seguridad: .claude/agents/vps-security-specialist.md

### Completado - Codigo (Local, pendiente deploy)
- [x] **CAUSA RAIZ IDENTIFICADA**: CVE-2025-55182 (React2Shell)
- [x] **Next.js actualizado**: 15.5.6 -> 15.5.10 (parcha CVE-2025-55182, CVE-2025-55183, CVE-2025-55184, CVE-2025-67779, CVE-2026-23864)
- [x] **React actualizado**: 19.2.0 -> 19.2.3 (parcha CVE-2025-55182 completo)
- [x] **react-dom actualizado**: 19.2.0 -> 19.2.3
- [x] **react-server-dom-webpack**: parcheado internamente por Next.js 15.5.10 (canary 9aa4f723, 2026-01-23)
- [x] **Path Traversal corregido**: `/api/docs/[...path]/route.ts` (validacion de segmentos + resolve boundary check)
- [x] **CSP hardened**: `unsafe-eval` removido de Content-Security-Policy
- [x] **child_process removido**: dependencia npm innecesaria eliminada de package.json
- [x] **Build exitoso**: verificado con todos los cambios
- [x] **Committed en git**: todos los cambios en rama main

### Completado - Documentacion
- [x] Reporte seguridad degux.cl: `2026-02-07_REPORTE_SEGURIDAD_DEGUX_CL.md`
- [x] Respuesta DigitalOcean v2: `2026-02-07_RESPUESTA_DIGITALOCEAN_TICKET_11599402-v.2.md`

### Pendiente - Requiere accion manual
- [ ] **DEPLOY AL VPS**: git pull + rebuild Docker + restart degux-web
- [ ] **VERIFICAR SITIO**: confirmar degux.cl operativo post-deploy
- [ ] **SUDO EN VPS**: Eliminar user supabase, bloquear IPs en UFW
- [ ] **ROTACION CREDENCIALES**: DB password, NextAuth secret, Google OAuth, Maps API, N8N webhook
- [ ] **ENVIAR RESPUESTA DO**: Solo despues de deploy exitoso
- [ ] **MONITOREO POST-DEPLOY**: 1 hora de observacion

---

## Fase 1: Deploy al VPS (SIGUIENTE PASO)

### 1.1 Subir cambios y rebuild

```bash
# En el VPS
ssh gabriel@VPS_IP_REDACTED

# Pull cambios con parches de seguridad
cd ~/vps-do/degux.cl  # o donde este el repo en el VPS
git pull origin main

# Rebuild imagen Docker sin cache (asegurar imagen limpia)
cd ~/vps-do
docker compose -f docker-compose.yml -f docker-compose.degux.yml build --no-cache degux-web

# Purgar imagen anterior
docker image prune -f
```

### 1.2 Restart con hardening

```bash
# Restart solo degux-web
docker compose -f docker-compose.yml -f docker-compose.degux.yml up -d degux-web

# Verificar que arranca
docker logs -f degux-web --tail 50
```

### 1.3 Verificar parche aplicado

```bash
# Verificar version de Next.js en el contenedor
docker exec degux-web node -e "console.log(require('/app/node_modules/next/package.json').version)"
# Debe mostrar: 15.5.10

# Verificar que no hay malware
docker exec degux-web ps aux
# Solo debe mostrar: node server.js

# Verificar CPU normal
docker stats --no-stream degux-web
# CPU debe estar < 5%

# Verificar sitio responde
curl -s -o /dev/null -w "%{http_code}" https://degux.cl
# Debe retornar: 200
```

---

## Fase 2: Acciones sudo en VPS

### 2.1 Eliminar usuario supabase

```bash
ssh gabriel@VPS_IP_REDACTED

# Verificar que no hay procesos del usuario
ps -u supabase

# Eliminar usuario
sudo userdel supabase

# Verificar eliminacion
grep supabase /etc/passwd  # No debe devolver nada
```

### 2.2 Bloquear IPs C2 en UFW

```bash
# Bloquear las 3 IPs de C2/payload servers
sudo ufw deny out to 77.90.185.76
sudo ufw deny out to 205.185.127.97
sudo ufw deny out to 91.92.243.113

# Verificar
sudo ufw status | grep -E '77.90|205.185|91.92'
```

### 2.3 Agregar gabriel al grupo adm (logs nginx)

```bash
sudo usermod -aG adm gabriel
# Requiere re-login para aplicar
```

---

## Fase 3: Rotacion de Credenciales

**IMPORTANTE**: Hacer DESPUES del deploy exitoso.

### 3.1 Credenciales a rotar

| Credencial | Donde rotar | Prioridad |
|------------|-------------|-----------|
| DEGUX_DB_PASSWORD | VPS .env + degux-db container | CRITICA |
| DEGUX_NEXTAUTH_SECRET | VPS .env | CRITICA |
| GOOGLE_CLIENT_SECRET | Google Cloud Console + VPS .env | ALTA |
| GOOGLE_MAPS_API_KEY | Google Cloud Console (restringir dominios) | ALTA |
| N8N_WEBHOOK_SECRET | VPS .env + n8n config | MEDIA |

### 3.2 Procedimiento

```bash
# 1. Generar nuevas credenciales
openssl rand -base64 32  # Para cada password/secret

# 2. Actualizar .env.production en el VPS
nano ~/vps-do/.env.production

# 3. Actualizar password en degux-db
docker exec -it degux-db psql -U degux_user -d degux_core -c \
  "ALTER USER degux_user WITH PASSWORD 'NUEVA_PASSWORD';"

# 4. Revocar Google Client Secret
# -> console.cloud.google.com -> APIs & Services -> Credentials
# -> Crear nuevo secret, actualizar en .env.production

# 5. Restringir Google Maps API Key
# -> console.cloud.google.com -> Limitar a dominios degux.cl

# 6. Restart servicios afectados
docker compose -f docker-compose.yml -f docker-compose.degux.yml restart degux-web
```

---

## Fase 4: Verificacion y Respuesta

### 4.1 Monitoreo post-deploy (1 hora)

```bash
# Monitorear conexiones salientes sospechosas
watch -n 60 'ss -tnp | grep -v "VPS_IP_REDACTED:22\|127.0.0"'

# Monitorear CPU
watch -n 30 'docker stats --no-stream degux-web'

# Monitorear logs (buscar intentos de exploit)
docker logs -f degux-web 2>&1 | grep -i "POST / "
```

### 4.2 Enviar respuesta a DigitalOcean

Solo despues de:
- [x] Deploy exitoso
- [x] Sitio operativo
- [x] Monitoreo limpio por 1 hora
- [ ] Credenciales rotadas (o en progreso)

Usar: `2026-02-07_RESPUESTA_DIGITALOCEAN_TICKET_11599402-v.2.md`

---

## Fase 5: Prevencion Futura

### 5.1 Suscribirse a alertas de seguridad

- Next.js: https://github.com/vercel/next.js/security/advisories
- React: https://github.com/facebook/react/security/advisories
- Node.js: https://nodejs.org/en/blog/vulnerability
- Docker: https://docs.docker.com/engine/security/

### 5.2 Politica de actualizaciones

- CVEs criticas (CVSS >= 9.0): parchear en < 24 horas
- CVEs altas (CVSS >= 7.0): parchear en < 7 dias
- CVEs medias (CVSS >= 4.0): parchear en siguiente release

### 5.3 Monitoreo continuo

Agregar al cron semanal:

```bash
# Detectar procesos sospechosos en contenedores
for container in $(docker ps -q); do
  name=$(docker inspect --format '{{.Name}}' $container)
  suspicious=$(docker top $container 2>/dev/null | grep -iE 'wget|curl|udevr|kok|monitor|udhcpc|nc |ncat' || true)
  if [ -n "$suspicious" ]; then
    echo "ALERTA: Procesos sospechosos en $name"
    echo "$suspicious"
  fi
done
```

### 5.4 Hardening permanente para todos los contenedores

```yaml
# Template obligatorio para todo nuevo servicio
security_opt:
  - no-new-privileges:true
cap_drop:
  - ALL
read_only: true  # cuando sea posible
tmpfs:
  - /tmp:rw,noexec,nosuid,size=100m
ports:
  - "127.0.0.1:PORT:PORT"  # NUNCA 0.0.0.0
```

---

## Checklist de Verificacion Final

### Parche de codigo (LOCAL)
- [x] Next.js 15.5.6 -> 15.5.10
- [x] React 19.2.0 -> 19.2.3
- [x] react-dom 19.2.0 -> 19.2.3
- [x] react-server-dom-webpack parcheado (interno Next.js)
- [x] Path traversal /api/docs/ corregido
- [x] unsafe-eval removido del CSP
- [x] child_process removido de package.json
- [x] Build exitoso verificado

### Deploy y verificacion (VPS)
- [ ] git pull en VPS
- [ ] Docker rebuild --no-cache
- [ ] degux-web reiniciado
- [ ] Version 15.5.10 confirmada en contenedor
- [ ] Sitio degux.cl responde 200
- [ ] CPU < 5%
- [ ] Sin procesos sospechosos
- [ ] Monitoreo 1 hora limpio

### Acciones administrativas
- [ ] User supabase eliminado
- [ ] IPs C2 bloqueadas en UFW
- [ ] gabriel agregado a grupo adm
- [ ] Credenciales rotadas
- [ ] Respuesta enviada a DigitalOcean
- [ ] Documentacion actualizada

---

## Cambios respecto a v1.0

| Cambio | Detalle |
|--------|---------|
| Causa raiz corregida | CVE-2025-55182 (React2Shell), NO CVE-2026-21858 (Ni8mare) |
| Parches aplicados | Next.js 15.5.10, React 19.2.3 (build exitoso) |
| Vulnerabilidades adicionales | Path traversal corregido, CSP hardened |
| child_process removido | Dependencia npm innecesaria eliminada |
| Fase 1 reorganizada | Ahora es "Deploy al VPS" (parches ya estan listos) |
| Respuesta DO actualizada | Referencia a v2 del correo |
| CVEs cubiertas | CVE-2025-55182, 55183, 55184, 67779, 2026-23864 |
