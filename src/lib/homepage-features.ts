import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase';
import type { Database, Tables } from '@/integrations/supabase/types';

export type HomepageFeature = Tables<'homepage_features'>;

export interface FetchHomepageFeaturesOptions {
  client?: SupabaseClient<Database>;
  limit?: number;
  includeInactive?: boolean;
}

const ORDER_COLUMN: keyof HomepageFeature = 'order_index';

const fetchHomepageFeaturesInternal = async (
  options: FetchHomepageFeaturesOptions
): Promise<HomepageFeature[]> => {
  const { client = supabase, limit, includeInactive = false } = options;

  let query = client.from('homepage_features').select('*');

  if (!includeInactive) {
    query = query.eq('active', true);
  }

  query = query.order(ORDER_COLUMN, { ascending: true });

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  const { data, error } = await query.returns<HomepageFeature[]>();

  if (error) {
    throw new Error(`Failed to fetch homepage features: ${error.message}`);
  }

  return data ?? [];
};

export const fetchHomepageFeatures = async (
  options: FetchHomepageFeaturesOptions = {}
): Promise<HomepageFeature[]> => fetchHomepageFeaturesInternal(options);

export const fetchActiveHomepageFeatures = async (
  options: Omit<FetchHomepageFeaturesOptions, 'includeInactive'> = {}
): Promise<HomepageFeature[]> =>
  fetchHomepageFeaturesInternal({ ...options, includeInactive: false });
