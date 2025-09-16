import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase';
import type { Database, Tables } from '@/integrations/supabase/types';

export type Repository = Tables<'repositories'>;

export interface FetchRepositoriesOptions {
  client?: SupabaseClient<Database>;
  limit?: number;
  includeInactive?: boolean;
}

/**
 * Retrieves repositories respecting row-level security policies.
 */
export const fetchRepositories = async (
  options: FetchRepositoriesOptions = {}
): Promise<Repository[]> => {
  const { client = supabase, limit, includeInactive = false } = options;

  let query = client.from('repositories').select('*');

  if (!includeInactive) {
    query = query.eq('active', true);
  }

  query = query.order('created_at', { ascending: false });

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  const { data, error } = await query.returns<Repository[]>();

  if (error) {
    throw new Error(`Failed to fetch repositories: ${error.message}`);
  }

  return data ?? [];
};
