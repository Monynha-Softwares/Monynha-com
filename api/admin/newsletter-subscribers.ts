import { fetchNewsletterSubscribersForAdmin } from '../../src/lib/newsletterSubscribers';
import { getServiceSupabaseClient, requireAdminUser } from '../_lib/admin';

interface ApiRequest {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
}

const extractAccessToken = (authorization?: string | string[]) => {
  if (!authorization) return undefined;
  const value = Array.isArray(authorization) ? authorization[0] : authorization;
  const [scheme, token] = value.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return undefined;
  }
  return token.trim();
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const headerToken =
    extractAccessToken(req.headers?.authorization) ||
    extractAccessToken(req.headers?.Authorization);

  if (!headerToken) {
    res.status(401).json({ error: 'Missing access token' });
    return;
  }

  try {
    const client = getServiceSupabaseClient();
    await requireAdminUser(client, headerToken);
    const data = await fetchNewsletterSubscribersForAdmin(client);

    res.status(200).json({ data });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    const message = error instanceof Error ? error.message : 'Unexpected server error.';
    res.status(status).json({ error: message });
  }
}
