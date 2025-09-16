import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase';
import type { Database, Tables } from '@/integrations/supabase/types';

export type BlogPost = Tables<'blog_posts'>;

export interface FetchBlogPostsOptions {
  client?: SupabaseClient<Database>;
  limit?: number;
  includeUnpublished?: boolean;
}

const ORDER_COLUMN: keyof BlogPost = 'updated_at';

const fetchBlogPostsInternal = async (
  options: FetchBlogPostsOptions
): Promise<BlogPost[]> => {
  const { client = supabase, limit, includeUnpublished = false } = options;

  let query = client.from('blog_posts').select('*');

  if (!includeUnpublished) {
    query = query.eq('published', true);
  }

  query = query.order(ORDER_COLUMN, { ascending: false });

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  const { data, error } = await query.returns<BlogPost[]>();

  if (error) {
    throw new Error(`Failed to fetch blog posts: ${error.message}`);
  }

  return data ?? [];
};

export const fetchBlogPosts = async (
  options: FetchBlogPostsOptions = {}
): Promise<BlogPost[]> => fetchBlogPostsInternal(options);

export const fetchPublishedBlogPosts = async (
  options: Omit<FetchBlogPostsOptions, 'includeUnpublished'> = {}
): Promise<BlogPost[]> =>
  fetchBlogPostsInternal({ ...options, includeUnpublished: false });
