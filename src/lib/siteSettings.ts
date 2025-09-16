import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type SiteSettingRecord = Database['public']['Tables']['site_settings']['Row'];
export type SiteSettingInsert = Database['public']['Tables']['site_settings']['Insert'];
export type SiteSettingUpdate = Database['public']['Tables']['site_settings']['Update'];

type TypedClient = SupabaseClient<Database>;

const SITE_SETTING_FIELDS = 'id, key, value, description, created_at, updated_at';

const resolveClient = (client?: TypedClient) => client ?? getSupabaseBrowserClient();

export const fetchSiteSettingByKey = async (
  key: string,
  client?: TypedClient
): Promise<SiteSettingRecord | null> => {
  const supabase = resolveClient(client);

  const { data, error } = await supabase
    .from('site_settings')
    .select(SITE_SETTING_FIELDS)
    .eq('key', key)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
};
