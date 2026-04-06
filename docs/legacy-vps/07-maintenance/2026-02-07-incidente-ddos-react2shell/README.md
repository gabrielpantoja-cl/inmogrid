# Incidente de Seguridad: DDoS via React2Shell (CVE-2025-55182)

**Fecha**: 2026-02-07
**Severidad**: CRITICA (CVSS 10.0)
**Ticket DigitalOcean**: #11599402
**Estado**: Parcheado localmente, pendiente deploy a produccion

---

## Resumen

El servidor de produccion de degux.cl fue comprometido mediante
CVE-2025-55182 ("React2Shell"), una vulnerabilidad de deserializacion
insegura en el protocolo Flight de React Server Components. El atacante
ejecuto codigo arbitrario via POST requests al endpoint raiz, instalando
un bot DDoS que genero trafico malicioso saliente.

## Causa Raiz

| Campo | Valor |
|-------|-------|
| CVE | CVE-2025-55182 / CVE-2025-66478 |
| Nombre | React2Shell |
| CVSS | 10.0 (Critica) |
| Tipo | Remote Code Execution (pre-auth) |
| Vector | POST / con payload crafteado (protocolo Flight) |
| Versiones afectadas | Next.js 15.5.6, React 19.2.0 |
| Versiones parcheadas | Next.js 15.5.10, React 19.2.3 |

## Documentos en esta carpeta

| Archivo | Descripcion |
|---------|-------------|
| `REPORTE_SEGURIDAD.md` | Reporte tecnico completo del incidente |
| `PLAN_REMEDIACION_v1.md` | Plan de remediacion inicial |
| `PLAN_REMEDIACION_v1.2.md` | Plan actualizado con causa raiz confirmada y parches aplicados |
| `RESPUESTA_DIGITALOCEAN_v1.md` | Borrador inicial de respuesta al ticket DO |
| `RESPUESTA_DIGITALOCEAN_v2.md` | Respuesta final con CVE identificada (usar esta) |

## Referencias externas

- [React - Critical Security Vulnerability in RSC](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- [NVD - CVE-2025-55182](https://nvd.nist.gov/vuln/detail/CVE-2025-55182)
- [Next.js - Security Advisory CVE-2025-66478](https://nextjs.org/blog/CVE-2025-66478)
- [Unit42 - Exploitation Analysis](https://unit42.paloaltonetworks.com/cve-2025-55182-react-and-cve-2025-66478-next/)
- [Wiz - React2Shell](https://www.wiz.io/blog/critical-vulnerability-in-react-cve-2025-55182)
