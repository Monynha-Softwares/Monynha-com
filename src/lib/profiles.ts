import { getSupabaseBrowserClient, type TypedSupabaseClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

const getClient = (client?: TypedSupabaseClient) => client ?? getSupabaseBrowserClient();

export const fetchProfileByUserId = async (
  userId: string,
  client?: TypedSupabaseClient
): Promise<Profile | null> => {
  const supabase = getClient(client);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  return data ?? null;
};
