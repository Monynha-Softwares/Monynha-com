import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase';
import type { Database, Tables, TablesInsert } from '@/integrations/supabase/types';

export type NewsletterSubscriber = Tables<'newsletter_subscribers'>;
export type NewsletterSubscriberInsert = TablesInsert<'newsletter_subscribers'>;

export interface NewsletterQueryOptions {
  client?: SupabaseClient<Database>;
  limit?: number;
  includeInactive?: boolean;
}

export interface SubscribeToNewsletterOptions {
  client?: SupabaseClient<Database>;
}

const ORDER_COLUMN: keyof NewsletterSubscriber = 'subscribed_at';

export const subscribeToNewsletter = async (
  email: string,
  options: SubscribeToNewsletterOptions = {}
): Promise<void> => {
  const { client = supabase } = options;
  const normalizedEmail = email.trim().toLowerCase();

  const payload: NewsletterSubscriberInsert = {
    email: normalizedEmail,
  };

  const { error } = await client
    .from('newsletter_subscribers')
    .insert([payload]);

  if (error) {
    throw error;
  }
};

export const fetchNewsletterSubscribers = async (
  options: NewsletterQueryOptions = {}
): Promise<NewsletterSubscriber[]> => {
  const { client = supabase, limit, includeInactive = false } = options;

  let query = client.from('newsletter_subscribers').select('*');

  if (!includeInactive) {
    query = query.eq('active', true);
  }

  query = query.order(ORDER_COLUMN, { ascending: false });

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  const { data, error } = await query.returns<NewsletterSubscriber[]>();

  if (error) {
    throw new Error(`Failed to fetch newsletter subscribers: ${error.message}`);
  }

  return data ?? [];
};
