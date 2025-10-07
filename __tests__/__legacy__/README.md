# 📦 Tests Legacy - Archivados

Este directorio contiene tests obsoletos que han sido movidos desde la raíz de `__tests__/`.

## ⚠️ Archivos Legacy

### Tests de Referenciales (Obsoletos)
- `referenciales-page.test.tsx` - Test de página de referenciales
- `actions.create-referencial.test.ts` - Test de action para crear referenciales

**Razón**: El proyecto degux.cl evolucionó desde "referenciales.cl" y estos tests ya no aplican.

### Tests de SignOut (Obsoletos)
- `useSignOut.test.tsx` - Test del hook useSignOut

**Razón**: Funcionalidad refactorizada en componentes más modernos.

## 🎯 Tests Actuales

Los tests activos están en:
- `__tests__/auth/` - Tests de autenticación (OAuth, NextAuth)
- `__tests__/api/public/` - Tests de API pública
- `__tests__/lib/validation.test.ts` - Tests de validación

## 🗑️ Limpieza Futura

Estos archivos pueden ser eliminados permanentemente después de:
1. Verificar que no haya funcionalidad dependiente
2. Confirmar que los tests nuevos cubren casos similares
3. Revisión del equipo

---

**Archivado**: 2025-10-06
**Proyecto**: degux.cl