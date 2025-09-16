import type { IncomingMessage, ServerResponse } from 'node:http';
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '../src/integrations/supabase';
import { fetchProfileByUserId } from '../src/lib/profiles';
import { fetchLeads } from '../src/lib/leads';
import { fetchNewsletterSubscribers } from '../src/lib/newsletter-subscribers';

interface AdminRequest extends IncomingMessage {
  method?: string;
  headers: IncomingMessage['headers'] & {
    authorization?: string;
    Authorization?: string;
  };
}

const sendJson = (res: ServerResponse, status: number, payload: unknown) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

const extractAccessToken = (req: AdminRequest): string | null => {
  const authorizationHeader =
    req.headers.authorization ?? req.headers.Authorization ?? '';

  if (typeof authorizationHeader !== 'string') {
    return null;
  }

  const trimmed = authorizationHeader.trim();
  if (!trimmed.toLowerCase().startsWith('bearer ')) {
    return null;
  }

  return trimmed.slice(7).trim();
};

const handleRequest = async (req: AdminRequest, res: ServerResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const accessToken = extractAccessToken(req);
  if (!accessToken) {
    return sendJson(res, 401, { error: 'Missing or invalid Authorization header' });
  }

  try {
    const serverClient = createServerSupabaseClient(accessToken);
    const { data: authData, error: userError } = await serverClient.auth.getUser(accessToken);

    if (userError || !authData?.user) {
      return sendJson(res, 401, { error: 'Invalid or expired session token' });
    }

    const profile = await fetchProfileByUserId(authData.user.id, {
      client: serverClient,
    });

    if (!profile || profile.role !== 'admin') {
      return sendJson(res, 403, { error: 'Access denied' });
    }

    const serviceClient = createServiceRoleSupabaseClient();

    const [leads, newsletterSubscribers] = await Promise.all([
      fetchLeads({ client: serviceClient }),
      fetchNewsletterSubscribers({ client: serviceClient, includeInactive: true }),
    ]);

    return sendJson(res, 200, {
      leads,
      newsletterSubscribers,
    });
  } catch (error) {
    console.error('Failed to process admin dashboard request', error);
    return sendJson(res, 500, { error: 'Internal server error' });
  }
};

export default async function handler(req: AdminRequest, res: ServerResponse) {
  await handleRequest(req, res);
}
