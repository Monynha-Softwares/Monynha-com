import { getSupabaseBrowserClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export type NewsletterSubscriberRow =
  Database['public']['Tables']['newsletter_subscribers']['Row'];
export type NewsletterInsert =
  Database['public']['Tables']['newsletter_subscribers']['Insert'];

export const subscribeToNewsletter = async (
  email: string,
  client: SupabaseClient<Database> = getSupabaseBrowserClient()
): Promise<void> => {
  const normalizedEmail = email.trim().toLowerCase();

  const { error } = await client
    .from('newsletter_subscribers')
    .insert([{ email: normalizedEmail } satisfies NewsletterInsert]);

  if (error) {
    throw error;
  }
};

export const fetchNewsletterSubscribersForAdmin = async (
  client: SupabaseClient<Database>
): Promise<NewsletterSubscriberRow[]> => {
  const { data, error } = await client
    .from('newsletter_subscribers')
    .select('id, email, active, subscribed_at')
    .order('subscribed_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load newsletter subscribers: ${error.message}`);
  }

  return data ?? [];
};
