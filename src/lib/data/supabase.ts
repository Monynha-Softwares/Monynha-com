import { supabase } from '@/integrations/supabase';
import type { Tables } from '@/lib/supabase/types.gen';
import type { SolutionContent } from '@/types/solutions';

export type SupabaseSolutionRow = Tables<'solutions'>;
export type HomepageFeatureRow = Tables<'homepage_features'>;
export type TeamMemberRow = Tables<'team_members'>;
export type RepositoryRow = Tables<'repositories'>;
export type BlogPostRow = Tables<'blog_posts'>;
export type CommentRow = Tables<'comments'>;
export type ProfileRow = Tables<'profiles'>;

const DEFAULT_SOLUTION_GRADIENT = 'from-brand-purple to-brand-blue';

type SupabaseClientError = { message: string; code?: string };

const wrapSupabaseError = (error: SupabaseClientError): never => {
  const wrappedError = new Error(error.message) as Error & {
    code?: string;
  };

  if (error.code) {
    wrappedError.code = error.code;
  }

  throw wrappedError;
};

const toStringArray = (value: unknown): string[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === 'string') {
          return entry;
        }

        if (typeof entry === 'number' || typeof entry === 'boolean') {
          return String(entry);
        }

        return null;
      })
      .filter((entry): entry is string => Boolean(entry && entry.trim().length > 0));
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? toStringArray(parsed) : [];
    } catch {
      return value.trim().length > 0 ? [value] : [];
    }
  }

  return [];
};

const ensureJsonObject = <T extends Record<string, unknown>>(value: unknown): T | null => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      return ensureJsonObject<T>(parsed);
    } catch {
      return null;
    }
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as T;
  }

  return null;
};

const parseSiteSettingValue = <T>(value: unknown): T | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  return value as T;
};

export interface SolutionsQueryOptions {
  limit?: number;
  slug?: string;
  activeOnly?: boolean;
  orderAscending?: boolean;
}

export const fetchSolutions = async (
  options: SolutionsQueryOptions = {}
): Promise<SolutionContent[]> => {
  const { limit, slug, activeOnly = true, orderAscending = true } = options;

  let query = supabase
    .from('solutions')
    .select('*')
    .order('created_at', { ascending: orderAscending });

  if (activeOnly) {
    query = query.eq('active', true);
  }

  if (slug) {
    query = query.eq('slug', slug);
  }

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    wrapSupabaseError(error);
  }

  const rows: SupabaseSolutionRow[] = data ?? [];

  return rows.map((solution) => ({
    id: solution.id,
    title: solution.title,
    description: solution.description,
    slug: solution.slug,
    imageUrl: solution.image_url,
    features: toStringArray(solution.features),
    gradient:
      solution.gradient && solution.gradient.length > 0
        ? solution.gradient
        : DEFAULT_SOLUTION_GRADIENT,
  }));
};

export const fetchSolutionBySlug = async (
  slug: string
): Promise<SolutionContent | null> => {
  const { data, error } = await supabase
    .from('solutions')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();

  if (error) {
    wrapSupabaseError(error);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    slug: data.slug,
    imageUrl: data.image_url,
    features: toStringArray(data.features),
    gradient:
      data.gradient && data.gradient.length > 0
        ? data.gradient
        : DEFAULT_SOLUTION_GRADIENT,
  } satisfies SolutionContent;
};

export const fetchHomepageFeatures = async (): Promise<HomepageFeatureRow[]> => {
  const { data, error } = await supabase
    .from('homepage_features')
    .select('*')
    .eq('active', true)
    .order('order_index', { ascending: true });

  if (error) {
    wrapSupabaseError(error);
  }

  return data ?? [];
};

export const fetchTeamMembers = async (): Promise<TeamMemberRow[]> => {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (error) {
    wrapSupabaseError(error);
  }

  return data ?? [];
};

