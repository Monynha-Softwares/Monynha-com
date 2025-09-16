import type { SupabaseClient } from '@/integrations/supabase';
import { getSupabaseClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

type BlogPostsTable = Database['public']['Tables']['blog_posts'];
export type BlogPost = BlogPostsTable['Row'];

export interface FetchBlogPostsOptions {
  limit?: number;
}

/**
 * Returns the list of published blog posts ordered by most recent update.
 */
export const fetchPublishedBlogPosts = async (
  options: FetchBlogPostsOptions = {},
  client?: SupabaseClient
): Promise<BlogPost[]> => {
  const supabase = client ?? getSupabaseClient();

  let query = supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('updated_at', { ascending: false });

  if (options.limit !== undefined) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
};

/**
 * Fetches a single published blog post.
 */
export const fetchPublishedBlogPostBySlug = async (
  slug: string,
  client?: SupabaseClient
): Promise<BlogPost | null> => {
  const supabase = client ?? getSupabaseClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
};
