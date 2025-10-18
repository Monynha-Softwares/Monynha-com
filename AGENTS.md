# Agent Notes

## Supabase blog post UUID migration
- Migration `20250731120000-create-blog-posts-table.sql` now enforces
  `public.blog_posts.id` as a `uuid` with `gen_random_uuid()` and backfills any
  legacy `text` identifiers (including cascading updates for `public.comments`).
- Payload CMS posts now store their Supabase UUID in the hidden `supabaseId`
  field; the after-change hook syncs both directions using Supabase-generated
  IDs.
- TypeScript definitions under `src/integrations/supabase/types.ts` expose a
  shared `UUID` alias so frontend code treats `blog_posts` and `comments`
  identifiers as UUID values.

## Data cleanup summary
- Legacy `text` IDs are renamed to `legacy_id` during the migration, random UUIDs
  are generated per row, and comment foreign keys are rewritten before the
  `legacy_id` column is dropped.

## CMS collection sync overview (2025-02-18)
- Payload now manages the following Supabase-backed collections via shared
  `afterChange` upserts:
  - `solutions`, `repositories`, `teamMembers`, `homepageFeatures`,
    `siteSettings`, `newsletterSubscribers`, and `leads`.
  - Optional editorial-only taxonomies: `authors` and `categories`.
- Localization: all human-facing strings (titles, descriptions, bios, feature
  copy) accept `pt-BR`/`en` variants; slugs enforce lowercase kebab-case.
- Validation: boolean flags default to `true`, gradient/icon selections expose
  predefined options, and contact/newsletter emails require a valid address.
- Media uploads automatically map to Supabase `image_url` columns when a public
  URL is available.

### Seed expectations
- Populate at least one active document for each public collection to avoid the
  SPA falling back to hardcoded placeholders:
  - `homepageFeatures`: 4+ rows with ordered icons.
  - `solutions`: 2+ rows with localized descriptions and feature lists.
  - `teamMembers`: active profiles with bios and (optional) LinkedIn URLs.
- Ensure `siteSettings` contains `about_stats` JSON (`[{ "number": "50+", ...}]`)
  so the About timeline renders dynamic statistics.
- `newsletterSubscribers`/`leads` tables remain empty-safe; entries appear once
  Supabase forms run in production.

### Follow-up ideas
- Extend the frontend to consume CMS-managed gradients for solutions instead of
  fallback heuristics.
- Add Supabase migrations for `authors`/`categories` if relationships are needed
  across blog posts or future knowledge base content.
- Evaluate a background worker to sync media URLs into Supabase when Payload
  stores only asset IDs.

## Next steps
- Run the updated migration in every Supabase environment and verify that the
  comment foreign-key backfill succeeds (no rows should retain `legacy_id`).
- After deploying, execute an end-to-end blog comment publish flow (CMS ➜
  Supabase ➜ `/blog/[slug]`) and confirm UUID identifiers propagate correctly.
- Update any downstream services that previously referenced the numeric/text blog
  IDs so they read the new UUID format instead.

## Status log (2025-02-14)
- Environment state: Local PostgreSQL 16 instance installed for disposable
  verification; no background services left running after dropping the
  `monynha_tmp` database.
- Schema status: All SQL migrations apply cleanly in timestamp order when run via
  `npx supabase migration up --db-url postgresql://postgres:postgres@127.0.0.1:5432/monynha_tmp`.
- Next stage owner: Web platform team to replay the migrations in managed
  Supabase projects and run the CMS ➜ Supabase ➜ frontend publishing smoke test.
