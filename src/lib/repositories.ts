import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/integrations/supabase';
import type { Database, Tables } from '@/integrations/supabase/types';

export type Repository = Tables<'repositories'>;

export const listActiveRepositories = async (
  client: SupabaseClient<Database> = getSupabaseClient()
): Promise<Repository[]> => {
  const { data, error } = await client
    .from('repositories')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
};
