import {
  fallbackSolutions,
  fallbackSolutionsMap,
  gradientOptions,
  normalizeSolutionSlug,
} from '@/data/solutions';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase';
import type { Database, Tables } from '@/integrations/supabase/types';
import type { SolutionContent } from '@/types/solutions';

export interface GitHubRepository {
  id: number;
  name: string;
  description: string | null;
  homepage: string | null;
  topics?: string[];
  language: string | null;
  private: boolean;
  archived: boolean;
  disabled: boolean;
  visibility: string;
  default_branch: string;
  stargazers_count: number;
  watchers_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  html_url: string;
}

export type SupabaseSolutionRow = Tables<'solutions'>;

const uniqueNonEmpty = (values: Array<string | null | undefined>): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (!value) {
      continue;
    }

    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }

    seen.add(trimmed);
    result.push(trimmed);
  }

  return result;
};

const coerceToStringArray = (value: unknown): string[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return uniqueNonEmpty(
      value.map((item) => {
        if (typeof item === 'string') {
          return item;
        }

        if (typeof item === 'number' || typeof item === 'boolean') {
          return String(item);
        }

        return null;
      })
    );
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return coerceToStringArray(parsed);
      }
    } catch {
      return uniqueNonEmpty([value]);
    }
  }

  return [];
};

const formatDate = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const buildFeatureList = (
  repository: GitHubRepository,
  fallback?: SolutionContent
): string[] => {
  const normalizedTopics = Array.isArray(repository.topics)
    ? uniqueNonEmpty(repository.topics)
    : [];

  const formattedUpdatedAt =
    formatDate(repository.updated_at ?? repository.pushed_at) ?? undefined;

  const metadata = uniqueNonEmpty([
    repository.language ? `Built with ${repository.language}.` : null,
    repository.homepage ? `Live project: ${repository.homepage}` : null,
    repository.stargazers_count > 0
      ? `${repository.stargazers_count} ⭐ stars on GitHub`
      : null,
    repository.open_issues_count > 0
      ? `${repository.open_issues_count} open issues`
      : null,
    repository.default_branch
      ? `Default branch: ${repository.default_branch}`
      : null,
    formattedUpdatedAt ? `Last updated on ${formattedUpdatedAt}` : null,
  ]);

  const combined = uniqueNonEmpty([...normalizedTopics, ...metadata]);

  if (combined.length > 0) {
    return combined;
  }

  return fallback?.features ? [...fallback.features] : [];
};

export const mapGitHubRepoToContent = (
  repository: GitHubRepository,
  index: number
): SolutionContent => {
  const normalizedSlug = normalizeSolutionSlug(repository.name);
  const fallback =
    fallbackSolutionsMap[normalizedSlug] ?? fallbackSolutionsMap[repository.name];
  const gradient =
    fallback?.gradient ?? gradientOptions[index % gradientOptions.length];

  const description = repository.description?.trim();

  return {
    id: String(repository.id),
    title: fallback?.title ?? repository.name,
    description:
      description && description.length > 0
        ? description
        : fallback?.description ??
          'Open-source solution maintained by Monynha Softwares.',
    slug: repository.name,
    imageUrl: fallback?.imageUrl ?? null,
    features: buildFeatureList(repository, fallback),
    gradient,
  };
};

export const mapSupabaseSolutionToContent = (
  solution: SupabaseSolutionRow,
  index: number
): SolutionContent => {
  const normalizedSlug = normalizeSolutionSlug(solution.slug);
  const fallback =
    fallbackSolutionsMap[normalizedSlug] ?? fallbackSolutionsMap[solution.slug];

  const gradient =
    fallback?.gradient ?? gradientOptions[index % gradientOptions.length];

  const parsedFeatures = coerceToStringArray(solution.features);

  const features =
    parsedFeatures.length > 0
      ? parsedFeatures
      : fallback?.features
        ? [...fallback.features]
        : [];

  return {
    id: solution.id,
    title: solution.title,
    description: solution.description,
    slug: solution.slug,
    imageUrl: solution.image_url ?? fallback?.imageUrl ?? null,
    features,
    gradient,
  };
};

interface SolutionOrderOptions {
  column: keyof SupabaseSolutionRow;
  ascending?: boolean;
}

export interface SolutionQueryOptions {
  client?: SupabaseClient<Database>;
  limit?: number;
  includeInactive?: boolean;
  order?: SolutionOrderOptions;
}

const DEFAULT_SOLUTION_ORDER: Required<SolutionOrderOptions> = {
  column: 'created_at',
  ascending: true,
};

const fetchSolutionsInternal = async (
  options: SolutionQueryOptions
): Promise<SupabaseSolutionRow[]> => {
  const { client = supabase, limit, includeInactive = false, order } = options;

  let query = client.from('solutions').select('*');

  if (!includeInactive) {
    query = query.eq('active', true);
  }

  const sortOptions = {
    column: order?.column ?? DEFAULT_SOLUTION_ORDER.column,
    ascending: order?.ascending ?? DEFAULT_SOLUTION_ORDER.ascending,
  } as const;

  query = query.order(sortOptions.column, { ascending: sortOptions.ascending });

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  const { data, error } = await query.returns<SupabaseSolutionRow[]>();

  if (error) {
    throw new Error(`Failed to fetch solutions: ${error.message}`);
  }

  return data ?? [];
};

export const fetchSolutions = async (
  options: SolutionQueryOptions = {}
): Promise<SupabaseSolutionRow[]> => fetchSolutionsInternal(options);

export const fetchActiveSolutions = async (
  options: Omit<SolutionQueryOptions, 'includeInactive'> = {}
): Promise<SupabaseSolutionRow[]> =>
  fetchSolutionsInternal({ ...options, includeInactive: false });

export type FetchSupabaseSolutionsOptions = Omit<
  SolutionQueryOptions,
  'includeInactive'
>;

export const fetchSupabaseSolutions = async (
  options: FetchSupabaseSolutionsOptions = {}
): Promise<SolutionContent[]> => {
  const rows = await fetchActiveSolutions(options);

  return rows.map((solution, index) =>
    mapSupabaseSolutionToContent(solution, index)
  );
};

export const getFallbackSolution = (
  slug: string
): SolutionContent | undefined => {
  if (!slug) {
    return undefined;
  }

  const normalizedSlug = normalizeSolutionSlug(slug);
  const fallback =
    fallbackSolutionsMap[normalizedSlug] ?? fallbackSolutionsMap[slug];

  if (!fallback) {
    return undefined;
  }

  return {
    ...fallback,
    features: [...fallback.features],
  };
};

export const getFallbackSolutions = (): SolutionContent[] =>
  fallbackSolutions.map((solution) => ({
    ...solution,
    features: [...solution.features],
  }));
