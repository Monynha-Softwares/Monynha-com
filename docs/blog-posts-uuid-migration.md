# Blog Post UUID Migration

This document tracks the changes applied to move `public.blog_posts.id` to the
PostgreSQL `uuid` type generated with `gen_random_uuid()`.

## Summary

- Ensured the primary migration at
  `supabase/migrations/20250731120000-create-blog-posts-table.sql` provisions the
  table with a UUID primary key and backfills any legacy `text` identifiers.
- Added resiliency to update existing comments so that foreign keys are
  realigned after UUIDs are generated.
- Updated the Payload CMS upsert hook to rely on Supabase-generated UUIDs and to
  persist the assigned identifier back into the CMS entry.
- Regenerated the local Supabase TypeScript definitions so that all blog post
  and comment identifiers are typed as UUIDs in the frontend codebase.

## Follow-up actions

- Apply the migration to every Supabase environment and verify the data
  realignment logs before and after deployment.
- Run end-to-end testing for blog comment creation (CMS ➜ Supabase ➜ frontend)
  once the migration is live.
- Remove any stale `text` identifiers from downstream integrations or tooling
  (for example, Zapier zaps or analytics exports) that might still reference the
  legacy ID format.
