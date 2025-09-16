import type { SupabaseClient } from '@/integrations/supabase';
import { getSupabaseClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

type NewsletterTable = Database['public']['Tables']['newsletter_subscribers'];
export type NewsletterSubscriber = NewsletterTable['Row'];
export type NewsletterSubscriberInsert = NewsletterTable['Insert'];

/**
 * Public action to subscribe a new email address to the newsletter.
 */
export const subscribeToNewsletter = async (
  email: string,
  client?: SupabaseClient
): Promise<void> => {
  const supabase = client ?? getSupabaseClient();

  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert([{ email: email.trim().toLowerCase() }]);

  if (error) {
    throw error;
  }
};

/**
 * Admin helper to list subscribers. Requires a privileged client.
 */
export const fetchNewsletterSubscribers = async (
  client: SupabaseClient
): Promise<NewsletterSubscriber[]> => {
  const { data, error } = await client
    .from('newsletter_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
};
