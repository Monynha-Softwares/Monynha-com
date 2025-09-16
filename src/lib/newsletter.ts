import { getSupabaseBrowserClient, type TypedSupabaseClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type NewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Row'];

const getClient = (client?: TypedSupabaseClient) => client ?? getSupabaseBrowserClient();

export const subscribeToNewsletter = async (
  email: string,
  client?: TypedSupabaseClient
): Promise<NewsletterSubscriber> => {
  const supabase = getClient(client);
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .insert([{ email }])
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const fetchNewsletterSubscribersForAdmin = async (
  client: TypedSupabaseClient
): Promise<NewsletterSubscriber[]> => {
  const { data, error } = await client
    .from('newsletter_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load newsletter subscribers: ${error.message}`);
  }

  return data ?? [];
};