export const fetchRepositories = async (): Promise<RepositoryRow[]> => {
  const { data, error } = await supabase
    .from('repositories')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    wrapSupabaseError(error);
  }

  return data ?? [];
};

export interface BlogPostsResult {
  posts: Array<
    Pick<
      BlogPostRow,
      'id' | 'slug' | 'title' | 'excerpt' | 'image_url' | 'updated_at'
    >
  >;
  total: number;
}

export const fetchPublishedBlogPosts = async (
  page: number,
  pageSize: number
): Promise<BlogPostsResult> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, image_url, updated_at', {
      count: 'exact',
    })
    .eq('published', true)
    .order('updated_at', { ascending: false })
    .range(from, to);

  if (error) {
    wrapSupabaseError(error);
  }

  return {
    posts: data ?? [],
    total: count ?? 0,
  };
};

export const fetchPublishedBlogPostBySlug = async (
  slug: string
): Promise<BlogPostRow | null> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error) {
    wrapSupabaseError(error);
  }

  return data ?? null;
};

export interface CommentWithAuthor extends CommentRow {
  author: Pick<ProfileRow, 'name' | 'avatar_url'> | null;
}

export const fetchCommentsWithAuthors = async (
  postId: string
): Promise<CommentWithAuthor[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select('id, post_id, user_id, content, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    wrapSupabaseError(error);
  }

  if (!data?.length) {
    return [];
  }

  const userIds = Array.from(
    new Set(data.map((comment) => comment.user_id).filter(Boolean))
  );

  let profilesMap = new Map<string, Pick<ProfileRow, 'name' | 'avatar_url'>>();

  if (userIds.length > 0) {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, name, avatar_url')
      .in('user_id', userIds);

    if (!profilesError && profilesData) {
      profilesMap = new Map(
        profilesData.map((profile) => [profile.user_id, profile])
      );
    } else if (profilesError) {
      console.error('Unable to load comment authors', profilesError);
    }
  }

  return data.map((comment) => ({
    ...comment,
    author: profilesMap.get(comment.user_id) ?? null,
  }));
};

export const insertComment = async (
  input: Pick<CommentRow, 'post_id' | 'user_id' | 'content'>
): Promise<void> => {
  const { error } = await supabase.from('comments').insert(input);

  if (error) {
    wrapSupabaseError(error);
  }
};

export interface NewsletterSubscriptionInput {
  email: string;
}

export const subscribeToNewsletter = async (
  input: NewsletterSubscriptionInput
): Promise<void> => {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email: input.email });

  if (error) {
    wrapSupabaseError(error);
  }
};

export interface LeadInput {
  name: string;
  email: string;
  message: string;
  company?: string | null;
  project?: string | null;
}

export const createLead = async (input: LeadInput): Promise<void> => {
  const { error } = await supabase.from('leads').insert({
    name: input.name,
    email: input.email,
    company: input.company ?? null,
    project: input.project ?? null,
    message: input.message,
  });

  if (error) {
    wrapSupabaseError(error);
  }
};

export const fetchSiteSettingValue = async <T = unknown>(
  key: string
): Promise<T | null> => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    wrapSupabaseError(error);
  }

  return parseSiteSettingValue<T>(data?.value ?? null);
};

export interface ContactInfoSetting {
  email?: string;
  phone?: string;
  address?: string;
  linkedin?: string;
}

export const fetchContactInfo = async (): Promise<ContactInfoSetting | null> => {
  const value = await fetchSiteSettingValue<unknown>('contact_info');
  return ensureJsonObject<ContactInfoSetting>(value) ?? null;
};

export const fetchProjectTypes = async (): Promise<string[]> => {
  const value = await fetchSiteSettingValue<unknown>('project_types');
  return toStringArray(value);
};

export type LocalizedCopy = Record<string, Record<string, string>>;

export const fetchLocalizedCopy = async (): Promise<LocalizedCopy | null> => {
  const value = await fetchSiteSettingValue<unknown>('localized_copy');
  return ensureJsonObject<LocalizedCopy>(value);
};
