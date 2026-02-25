-- Script de inicialización de PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

DO $$
BEGIN
    RAISE NOTICE '✅ Base de datos farmacia_db inicializada correctamente';
    RAISE NOTICE '✅ Extensiones uuid-ossp y pg_trgm habilitadas';
END $$;
