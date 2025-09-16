import { getSupabaseBrowserClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export type LeadRow = Database['public']['Tables']['leads']['Row'];
export type LeadInsert = Database['public']['Tables']['leads']['Insert'];

export interface LeadFormInput {
  name: string;
  email: string;
  company?: string;
  project?: string;
  message: string;
}

export const submitLead = async (
  input: LeadFormInput,
  client: SupabaseClient<Database> = getSupabaseBrowserClient()
): Promise<void> => {
  const payload: LeadInsert = {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    company: input.company?.trim() ? input.company.trim() : null,
    project: input.project?.trim() ? input.project.trim() : null,
    message: input.message.trim(),
  };

  const { error } = await client.from('leads').insert([payload]);

  if (error) {
    throw new Error(`Failed to submit lead: ${error.message}`);
  }
};

export const fetchLeadsForAdmin = async (
  client: SupabaseClient<Database>
): Promise<LeadRow[]> => {
  const { data, error } = await client
    .from('leads')
    .select('id, name, email, company, project, message, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load leads: ${error.message}`);
  }

  return data ?? [];
};
