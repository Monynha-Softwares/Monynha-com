import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];

const PROFILE_COLUMNS =
  'id, user_id, email, name, role, avatar_url, created_at, updated_at';

export const fetchProfileByUserId = async (
  userId: string,
  client: SupabaseClient<Database> = getSupabaseClient()
): Promise<ProfileRow | null> => {
  const { data, error } = await client
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return data ?? null;
};

