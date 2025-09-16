import type { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type LeadRow = Database['public']['Tables']['leads']['Row'];
export type LeadInsert = Database['public']['Tables']['leads']['Insert'];

const LEAD_COLUMNS = 'id, name, email, company, project, message, created_at';

const sanitizeLeadInsert = (payload: LeadInsert): LeadInsert => ({
  name: payload.name?.trim() ?? '',
  email: payload.email?.trim() ?? '',
  company: payload.company?.trim() || null,
  project: payload.project?.trim() || null,
  message: payload.message?.trim() ?? '',
});

export class LeadMutationError extends Error {
  constructor(message: string, readonly cause?: PostgrestError) {
    super(message);
    this.name = 'LeadMutationError';
  }
}

export const createLead = async (
  payload: LeadInsert,
  client: SupabaseClient<Database> = getSupabaseClient()
): Promise<void> => {
  const lead = sanitizeLeadInsert(payload);

  const { error } = await client.from('leads').insert([lead]);

  if (error) {
    throw new LeadMutationError('Failed to submit lead form.', error);
  }
};

export const fetchLeads = async (
  client: SupabaseClient<Database> = getSupabaseClient()
): Promise<LeadRow[]> => {
  const { data, error } = await client
    .from('leads')
    .select(LEAD_COLUMNS)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch leads: ${error.message}`);
  }

  return data ?? [];
};

