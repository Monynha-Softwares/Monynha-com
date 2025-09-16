import {
  fallbackSolutions,
  fallbackSolutionsMap,
  gradientOptions,
  normalizeSolutionSlug,
} from '@/data/solutions';
import type { Tables } from '@/integrations/supabase/types';
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

type SupabaseSolutionRow = Tables<'solutions'>;

const mapSupabaseFeatures = (
  features: SupabaseSolutionRow['features'],
  fallback?: SolutionContent
): string[] => {
  if (Array.isArray(features)) {
    const entries = (features as unknown[]).filter(
      (feature): feature is string => typeof feature === 'string'
    );

    if (entries.length > 0) {
      return entries;
    }
  }

  if (fallback?.features?.length) {
    return [...fallback.features];
  }

  return [];
};

export const mapSupabaseSolutionToContent = (
  solution: SupabaseSolutionRow,
  options: { index?: number } = {}
): SolutionContent => {
  const fallback = fallbackSolutionsMap[solution.slug] ??
    fallbackSolutionsMap[normalizeSolutionSlug(solution.slug)];

  const gradientIndex = options.index ?? 0;
  const gradient = fallback?.gradient ??
    gradientOptions[gradientIndex % gradientOptions.length];

  return {
    id: solution.id,
    title: solution.title,
    description: solution.description,
    slug: solution.slug,
    imageUrl: solution.image_url ?? fallback?.imageUrl ?? null,
    features: mapSupabaseFeatures(solution.features, fallback),
    gradient,
  };
};
