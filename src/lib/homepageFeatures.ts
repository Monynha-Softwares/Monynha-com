import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type HomepageFeatureRow =
  Database['public']['Tables']['homepage_features']['Row'];

const HOMEPAGE_FEATURE_COLUMNS =
  'id, title, description, icon, url, order_index, active';

export const fetchActiveHomepageFeatures = async (
  client: SupabaseClient<Database> = getSupabaseClient()
): Promise<HomepageFeatureRow[]> => {
  const { data, error } = await client
    .from('homepage_features')
    .select(HOMEPAGE_FEATURE_COLUMNS)
    .eq('active', true)
    .order('order_index', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch homepage features: ${error.message}`);
  }

  return data ?? [];
};

