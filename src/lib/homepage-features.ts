import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/integrations/supabase';
import type { Database, Tables } from '@/integrations/supabase/types';

export type HomepageFeature = Tables<'homepage_features'>;

export const listActiveHomepageFeatures = async (
  client: SupabaseClient<Database> = getSupabaseClient()
): Promise<HomepageFeature[]> => {
  const { data, error } = await client
    .from('homepage_features')
    .select('*')
    .eq('active', true)
    .order('order_index', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
};
