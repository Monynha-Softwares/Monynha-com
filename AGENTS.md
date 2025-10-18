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

## CMS collection sync (2025-02-15)
- Payload CMS now exposes collections for: `solutions`, `repositories`,
  `teamMembers`, `homepageFeatures`, `siteSettings`, `newsletterSubscribers`,
  `leads`, plus optional taxonomies (`authors`, `categories`). Each collection
  pushes updates to the matching Supabase table via `afterChange` hooks that
  reuse the shared PostgreSQL `Pool`.
- Localization is enabled for user-facing text fields so the SPA can render
  `pt-BR` and `en` copy without code changes. Slugs, booleans, and select lists
  (icons, gradients) enforce validation consistent with frontend expectations.
- Seed recommendations: create at least two `solutions` (with features array),
  three `homepageFeatures` rows ordered for the landing page carousel, and seed
  `teamMembers`/`repositories` with the profiles already present in Supabase to
  avoid duplicate inserts when the hooks run.
- Follow-ups:
  - Extend the Supabase `solutions` table with a `gradient` column and update
    the SPA to consume it instead of falling back to hard-coded styles.
  - Expose `siteSettings` records through the frontend for dynamic contact
    metadata and gradient overrides sourced from Payload.
  - Add automated deletion hooks (or manual SOP) so removing a document from
    Payload also removes the Supabase row when appropriate.

## Shared frontend data layer (2025-03-01)
- Supabase read/write helpers now live in `src/lib/data/supabase.ts` with
  generated types (`src/lib/supabase/types.gen.ts`). Run
  `npm run supabase:types` after schema changes to regenerate typings.
- React code should consume data through the helpers (e.g.
  `fetchSolutions`, `createLead`, `fetchLocalizedCopy`) instead of calling the
  Supabase client directly. Use `useDynamicCopy` to merge CMS-managed strings
  into i18n resources at runtime.
- CMS preview URLs are wired via `cms/src/utilities/preview.ts` so editors can
  open SPA/Next routes for blog posts, solutions, home content, and site
  settings.

## Status log (2025-02-14)
- Environment state: Local PostgreSQL 16 instance installed for disposable
  verification; no background services left running after dropping the
  `monynha_tmp` database.
- Schema status: All SQL migrations apply cleanly in timestamp order when run via
  `npx supabase migration up --db-url postgresql://postgres:postgres@127.0.0.1:5432/monynha_tmp`.
- Next stage owner: Web platform team to replay the migrations in managed
  Supabase projects and run the CMS ➜ Supabase ➜ frontend publishing smoke test.

## Security & access QA (2025-02-20)
- RPC `get_admin_dashboard_data` enforces admin-only reads (non-admin sessions receive `42501`).
- Admin dashboard requires `aal2` when a TOTP factor exists; after `challengeAndVerify`, leads/newsletter tables load successfully.
- Payload role transitions now emit webhooks to `payload-admin-sync`, updating `profiles.payload_user_id` and issuing password resets for new admins.

### Outstanding follow-up
- Populate `public.payload_admin_sync_config` with the deployed edge-function URL and secret in each Supabase environment.
- Deploy `supabase/functions/payload-admin-sync` with the required environment variables (`PAYLOAD_API_BASE_URL`, `PAYLOAD_ADMIN_TOKEN`, etc.).
- Perform an end-to-end CMS role promotion/demotion against a real Payload instance once the webhook endpoint is live.

## QA & Observability (2025-10-18)
- Automated coverage now includes:
  - Unit tests for Payload ➜ Supabase hooks (`cms/__tests__/solutions.hook.unit.test.ts`).
  - Integration checks for row-level security definitions (`tests/supabase/policies.integration.test.ts`).
  - End-to-end SPA navigation and lead capture (`tests/e2e/spa.user-journeys.e2e.test.tsx`).
  - Accessibility regression guard for the Solutions catalog (`tests/accessibility/solutions.a11y.test.tsx`).
- Monitoring endpoints:
  - CMS sync events emit to `CMS_OBSERVABILITY_WEBHOOK_URL` with dashboards discoverable via `CMS_OBSERVABILITY_DASHBOARD_URL`.
  - Supabase `payload-admin-sync` forwards status updates to `OBSERVABILITY_WEBHOOK_URL` and links back to the same observability dashboard.
- Release workflow:
  - GitHub Actions `deploy_spa` (environment `spa-production`) archives the Vite bundle and requires approval before execution.
  - GitHub Actions `deploy_cms` (environment `cms-production`) builds the Payload TypeScript output and likewise pauses for approval.
- Runbook snapshot:
  1. Execute `npm test` locally to validate CMS hooks, policies, SPA journeys, and a11y gates.
  2. Merge to `prod`; obtain approvals for both `spa-production` and `cms-production` environments inside the workflow run.
  3. Monitor the observability dashboard for `payload-admin-sync` success or error logs immediately after release.
