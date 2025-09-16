import type { SupabaseDatabaseClient } from '@/integrations/supabase';
import { getSupabaseBrowserClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type NewsletterSubscriberRow =
  Database['public']['Tables']['newsletter_subscribers']['Row'];
export type NewsletterSubscriberInsert =
  Database['public']['Tables']['newsletter_subscribers']['Insert'];

export const subscribeToNewsletter = async (
  email: string,
  client: SupabaseDatabaseClient = getSupabaseBrowserClient()
): Promise<void> => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error('O e-mail é obrigatório.');
  }

  const payload: NewsletterSubscriberInsert = {
    email: normalizedEmail,
    active: true,
  };

  const { error } = await client
    .from('newsletter_subscribers')
    .insert([payload]);

  if (error) {
    throw error;
  }
};
