import { getSupabaseBrowserClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export type HomepageFeatureRow =
  Database['public']['Tables']['homepage_features']['Row'];

export const fetchActiveHomepageFeatures = async (
  client: SupabaseClient<Database> = getSupabaseBrowserClient()
): Promise<HomepageFeatureRow[]> => {
  const { data, error } = await client
    .from('homepage_features')
    .select(
      'id, title, description, icon, url, order_index, active, created_at, updated_at'
    )
    .eq('active', true)
    .order('order_index', { ascending: true });

  if (error) {
    throw new Error(`Failed to load homepage features: ${error.message}`);
  }

  return data ?? [];
};
