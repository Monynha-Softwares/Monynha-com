import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase';
import type { Database, Tables } from '@/integrations/supabase/types';

export type TeamMember = Tables<'team_members'>;

export interface FetchTeamMembersOptions {
  client?: SupabaseClient<Database>;
  limit?: number;
  includeInactive?: boolean;
}

const DEFAULT_ORDER_COLUMN: keyof TeamMember = 'created_at';

const fetchTeamMembersInternal = async (
  options: FetchTeamMembersOptions
): Promise<TeamMember[]> => {
  const { client = supabase, limit, includeInactive = false } = options;

  let query = client.from('team_members').select('*');

  if (!includeInactive) {
    query = query.eq('active', true);
  }

  query = query.order(DEFAULT_ORDER_COLUMN, { ascending: true });

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  const { data, error } = await query.returns<TeamMember[]>();

  if (error) {
    throw new Error(`Failed to fetch team members: ${error.message}`);
  }

  return data ?? [];
};

export const fetchTeamMembers = async (
  options: FetchTeamMembersOptions = {}
): Promise<TeamMember[]> => fetchTeamMembersInternal(options);

export const fetchActiveTeamMembers = async (
  options: Omit<FetchTeamMembersOptions, 'includeInactive'> = {}
): Promise<TeamMember[]> =>
  fetchTeamMembersInternal({ ...options, includeInactive: false });
