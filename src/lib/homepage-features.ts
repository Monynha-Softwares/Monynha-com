import { getSupabaseBrowserClient, type TypedSupabaseClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type HomepageFeature = Database['public']['Tables']['homepage_features']['Row'];

const getClient = (client?: TypedSupabaseClient) => client ?? getSupabaseBrowserClient();

export const fetchActiveHomepageFeatures = async (
  client?: TypedSupabaseClient
): Promise<HomepageFeature[]> => {
  const supabase = getClient(client);
  const { data, error } = await supabase
    .from('homepage_features')
    .select('*')
    .eq('active', true)
    .order('order_index', { ascending: true });

  if (error) {
    throw new Error(`Failed to load homepage features: ${error.message}`);
  }

  return data ?? [];
};
