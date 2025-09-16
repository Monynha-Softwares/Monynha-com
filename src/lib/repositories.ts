import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type RepositoryRecord = Database['public']['Tables']['repositories']['Row'];
export type RepositoryInsert = Database['public']['Tables']['repositories']['Insert'];
export type RepositoryUpdate = Database['public']['Tables']['repositories']['Update'];

type TypedClient = SupabaseClient<Database>;

const REPOSITORY_FIELDS =
  'id, name, description, github_url, demo_url, tags, active, created_at, updated_at';

export interface FetchRepositoriesOptions {
  client?: TypedClient;
  ascending?: boolean;
}

const resolveClient = (client?: TypedClient) => client ?? getSupabaseBrowserClient();

export const fetchActiveRepositories = async (
  options: FetchRepositoriesOptions = {}
): Promise<RepositoryRecord[]> => {
  const { client, ascending = false } = options;
  const supabase = resolveClient(client);

  const { data, error } = await supabase
    .from('repositories')
    .select(REPOSITORY_FIELDS)
    .eq('active', true)
    .order('created_at', { ascending });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};
