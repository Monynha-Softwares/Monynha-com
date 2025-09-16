import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type ProfileRecord = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

type TypedClient = SupabaseClient<Database>;

const PROFILE_FIELDS =
  'id, user_id, name, email, role, avatar_url, created_at, updated_at';

const resolveClient = (client?: TypedClient) => client ?? getSupabaseBrowserClient();

export const fetchProfileByUserId = async (
  userId: string,
  client?: TypedClient
): Promise<ProfileRecord | null> => {
  const supabase = resolveClient(client);

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
};

export const isUserAdmin = (profile: ProfileRecord | null | undefined) =>
  profile?.role === 'admin';
