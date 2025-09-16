import type { SupabaseClient } from '@/integrations/supabase';
import { getSupabaseClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

type LeadsTable = Database['public']['Tables']['leads'];
export type Lead = LeadsTable['Row'];
export type LeadInsert = LeadsTable['Insert'];

export interface CreateLeadInput {
  name: string;
  email: string;
  company?: string | null;
  project?: string | null;
  message: string;
}

const normalizeNullableText = (value: string | null | undefined) => {
  if (typeof value !== 'string') {
    return value ?? null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

/**
 * Public endpoint for submitting a new lead. Anyone can insert according to RLS.
 */
export const createLead = async (
  payload: CreateLeadInput,
  client?: SupabaseClient
): Promise<void> => {
  const supabase = client ?? getSupabaseClient();

  const { error } = await supabase.from('leads').insert([
    {
      name: payload.name,
      email: payload.email,
      company: normalizeNullableText(payload.company),
      project: normalizeNullableText(payload.project),
      message: payload.message,
    },
  ]);

  if (error) {
    throw error;
  }
};

/**
 * Admin-only helper that fetches every lead. Requires a privileged client (service role).
 */
export const fetchAllLeads = async (
  client: SupabaseClient
): Promise<Lead[]> => {
  const { data, error } = await client
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
};
