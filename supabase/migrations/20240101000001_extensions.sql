-- Migration: 0001_extensions
-- Description: Enable required PostgreSQL extensions
--
-- uuid-ossp  → uuid_generate_v4() for primary keys
-- pgcrypto   → gen_random_bytes() for secure key generation (used in Phase 5+)

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
