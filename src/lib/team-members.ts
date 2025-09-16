import { getSupabaseBrowserClient, type TypedSupabaseClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type TeamMember = Database['public']['Tables']['team_members']['Row'];

const getClient = (client?: TypedSupabaseClient) => client ?? getSupabaseBrowserClient();

export const fetchActiveTeamMembers = async (
  client?: TypedSupabaseClient
): Promise<TeamMember[]> => {
  const supabase = getClient(client);
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to load team members: ${error.message}`);
  }

  return data ?? [];
};
