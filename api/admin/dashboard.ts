import {
  createSupabaseServiceRoleClient,
  type TypedSupabaseClient,
} from '../../src/integrations/supabase';
import { fetchLeadsForAdmin } from '../../src/lib/leads';
import { fetchNewsletterSubscribersForAdmin } from '../../src/lib/newsletter';
import { fetchProfileByUserId } from '../../src/lib/profiles';

interface ApiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  status: (statusCode: number) => ApiResponse;
  json: (body: unknown) => void;
}

const extractBearerToken = (authorization?: string | string[]): string | null => {
  const header = Array.isArray(authorization) ? authorization[0] : authorization;
  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(' ');
  if (!token || scheme.toLowerCase() !== 'bearer') {
    return null;
  }

  return token.trim();
};

const sendError = (res: ApiResponse, statusCode: number, message: string) => {
  res.status(statusCode).json({ error: message });
};

const fetchAdminData = async (
  client: TypedSupabaseClient
): Promise<{ leads: Awaited<ReturnType<typeof fetchLeadsForAdmin>>; subscribers: Awaited<ReturnType<typeof fetchNewsletterSubscribersForAdmin>>; }> => {
  const [leads, subscribers] = await Promise.all([
    fetchLeadsForAdmin(client),
    fetchNewsletterSubscribersForAdmin(client),
  ]);

  return { leads, subscribers };
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    sendError(res, 405, 'Method not allowed');
    return;
  }

  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    sendError(res, 401, 'Cabeçalho de autorização ausente ou inválido.');
    return;
  }

  try {
    const adminClient = createSupabaseServiceRoleClient();
    const { data: userData, error: userError } = await adminClient.auth.getUser(token);

    if (userError || !userData?.user) {
      sendError(res, 401, 'Token de acesso inválido.');
      return;
    }

    const profile = await fetchProfileByUserId(userData.user.id, adminClient);

    if (!profile || profile.role !== 'admin') {
      sendError(res, 403, 'Acesso não autorizado.');
      return;
    }

    const { leads, subscribers } = await fetchAdminData(adminClient);

    res.status(200).json({ leads, subscribers });
  } catch (error) {
    console.error('Erro ao carregar dados administrativos', error);
    sendError(res, 500, 'Erro interno ao carregar dados administrativos.');
  }
}
