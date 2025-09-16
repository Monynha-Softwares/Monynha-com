import { createSupabaseServiceRoleClient } from '../../src/integrations/supabase';
import { fetchProfileByUserId } from '../../src/lib/profiles';
import { fetchLeadsForAdmin } from '../../src/lib/leads';
import { fetchNewsletterSubscribersForAdmin } from '../../src/lib/newsletter';
import type { LeadRow } from '../../src/lib/leads';
import type { NewsletterSubscriberRow } from '../../src/lib/newsletter';

interface RequestLike {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
}

interface ResponseLike {
  status: (code: number) => ResponseLike;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

const extractBearerToken = (req: RequestLike): string | null => {
  const header = req.headers.authorization ?? req.headers.Authorization;
  const value = Array.isArray(header) ? header[0] : header;

  if (!value) {
    return null;
  }

  const [scheme, token] = value.split(' ');
  if (!token || scheme?.toLowerCase() !== 'bearer') {
    return null;
  }

  return token.trim();
};

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const accessToken = extractBearerToken(req);
  if (!accessToken) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  try {
    const supabaseAdmin = createSupabaseServiceRoleClient();

    const { data: userResult, error: userError } = await supabaseAdmin.auth.getUser(
      accessToken
    );

    if (userError || !userResult?.user) {
      return res.status(401).json({ error: 'Invalid Supabase token' });
    }

    const profile = await fetchProfileByUserId(userResult.user.id, supabaseAdmin);
    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const [leads, subscribers] = await Promise.all<[
      LeadRow[],
      NewsletterSubscriberRow[],
    ]>([
      fetchLeadsForAdmin(supabaseAdmin),
      fetchNewsletterSubscribersForAdmin(supabaseAdmin),
    ]);

    return res.status(200).json({ leads, subscribers });
  } catch (error) {
    console.error('Admin dashboard handler error', error);
    return res.status(500).json({ error: 'Failed to load admin data' });
  }
}
