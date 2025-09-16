import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase';
import type { Database, Tables } from '@/integrations/supabase/types';

export type Profile = Tables<'profiles'>;

export interface ProfileQueryOptions {
  client?: SupabaseClient<Database>;
}

export const fetchProfileByUserId = async (
  userId: string,
  options: ProfileQueryOptions = {}
): Promise<Profile | null> => {
  if (!userId) {
    throw new Error('User ID is required to fetch profile data.');
  }

  const { client = supabase } = options;

  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return data ?? null;
};

export const isUserAdmin = (profile: Profile | null | undefined): boolean =>
  profile?.role === 'admin';
