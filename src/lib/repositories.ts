import { getSupabaseBrowserClient, type TypedSupabaseClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type Repository = Database['public']['Tables']['repositories']['Row'];

const getClient = (client?: TypedSupabaseClient) => client ?? getSupabaseBrowserClient();

export const fetchActiveRepositories = async (
  client?: TypedSupabaseClient
): Promise<Repository[]> => {
  const supabase = getClient(client);
  const { data, error } = await supabase
    .from('repositories')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load repositories: ${error.message}`);
  }

  return data ?? [];
};
