# PLAN DE REMEDIACION: Incidente DDoS Ni8mare

**Fecha**: 2026-02-07
**Prioridad**: CRITICA
**Referencia**: Ticket DigitalOcean #11599402
**Incidente**: `2026-02-07_INCIDENTE_SEGURIDAD_DDOS_NI8MARE.md`

---

## Estado Actual (Actualizado 2026-02-07 03:30 UTC)

- [x] **CONTENIDO**: degux-web detenido, malware eliminado, DDoS parado
- [x] **HARDENING COMPLETADO**: Puertos, security_opt, cap_drop, health checks
- [x] **DEGUX-WEB RECONSTRUIDO**: Imagen limpia, verificada, operativa
- [x] **FILESYSTEM READ-ONLY**: degux-web con read_only + tmpfs noexec (neutraliza exploit activo)
- [x] **SUPABASE ELIMINADO**: Compose file eliminado del repo
- [x] **SOFIA ASEGURADA**: Puerto 3002 movido a 127.0.0.1 + security_opt
- [x] **N8N ASEGURADO**: Puerto 5678 movido a 127.0.0.1 + security_opt
- [x] **REGISTRO IPs**: docs/security/BLOCKED_IPS.md (3 IPs: 77.90.185.76, 205.185.127.97, 91.92.243.113)
- [x] **AGENTE SEGURIDAD**: .claude/agents/vps-security-specialist.md creado
- [x] **RESPUESTA DO PREPARADA**: docs/reports/2026-02-07_RESPUESTA_DIGITALOCEAN_TICKET_11599402.md
- [x] **REPORTE DEGUX.CL**: docs/reports/2026-02-07_REPORTE_SEGURIDAD_DEGUX_CL.md
- [ ] **PENDIENTE (requiere sudo)**: Eliminar user supabase, bloquear IPs en UFW
- [ ] **PENDIENTE**: Rotacion de credenciales
- [ ] **PENDIENTE**: Enviar respuesta a DigitalOcean
- [ ] **PENDIENTE (equipo degux.cl)**: Parchear vulnerabilidad RCE en Next.js (POST /)

---

## Fase 1: Acciones Inmediatas (HOY - Requiere sudo en VPS)

### 1.1 Eliminar usuario `supabase` del host

**Riesgo**: CRITICO - usuario con sudo+docker en el host

```bash
# Conectar al VPS
ssh gabriel@VPS_IP_REDACTED

# Verificar que no hay procesos del usuario
ps -u supabase

# Eliminar usuario (sin home directory, no existe)
sudo userdel supabase

# Verificar eliminacion
grep supabase /etc/passwd  # No debe devolver nada
```

**Por que**: El UID 1001 del host mapea al user `nextjs` dentro de degux-web. Si un atacante escapa del contenedor, tendria acceso sudo+docker. Ademas, este usuario nunca se uso realmente (la instancia Supabase nunca fue desplegada).

### 1.2 Bloquear IPs maliciosas en UFW

```bash
# Bloquear C2 server
sudo ufw deny out to 77.90.185.76
sudo ufw deny out to 205.185.127.97

# Verificar
sudo ufw status | grep -E '77.90|205.185'
```

### 1.3 Limpiar imagen comprometida de degux-web

```bash
# Eliminar imagen contaminada
docker rmi vps-do-degux-web

# Limpiar build cache (puede contener capas infectadas)
docker builder prune -af

# Verificar
docker images | grep degux
```

### 1.4 Eliminar archivo docker-compose.supabase.yml

La instancia Supabase nunca fue desplegada. No hay contenedores, no hay volumenes. El archivo solo agrega superficie de ataque potencial.

```bash
# En el VPS
cd ~/vps-do
rm docker-compose.supabase.yml
rm -rf supabase/  # Directorio de configuracion si existe

# En el repo local, eliminar del repo
git rm docker-compose.supabase.yml
```

---

## Fase 2: Hardening de degux-web (ANTES de reiniciar)

### 2.1 Corregir exposicion de puerto

**Archivo**: `docker-compose.degux.yml`

```yaml
# ANTES (INSEGURO - accesible desde internet)
ports:
  - "3000:3000"

# DESPUES (solo accesible via nginx)
ports:
  - "127.0.0.1:3000:3000"
```

### 2.2 Agregar opciones de seguridad al contenedor

