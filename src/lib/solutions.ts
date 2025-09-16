import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type SolutionRecord = Database['public']['Tables']['solutions']['Row'];
export type SolutionInsert = Database['public']['Tables']['solutions']['Insert'];
export type SolutionUpdate = Database['public']['Tables']['solutions']['Update'];

type TypedClient = SupabaseClient<Database>;

const SOLUTION_FIELDS =
  'id, title, description, slug, image_url, features, active, created_at, updated_at';

export interface FetchSolutionsOptions {
  client?: TypedClient;
  limit?: number;
  ascending?: boolean;
}

const resolveClient = (client?: TypedClient) => client ?? getSupabaseBrowserClient();

export const fetchActiveSolutions = async (
  options: FetchSolutionsOptions = {}
): Promise<SolutionRecord[]> => {
  const { client, limit, ascending = true } = options;
  const supabase = resolveClient(client);

  let query = supabase
    .from('solutions')
    .select(SOLUTION_FIELDS)
    .eq('active', true)
    .order('created_at', { ascending });

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

export const fetchSolutionBySlug = async (
  slug: string,
  client?: TypedClient
): Promise<SolutionRecord | null> => {
  const supabase = resolveClient(client);

  const { data, error } = await supabase
    .from('solutions')
    .select(SOLUTION_FIELDS)
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
};
