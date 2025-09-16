import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase';
import type { Database, Tables, TablesInsert } from '@/integrations/supabase/types';

export type Lead = Tables<'leads'>;
export type LeadInsert = TablesInsert<'leads'>;

export interface LeadQueryOptions {
  client?: SupabaseClient<Database>;
  limit?: number;
}

export interface CreateLeadOptions {
  client?: SupabaseClient<Database>;
}

const ORDER_COLUMN: keyof Lead = 'created_at';

export const createLead = async (
  payload: LeadInsert,
  options: CreateLeadOptions = {}
): Promise<void> => {
  const { client = supabase } = options;

  const normalizedPayload: LeadInsert = {
    ...payload,
    company: payload.company ?? null,
    project: payload.project ?? null,
  };

  const { error } = await client
    .from('leads')
    .insert([normalizedPayload]);

  if (error) {
    throw error;
  }
};

export const fetchLeads = async (
  options: LeadQueryOptions = {}
): Promise<Lead[]> => {
  const { client = supabase, limit } = options;

  let query = client.from('leads').select('*');

  query = query.order(ORDER_COLUMN, { ascending: false });

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  const { data, error } = await query.returns<Lead[]>();

  if (error) {
    throw new Error(`Failed to fetch leads: ${error.message}`);
  }

  return data ?? [];
};
