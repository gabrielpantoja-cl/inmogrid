-- ============================================================================
-- SCRIPT PARA VERIFICAR ROLES Y PERMISOS
-- Ejecutar en Neon para verificar que todo está configurado correctamente
-- ============================================================================

-- 1. Mostrar todos los usuarios admin
SELECT 
    id, 
    email, 
    role, 
    name,
    "createdAt",
    "updatedAt"
FROM "User" 
WHERE role = 'admin' 
ORDER BY "createdAt" DESC;

-- 2. Contar usuarios por rol
SELECT 
    role, 
    COUNT(*) as cantidad
FROM "User" 
GROUP BY role
ORDER BY role;

-- 3. Mostrar últimos usuarios registrados
SELECT 
    email, 
    role, 
    "createdAt"
FROM "User" 
ORDER BY "createdAt" DESC 
LIMIT 10;

-- 4. Verificar que los admins tienen el rol correcto
SELECT 
    CASE 
        WHEN email IN ('gabrielpantojarivera@gmail.com', 'monacaniqueo@gmail.com') 
        THEN 'ESPERADO ADMIN'
        ELSE 'USUARIO NORMAL'
    END as estado_esperado,
    email,
    role,
    CASE 
        WHEN email IN ('gabrielpantojarivera@gmail.com', 'monacaniqueo@gmail.com') AND role = 'admin'
        THEN '✅ CORRECTO'
        WHEN email IN ('gabrielpantojarivera@gmail.com', 'monacaniqueo@gmail.com') AND role != 'admin'
        THEN '❌ NECESITA ACTUALIZACIÓN'
        ELSE '✅ OK'
    END as estado
FROM "User"
WHERE email IN ('gabrielpantojarivera@gmail.com', 'monacaniqueo@gmail.com')
   OR role = 'admin';

-- ============================================================================