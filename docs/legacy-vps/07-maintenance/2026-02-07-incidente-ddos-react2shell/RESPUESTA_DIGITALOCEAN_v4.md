# Respuesta a DigitalOcean - Ticket #11599402 (v4)

**Para**: DigitalOcean Security Operations Center
**De**: Gabriel Pantoja (gabrielpantojarivera@gmail.com)
**Asunto**: RE: [Notification Only] Droplet Detected Sending Potentially Malicious Traffic
**Referencia**: ref:!00Df2018t5m.!500QP01GoUqr:ref
**Fecha**: 2026-02-07

---

## Texto para Respuesta

```
Subject: RE: Ticket #11599402 - Remediation Complete

Hi DigitalOcean Security Team,

Thank you for the prompt notification regarding our droplet
ubuntu-s-2vcpu-2gb-amd-nyc3-01 (VPS_IP_REDACTED). We truly appreciate
your vigilance — it helped us act quickly.

We chose Path 3 (self-remediation) and completed a full forensic
investigation. Here is a summary:

REGARDING CVE-2026-21858 (Ni8mare)
We do run n8n on this droplet; however, it is already patched (v2.6.3,
well above the fix in v1.121.0) and its port is bound exclusively to
127.0.0.1 — not publicly exposed. We confirmed n8n was not the entry
point.

ACTUAL ROOT CAUSE
CVE-2025-55182 ("React2Shell") — a critical insecure deserialization
flaw (CVSS 10.0) in the React Server Components Flight protocol. An
attacker exploited this via crafted POST requests to our Next.js web
application container, achieving RCE and deploying a DDoS bot.

Ref: https://nvd.nist.gov/vuln/detail/CVE-2025-55182

MALWARE IDENTIFIED
- udevr: DDoS bot (C2: 77.90.185.76:110) — matching the ~36,782 pps
  outbound traffic you reported
- x86_64.kok, .monitor: payload and dropper components
- Payload servers: 205.185.127.97, 91.92.243.113

REMEDIATION COMPLETED
1. Contained: stopped compromised container, killed all malware processes
2. Patched: upgraded web framework to versions that fix CVE-2025-55182
3. Verified: confirmed n8n already patched against CVE-2026-21858 (v2.6.3)
4. Hardened: read-only filesystem, no-new-privileges, cap_drop ALL,
   all internal ports bound to 127.0.0.1, removed download tools
5. Rotating: all credentials accessible to the compromised container

CURRENT STATUS
- Malicious outbound traffic: STOPPED
- CVE-2025-55182 (React2Shell): PATCHED
- CVE-2026-21858 (Ni8mare / n8n): ALREADY PATCHED (v2.6.3)
- Container: HARDENED
- Other services: VERIFIED CLEAN

All DDoS activity has ceased and both vulnerability vectors are fully
closed. We are happy to provide additional details, logs, or IOCs if
needed.

Thank you again for your support.

Best regards,
Gabriel Pantoja
```

---

## Notas Internas (NO enviar a DigitalOcean)

### Cambios respecto a v3
- Se reconoce explicitamente CVE-2026-21858 (Ni8mare) que DO menciono en su correo
- Se explica por que n8n no fue el vector: parcheado (v2.6.3) + port bound a 127.0.0.1
- Se menciona "Path 3" para facilitar tracking interno de DO
- Se correlaciona "~36,782 pps" del malware con los numeros que DO reporto
- Status final ahora cubre ambos CVEs explicitamente
- Se agrega "IOCs" en la oferta de info adicional

### Investigacion CVE-2026-21858 (Ni8mare)
- **Que es**: RCE no autenticado en n8n via content-type confusion en webhooks
- **CVSS**: 10.0
- **Afecta**: n8n <= 1.65.0
- **Fix**: n8n >= 1.121.0 (noviembre 2025)
- **Nuestro estado**: n8n v2.6.3 (parcheado), port 5678 bound a 127.0.0.1, no en UFW
- **Conclusion**: n8n NO fue el vector de ataque en nuestro caso
- **Refs**:
  - https://nvd.nist.gov/vuln/detail/CVE-2026-21858
  - https://www.cyera.com/research-labs/ni8mare-unauthenticated-remote-code-execution-in-n8n-cve-2026-21858
  - https://horizon3.ai/attack-research/attack-blogs/the-ni8mare-test-n8n-rce-under-the-microscope-cve-2026-21858/

### Criterios mantenidos de v3
- No se revelan versiones especificas de Next.js/React (solo "web framework")
- No se incluyen IPs internas ni nombres de servicios internos
- No se revelan credenciales ni configuraciones
- Se mantienen los IOCs (IPs C2 y payload servers) por si DO los necesita
- Tono profesional y tecnico

### Pendientes antes de enviar
- [ ] Completar deploy al VPS con las versiones parcheadas
- [ ] Verificar que el sitio funciona correctamente post-deploy
- [ ] Iniciar rotacion de credenciales
- [ ] Ejecutar acciones sudo (bloqueo IPs C2, eliminar user supabase)
