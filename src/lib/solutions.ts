import type { SupabaseClient } from '@/integrations/supabase';
import { getSupabaseClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

type SolutionsTable = Database['public']['Tables']['solutions'];
export type Solution = SolutionsTable['Row'];
export type SolutionInsert = SolutionsTable['Insert'];
export type SolutionUpdate = SolutionsTable['Update'];

export interface FetchSolutionsOptions {
  limit?: number;
  orderBy?: keyof Pick<Solution, 'created_at' | 'updated_at' | 'title'>;
  ascending?: boolean;
}

/**
 * Fetches all active solutions. RLS restricts the data to active records only.
 */
export const fetchActiveSolutions = async (
  options: FetchSolutionsOptions = {},
  client?: SupabaseClient
): Promise<Solution[]> => {
  const supabase = client ?? getSupabaseClient();

  const orderColumn = options.orderBy ?? 'created_at';
  const ascending = options.ascending ?? true;

  let query = supabase
    .from('solutions')
    .select('*')
    .eq('active', true)
    .order(orderColumn, { ascending });

  if (options.limit !== undefined) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
};

/**
 * Fetches a single active solution by slug. Returns null when not found or inactive.
 */
export const fetchActiveSolutionBySlug = async (
  slug: string,
  client?: SupabaseClient
): Promise<Solution | null> => {
  const supabase = client ?? getSupabaseClient();

  const { data, error } = await supabase
    .from('solutions')
    .select('*')
    .eq('active', true)
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
};
