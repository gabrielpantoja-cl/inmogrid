# Respuesta a DigitalOcean - Ticket #11599402

**Para**: DigitalOcean Security Operations Center
**De**: Gabriel Pantoja (gabrielpantojarivera@gmail.com)
**Asunto**: RE: [Notification Only] Droplet Detected Sending Potentially Malicious Traffic
**Referencia**: ref:!00Df2018t5m.!500QP01GoUqr:ref
**Fecha**: 2026-02-07

---

## Texto Sugerido para Respuesta

```
Subject: RE: Ticket #11599402 - Remediation Complete

Hi DigitalOcean Security Team,

Thank you for the notification about malicious traffic originating from
our droplet ubuntu-s-2vcpu-2gb-amd-nyc3-01 (VPS_IP_REDACTED).

We have conducted a thorough investigation and implemented comprehensive
remediation measures. Below is our detailed response.

## Investigation Findings

The compromise was traced to a Docker container running a Next.js web
application (degux-web). The attack exploited a Server-Side code execution
vulnerability triggered by specially crafted POST requests to the root
endpoint, allowing the attacker to download and execute DDoS malware.

### Malware Identified
- `udevr`: DDoS bot connecting to C2 at 77.90.185.76:110
  (consumed 80% CPU, 1.9GB RAM, generated 36,782 pps)
- `/x86_64.kok`: Malicious binary (multiple instances)
- `.monitor`: Initial dropper component
- Multiple `udhcpc` fake processes masking malware activity

### Command & Control / Payload Servers
- 77.90.185.76:110 (C2 server for DDoS coordination)
- 205.185.127.97:80 (malware payload delivery)
- 91.92.243.113:235 (secondary payload delivery, discovered during
  live attack monitoring)

### Attack Vector
The attacker sent POST requests through our Nginx reverse proxy to the
Next.js application, exploiting a server-side code execution vulnerability.
The malware was downloaded via `node` HTTP requests and executed within
the container.

## Remediation Actions Completed

### Immediate Response (within 2 hours of notification)
1. Identified and stopped the compromised container
2. Killed all malicious processes (udevr, x86_64.kok, .monitor)
3. Verified all other containers are clean
4. Confirmed DDoS traffic has completely ceased

### Infrastructure Hardening
5. Bound ALL application ports to 127.0.0.1 (previously 0.0.0.0)
   - Port 3000 (Next.js): now 127.0.0.1 only
   - Port 5678 (n8n): now 127.0.0.1 only
   - Port 3002 (API backend): now 127.0.0.1 only
6. Added `security_opt: no-new-privileges` to all containers
7. Added `cap_drop: ALL` to all containers
8. Made the vulnerable container's filesystem read-only
   (`read_only: true` + tmpfs with noexec,nosuid)
9. Replaced wget-based health checks with native node checks
   (removing potential download tools from containers)

### Access Control
10. Identified and scheduled removal of an unused system user with
    elevated privileges (sudo + docker groups)
11. Removed unused Docker Compose stack (Supabase, never deployed)
12. Purged compromised container image and Docker build cache

### Monitoring
13. Implemented container process auditing (detecting anomalous
    processes like wget, curl, udhcpc within containers)
14. Added outbound connection monitoring for suspicious traffic
15. Created security incident documentation and IP blocklist

### Pending (scheduled for immediate execution)
16. UFW rules to block C2/payload IPs (77.90.185.76, 205.185.127.97,
    91.92.243.113)
17. Rotation of all credentials that were accessible within the
    compromised container
18. Investigation and patching of the Next.js server-side vulnerability

## Verification

After implementing the read-only filesystem mitigation, we observed the
attacker's automated exploit still attempting to compromise the container
via POST requests. The exploit chain was captured in real-time:

  POST / -> Server-side code execution -> shell spawn ->
  node HTTP download from 91.92.243.113:235/x86_64.kok ->
  writeFileSync FAILS (read-only filesystem) ->
  exec FAILS (cannot write binary)

Container CPU dropped from 103% (during active malware) to 0.09%
(exploit attempts failing harmlessly).

## Current Status

- All DDoS traffic: STOPPED
- All malware processes: ELIMINATED
- Vulnerable container: HARDENED (read-only, no-new-privileges)
- Other containers: VERIFIED CLEAN
- Monitoring: ACTIVE

We confirm the malicious traffic has been completely stopped and the
system is secured against the observed attack vector.

Best regards,
Gabriel Pantoja
```

---

## Notas Internas (NO enviar a DigitalOcean)

- No mencionar versiones especificas de software para evitar revelar informacion que facilite futuros ataques
- No incluir IPs internas ni configuraciones de red
- El texto esta redactado para demostrar que tomamos el incidente en serio y actuamos rapidamente
- Si DigitalOcean pide mas detalles, podemos compartir los reportes tecnicos
- Mantener el ticket abierto hasta completar la rotacion de credenciales y parche de Next.js
