import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/integrations/supabase';
import type { Database, Tables } from '@/integrations/supabase/types';

export type TeamMember = Tables<'team_members'>;

export const listActiveTeamMembers = async (
  client: SupabaseClient<Database> = getSupabaseClient()
): Promise<TeamMember[]> => {
  const { data, error } = await client
    .from('team_members')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
};
