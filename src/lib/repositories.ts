import type { SupabaseDatabaseClient } from '@/integrations/supabase';
import { getSupabaseBrowserClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type RepositoryRow = Database['public']['Tables']['repositories']['Row'];

export const fetchActiveRepositories = async (
  client: SupabaseDatabaseClient = getSupabaseBrowserClient()
): Promise<RepositoryRow[]> => {
  const { data, error } = await client
    .from('repositories')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};
