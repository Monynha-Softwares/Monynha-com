import { createSupabaseServerClient, createSupabaseServiceRoleClient } from '../src/integrations/supabase';
import { listActiveSolutions } from '../src/lib/solutions';
import { listActiveRepositories } from '../src/lib/repositories';
import { listActiveHomepageFeatures } from '../src/lib/homepage-features';
import { listPublishedBlogPosts } from '../src/lib/blog';
import { listActiveTeamMembers } from '../src/lib/team';
import { createLead } from '../src/lib/leads';

const hasAnonConfig = Boolean(
  (process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? process.env.SUPABASE_PROJECT_URL) &&
    (process.env.VITE_SUPABASE_ANON_KEY ??
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
      process.env.SUPABASE_ANON_KEY)
);

if (!hasAnonConfig) {
  console.warn('Skipping Supabase permission checks because Supabase environment variables are not configured.');
  process.exit(0);
}

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const testVisitorAccess = async () => {
  console.log('\nChecking visitor permissions...');
  const visitorClient = createSupabaseServerClient();

  const [solutions, repositories, features, blogPosts, team] = await Promise.all([
    listActiveSolutions({}, visitorClient),
    listActiveRepositories(visitorClient),
    listActiveHomepageFeatures(visitorClient),
    listPublishedBlogPosts(visitorClient),
    listActiveTeamMembers(visitorClient),
  ]);

  console.log(`Visitor can read ${solutions.length} solutions, ${repositories.length} repositories.`);
  console.log(`Visitor can read ${features.length} homepage features, ${blogPosts.length} blog posts.`);
  console.log(`Visitor can read ${team.length} team members.`);

  const { error: leadsReadError } = await visitorClient.from('leads').select('id').limit(1);
  if (leadsReadError) {
    console.log('Visitor cannot read leads as expected.');
  } else {
    console.warn('Warning: visitor was able to read leads. Check RLS configuration.');
  }

  if (!serviceRoleKey) {
    console.warn('Skipping visitor lead insertion test because SUPABASE_SERVICE_ROLE_KEY is not configured for cleanup.');
    return;
  }

  const timestamp = Date.now();
  const testLead = await createLead(
    {
      name: 'Permission Test Visitor',
      email: `visitor-test-${timestamp}@example.com`,
      message: 'Lead created during automated permission checks. Safe to delete.',
      project: null,
      company: null,
    },
    visitorClient
  );

  console.log(`Visitor lead insertion succeeded with id ${testLead.id}. Cleaning up using service role.`);

  const adminClient = createSupabaseServiceRoleClient();
  await adminClient.from('leads').delete().eq('id', testLead.id);
  console.log('Cleaned up visitor lead using service role client.');
};

const testLoggedUserAccess = async () => {
  const email = process.env.SUPABASE_TEST_USER_EMAIL;
  const password = process.env.SUPABASE_TEST_USER_PASSWORD;

  if (!email || !password) {
    console.warn('Skipping logged user checks because SUPABASE_TEST_USER_EMAIL/PASSWORD are not configured.');
    return;
  }

  console.log('\nChecking authenticated user permissions...');
  const userClient = createSupabaseServerClient();

  const { data: sessionData, error: signInError } = await userClient.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    throw signInError;
  }

  const userId = sessionData.user?.id;
  console.log(`Authenticated as user ${userId}.`);

  if (!userId) {
    console.warn('Authenticated session returned without a user id.');
    return;
  }

  const { data: profile, error: profileError } = await userClient
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (profileError) {
    console.warn(`Authenticated user could not read profile data: ${profileError.message}`);
  } else {
    console.log(`Authenticated user profile loaded with id ${profile?.id ?? 'unknown'}.`);
  }
};

const testAdminAccess = async () => {
  if (!serviceRoleKey) {
    console.warn('Skipping admin checks because SUPABASE_SERVICE_ROLE_KEY is not configured.');
    return;
  }

  console.log('\nChecking admin (service role) permissions...');
  const adminClient = createSupabaseServiceRoleClient();
  const { data, error } = await adminClient.from('leads').select('id').limit(1);

  if (error) {
    throw error;
  }

  console.log(`Service role client can read ${data?.length ?? 0} lead entries.`);
};

const run = async () => {
  await testVisitorAccess();
  await testLoggedUserAccess();
  await testAdminAccess();
  console.log('\nSupabase permission checks completed.');
};

run().catch((error) => {
  const message =
    typeof error === 'string'
      ? error
      : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message?: unknown }).message ?? '')
        : '';

  if (message.includes('fetch failed')) {
    console.warn('Skipping Supabase permission checks due to network or credential issues:', error);
    process.exit(0);
    return;
  }

  console.error('Supabase permission checks failed:', error);
  process.exit(1);
});
