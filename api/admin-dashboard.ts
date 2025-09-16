import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createSupabaseServiceRoleClient } from '../src/integrations/supabase';

const getAccessToken = (request: VercelRequest): string | null => {
  const header = request.headers.authorization || request.headers.Authorization;

  if (!header) {
    return null;
  }

  const raw = Array.isArray(header) ? header[0] : header;

  if (!raw || typeof raw !== 'string') {
    return null;
  }

  const [scheme, token] = raw.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token.trim();
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const accessToken = getAccessToken(request);

  if (!accessToken) {
    return response
      .status(401)
      .json({ error: 'Token de autenticação ausente.' });
  }

  try {
    const supabaseAdmin = createSupabaseServiceRoleClient();

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      return response.status(401).json({ error: 'Sessão inválida.' });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    if (!profile || profile.role !== 'admin') {
      return response.status(403).json({ error: 'Acesso não autorizado.' });
    }

    const [leadsResponse, subscribersResponse] = await Promise.all([
      supabaseAdmin
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false }),
    ]);

    if (leadsResponse.error) {
      throw leadsResponse.error;
    }

    if (subscribersResponse.error) {
      throw subscribersResponse.error;
    }

    response.setHeader('Cache-Control', 'private, max-age=0, no-store');

    return response.status(200).json({
      leads: leadsResponse.data ?? [],
      subscribers: subscribersResponse.data ?? [],
    });
  } catch (error) {
    console.error('Failed to load admin dashboard data', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Erro ao carregar dados administrativos.';

    return response.status(500).json({ error: message });
  }
}
