import { getSupabaseBrowserClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];

const PROFILE_COLUMNS =
  'id, user_id, name, email, role, avatar_url, created_at, updated_at';

export const fetchProfileByUserId = async (
  userId: string,
  client: SupabaseClient<Database> = getSupabaseBrowserClient()
): Promise<ProfileRow | null> => {
  if (!userId) {
    return null;
  }

  const { data, error } = await client
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  return data ?? null;
};
