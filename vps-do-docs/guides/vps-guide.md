# Guía Unificada de Administración de VPS

**Versión:** 1.0
**Fecha:** 2025-08-18

Este documento es la guía central y única para la administración, despliegue y mantenimiento del VPS. Consolida toda la información de auditorías, mejores prácticas, arquitectura y guías de herramientas.

---

## Tabla de Contenidos

1.  [**Filosofía y Estrategia**](#1-filosofía-y-estrategia)
    *   [Infraestructura Sostenible y Reproducible](#infraestructura-sostenible-y-reproducible)
    *   [Valores Fundamentales](#valores-fundamentales)
2.  [**Estado Inicial y Plan de Acción (Auditoría)**](#2-estado-inicial-y-plan-de-acción-auditoría)
    *   [Resumen de la Auditoría](#resumen-de-la-auditoría)
    *   [Plan de Renovación Consciente](#plan-de-renovación-consciente)
3.  [**Gestión de Servicios Core**](#3-gestión-de-servicios-core)
    *   [Portainer: Interfaz Gráfica de Docker](#portainer-interfaz-gráfica-de-docker)
    *   [Nginx: Proxy Inverso y Troubleshooting](#nginx-proxy-inverso-y-troubleshooting)
4.  [**Arquitectura de Repositorios y Aplicaciones**](#4-arquitectura-de-repositorios-y-aplicaciones)
    *   [Separación de Responsabilidades](#separación-de-responsabilidades)
    *   [Flujo de Integración](#flujo-de-integración)
    *   [Deploy de Landing Page de Luanti (Vegan-Wetlands)](#deploy-de-landing-page-de-luanti-vegan-wetlands)
5.  [**Flujo de Despliegue de Aplicaciones**](#5-flujo-de-despliegue-de-aplicaciones)
    *   [Paso 1: El Repositorio de la Aplicación](#paso-1-el-repositorio-de-la-aplicación)
    *   [Paso 2: El Registro de Imágenes (GHCR)](#paso-2-el-registro-de-imágenes-ghcr)
    *   [Paso 3: Automatización con GitHub Actions](#paso-3-automatización-con-github-actions)
    *   [Paso 4: Despliegue en el VPS con `vps-do`](#paso-4-despliegue-en-el-vps-con-vps-do)
6.  [**Arquitectura de Bases de Datos**](#6-arquitectura-de-bases-de-datos)
    *   [Estrategia Recomendada: Múltiples Instancias Supabase](#estrategia-recomendada-múltiples-instancias-supabase)
    *   [Implementación y Plan de Migración](#implementación-y-plan-de-migración)
7.  [**Mantenimiento y Seguridad**](#7-mantenimiento-y-seguridad)
    *   [Actualizaciones](#actualizaciones)
    *   [Seguridad Esencial](#seguridad-esencial)
    *   [Backups](#backups)

---

## 1. Filosofía y Estrategia

### Infraestructura Sostenible y Reproducible

La regla de oro es tratar a nuestros servidores como **sistemas modulares y reproducibles**. El objetivo es poder recrear toda la infraestructura desde cero de forma rápida y automática.

**Tu repositorio de GitHub (`vps-do`) es el "ADN digital" de tu infraestructura.** Todo cambio, configuración o despliegue debe realizarse a través de este repositorio para garantizar la trazabilidad y la reproducibilidad.

### Valores Fundamentales
*   **Sostenibilidad Tecnológica:** Eficiencia de recursos, longevidad y reproducibilidad.
*   **Transparencia y Documentación:** Código como documentación, trazabilidad y accesibilidad.
*   **Responsabilidad Digital:** Seguridad por diseño, minimización de superficie de ataque y gestión consciente de datos.
*   **Colaboración Ética:** Priorizar herramientas libres y compartir conocimiento.

---

## 2. Estado Inicial y Plan de Acción (Auditoría)

### Resumen de la Auditoría (Basado en 2025-08-11)
El estado inicial del servidor mostró una oportunidad de mejora, con múltiples proyectos desplegados sin una gestión centralizada y varios contenedores en estado de reinicio (`Restarting`) o no saludables (`unhealthy`). Esto subrayó la necesidad de una infraestructura gestionada como código.

### Plan de Renovación Consciente
Para establecer una base sólida, se sigue este proceso:
1.  **Inventario responsable:** Identificar y respaldar datos valiosos de los volúmenes existentes.
2.  **Migración ordenada:** Parar los servicios de forma controlada para evitar pérdida de datos.
3.  **Limpieza consciente:** Remover contenedores y volúmenes obsoletos o no utilizados para liberar recursos.

---

## 3. Gestión de Servicios Core

### Portainer: Interfaz Gráfica de Docker

Portainer es un panel de control web para gestionar Docker. Nos proporciona visibilidad y control sobre contenedores, logs, uso de recursos y redes.

*   **Acceso:** `https://VPS_IP_REDACTED:9443`
*   **Instalación:** Portainer se gestiona a través del `docker-compose.yml` principal en este repositorio.
*   **Troubleshooting:**
    *   **Problema:** No se puede crear el usuario administrador.
    *   **Causa:** Existe un volumen de datos antiguo (`portainer_data`).
    *   **Solución:** Parar y eliminar el contenedor de Portainer, eliminar el volumen `docker volume rm portainer_data`, y volver a desplegarlo.
    *   **Problema:** No se puede acceder a la interfaz.
    *   **Solución:** Verificar que el contenedor esté corriendo (`docker ps -a`), que el firewall (UFW) permita el puerto 9443 (`sudo ufw status`), y revisar los logs (`docker logs portainer`).

### Nginx: Proxy Inverso y Troubleshooting

Nginx actúa como el único punto de entrada (proxy inverso) para todo el tráfico web, dirigiendo las peticiones al contenedor correcto.

*   **Configuración:** Los archivos de configuración se encuentran en el directorio `nginx/` de este repositorio.
*   **Configuración Actual de Rutas:**
    *   **`/`** → `vegan-wetlands:3000` (Landing page del servidor Luanti)
    *   **`N8N_HOST_REDACTED`** → `n8n:5678` (Automatización de workflows)
*   **Servicios Independientes:**
    *   **Portainer:** Acceso directo en `https://VPS_IP_REDACTED:9443` (no a través de Nginx)
*   **Troubleshooting (Basado en incidente de 2025-08-11):**
    *   **Problema:** El contenedor de Nginx entraba en un bucle de reinicios.
    *   **Causa:** La configuración intentaba cargar certificados SSL (`fullchain.pem`) para una dirección IP, lo cual no es posible. Let's Encrypt solo emite certificados para nombres de dominio.
    *   **Solución:** Se eliminó temporalmente el bloque de servidor HTTPS del archivo `nginx.conf` para permitir que el contenedor se inicie correctamente en HTTP (puerto 80).
    *   **Plan a Largo Plazo:** Para habilitar HTTPS, es necesario usar un nombre de dominio apuntando a la IP del servidor y luego generar los certificados SSL correspondientes.

---

## 4. Arquitectura de Repositorios y Aplicaciones

### Separación de Responsabilidades

La infraestructura sigue un patrón claro de separación de responsabilidades entre repositorios:

#### **[vps-do](https://github.com/gabrielpantoja-cl/vps-do.git)** (este repositorio)
- **Propósito:** Infraestructura y configuración del VPS
- **Responsabilidades:**
  - Configuración de Nginx (reverse proxy)
  - Docker Compose para servicios base (Portainer, Nginx, Certbot)
  - Configuración de red y volúmenes
  - Documentación de infraestructura
  - Gestión de certificados SSL

#### **[Vegan-Wetlands](https://github.com/gabrielpantoja-cl/Vegan-Wetlands.git)**
- **Propósito:** Aplicación completa del servidor Luanti
- **Responsabilidades:**
  - Servidor Luanti 24/7 con mods personalizados (puerto 30000)
  - Landing page web del servidor Luanti (puerto 3000)
  - Configuración específica del juego
  - Mods y contenido personalizado

### Flujo de Integración

1. **Vegan-Wetlands** ejecuta como aplicación independiente
2. **vps-do** (Nginx) hace proxy hacia Vegan-Wetlands para servir la landing page
3. Ambos repositorios se mantienen separados pero se integran en el VPS

### Deploy de Landing Page de Luanti (Vegan-Wetlands)

#### Prerrequisitos
- **Nginx configurado** para hacer proxy a `vegan-wetlands:3000` en la ruta raíz `/`
- **Docker network** `vps_network` creado y funcional
- **Repositorio Vegan-Wetlands** listo con servidor Luanti + landing page

#### Pasos para el Deploy

1. **Conectar al VPS:**
   ```bash
   ssh gabriel@VPS_IP_REDACTED
   ```

2. **Actualizar configuración de infraestructura:**
   ```bash
   cd ~/vps-do
   git pull
   docker compose up -d --force-recreate nginx
   ```

3. **Clonar y configurar Vegan-Wetlands:**
   ```bash
   cd ~
   git clone https://github.com/gabrielpantoja-cl/Vegan-Wetlands.git
   cd Vegan-Wetlands
   # Configurar variables de entorno según sea necesario
   ```

4. **Desplegar la aplicación:**
   ```bash
   # El contenedor debe usar el nombre "vegan-wetlands" y conectarse a la red "vps_network"
   docker compose up -d
   ```

5. **Verificar funcionamiento:**
   ```bash
   # Verificar que el contenedor esté corriendo
   docker ps | grep vegan-wetlands
   
   # Probar la conectividad interna
   docker exec nginx-proxy nslookup vegan-wetlands
   
   # Testear la landing page
   curl -I http://VPS_IP_REDACTED
   ```

#### Troubleshooting

- **Problema:** Nginx no puede resolver `vegan-wetlands`
  - **Solución:** Verificar que el contenedor esté en la red `vps_network`
- **Problema:** Error 502 Bad Gateway
  - **Solución:** Verificar que la aplicación esté corriendo en el puerto 3000
- **Problema:** Puerto ocupado
  - **Solución:** Verificar conflictos de puertos con `docker ps` y `netstat -tlnp`

---

## 5. Flujo de Despliegue de Aplicaciones

Este es el proceso estándar y ético para desplegar cualquier aplicación.

### Paso 1: El Repositorio de la Aplicación
*   **Responsabilidad:** Contiene únicamente el código fuente de la aplicación.
*   **Requisito Clave:** Debe incluir un `Dockerfile`.

### Paso 2: El Registro de Imágenes (GHCR)
*   **Concepto:** Un "almacén" para las imágenes de Docker listas para usar.
*   **Recomendación:** Usar **GitHub Container Registry (GHCR)** por su integración nativa.

### Paso 3: Automatización con GitHub Actions
*   **Objetivo:** Automatizar la creación y publicación de la imagen de Docker en GHCR cada vez que se actualiza el código (`git push`).
*   **Implementación:** A través de un workflow de GitHub Actions (`.github/workflows/build-and-push.yml`) en el repositorio de la aplicación.

### Paso 4: Despliegue en el VPS con `vps-do`
1.  **Definir el servicio:** Crea un archivo `docker-compose.<proyecto>.yml` en este repositorio, apuntando a la imagen en GHCR.
2.  **Configurar la ruta en Nginx:** Añade una nueva sección `location` en la configuración de Nginx para dirigir el tráfico al nuevo servicio.
3.  **Desplegar:**
    *   Conéctate al VPS: `ssh gabriel@<IP_DEL_SERVIDOR>`
    *   Navega al repositorio: `cd /ruta/a/vps-do`
    *   Actualiza la configuración: `git pull`
    *   Descarga la nueva imagen de la app: `docker compose pull <nombre-servicio>`
    *   Lanza el entorno actualizado: `docker compose -f docker-compose.yml -f docker-compose.<proyecto>.yml up -d`

---

## 5. Arquitectura de Bases de Datos

### Estrategia Recomendada: Múltiples Instancias Supabase
Para garantizar el aislamiento, la seguridad y la escalabilidad, la arquitectura recomendada es desplegar **una instancia de Supabase dedicada para cada proyecto** en el VPS.

*   **Ventajas:** URLs y dashboards independientes, mejor aislamiento.
*   **Desventajas:** Mayor consumo de recursos (~500MB de RAM por instancia).
*   **Requisito:** Se recomienda un VPS con al menos 4GB de RAM para alojar ~4 proyectos con esta arquitectura.

### Implementación y Plan de Migración
*   **Estructura:** Cada instancia de Supabase se define en su propio archivo `docker-compose.supabase-<proyecto>.yml`.
*   **Acceso:** Nginx se configura para exponer cada dashboard de Supabase en una ruta dedicada (ej: `/supabase/<proyecto>/`).
*   **Plan de Migración:**
    1.  **Fase 1:** Migrar `referenciales.cl` (desde Neon) a su propia instancia Supabase en el VPS.
    2.  **Fase 2:** Configurar `pitutito.cl` con su nueva instancia Supabase.
    3.  **Fase 3:** Evaluar la migración de los proyectos en Supabase Cloud para consolidar la infraestructura.

---

## 7. Mantenimiento y Seguridad

### Actualizaciones
*   **Sistema Operativo:** Ejecutar `sudo apt update && sudo apt upgrade -y` semanalmente.
*   **Aplicaciones:** Para actualizar un servicio, descarga la nueva imagen (`docker compose pull <servicio>`) y relanza el stack de compose.

### Seguridad Esencial
*   **Acceso SSH:** Utilizar únicamente autenticación por clave SSH, deshabilitando el login con contraseña.
*   **Firewall (UFW):** Mantener una política de "denegar por defecto" y permitir únicamente los puertos necesarios (22 para SSH, 80 para HTTP, 443 para HTTPS).
*   **Gestión de Secretos:** **NUNCA** guardar contraseñas, tokens o claves de API en el repositorio de Git. Utilizar archivos `.env` locales en el servidor (incluidos en `.gitignore`) y proporcionar plantillas de ejemplo (`.env.example`) en el repositorio.

### Backups
*   **Qué respaldar:** Los volúmenes de Docker que contienen datos persistentes (ej: `supabase_db-config`, etc.).
*   **Estrategia:** Implementar un script de `cron` que se ejecute diariamente para comprimir los volúmenes y, opcionalmente, subirlos a un almacenamiento externo (como S3, Backblaze B2, etc.).

### Monitoreo (Opcional)
Para una administración avanzada y el mantenimiento de la salud del servidor, el stack incluye servicios de monitoreo con Prometheus y Grafana. Su configuración es opcional pero altamente recomendada para entornos de producción.

*   **Prometheus**: Es el sistema de recolección de métricas. Se encarga de registrar datos como el uso de CPU, memoria, actividad de red y métricas específicas de las aplicaciones a lo largo del tiempo. La configuración de la retención de estos datos se maneja con la variable `PROMETHEUS_RETENTION` en el archivo `.env`.

*   **Grafana**: Es la plataforma de visualización. Se conecta a Prometheus para mostrar los datos en forma de gráficos y paneles (dashboards) interactivos. Esto te permite observar el rendimiento, diagnosticar problemas y entender cómo se comportan tus servicios. La contraseña para el usuario `admin` de Grafana se establece con la variable `GRAFANA_ADMIN_PASSWORD` en el archivo `.env`.

Para activar el monitoreo, simplemente descomenta y asigna valores a estas variables en tu archivo `.env` y despliega los servicios correspondientes definidos en el `docker-compose.yml` principal.