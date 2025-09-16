import { randomUUID } from 'crypto';
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from '@/integrations/supabase';
import { fetchSolutionsRows } from '@/lib/solutions';
import { fetchActiveHomepageFeatures } from '@/lib/homepageFeatures';
import { fetchActiveTeamMembers } from '@/lib/teamMembers';
import { createLead, fetchLeads } from '@/lib/leads';
import {
  subscribeToNewsletter,
  fetchNewsletterSubscribers,
} from '@/lib/newsletterSubscribers';
import { fetchProfileByUserId } from '@/lib/profiles';

type AsyncTask = () => Promise<void>;

const cleanupTasks: AsyncTask[] = [];
const failures: string[] = [];

const logResult = (label: string, status: 'ok' | 'fail', detail?: string) => {
  const symbol = status === 'ok' ? '✅' : '❌';
  if (detail) {
    console.log(`${symbol} ${label}: ${detail}`);
  } else {
    console.log(`${symbol} ${label}`);
  }
};

const expectSuccess = async (label: string, fn: () => Promise<void>) => {
  try {
    await fn();
    logResult(label, 'ok');
  } catch (error) {
    const message =
      error instanceof Error ? error.message : JSON.stringify(error, null, 2);
    logResult(label, 'fail', message);
    failures.push(`${label}: ${message}`);
  }
};

const expectForbidden = async (label: string, fn: () => Promise<void>) => {
  try {
    await fn();
    const message = `${label} should be forbidden but succeeded.`;
    logResult(label, 'fail', message);
    failures.push(message);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : JSON.stringify(error, null, 2);
    logResult(label, 'ok', message);
  }
};

const run = async () => {
  console.log('🔐 Running Supabase permission checks...');

  const visitorClient = createSupabaseServerClient();
  const serviceRoleClient = createSupabaseServiceRoleClient();

  const leadEmail = `visitor-${randomUUID()}@example.com`;
  const newsletterEmail = `newsletter-${randomUUID()}@example.com`;

  await expectSuccess('visitor: fetch active solutions', async () => {
    await fetchSolutionsRows({ client: visitorClient });
  });

  await expectSuccess('visitor: fetch homepage features', async () => {
    await fetchActiveHomepageFeatures(visitorClient);
  });

  await expectSuccess('visitor: fetch team members', async () => {
    await fetchActiveTeamMembers(visitorClient);
  });

  await expectSuccess('visitor: submit lead', async () => {
    await createLead(
      {
        name: 'Visitor Example',
        email: leadEmail,
        message: 'Test lead generated during permission checks.',
        company: null,
        project: null,
      },
      visitorClient
    );

    cleanupTasks.push(async () => {
      await serviceRoleClient.from('leads').delete().eq('email', leadEmail);
    });
  });

  await expectSuccess('visitor: subscribe to newsletter', async () => {
    await subscribeToNewsletter(newsletterEmail, visitorClient);

    cleanupTasks.push(async () => {
      await serviceRoleClient
        .from('newsletter_subscribers')
        .delete()
        .eq('email', newsletterEmail);
    });
  });

  await expectForbidden('visitor: fetch leads', async () => {
    await fetchLeads(visitorClient);
  });

  await expectForbidden('visitor: fetch newsletter subscribers', async () => {
    await fetchNewsletterSubscribers(visitorClient);
  });

  const testEmail = `user-${randomUUID()}@example.com`;
  const testPassword = `P@ssw0rd-${randomUUID().slice(0, 8)}`;

  const { data: createdUser, error: createUserError } =
    await serviceRoleClient.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    });

  if (createUserError) {
    throw createUserError;
  }

  const userId = createdUser?.user?.id;

  if (!userId) {
    throw new Error('Unable to determine ID of the created test user.');
  }

  cleanupTasks.push(async () => {
    await serviceRoleClient.from('profiles').delete().eq('user_id', userId);
    await serviceRoleClient.auth.admin.deleteUser(userId);
  });

  const { error: upsertProfileError } = await serviceRoleClient
    .from('profiles')
    .upsert(
      {
        user_id: userId,
        email: testEmail,
        name: 'Permission Test User',
        role: 'user',
      },
      { onConflict: 'user_id' }
    );

  if (upsertProfileError) {
    throw upsertProfileError;
  }

  const { data: signInData, error: signInError } =
    await visitorClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

  if (signInError) {
    throw signInError;
  }

  const accessToken = signInData.session?.access_token;

  if (!accessToken) {
    throw new Error('Authentication succeeded but no access token was returned.');
  }

  const userClient = createSupabaseServerClient(accessToken);

  await expectSuccess('user: fetch own profile', async () => {
    await fetchProfileByUserId(userId, userClient);
  });

  await expectForbidden('user: fetch leads', async () => {
    await fetchLeads(userClient);
  });

  const { error: promoteError } = await serviceRoleClient
    .from('profiles')
    .update({ role: 'admin' })
    .eq('user_id', userId);

  if (promoteError) {
    throw promoteError;
  }

  await expectSuccess('admin: fetch leads', async () => {
    await fetchLeads(userClient);
  });

  await expectSuccess('admin: fetch newsletter subscribers', async () => {
    await fetchNewsletterSubscribers(userClient);
  });

  if (failures.length > 0) {
    const message = failures.join('\n - ');
    throw new Error(`Permission checks failed:\n - ${message}`);
  }

  console.log('🎉 All Supabase permission checks passed.');
};

run()
  .catch((error) => {
    console.error('Supabase permission checks failed.');
    console.error(error instanceof Error ? error.stack ?? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    for (const task of cleanupTasks.reverse()) {
      try {
        await task();
      } catch (error) {
        console.error('Cleanup task failed:', error);
      }
    }
  });

