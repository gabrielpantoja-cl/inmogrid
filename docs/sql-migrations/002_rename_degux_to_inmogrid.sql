-- ============================================================
-- MIGRACIÓN 002: Renombrar tablas degux_* → inmogrid_*
-- Proyecto: inmogrid.cl (antes degux.cl)
-- Fecha: abril 2026
-- Ejecutar en: Supabase → SQL Editor
-- ============================================================
-- NOTA: usa prefijo "public." explícito para evitar errores
-- de search_path en el SQL Editor de Supabase.
-- ============================================================

ALTER TABLE public.degux_profiles              RENAME TO inmogrid_profiles;
ALTER TABLE public.degux_connections           RENAME TO inmogrid_connections;
ALTER TABLE public.degux_events                RENAME TO inmogrid_events;
ALTER TABLE public.degux_professional_profiles RENAME TO inmogrid_professional_profiles;
ALTER TABLE public.degux_audit_logs            RENAME TO inmogrid_audit_logs;
ALTER TABLE public.degux_chat_messages         RENAME TO inmogrid_chat_messages;

-- NOTA: la tabla "degux_posts" (vacía, legacy) NO se renombra.
-- El modelo Post de Prisma apunta a "posts" (tabla compartida),
-- no a "degux_posts". Puede dejarse o eliminarse por separado.

-- Verificación: ejecutar esto al final para confirmar que todo quedó bien.
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND (table_name LIKE 'inmogrid_%' OR table_name LIKE 'degux_%')
ORDER BY table_name;

-- Resultado esperado:
--   degux_posts          ← legacy vacía, se dejó intacta
--   inmogrid_audit_logs
--   inmogrid_chat_messages
--   inmogrid_connections
--   inmogrid_events
--   inmogrid_professional_profiles
--   inmogrid_profiles