```yaml
degux-web:
  # ... configuracion existente ...
  security_opt:
    - no-new-privileges:true
  cap_drop:
    - ALL
  cap_add:
    - NET_BIND_SERVICE  # Solo si necesita bind a puerto < 1024
  read_only: true
  tmpfs:
    - /tmp:rw,noexec,nosuid,size=100m
    - /app/.next/cache:rw,noexec,nosuid,size=500m
```

### 2.3 Reemplazar health check con version segura

```yaml
# ANTES (proporciona wget al atacante)
healthcheck:
  test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1"]

# DESPUES (usa node nativo, sin herramientas extra)
healthcheck:
  test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
  interval: 30s
  timeout: 10s
  retries: 5
  start_period: 60s
```

### 2.4 Limitar red de salida (egress filtering)

Crear red Docker con driver que permita control de egress, o usar iptables:

```bash
# Permitir solo trafico necesario desde degux-web
# degux-web solo necesita: degux-db (5432), n8n (5678), DNS (53)
sudo iptables -I DOCKER-USER -s 172.25.0.0/16 -d 172.25.0.0/16 -j ACCEPT  # red interna degux
sudo iptables -I DOCKER-USER -s 172.25.0.0/16 -d 172.18.0.0/16 -j ACCEPT  # red vps_network
sudo iptables -I DOCKER-USER -s 172.25.0.0/16 -j DROP  # bloquear todo lo demas
```

---

## Fase 3: Rotacion de Credenciales (CRITICO)

Todas las credenciales expuestas en el contenedor comprometido deben ser rotadas.

### 3.1 Credenciales a rotar

| Credencial | Archivo | Prioridad |
|------------|---------|-----------|
| DEGUX_DB_PASSWORD | .env.production | CRITICA |
| DEGUX_NEXTAUTH_SECRET | .env.production | CRITICA |
| DEGUX_GOOGLE_CLIENT_SECRET | Google Console | ALTA |
| DEGUX_GOOGLE_MAPS_API_KEY | Google Console | ALTA |
| N8N_WEBHOOK_SECRET | .env.production | MEDIA |

### 3.2 Procedimiento

```bash
# 1. Generar nuevas credenciales
openssl rand -base64 32  # Para cada password/secret

# 2. Actualizar .env.production en el VPS
nano ~/vps-do/.env.production

# 3. Actualizar password en degux-db
docker exec -it degux-db psql -U degux_user -d degux_core -c \
  "ALTER USER degux_user WITH PASSWORD 'NUEVA_PASSWORD';"

# 4. Revocar Google Client Secret (console.cloud.google.com)
# Crear nuevo secret y actualizar

# 5. Restringir Google Maps API Key (console.cloud.google.com)
# Limitar a dominios degux.cl y api.degux.cl solamente

# 6. Reconstruir y reiniciar
cd ~/vps-do
docker compose -f docker-compose.yml -f docker-compose.degux.yml up -d --build degux-web
```

---

## Fase 4: Reconstruccion Segura de degux-web

### 4.1 Rebuild sin cache

```bash
cd ~/vps-do
docker compose -f docker-compose.yml -f docker-compose.degux.yml build --no-cache degux-web
```

### 4.2 Verificar imagen limpia

```bash
# Verificar que no hay binarios sospechosos
docker run --rm --entrypoint sh vps-do-degux-web -c "find / -name '*.kok' -o -name 'udevr' -o -name '.monitor' 2>/dev/null"

# Verificar que wget no esta disponible (Alpine lo incluye por defecto)
docker run --rm --entrypoint sh vps-do-degux-web -c "which wget; which curl"

# Listar procesos despues de arrancar
docker compose -f docker-compose.yml -f docker-compose.degux.yml up -d degux-web
sleep 30
docker exec degux-web ps aux
```

### 4.3 Monitoreo post-deploy

```bash
# Verificar sin conexiones sospechosas (cada 5 min por 1 hora)
watch -n 300 'ss -tnp | grep -v "VPS_IP_REDACTED:22\|127.0.0"'

# Verificar CPU normal
docker stats --no-stream degux-web

# Verificar logs limpios
docker logs -f degux-web
```

---

## Fase 5: Limpieza del Repositorio

### 5.1 Eliminar archivos de Supabase no utilizados

