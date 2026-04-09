# 🚀 INICIO RÁPIDO - inmogrid.cl

**⏱️ Tiempo de lectura: 3 minutos**  
**📍 Estás en:** Windows (c:\\Users\\gabri\\Developer\\inmogrid.cl)

---

## 🎯 En 3 Pasos

### ✅ Paso 1: Preparar (1 minuto)
```powershell
# Crear archivo de configuración
Copy-Item .env.local.example .env.local

# Instalar dependencias
npm install

# Generar Prisma
npm run prisma:generate
```

### ✅ Paso 2: Base de Datos (2 minutos)
```powershell
# Iniciar PostgreSQL en Docker
docker compose -f docker/docker-compose.local.yml up -d

# Esperar 10 segundos
Start-Sleep -Seconds 10
```

### ✅ Paso 3: Programar (Inmediato)
```powershell
# Iniciar servidor
npm run dev

# Abrir navegador en http://localhost:3000
```

---

## ✅ Verificar que todo funciona

```powershell
# En otra terminal
npm run lint    # Linting
npm run test    # Tests
```

---

## 📚 Documentación Completa

| Documento | Para qué | Leer |
|-----------|---------|------|
| [SETUP_COMPLETE.md](SETUP_COMPLETE.md) | Estado actual | ⭐ Ahora |
| [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) | Guías detalladas | Próximo |
| [TROUBLESHOOTING_GUIDE.md](TROUBLESHOOTING_GUIDE.md) | Errores | Si falla |
| [TECHNICAL_CHECKLIST.md](TECHNICAL_CHECKLIST.md) | Verificaciones | Si necesitas |
| [VERIFICATION_SUMMARY.md](VERIFICATION_SUMMARY.md) | Resumen visual | Para entender |

---

## 🐧 En Linux (máquina principal)

```bash
# Similar a Windows:
cp .env.local.example .env.local
npm install
npm run prisma:generate

# Iniciar BD
docker compose -f docker/docker-compose.local.yml up -d

# Programar
npm run dev
```

---

## 💡 Tips Importantes

✅ **Base de datos:** Ya está configurada en Docker  
✅ **OAuth Google:** Credenciales en `.env.local.example`  
✅ **Tests:** Corren sin BD si es necesario  
✅ **Sincronización:** Git sincroniza entre Windows y Linux  

---

## ❌ Problemas?

- Error de instalación → [TROUBLESHOOTING_GUIDE.md](TROUBLESHOOTING_GUIDE.md#errores-comunes-de-instalación)
- Error de BD → [TROUBLESHOOTING_GUIDE.md](TROUBLESHOOTING_GUIDE.md#errores-de-base-de-datos)
- Error de testing → [TROUBLESHOOTING_GUIDE.md](TROUBLESHOOTING_GUIDE.md#problemas-de-testing)

---

## 🎉 ¡Listo!

**Todo está configurado. Ahora sí... ¡a programar!** 🚀

```powershell
npm run dev
```

Accede a `http://localhost:3000` en tu navegador.

---

*Para instrucciones detalladas, lee [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)*
