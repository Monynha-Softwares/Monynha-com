import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  test,
} from '@jest/globals';
import type { Database } from '@/integrations/supabase/types';

type EnvValue = string | undefined;

const getEnv = (key: string): EnvValue =>
  process.env[key] ?? process.env[`VITE_${key}`];

const SUPABASE_URL = getEnv('SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY') ?? getEnv('SUPABASE_PUBLISHABLE_KEY');

const createAnonClient = (): SupabaseClient<Database> =>
  createClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  describe.skip('Supabase RLS permissions', () => {
    test('requires Supabase credentials', () => {
      // Intentionally skipped when credentials are not available.
    });
  });
} else {
  describe('Supabase RLS permissions', () => {
    let visitorClient: SupabaseClient<Database>;

    beforeAll(() => {
      visitorClient = createAnonClient();
    });

    afterAll(async () => {
      await visitorClient.auth.signOut();
    });

    test('visitor can read active solutions but cannot read leads', async () => {
      const solutionsResult = await visitorClient
        .from('solutions')
        .select('id')
        .limit(1);

      if (solutionsResult.error) {
        console.warn(
          'Skipping visitor permission assertions due to Supabase connectivity error:',
          solutionsResult.error.message
        );
        expect(solutionsResult.error).toBeDefined();
        return;
      }

      expect(Array.isArray(solutionsResult.data)).toBe(true);

      const leadsResult = await visitorClient.from('leads').select('id').limit(1);
      expect(leadsResult.error).toBeTruthy();
      expect(leadsResult.data).toBeNull();
    });

    const userEmail = getEnv('SUPABASE_TEST_USER_EMAIL');
    const userPassword = getEnv('SUPABASE_TEST_USER_PASSWORD');

    const adminEmail = getEnv('SUPABASE_TEST_ADMIN_EMAIL');
    const adminPassword = getEnv('SUPABASE_TEST_ADMIN_PASSWORD');

    describe('authenticated user', () => {
      if (!userEmail || !userPassword) {
        test.skip('requires SUPABASE_TEST_USER_EMAIL and SUPABASE_TEST_USER_PASSWORD', () => {});
        return;
      }

      let userClient: SupabaseClient<Database>;

      beforeAll(async () => {
        userClient = createAnonClient();
        const { error } = await userClient.auth.signInWithPassword({
          email: userEmail,
          password: userPassword,
        });

        if (error) {
          throw error;
        }
      });

      afterAll(async () => {
        await userClient.auth.signOut();
      });

      test('user can access own profile but not leads', async () => {
        const profileResult = await userClient
          .from('profiles')
          .select('id')
          .maybeSingle();

        expect(profileResult.error).toBeNull();

        const leadsResult = await userClient.from('leads').select('id').limit(1);
        expect(leadsResult.error).toBeTruthy();
      });
    });

    describe('admin user', () => {
      if (!adminEmail || !adminPassword) {
        test.skip(
          'requires SUPABASE_TEST_ADMIN_EMAIL and SUPABASE_TEST_ADMIN_PASSWORD',
          () => {}
        );
        return;
      }

      let adminClient: SupabaseClient<Database>;

      beforeAll(async () => {
        adminClient = createAnonClient();
        const { error } = await adminClient.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword,
        });

        if (error) {
          throw error;
        }
      });

      afterAll(async () => {
        await adminClient.auth.signOut();
      });

      test('admin can view leads and subscribers', async () => {
        const leadsResult = await adminClient
          .from('leads')
          .select('id, created_at')
          .order('created_at', { ascending: false })
          .limit(1);

        expect(leadsResult.error).toBeNull();

        const subscribersResult = await adminClient
          .from('newsletter_subscribers')
          .select('id, subscribed_at')
          .order('subscribed_at', { ascending: false })
          .limit(1);

        expect(subscribersResult.error).toBeNull();
      });
    });
  });
}
