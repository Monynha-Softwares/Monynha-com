import {
  fallbackSolutions,
  fallbackSolutionsMap,
  gradientOptions,
  normalizeSolutionSlug,
} from '@/data/solutions';
import type { Database } from '@/integrations/supabase/types';
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

type SupabaseSolutionRow = Database['public']['Tables']['solutions']['Row'];

const GITHUB_REPOS_URL =
  'https://api.github.com/orgs/Monynha-Softwares/repos?per_page=100';

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

const resolveFallback = (slug: string): SolutionContent | undefined => {
  const normalizedSlug = normalizeSolutionSlug(slug);
  return (
    fallbackSolutionsMap[normalizedSlug] ?? fallbackSolutionsMap[slug]
  );
};

const parseSolutionFeatures = (
  features: SupabaseSolutionRow['features']
): string[] => {
  if (Array.isArray(features)) {
    return features
      .filter((feature): feature is string => typeof feature === 'string')
      .map((feature) => feature.trim())
      .filter((feature) => feature.length > 0);
  }

  if (typeof features === 'string') {
    try {
      const parsed = JSON.parse(features);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((feature): feature is string => typeof feature === 'string')
          .map((feature) => feature.trim())
          .filter((feature) => feature.length > 0);
      }
    } catch (error) {
      console.warn('Failed to parse solution features', error);
    }
  }

  return [];
};

export const mapGitHubRepoToContent = (
  repository: GitHubRepository,
  index: number
): SolutionContent => {
  const fallback = resolveFallback(repository.name);
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
    githubUrl: repository.html_url,
  };
};

export const mapSupabaseSolutionToContent = (
  solution: SupabaseSolutionRow,
  index: number
): SolutionContent => {
  const fallback = resolveFallback(solution.slug);
  const features = parseSolutionFeatures(solution.features);

  return {
    id: solution.id,
    title: solution.title,
    description: solution.description,
    slug: solution.slug,
    imageUrl: solution.image_url ?? fallback?.imageUrl ?? null,
    features: features.length > 0 ? features : fallback?.features ?? [],
    gradient:
      fallback?.gradient ?? gradientOptions[index % gradientOptions.length],
    githubUrl: null,
  };
};

export const mapSupabaseSolutions = (
  solutions: SupabaseSolutionRow[]
): SolutionContent[] =>
  solutions.map((solution, index) =>
    mapSupabaseSolutionToContent(solution, index)
  );

export const fetchGitHubSolutions = async (): Promise<SolutionContent[]> => {
  const response = await fetch(GITHUB_REPOS_URL, {
    headers: {
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API responded with ${response.status}`);
  }

  const repositories: GitHubRepository[] = await response.json();

  const toTimestamp = (repository: GitHubRepository) => {
    const reference =
      repository.pushed_at ?? repository.updated_at ?? repository.created_at;
    const timestamp = new Date(reference).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  };

  const activeRepositories = repositories.filter(
    (repository) =>
      !repository.private && !repository.archived && !repository.disabled
  );

  const sortedRepositories = activeRepositories
    .slice()
    .sort((a, b) => toTimestamp(b) - toTimestamp(a));

  return sortedRepositories.map((repository, index) =>
    mapGitHubRepoToContent(repository, index)
  );
};

export const getFallbackSolution = (
  slug: string
): SolutionContent | undefined => {
  if (!slug) {
    return undefined;
  }

  const fallback = resolveFallback(slug);

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
