import type { SupabaseClient } from '@/integrations/supabase';
import { getSupabaseClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

type HomepageFeaturesTable = Database['public']['Tables']['homepage_features'];
export type HomepageFeature = HomepageFeaturesTable['Row'];

/**
 * Fetches active homepage features ordered by their configured position.
 */
export const fetchActiveHomepageFeatures = async (
  client?: SupabaseClient
): Promise<HomepageFeature[]> => {
  const supabase = client ?? getSupabaseClient();

  const { data, error } = await supabase
    .from('homepage_features')
    .select('*')
    .eq('active', true)
    .order('order_index', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
};