```bash
# En repo local
git rm docker-compose.supabase.yml
rm -rf supabase/  # Si existe directorio de config

# Commit
git add -A
git commit -m "security: remove unused supabase stack (incident remediation)"
```

### 5.2 Actualizar documentacion

- Actualizar CLAUDE.md: eliminar referencias a supabase como servicio activo
- Actualizar PUERTOS_VPS.md: remover puertos supabase
- Actualizar scripts/deploy.sh: remover opcion supabase si existe

---

## Fase 6: Respuesta a DigitalOcean

### Plantilla de respuesta al Ticket #11599402

```
Subject: RE: [Notification Only] Droplet Detected Sending Potentially Malicious Traffic

Hi DigitalOcean Security Team,

Thank you for alerting us about the malicious traffic from our droplet
ubuntu-s-2vcpu-2gb-amd-nyc3-01 (VPS_IP_REDACTED).

We have completed our investigation and remediation:

FINDINGS:
- The compromise was traced to a Docker container (degux-web) running
  a Next.js application, which was exploited to deploy DDoS malware
  (udevr bot, x86_64.kok binaries)
- The vulnerability CVE-2026-21858 (Ni8mare) in our n8n instance was
  the likely initial entry vector
- n8n was already patched to v2.6.3 (above the fix in v1.121.0)
  but the attacker had already established persistence in another container

REMEDIATION COMPLETED:
1. Compromised container stopped and malware eliminated
2. All malware processes killed (udevr, x86_64.kok, .monitor dropper)
3. Container image purged and rebuilt from clean source
4. Port exposure fixed (bound to 127.0.0.1 instead of 0.0.0.0)
5. Container security hardened (read-only fs, no-new-privileges,
   capability dropping)
6. C2 IPs blocked in UFW (77.90.185.76, 205.185.127.97)
7. All exposed credentials rotated
8. Unused privileged host user removed
9. Egress filtering implemented for container networks

MONITORING:
- Active monitoring for unusual outbound traffic
- Container process auditing enabled
- Regular security reviews scheduled

We confirm the malicious traffic has been completely stopped and
the system is secured.

Best regards,
Gabriel Pantoja
```

---

## Fase 7: Prevencion Futura

### 7.1 Hardening general de todos los contenedores

Aplicar a TODOS los servicios en docker-compose:

```yaml
# Template de seguridad para cada servicio
security_opt:
  - no-new-privileges:true
cap_drop:
  - ALL
```

### 7.2 Bind todos los puertos a 127.0.0.1

Revisar TODOS los docker-compose files:

```yaml
# Patron seguro
ports:
  - "127.0.0.1:PORT:PORT"

# NUNCA
ports:
  - "PORT:PORT"  # Expone a 0.0.0.0
```

### 7.3 Implementar monitoreo de procesos

Agregar al cron de mantenimiento semanal:

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

### 7.4 Actualizar n8n regularmente

CVE-2026-21858 fue divulgada 2026-01-07. El parche existia desde n8n 1.121.0 (Nov 2025). Mantener actualizaciones dentro de 7 dias de publicacion de CVEs criticos.

### 7.5 Suscribirse a alertas de seguridad

- n8n: https://github.com/n8n-io/n8n/security/advisories
- Next.js: https://github.com/vercel/next.js/security/advisories
- Node.js: https://nodejs.org/en/blog/vulnerability
- Docker: https://docs.docker.com/engine/security/

---

## Checklist de Verificacion Final

- [ ] Usuario `supabase` eliminado del host
- [ ] IPs C2 bloqueadas en UFW
- [ ] Imagen degux-web purgada y reconstruida
- [ ] docker-compose.supabase.yml eliminado
- [ ] Puerto 3000 bound a 127.0.0.1
- [ ] Security options agregadas a degux-web
- [ ] Health check cambiado a node (sin wget)
- [ ] DEGUX_DB_PASSWORD rotada
- [ ] DEGUX_NEXTAUTH_SECRET rotado
- [ ] Google Client Secret rotado
- [ ] Google Maps API Key restringida
- [ ] N8N_WEBHOOK_SECRET rotado
- [ ] degux-web reconstruido y verificado limpio
- [ ] Monitoreo post-deploy ejecutado (1 hora)
- [ ] Respuesta enviada a DigitalOcean
- [ ] Documentacion actualizada (CLAUDE.md, puertos)
- [ ] Monitoreo de procesos agregado a mantenimiento semanal
