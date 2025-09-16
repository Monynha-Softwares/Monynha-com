import type { SupabaseDatabaseClient } from '@/integrations/supabase';
import { getSupabaseBrowserClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type LeadRow = Database['public']['Tables']['leads']['Row'];
export type LeadInsert = Database['public']['Tables']['leads']['Insert'];

export const createLead = async (
  payload: LeadInsert,
  client: SupabaseDatabaseClient = getSupabaseBrowserClient()
): Promise<void> => {
  const sanitizedPayload: LeadInsert = {
    ...payload,
    email: payload.email.trim(),
    name: payload.name.trim(),
    message: payload.message.trim(),
    company: payload.company?.trim() || null,
    project: payload.project?.trim() || null,
  };

  const { error } = await client.from('leads').insert([sanitizedPayload]);

  if (error) {
    throw error;
  }
};
