import type { SupabaseClient } from '@/integrations/supabase';
import { getSupabaseClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

type RepositoriesTable = Database['public']['Tables']['repositories'];
export type Repository = RepositoriesTable['Row'];
export type RepositoryInsert = RepositoriesTable['Insert'];
export type RepositoryUpdate = RepositoriesTable['Update'];

export interface FetchRepositoriesOptions {
  orderBy?: keyof Pick<Repository, 'created_at' | 'updated_at' | 'name'>;
  ascending?: boolean;
}

/**
 * Returns the list of repositories allowed by the RLS policy (active = true).
 */
export const fetchActiveRepositories = async (
  options: FetchRepositoriesOptions = {},
  client?: SupabaseClient
): Promise<Repository[]> => {
  const supabase = client ?? getSupabaseClient();

  const orderColumn = options.orderBy ?? 'created_at';
  const ascending = options.ascending ?? false;

  const { data, error } = await supabase
    .from('repositories')
    .select('*')
    .eq('active', true)
    .order(orderColumn, { ascending });

  if (error) {
    throw error;
  }

  return data ?? [];
};
