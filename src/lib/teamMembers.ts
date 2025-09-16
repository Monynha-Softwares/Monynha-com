import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type TeamMemberRecord = Database['public']['Tables']['team_members']['Row'];
export type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert'];
export type TeamMemberUpdate = Database['public']['Tables']['team_members']['Update'];

type TypedClient = SupabaseClient<Database>;

const TEAM_MEMBER_FIELDS =
  'id, name, role, bio, image_url, linkedin_url, active, created_at, updated_at';

const resolveClient = (client?: TypedClient) => client ?? getSupabaseBrowserClient();

export const fetchActiveTeamMembers = async (client?: TypedClient): Promise<TeamMemberRecord[]> => {
  const supabase = resolveClient(client);

  const { data, error } = await supabase
    .from('team_members')
    .select(TEAM_MEMBER_FIELDS)
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};
