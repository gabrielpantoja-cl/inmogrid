# 📚 Desarrollo & Guías Prácticas

**Carpeta:** `docs/02-desarrollo/`  
**Propósito:** Guías detalladas y prácticas para desarrollo

---

## 📚 Documentos

### [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) 🚀
**Guías paso a paso para Windows y Linux**

Secciones:
- 🪟 Windows - Guía completa (instalación, desarrollo, troubleshooting)
- 🐧 Linux - Guía completa (instalación, desarrollo, troubleshooting)  
- 🔀 Sincronización Windows ↔ Linux
- 📊 Configuración OAuth Google
- ✅ Checklist final

**Cuándo leer:** Cuando vayas a empezar a programar  
**Tiempo:** 20 minutos

---

### [TROUBLESHOOTING_GUIDE.md](TROUBLESHOOTING_GUIDE.md) 🆘
**Guía de solución de problemas comunes**

Secciones:
1. Problemas de instalación
2. Errores de base de datos
3. Errores de autenticación
4. Problemas de testing
5. Errores de build
6. Problemas de Docker
7. Errores de performance
8. Diferencias Windows/Linux
9. Scripts de recuperación

**Cuándo leer:** Cuando encuentres un error  
**Tiempo:** Variable (búsqueda puntual)

---

### [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) 📑
**Índice completo de documentación**

Incluye:
- Rutas de lectura según necesidad
- Cuándo leer cada documento
- Links a toda la documentación
- Soporte rápido por tema

**Cuándo leer:** Para entender dónde están las respuestas

---

## 🎯 Flujo de Lectura

### Nuevo en el proyecto
```
1. ../00-setup/START_HERE.md (3 min)
2. ../00-setup/SETUP_COMPLETE.md (5 min)
3. QUICK_START_GUIDE.md - Sección de tu SO (10 min)
4. ¡Programar!
```

### Tengo un error
```
1. TROUBLESHOOTING_GUIDE.md (buscar tu error)
2. Seguir la solución
```

### Quiero documentación completa
```
1. DOCUMENTATION_INDEX.md (índice)
2. ../04-verificacion/TECHNICAL_CHECKLIST.md (detalles técnicos)
3. ../04-verificacion/SETUP_VERIFICATION_REPORT.md (reporte)
```

---

## ✅ Scripts Útiles

```powershell
# Development
npm run dev              # Servidor Next.js
npm run build            # Build producción
npm run lint             # ESLint

# Testing  
npm run test             # Jest tests
npm run test:watch       # Watch mode
npm run test:e2e         # Playwright E2E

# Database
npm run prisma:studio    # Gestor visual
docker compose -f docker/docker-compose.local.yml up -d  # Iniciar BD
```

---

## 📱 Características

✅ Next.js 15 + React 19  
✅ TypeScript strict mode  
✅ PostgreSQL + PostGIS  
✅ NextAuth OAuth2  
✅ Jest + Playwright E2E  
✅ Docker ready  
✅ Tailwind CSS  
✅ Cross-platform

---

*Ver [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) para índice completo*
