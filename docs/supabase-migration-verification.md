# Supabase migration verification

Use this checklist to replay the SQL migrations against a disposable PostgreSQL
instance and confirm that the scripts run in order.

## Prerequisites

- Local PostgreSQL 16+ with `createdb`, `dropdb`, and `psql` commands available.
- Node.js 20+ (the repository already ships with `npx supabase`).

## Procedure

1. Start from the repository root and create a throwaway database:
   ```sh
   createdb -h localhost -U postgres monynha_tmp
   ```
2. Prime the database with the minimal Supabase objects the migrations expect:
   ```sh
   psql -h localhost -U postgres -d monynha_tmp <<'SQL'
   CREATE ROLE anon NOLOGIN;
   CREATE ROLE authenticated NOLOGIN;
   CREATE SCHEMA auth;
   CREATE EXTENSION IF NOT EXISTS pgcrypto;
   CREATE TABLE auth.users (id uuid PRIMARY KEY);
   CREATE OR REPLACE FUNCTION auth.uid()
   RETURNS uuid
   LANGUAGE sql
   STABLE
   AS $$ SELECT '00000000-0000-0000-0000-000000000000'::uuid $$;
   SQL
   ```
3. Run the migrations against the disposable database:
   ```sh
   npx supabase migration up --db-url "postgresql://postgres:postgres@127.0.0.1:5432/monynha_tmp"
   ```
   A successful run applies every script in timestamp order and ends with a
   confirmation similar to the following:
   > Applying migration 20250730183503_fix_profiles_rls.sql...
   > Applying migration 20250731120000_create_blog_posts_table.sql...
   > Applying migration 20250801120000_create_comments_table.sql...
   > Local database is up to date.
4. Drop the disposable database when you are finished:
   ```sh
   dropdb -h localhost -U postgres monynha_tmp
   ```

## Notes

- The verification flow relies on stub roles (`anon`, `authenticated`) and the
  `auth.uid()` helper to emulate Supabase's platform functions. These stubs are
  only required for local testing and should not be added to production.
- PostgreSQL will emit harmless warnings when a migration tries to grant access
  to roles without login privileges; this mirrors Supabase's behaviour and can
  be safely ignored during verification. 【2e324a†L1-L15】
