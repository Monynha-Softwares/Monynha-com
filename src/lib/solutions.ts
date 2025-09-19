import {
  fallbackSolutions,
  fallbackSolutionsMap,
  gradientOptions,
  normalizeSolutionSlug,
} from '@/data/solutions';
import { supabase } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';
import type { SolutionContent } from '@monynha/ui';

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

type SupabaseSolutionRow = Database['public']['Tables']['solutions']['Row'];

type MapSupabaseOptions = number | { index?: number };

const DEFAULT_GRADIENT = 'from-brand-purple to-brand-blue';

const pickGradient = (index: number | undefined, fallback?: string): string => {
  if (fallback) {
    return fallback;
  }

  if (!Array.isArray(gradientOptions) || gradientOptions.length === 0) {
    return DEFAULT_GRADIENT;
  }

  const safeIndex =
    typeof index === 'number' && Number.isFinite(index) ? Math.abs(index) : 0;

  return gradientOptions[safeIndex % gradientOptions.length];
};

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
    fallbackSolutionsMap[normalizedSlug] ??
    fallbackSolutionsMap[repository.name];
  const gradient = pickGradient(index, fallback?.gradient);

  const description = repository.description?.trim();

  return {
    id: String(repository.id),
    title: fallback?.title ?? repository.name,
    description:
      description && description.length > 0
        ? description
        : (fallback?.description ??
          'Open-source solution maintained by Monynha Softwares.'),
    slug: repository.name,
    imageUrl: fallback?.imageUrl ?? null,
    features: buildFeatureList(repository, fallback),
    gradient,
    externalUrl: repository.html_url,
  };
};

const resolveIndexFromOptions = (options?: MapSupabaseOptions): number => {
  if (typeof options === 'number') {
    return options;
  }

  if (options && typeof options.index === 'number') {
    return options.index;
  }

  return 0;
};

export const mapSupabaseSolutionToContent = (
  solution: SupabaseSolutionRow,
  options?: MapSupabaseOptions
): SolutionContent => {
  const index = resolveIndexFromOptions(options);
  const normalizedSlug = normalizeSolutionSlug(solution.slug);
  const fallback =
    fallbackSolutionsMap[normalizedSlug] ?? fallbackSolutionsMap[solution.slug];

  const gradient = pickGradient(index, fallback?.gradient);
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
    externalUrl: null,
  };
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

export const fetchSupabaseSolutions = async (): Promise<SolutionContent[]> => {
  const { data, error } = await supabase
    .from('solutions')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];

  return rows.map((solution, index) =>
    mapSupabaseSolutionToContent(solution, index)
  );
};
