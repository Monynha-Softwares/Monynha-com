import { getSupabaseBrowserClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export type BlogPostRow = Database['public']['Tables']['blog_posts']['Row'];

const BLOG_POST_COLUMNS =
  'id, slug, title, excerpt, content, image_url, published, created_at, updated_at';

export const fetchPublishedBlogPosts = async (
  client: SupabaseClient<Database> = getSupabaseBrowserClient()
): Promise<BlogPostRow[]> => {
  const { data, error } = await client
    .from('blog_posts')
    .select(BLOG_POST_COLUMNS)
    .eq('published', true)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load blog posts: ${error.message}`);
  }

  return data ?? [];
};

export const fetchPublishedBlogPostBySlug = async (
  slug: string,
  client: SupabaseClient<Database> = getSupabaseBrowserClient()
): Promise<BlogPostRow | null> => {
  if (!slug) {
    return null;
  }

  const { data, error } = await client
    .from('blog_posts')
    .select(BLOG_POST_COLUMNS)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to load blog post: ${error.message}`);
  }

  return data ?? null;
};
