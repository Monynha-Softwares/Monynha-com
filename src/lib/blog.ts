import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/integrations/supabase';
import type { Database, Tables } from '@/integrations/supabase/types';

export type BlogPost = Tables<'blog_posts'>;

export const listPublishedBlogPosts = async (
  client: SupabaseClient<Database> = getSupabaseClient()
): Promise<BlogPost[]> => {
  const { data, error } = await client
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const getBlogPostBySlug = async (
  slug: BlogPost['slug'],
  client: SupabaseClient<Database> = getSupabaseClient()
): Promise<BlogPost | null> => {
  const { data, error } = await client
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
};
