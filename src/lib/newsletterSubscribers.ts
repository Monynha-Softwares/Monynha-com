import type { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type NewsletterSubscriberRow =
  Database['public']['Tables']['newsletter_subscribers']['Row'];

const NEWSLETTER_COLUMNS = 'id, email, active, subscribed_at';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export class NewsletterSubscriptionError extends Error {
  constructor(message: string, readonly cause?: PostgrestError) {
    super(message);
    this.name = 'NewsletterSubscriptionError';
  }

  get code(): string | undefined {
    return this.cause?.code;
  }
}

export const subscribeToNewsletter = async (
  email: string,
  client: SupabaseClient<Database> = getSupabaseClient()
): Promise<void> => {
  const normalizedEmail = normalizeEmail(email);
  const { error } = await client
    .from('newsletter_subscribers')
    .insert([{ email: normalizedEmail }]);

  if (error) {
    throw new NewsletterSubscriptionError(
      'Failed to subscribe to the newsletter.',
      error
    );
  }
};

export const fetchNewsletterSubscribers = async (
  client: SupabaseClient<Database> = getSupabaseClient()
): Promise<NewsletterSubscriberRow[]> => {
  const { data, error } = await client
    .from('newsletter_subscribers')
    .select(NEWSLETTER_COLUMNS)
    .order('subscribed_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch newsletter subscribers: ${error.message}`);
  }

  return data ?? [];
};

