import type { SupabaseDatabaseClient } from '@/integrations/supabase';
import { getSupabaseBrowserClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type TeamMemberRow = Database['public']['Tables']['team_members']['Row'];

export const fetchActiveTeamMembers = async (
  client: SupabaseDatabaseClient = getSupabaseBrowserClient()
): Promise<TeamMemberRow[]> => {
  const { data, error } = await client
    .from('team_members')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};
