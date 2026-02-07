# Respuesta a DigitalOcean - Ticket #11599402 (Version Final v5)

**Fecha**: 2026-02-07
**Estado**: LISTA PARA ENVIAR

---

```
Subject: RE: Ticket #11599402 - Remediation Complete

Hi DigitalOcean Security Team,

Thank you for the prompt notification regarding our droplet
ubuntu-s-2vcpu-2gb-amd-nyc3-01 (VPS_IP_REDACTED). We truly appreciate
your vigilance — it helped us act quickly.

We chose Path 3 (self-remediation) and completed a full forensic
investigation. Here is a summary:

REGARDING CVE-2026-21858 (Ni8mare)
We do run n8n on this droplet; however, it is already on version 2.6.3,
well above the fix in v1.121.0 (affected range: 1.65.0–1.120.4). Its
port is bound exclusively to 127.0.0.1 behind our reverse proxy — not
publicly exposed. We confirmed n8n was not the entry point.

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
2. Patched: upgraded Next.js to 15.5.10 and React to 19.2.3
   (versions that fix CVE-2025-55182)
3. Verified: confirmed n8n already patched against CVE-2026-21858
   (running v2.6.3, fix was v1.121.0)
4. Hardened: read-only filesystem, tmpfs with noexec, no-new-privileges,
   cap_drop ALL, all internal ports bound to 127.0.0.1, download tools
   removed from container image
5. Rotating: all credentials that were accessible to the compromised
   container (database, auth secrets, API keys)

CURRENT STATUS
- Malicious outbound traffic: STOPPED
- CVE-2025-55182 (React2Shell): PATCHED
- CVE-2026-21858 (Ni8mare / n8n): ALREADY PATCHED (v2.6.3)
- Container: HARDENED (read-only fs, noexec tmpfs, no-new-privileges)
- Other services: VERIFIED CLEAN

All DDoS activity has ceased and both vulnerability vectors are fully
closed. We are happy to provide additional details, logs, or IOCs if
needed.

Thank you again for your support.

Best regards,
Gabriel Pantoja
```

---

## Cambios desde v4

1. Agregado rango exacto de versiones afectadas de Ni8mare: "1.65.0–1.120.4"
2. Versiones especificas del parche: "Next.js to 15.5.10 and React to 19.2.3"
3. Agregado "tmpfs with noexec" en hardening (fue clave en la neutralizacion)
4. Resumen de hardening en CURRENT STATUS mas detallado
5. Credential rotation: clarificado que incluye "database, auth secrets, API keys"

## Fuentes de Verificacion

- CVE-2026-21858 fix version: [n8n Community Advisory](https://community.n8n.io/t/security-advisory-security-vulnerability-in-n8n-versions-1-65-1-120-4/247305)
- CVE-2026-21858 NVD: [NVD Detail](https://nvd.nist.gov/vuln/detail/CVE-2026-21858)
- n8n version en VPS: verificado via `docker exec n8n n8n --version` = 2.6.3
- n8n port binding: verificado via `docker inspect` = 127.0.0.1:5678
- Malware status: verificado via `ps aux` = no malware processes
- Outbound traffic: verificado via `ss -tunp` = solo SSH (clean)
