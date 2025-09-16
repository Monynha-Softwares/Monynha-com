import type { SupabaseDatabaseClient } from '@/integrations/supabase';
import { getSupabaseBrowserClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export const fetchProfileByUserId = async (
  userId: string,
  client: SupabaseDatabaseClient = getSupabaseBrowserClient()
): Promise<ProfileRow | null> => {
  if (!userId) {
    return null;
  }

  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
};
