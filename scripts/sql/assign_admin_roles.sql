-- ============================================================================
-- SCRIPT PARA ASIGNAR ROLES DE ADMIN EN NEON DATABASE
-- Ejecutar directamente en Neon Console o CLI
-- ============================================================================

-- 1. Actualizar usuarios existentes a rol admin
UPDATE "User" 
SET role = 'admin' 
WHERE email IN ('gabrielpantojarivera@gmail.com', 'monacaniqueo@gmail.com');

-- 2. Verificar que se aplicaron los cambios
SELECT id, email, role, "createdAt", "updatedAt" 
FROM "User" 
WHERE email IN ('gabrielpantojarivera@gmail.com', 'monacaniqueo@gmail.com');

-- 3. Ver todos los usuarios y sus roles (opcional)
SELECT email, role, "createdAt" 
FROM "User" 
ORDER BY "createdAt" DESC;

-- ============================================================================
-- NOTAS:
-- - Este script debe ejecutarse DESPUÉS de que los usuarios hayan hecho login al menos una vez
-- - Si los usuarios no existen aún, se crearán automáticamente en el primer login con rol 'user'
-- - Puedes ejecutar este script las veces que necesites
-- ============================================================================