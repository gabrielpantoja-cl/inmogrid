-- ========================================
-- Script de Inicialización PostgreSQL Local
-- ========================================
-- Se ejecuta automáticamente al crear el contenedor por primera vez

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Confirmar extensiones instaladas
SELECT extname, extversion FROM pg_extension;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Extensiones PostGIS instaladas correctamente';
END $$;