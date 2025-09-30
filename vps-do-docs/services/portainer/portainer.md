# Problema de Timeout de Seguridad en Portainer

**Fecha del incidente:** 13 de septiembre de 2025
**Estado:** Resuelto

## Descripción del Problema

Portainer se volvió inaccesible a través de https://VPS_IP_REDACTED:9443 sin intervención manual previa. El problema fue identificado como un "security timeout" automático de Portainer.

## Síntomas Observados

1. **URL inaccesible:** https://VPS_IP_REDACTED:9443 devolvía "Conexión rehusada"
2. **Contenedor aparentemente corriendo:** `docker ps` mostraba el contenedor como "Up"
3. **Logs revelaban el problema:** Múltiples mensajes de timeout por seguridad

## Análisis de Logs

Los logs de Portainer mostraron repetidamente este mensaje crítico:

```
[90m2025/XX/XX XX:XXPM[0m [32mINF[0m [1mgithub.com/portainer/portainer/api/adminmonitor/admin_monitor.go:62[0m[36m >[0m the Portainer instance timed out for security purposes, to re-enable your Portainer instance, you will need to restart Portainer |
```

## Causa Raíz: Mecanismo de Seguridad de Portainer

Portainer tiene un mecanismo de seguridad automático llamado **Admin Monitor** que:

- **Monitorea actividad de administrador:** Si no hay actividad de un usuario administrador durante un período específico (típicamente 5 minutos)
- **Bloquea automáticamente el acceso:** Por razones de seguridad, especialmente en instancias sin configuración de autenticación robusta
- **Requiere reinicio manual:** El único método para reactivar el acceso es reiniciar el contenedor

## Resolución Aplicada

```bash
# En el VPS
cd /home/gabriel/vps-do
docker compose up -d portainer
```

**Resultado:** Acceso restaurado inmediatamente en https://VPS_IP_REDACTED:9443

## Por Qué Pasó Sin Intervención Manual

Este es un comportamiento **normal y esperado** de Portainer cuando:

1. **No hay sesión administrativa activa** durante el período de timeout (≈5 minutos)
2. **El contenedor sigue técnicamente "corriendo"** pero el servicio web se auto-bloquea
3. **Es una medida de seguridad preventiva** contra acceso no autorizado

## Medidas Preventivas Recomendadas

### Opción 1: Configurar Autenticación Robusta
```yaml
# En docker-compose.yml, agregar variables de entorno:
environment:
  - PORTAINER_ADMIN_PASSWORD_FILE=/run/secrets/portainer_admin_password
secrets:
  portainer_admin_password:
    file: ./portainer_admin_password.txt
```

### Opción 2: Ajustar Configuración de Timeout
```yaml
# Aumentar el tiempo de timeout (no recomendado para seguridad)
command: --admin-password-file /tmp/portainer_password --session-timeout 30m
```

### Opción 3: Monitoreo Automático
Crear script de monitoreo que verifique periódicamente si Portainer responde:

```bash
#!/bin/bash
# Script: check-portainer.sh
if ! curl -k -s https://localhost:9443 > /dev/null; then
    cd /home/gabriel/vps-do && docker compose restart portainer
    echo "$(date): Portainer restarted due to timeout" >> /var/log/portainer-monitor.log
fi
```

## Frecuencia Esperada

- **Normal:** Cada vez que no hay actividad de administrador por >5 minutos
- **Más frecuente si:** La instancia no tiene autenticación configurada adecuadamente
- **Menos frecuente si:** Hay actividad administrativa regular o sesiones persistentes configuradas

## Comando de Diagnóstico Rápido

Para verificar si Portainer está en timeout de seguridad:
```bash
docker logs portainer | grep -i "timed out for security purposes"
```

## Referencias

- [Documentación oficial de Portainer sobre Admin Monitor](https://docs.portainer.io/)
- Código fuente: `github.com/portainer/portainer/api/adminmonitor/admin_monitor.go:62`

---
**Nota:** Este comportamiento es una característica de seguridad, no un bug. Es importante entenderlo para evitar confusión en el futuro.