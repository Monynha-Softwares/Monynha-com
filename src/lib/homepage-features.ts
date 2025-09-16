import type { SupabaseDatabaseClient } from '@/integrations/supabase';
import { getSupabaseBrowserClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

type HomepageFeatureRow = Database['public']['Tables']['homepage_features']['Row'];

type HomepageFeature = HomepageFeatureRow;

export const fetchActiveHomepageFeatures = async (
  client: SupabaseDatabaseClient = getSupabaseBrowserClient()
): Promise<HomepageFeature[]> => {
  const { data, error } = await client
    .from('homepage_features')
    .select('*')
    .eq('active', true)
    .order('order_index', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

export type { HomepageFeature };
