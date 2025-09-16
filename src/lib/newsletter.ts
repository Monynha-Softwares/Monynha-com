import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/integrations/supabase';
import type { Database, Tables, TablesInsert } from '@/integrations/supabase/types';

export type NewsletterSubscriber = Tables<'newsletter_subscribers'>;

export const subscribeToNewsletter = async (
  email: string,
  client: SupabaseClient<Database> = getSupabaseClient()
): Promise<NewsletterSubscriber | null> => {
  const sanitizedEmail = email.trim().toLowerCase();

  const payload: TablesInsert<'newsletter_subscribers'> = {
    email: sanitizedEmail,
    active: true,
  };

  const { data, error } = await client
    .from('newsletter_subscribers')
    .insert(payload)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
};
