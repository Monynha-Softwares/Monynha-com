import { getSupabaseBrowserClient, type TypedSupabaseClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type Solution = Database['public']['Tables']['solutions']['Row'];

export interface FetchSolutionsOptions {
  limit?: number;
  ascending?: boolean;
}

const getClient = (client?: TypedSupabaseClient) => client ?? getSupabaseBrowserClient();

export const fetchActiveSolutions = async (
  options: FetchSolutionsOptions = {},
  client?: TypedSupabaseClient
): Promise<Solution[]> => {
  const supabase = getClient(client);

  let query = supabase
    .from('solutions')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: options.ascending ?? true });

  if (typeof options.limit === 'number') {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load solutions: ${error.message}`);
  }

  return data ?? [];
};

export const fetchActiveSolutionBySlug = async (
  slug: string,
  client?: TypedSupabaseClient
): Promise<Solution | null> => {
  const supabase = getClient(client);
  const { data, error } = await supabase
    .from('solutions')
    .select('*')
    .eq('active', true)
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load solution: ${error.message}`);
  }

  return data ?? null;
};

export const extractSolutionFeatures = (solution: Solution): string[] => {
  const { features } = solution;
  if (Array.isArray(features)) {
    return features.filter((feature): feature is string => typeof feature === 'string');
  }
  return [];
};
