import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/integrations/supabase';
import type { Database, Tables } from '@/integrations/supabase/types';

export type Solution = Tables<'solutions'>;

export interface SolutionsQueryOptions {
  limit?: number;
}

export const listActiveSolutions = async (
  options: SolutionsQueryOptions = {},
  client: SupabaseClient<Database> = getSupabaseClient()
): Promise<Solution[]> => {
  const query = client
    .from('solutions')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (options.limit) {
    query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const getSolutionBySlug = async (
  slug: Solution['slug'],
  client: SupabaseClient<Database> = getSupabaseClient()
): Promise<Solution | null> => {
  const { data, error } = await client
    .from('solutions')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
};
