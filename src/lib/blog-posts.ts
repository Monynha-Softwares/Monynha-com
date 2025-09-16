import type { SupabaseDatabaseClient } from '@/integrations/supabase';
import { getSupabaseBrowserClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type BlogPostRow = Pick<
  Database['public']['Tables']['blog_posts']['Row'],
  'id' | 'slug' | 'title' | 'excerpt' | 'image_url' | 'updated_at'
>;

export const fetchPublishedBlogPosts = async (
  client: SupabaseDatabaseClient = getSupabaseBrowserClient()
): Promise<BlogPostRow[]> => {
  const { data, error } = await client
    .from('blog_posts')
    .select('id, slug, title, excerpt, image_url, updated_at')
    .eq('published', true)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};
