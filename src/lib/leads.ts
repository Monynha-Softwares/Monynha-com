import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type LeadRecord = Database['public']['Tables']['leads']['Row'];
export type LeadInsert = Database['public']['Tables']['leads']['Insert'];

type TypedClient = SupabaseClient<Database>;

const LEAD_FIELDS =
  'id, name, email, company, project, message, created_at';

const resolveClient = (client?: TypedClient) => client ?? getSupabaseBrowserClient();

export interface CreateLeadPayload {
  name: string;
  email: string;
  message: string;
  company?: string | null;
  project?: string | null;
}

const sanitizeOptionalField = (value?: string | null) => {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const createLead = async (
  payload: CreateLeadPayload,
  client?: TypedClient
): Promise<void> => {
  const supabase = resolveClient(client);

  const entry: LeadInsert = {
    name: payload.name.trim(),
    email: payload.email.trim(),
    message: payload.message.trim(),
    company: sanitizeOptionalField(payload.company),
    project: sanitizeOptionalField(payload.project),
  };

  const { error } = await supabase.from('leads').insert([entry]);

  if (error) {
    throw error;
  }
};

export const fetchLeadsForAdmin = async (
  client: TypedClient
): Promise<LeadRecord[]> => {
  const { data, error } = await client
    .from('leads')
    .select(LEAD_FIELDS)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};
