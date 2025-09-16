import type { SupabaseClient } from '@/integrations/supabase';
import { getSupabaseClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

type TeamMembersTable = Database['public']['Tables']['team_members'];
export type TeamMember = TeamMembersTable['Row'];

/**
 * Fetches active team members sorted by creation date (oldest first).
 */
export const fetchActiveTeamMembers = async (
  client?: SupabaseClient
): Promise<TeamMember[]> => {
  const supabase = client ?? getSupabaseClient();

  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
};
