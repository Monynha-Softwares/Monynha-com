import { getSupabaseBrowserClient, type TypedSupabaseClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type Lead = Database['public']['Tables']['leads']['Row'];
export type LeadInsert = Database['public']['Tables']['leads']['Insert'];

const getClient = (client?: TypedSupabaseClient) => client ?? getSupabaseBrowserClient();

export const createLead = async (
  payload: LeadInsert,
  client?: TypedSupabaseClient
): Promise<Lead> => {
  const supabase = getClient(client);
  const { data, error } = await supabase
    .from('leads')
    .insert([{ ...payload }])
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create lead: ${error.message}`);
  }

  return data;
};

export const fetchLeadsForAdmin = async (
  client: TypedSupabaseClient
): Promise<Lead[]> => {
  const { data, error } = await client
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load leads: ${error.message}`);
  }

  return data ?? [];
};
