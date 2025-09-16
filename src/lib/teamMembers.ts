import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type TeamMemberRow = Database['public']['Tables']['team_members']['Row'];

const TEAM_MEMBER_COLUMNS =
  'id, name, role, bio, image_url, linkedin_url, active, created_at';

export const fetchActiveTeamMembers = async (
  client: SupabaseClient<Database> = getSupabaseClient()
): Promise<TeamMemberRow[]> => {
  const { data, error } = await client
    .from('team_members')
    .select(TEAM_MEMBER_COLUMNS)
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch team members: ${error.message}`);
  }

  return data ?? [];
};

