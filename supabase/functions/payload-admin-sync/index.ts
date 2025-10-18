import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

type Profile = {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role: string;
  payload_user_id?: number | null;
};

type SyncPayload = {
  event: 'UPDATE' | 'INSERT' | 'DELETE';
  profile: Profile;
  previous_profile?: Profile | null;
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const PAYLOAD_API_BASE_URL = Deno.env.get('PAYLOAD_API_BASE_URL');
const PAYLOAD_ADMIN_TOKEN = Deno.env.get('PAYLOAD_ADMIN_TOKEN');
const PAYLOAD_SYNC_SHARED_SECRET = Deno.env.get('PAYLOAD_SYNC_SHARED_SECRET');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase configuration for payload-admin-sync function.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const baseHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${PAYLOAD_ADMIN_TOKEN}`,
});

async function ensurePayloadConfigured() {
  if (!PAYLOAD_API_BASE_URL || !PAYLOAD_ADMIN_TOKEN) {
    throw new Error('Payload integration is not configured.');
  }
}

async function fetchPayloadUserByEmail(email: string) {
  await ensurePayloadConfigured();
  const url = new URL(`${PAYLOAD_API_BASE_URL.replace(/\/$/, '')}/users`);
  url.searchParams.set('where[email][equals]', email);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: baseHeaders(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to query Payload users (${response.status}): ${text}`);
  }

  const payload = await response.json();
  const docs = Array.isArray(payload?.docs) ? payload.docs : [];
  return docs.length > 0 ? docs[0] : null;
}

async function createOrUpdatePayloadAdmin(profile: Profile): Promise<number | null> {
  await ensurePayloadConfigured();

  const existing = await fetchPayloadUserByEmail(profile.email);

  if (existing) {
    const response = await fetch(
      `${PAYLOAD_API_BASE_URL.replace(/\/$/, '')}/users/${existing.id}`,
      {
        method: 'PATCH',
        headers: baseHeaders(),
        body: JSON.stringify({
          email: profile.email,
          name: profile.name,
          roles: ['admin'],
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to update Payload user (${response.status}): ${text}`);
    }

    return typeof existing.id === 'number'
      ? existing.id
      : typeof existing.id === 'string'
        ? Number.parseInt(existing.id, 10)
        : null;
  }

  const password = crypto.randomUUID();
  const response = await fetch(`${PAYLOAD_API_BASE_URL.replace(/\/$/, '')}/users`, {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({
      email: profile.email,
      name: profile.name,
      password,
      roles: ['admin'],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create Payload user (${response.status}): ${text}`);
  }

  const payloadUser = await response.json();
  const newId = payloadUser?.doc?.id ?? payloadUser?.id ?? null;

  // Trigger a password reset email so the admin can set a known password.
  await triggerPayloadReset(profile.email);

  return typeof newId === 'number'
    ? newId
    : typeof newId === 'string'
      ? Number.parseInt(newId, 10)
      : null;
}

async function triggerPayloadReset(email: string) {
  await ensurePayloadConfigured();
  const response = await fetch(
    `${PAYLOAD_API_BASE_URL.replace(/\/$/, '')}/users/forgot-password`,
    {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({ email }),
    }
  );

  if (!response.ok && response.status !== 404) {
    const text = await response.text();
    throw new Error(`Failed to trigger Payload password reset (${response.status}): ${text}`);
  }
}

async function deletePayloadUser(
  identifier: number | string | null,
  email?: string
) {
  let resolvedIdentifier: number | string | null = identifier;

  if ((resolvedIdentifier === null || resolvedIdentifier === undefined) && email) {
    const existing = await fetchPayloadUserByEmail(email);
    resolvedIdentifier = existing?.id ?? null;
  }

  if (resolvedIdentifier === null || resolvedIdentifier === undefined) {
    return;
  }

  await ensurePayloadConfigured();
  const id =
    typeof resolvedIdentifier === 'string'
      ? resolvedIdentifier
      : String(resolvedIdentifier);
  const response = await fetch(`${PAYLOAD_API_BASE_URL.replace(/\/$/, '')}/users/${id}`, {
    method: 'DELETE',
    headers: baseHeaders(),
  });

  if (!response.ok && response.status !== 404) {
    const text = await response.text();
    throw new Error(`Failed to delete Payload user (${response.status}): ${text}`);
  }
}

function isValidSecret(token: string | null) {
  return (
    typeof PAYLOAD_SYNC_SHARED_SECRET === 'string' &&
    PAYLOAD_SYNC_SHARED_SECRET.length > 0 &&
    token === PAYLOAD_SYNC_SHARED_SECRET
  );
}

serve(async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '').trim()
    : null;

  if (!isValidSecret(token)) {
    return new Response('Unauthorized', { status: 401 });
  }

  let payload: SyncPayload;
  try {
    payload = (await request.json()) as SyncPayload;
  } catch (_error) {
    return new Response('Invalid JSON payload', { status: 400 });
  }

  const profile = payload.profile;
  const previous = payload.previous_profile ?? null;

  if (!profile || !profile.role) {
    return new Response('Missing profile payload', { status: 400 });
  }

  const promotedToAdmin =
    profile.role === 'admin' && (!previous || previous.role !== 'admin');
  const demotedFromAdmin =
    previous?.role === 'admin' && profile.role !== 'admin';

  if (!promotedToAdmin && !demotedFromAdmin) {
    return new Response(JSON.stringify({ skipped: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    if (promotedToAdmin) {
      const payloadId = await createOrUpdatePayloadAdmin(profile);

      if (payloadId !== null) {
        await supabase
          .from('profiles')
          .update({ payload_user_id: payloadId })
          .eq('id', profile.id);
      }
    } else if (demotedFromAdmin) {
      const identifier =
        profile.payload_user_id ?? previous?.payload_user_id ?? null;

      await deletePayloadUser(identifier, profile.email);
      await supabase
        .from('profiles')
        .update({ payload_user_id: null })
        .eq('id', profile.id);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('payload-admin-sync failed', error);
    const message =
      error instanceof Error ? error.message : 'Unknown error during sync';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
