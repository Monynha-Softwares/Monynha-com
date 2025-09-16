import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createSupabaseServiceRoleClient } from '../../src/integrations/supabase';
import type { Database } from '../../src/integrations/supabase/types';

export type ServiceSupabaseClient = SupabaseClient<Database>;

interface ApiError extends Error {
  status?: number;
}

export const getServiceSupabaseClient = () => createSupabaseServiceRoleClient();

export const requireAdminUser = async (
  client: ServiceSupabaseClient,
  accessToken: string
): Promise<User> => {
  const { data: userData, error: authError } = await client.auth.getUser(accessToken);

  if (authError || !userData?.user) {
    const error: ApiError = new Error(authError?.message ?? 'Unauthorized');
    error.status = 401;
    throw error;
  }

  const { data: isAdmin, error: roleError } = await client.rpc('is_admin', {
    uid: userData.user.id,
  });

  if (roleError) {
    const error: ApiError = new Error(roleError.message);
    error.status = 500;
    throw error;
  }

  if (!isAdmin) {
    const error: ApiError = new Error('Forbidden');
    error.status = 403;
    throw error;
  }

  return userData.user;
};
