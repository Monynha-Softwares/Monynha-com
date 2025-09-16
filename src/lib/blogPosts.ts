import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';

export type BlogPostRecord = Database['public']['Tables']['blog_posts']['Row'];
export type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert'];
export type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update'];

type TypedClient = SupabaseClient<Database>;

const BLOG_POST_FIELDS =
  'id, slug, title, excerpt, content, image_url, published, created_at, updated_at';

const resolveClient = (client?: TypedClient) => client ?? getSupabaseBrowserClient();

export const fetchPublishedBlogPosts = async (client?: TypedClient): Promise<BlogPostRecord[]> => {
  const supabase = resolveClient(client);

  const { data, error } = await supabase
    .from('blog_posts')
    .select(BLOG_POST_FIELDS)
    .eq('published', true)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

export const fetchBlogPostBySlug = async (
  slug: string,
  client?: TypedClient
): Promise<BlogPostRecord | null> => {
  const supabase = resolveClient(client);

  const { data, error } = await supabase
    .from('blog_posts')
    .select(BLOG_POST_FIELDS)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
};
