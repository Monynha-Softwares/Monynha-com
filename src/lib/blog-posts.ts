import { getSupabaseBrowserClient, type TypedSupabaseClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type BlogPost = Database['public']['Tables']['blog_posts']['Row'];

const getClient = (client?: TypedSupabaseClient) => client ?? getSupabaseBrowserClient();

export const fetchPublishedBlogPosts = async (
  client?: TypedSupabaseClient
): Promise<BlogPost[]> => {
  const supabase = getClient(client);
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load blog posts: ${error.message}`);
  }

  return data ?? [];
};

export const fetchPublishedBlogPostBySlug = async (
  slug: string,
  client?: TypedSupabaseClient
): Promise<BlogPost | null> => {
  const supabase = getClient(client);
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load blog post: ${error.message}`);
  }

  return data ?? null;
};
