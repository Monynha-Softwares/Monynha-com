import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type BlogPostRow = Database['public']['Tables']['blog_posts']['Row'];

const BLOG_POST_COLUMNS =
  'id, slug, title, excerpt, image_url, updated_at, published';

export const fetchPublishedBlogPosts = async (
  client: SupabaseClient<Database> = getSupabaseClient()
): Promise<BlogPostRow[]> => {
  const { data, error } = await client
    .from('blog_posts')
    .select(BLOG_POST_COLUMNS)
    .eq('published', true)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch blog posts: ${error.message}`);
  }

  return data ?? [];
};

