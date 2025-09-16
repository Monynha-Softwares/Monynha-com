import { getSupabaseBrowserClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export type TeamMemberRow = Database['public']['Tables']['team_members']['Row'];

export const fetchActiveTeamMembers = async (
  client: SupabaseClient<Database> = getSupabaseBrowserClient()
): Promise<TeamMemberRow[]> => {
  const { data, error } = await client
    .from('team_members')
    .select(
      'id, name, role, bio, image_url, linkedin_url, active, created_at, updated_at'
    )
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to load team members: ${error.message}`);
  }

  return data ?? [];
};
