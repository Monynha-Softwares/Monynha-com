import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type RepositoryRow = Database['public']['Tables']['repositories']['Row'];

const DEFAULT_REPOSITORY_COLUMNS =
  'id, name, description, github_url, demo_url, tags, active, created_at, updated_at';

export const fetchActiveRepositories = async (
  client: SupabaseClient<Database> = getSupabaseClient()
): Promise<RepositoryRow[]> => {
  const { data, error } = await client
    .from('repositories')
    .select(DEFAULT_REPOSITORY_COLUMNS)
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch repositories: ${error.message}`);
  }

  return data ?? [];
};

