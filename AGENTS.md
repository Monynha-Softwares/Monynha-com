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

## CMS collections & Supabase sync
- Payload now exposes Supabase-backed collections for `solutions`,
  `repositories`, `teamMembers`, `homepageFeatures`, `siteSettings`,
  `newsletterSubscribers`, and `leads` in addition to the existing `posts`,
  `media`, and `users` slugs. The CMS writes to the matching `public.*`
  tables through shared PG pool upserts, persisting Supabase row IDs back into
  the hidden `supabaseId` field for repeat edits.
- Field localization matches frontend expectations: strings rendered in the SPA
  accept per-locale copy in Payload but resolve to a single value when syncing
  with Supabase (`pt-BR` preferred, falling back to `en`). Array inputs (solution
  features, repository tags) enforce non-empty entries and deduplicate on sync.
- Gradient selections for solutions live in Payload for now; the SPA still
  derives gradients client-side until the Supabase schema grows a dedicated
  column.
- CMS access mirrors RLS intent: public content collections remain readable by
  anyone, whereas sensitive data (`newsletterSubscribers`, `leads`, `siteSettings`)
  require an authenticated admin to view or mutate entries.

### Seed data & operations
- Supabase migrations continue to seed starter rows for the new collections.
  Running `npx supabase migration up` against a clean database still provisions
  demo solutions, repositories, homepage features, team members, and contact
  metadata expected by the SPA.
- Regenerate Payload TypeScript definitions after structural edits with
  `npx payload generate:types` (executed from the `cms/` directory). The types
  surface via `cms/src/collections/index.ts` for reuse across scripts.

### Follow-up ideas
- Expand Supabase schema to persist CMS-managed presentation fields (e.g.
  solution gradients, localized blurbs) once downstream consumers are ready to
  read them directly.
- Add CMS-driven moderation dashboards for newsletter subscribers and leads if
  workflows demand auditing beyond Supabase SQL queries.
