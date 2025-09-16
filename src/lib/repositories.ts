import { getSupabaseBrowserClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export type RepositoryRow = Database['public']['Tables']['repositories']['Row'];

export const fetchActiveRepositories = async (
  client: SupabaseClient<Database> = getSupabaseBrowserClient()
): Promise<RepositoryRow[]> => {
  const { data, error } = await client
    .from('repositories')
    .select(
      'id, name, description, github_url, demo_url, tags, created_at, updated_at, active'
    )
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load repositories: ${error.message}`);
  }

  return data ?? [];
};
