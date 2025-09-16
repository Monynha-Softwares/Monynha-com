import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/integrations/supabase';
import type { Database, Tables, TablesInsert } from '@/integrations/supabase/types';

export type Lead = Tables<'leads'>;

export interface CreateLeadPayload {
  name: string;
  email: string;
  message: string;
  company?: string | null;
  project?: string | null;
}

export const createLead = async (
  payload: CreateLeadPayload,
  client: SupabaseClient<Database> = getSupabaseClient()
): Promise<Lead> => {
  const leadPayload: TablesInsert<'leads'> = {
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    message: payload.message.trim(),
    company: payload.company?.trim() || null,
    project: payload.project?.trim() || null,
  };

  const { data, error } = await client
    .from('leads')
    .insert(leadPayload)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Lead insertion succeeded but no data was returned.');
  }

  return data;
};
