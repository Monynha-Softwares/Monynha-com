import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type HomepageFeatureRecord = Database['public']['Tables']['homepage_features']['Row'];
export type HomepageFeatureInsert = Database['public']['Tables']['homepage_features']['Insert'];
export type HomepageFeatureUpdate = Database['public']['Tables']['homepage_features']['Update'];

type TypedClient = SupabaseClient<Database>;

const HOMEPAGE_FEATURE_FIELDS =
  'id, title, description, icon, url, order_index, active, created_at, updated_at';

const resolveClient = (client?: TypedClient) => client ?? getSupabaseBrowserClient();

export const fetchActiveHomepageFeatures = async (
  client?: TypedClient
): Promise<HomepageFeatureRecord[]> => {
  const supabase = resolveClient(client);

  const { data, error } = await supabase
    .from('homepage_features')
    .select(HOMEPAGE_FEATURE_FIELDS)
    .eq('active', true)
    .order('order_index', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};
