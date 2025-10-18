/**
 * @jest-environment node
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('Supabase security policies', () => {
  const migrationsDir = path.join(__dirname, '..', '..', 'supabase', 'migrations');

  const readMigration = (filename: string) =>
    readFileSync(path.join(migrationsDir, filename), 'utf8');

  it('exposes public blog content safely', () => {
    const sql = readMigration('20250731120000_create_blog_posts_table.sql');
    expect(sql).toMatch(/enable row level security/i);
    expect(sql).toMatch(/create policy "blog_posts_select_public"/i);
    expect(sql).toMatch(/to anon, public/i);
  });

  it('enforces authenticated comment creation with user ownership checks', () => {
    const sql = readMigration('20250801120000_create_comments_table.sql');
    expect(sql).toMatch(/enable row level security/i);
    expect(sql).toMatch(/create policy "comments_insert_authenticated"/i);
    expect(sql).toMatch(/with check \(auth.uid\(\) = user_id\)/i);
  });

  it('limits administrative tables to the service role only', () => {
    const payloadSync = readMigration('20250815150000_payload_admin_sync.sql');
    expect(payloadSync).toMatch(/Only service role manages payload sync config/i);
    expect(payloadSync).toMatch(/to service_role/i);

    const webhookConfig = readMigration('20250820120000_content_sync_and_gradient.sql');
    expect(webhookConfig).toMatch(/Service role manages content sync webhooks/i);
    expect(webhookConfig).toMatch(/ENABLE ROW LEVEL SECURITY/i);
  });

  it('reuses the admin helper for privileged CRUD', () => {
    const sql = readMigration('20250730183503_fix_profiles_rls.sql');
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION public\.is_admin/);
    expect(sql).toMatch(/CREATE POLICY "Only admins can manage solutions"/);
    expect(sql).toMatch(/CREATE POLICY "Only admins can view leads"/);
  });
});
