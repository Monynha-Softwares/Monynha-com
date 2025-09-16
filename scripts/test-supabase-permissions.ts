import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const getEnv = (...keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.length > 0) {
      return value;
    }
  }
  return undefined;
};

const SUPABASE_URL = getEnv('SUPABASE_URL', 'VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnv(
  'SUPABASE_ANON_KEY',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_PUBLISHABLE_KEY'
);
const SUPABASE_SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');
const TEST_USER_EMAIL = getEnv('SUPABASE_TEST_USER_EMAIL');
const TEST_USER_PASSWORD = getEnv('SUPABASE_TEST_USER_PASSWORD');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase URL/Anon key not provided. Skipping permission checks.');
  process.exit(0);
}

const results: Array<{ name: string; status: 'pass' | 'fail' | 'skip'; details?: string }> = [];

const anonClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const expectSuccess = async (name: string, fn: () => Promise<void>) => {
  try {
    await fn();
    results.push({ name, status: 'pass' });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'object'
          ? JSON.stringify(error)
          : String(error);
    results.push({ name, status: 'fail', details: message });
  }
};

const expectFailure = async (name: string, fn: () => Promise<void>) => {
  try {
    await fn();
    results.push({
      name,
      status: 'fail',
      details: 'Operation succeeded unexpectedly',
    });
  } catch {
    results.push({ name, status: 'pass' });
  }
};

await expectSuccess('Visitor can read active solutions', async () => {
  const { error } = await anonClient.from('solutions').select('id').limit(1);
  if (error) {
    throw error;
  }
});

await expectFailure('Visitor cannot read leads', async () => {
  const { error } = await anonClient.from('leads').select('id').limit(1);
  if (!error) {
    throw new Error('Expected row level security error');
  }
  throw error;
});

await expectSuccess('Visitor can insert lead', async () => {
  const { error } = await anonClient.from('leads').insert({
    name: 'Test Lead',
    email: `test-${Date.now()}@example.com`,
    message: 'Automated permission check',
    company: null,
    project: null,
  });
  if (error) {
    throw error;
  }
});

let userClient: SupabaseClient<Database> | null = null;
if (TEST_USER_EMAIL && TEST_USER_PASSWORD) {
  const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
  });

  if (signInError || !signInData.session) {
    results.push({
      name: 'Authenticated user login',
      status: 'fail',
      details: signInError?.message ?? 'Unable to retrieve session',
    });
  } else {
    userClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        headers: {
          Authorization: `Bearer ${signInData.session.access_token}`,
        },
      },
    });

    await expectSuccess('User can read own profile', async () => {
      const { data, error } = await userClient!
        .from('profiles')
        .select('id')
        .eq('user_id', signInData.session!.user.id)
        .maybeSingle();
      if (error) {
        throw error;
      }
      if (!data) {
        throw new Error('Profile not found');
      }
    });

    await expectFailure('Authenticated user cannot read leads', async () => {
      const { error } = await userClient!
        .from('leads')
        .select('id')
        .limit(1);
      if (!error) {
        throw new Error('Expected row level security error');
      }
      throw error;
    });
  }
} else {
  results.push({
    name: 'Authenticated user permissions',
    status: 'skip',
    details: 'SUPABASE_TEST_USER_EMAIL/PASSWORD not provided',
  });
}

if (SUPABASE_SERVICE_ROLE_KEY) {
  const serviceClient = createClient<Database>(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  await expectSuccess('Service role can read leads', async () => {
    const { error } = await serviceClient.from('leads').select('id').limit(1);
    if (error) {
      throw error;
    }
  });
} else {
  results.push({
    name: 'Service role permissions',
    status: 'skip',
    details: 'SUPABASE_SERVICE_ROLE_KEY not provided',
  });
}

const hasFailure = results.some((result) => result.status === 'fail');

for (const result of results) {
  const prefix =
    result.status === 'pass'
      ? 'PASS'
      : result.status === 'fail'
        ? 'FAIL'
        : 'SKIP';
  const suffix = result.details ? ` - ${result.details}` : '';
  console.log(`[${prefix}] ${result.name}${suffix}`);
}

if (hasFailure) {
  console.warn('One or more permission checks failed. Review the log above for details.');
}
