import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type NewsletterSubscriberRecord =
  Database['public']['Tables']['newsletter_subscribers']['Row'];
export type NewsletterSubscriberInsert =
  Database['public']['Tables']['newsletter_subscribers']['Insert'];

type TypedClient = SupabaseClient<Database>;

const NEWSLETTER_FIELDS = 'id, email, active, subscribed_at';

const resolveClient = (client?: TypedClient) => client ?? getSupabaseBrowserClient();

export const subscribeToNewsletter = async (
  email: string,
  client?: TypedClient
): Promise<void> => {
  const supabase = resolveClient(client);
  const sanitizedEmail = email.trim();

  const entry: NewsletterSubscriberInsert = {
    email: sanitizedEmail,
  };

  const { error } = await supabase.from('newsletter_subscribers').insert([entry]);

  if (error) {
    throw error;
  }
};

export const fetchNewsletterSubscribersForAdmin = async (
  client: TypedClient
): Promise<NewsletterSubscriberRecord[]> => {
  const { data, error } = await client
    .from('newsletter_subscribers')
    .select(NEWSLETTER_FIELDS)
    .order('subscribed_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};
