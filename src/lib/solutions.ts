import i18n from '@/i18n';
import { supabase } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';
import {
  fallbackSolutionDefinitions,
  fallbackSolutionDefinitionMap,
  gradientOptions,
  normalizeSolutionSlug,
  type FallbackSolutionDefinition,
} from '@/data/solutions';
import { getNormalizedLocale } from '@/lib/i18n';
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

type NullableString = string | null | undefined;

type TranslationLanguage = string;

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

const formatDate = (
  value: NullableString,
  language: TranslationLanguage
): string | null => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const locale = getNormalizedLocale(language);

  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
};

const findFallbackDefinition = (
  slugOrKey: NullableString
): FallbackSolutionDefinition | undefined => {
  if (!slugOrKey) {
    return undefined;
  }

  return (
    fallbackSolutionDefinitionMap[slugOrKey] ??
    fallbackSolutionDefinitionMap[normalizeSolutionSlug(slugOrKey)]
  );
};

const translateFallbackDefinition = (
  definition: FallbackSolutionDefinition,
  language: TranslationLanguage
): SolutionContent => {
  const t = i18n.getFixedT(language);
  const baseKey = `solutionsContent.fallback.${definition.key}`;

  const features = t(`${baseKey}.features`, {
    returnObjects: true,
    defaultValue: [],
  }) as unknown;

  const featureList = Array.isArray(features)
    ? uniqueNonEmpty(
        features.map((feature) =>
          typeof feature === 'string' ? feature : null
        )
      )
    : [];

  return {
    id: definition.slug,
    title: t(`${baseKey}.title`),
    description: t(`${baseKey}.description`),
    slug: definition.slug,
    imageUrl: definition.imageUrl ?? null,
    features: featureList,
    gradient: definition.gradient,
  } satisfies SolutionContent;
};

const buildFeatureList = (
  repository: GitHubRepository,
  fallback: SolutionContent | undefined,
  language: TranslationLanguage
): string[] => {
  const t = i18n.getFixedT(language);

  const normalizedTopics = Array.isArray(repository.topics)
    ? uniqueNonEmpty(repository.topics)
    : [];

  const formattedUpdatedAt =
    formatDate(repository.updated_at ?? repository.pushed_at, language) ??
    undefined;

  const metadata = uniqueNonEmpty([
    repository.language
      ? t('solutionsContent.github.metadata.language', {
          language: repository.language,
        })
      : null,
    repository.homepage
      ? t('solutionsContent.github.metadata.homepage', {
          url: repository.homepage,
        })
      : null,
    repository.stargazers_count > 0
      ? t('solutionsContent.github.metadata.stars', {
          count: repository.stargazers_count,
        })
      : null,
    repository.open_issues_count > 0
      ? t('solutionsContent.github.metadata.issues', {
          count: repository.open_issues_count,
        })
      : null,
    repository.default_branch
      ? t('solutionsContent.github.metadata.defaultBranch', {
          branch: repository.default_branch,
        })
      : null,
    formattedUpdatedAt
      ? t('solutionsContent.github.metadata.updatedAt', {
          date: formattedUpdatedAt,
        })
      : null,
  ]);

  const combined = uniqueNonEmpty([...normalizedTopics, ...metadata]);

  if (combined.length > 0) {
    return combined;
  }

  return fallback?.features ? [...fallback.features] : [];
};

export const mapGitHubRepoToContent = (
  repository: GitHubRepository,
  index: number,
  language: TranslationLanguage = i18n.language
): SolutionContent => {
  const fallbackDefinition = findFallbackDefinition(repository.name);
  const fallbackContent = fallbackDefinition
    ? translateFallbackDefinition(fallbackDefinition, language)
    : undefined;

  const gradient =
    fallbackContent?.gradient ??
    fallbackDefinition?.gradient ??
    gradientOptions[index % gradientOptions.length];

  const description = repository.description?.trim();
  const t = i18n.getFixedT(language);

  const fallbackDescription =
    fallbackContent?.description ??
    t('solutionsContent.github.fallbackDescription');

  return {
    id: String(repository.id),
    title: fallbackContent?.title ?? repository.name,
    description:
      description && description.length > 0
        ? description
        : fallbackDescription,
    slug: repository.name,
    imageUrl: fallbackContent?.imageUrl ?? null,
    features: buildFeatureList(repository, fallbackContent, language),
    gradient,
  } satisfies SolutionContent;
};

interface MapSupabaseOptions {
  index?: number;
  language?: TranslationLanguage;
}

export const mapSupabaseSolutionToContent = (
  solution: SupabaseSolutionRow,
  options: MapSupabaseOptions = {}
): SolutionContent => {
  const { index = 0, language = i18n.language } = options;

  const fallbackDefinition = findFallbackDefinition(solution.slug);
  const fallbackContent = fallbackDefinition
    ? translateFallbackDefinition(fallbackDefinition, language)
    : undefined;

  const gradient =
    fallbackContent?.gradient ??
    fallbackDefinition?.gradient ??
    gradientOptions[index % gradientOptions.length];

  const parsedFeatures = coerceToStringArray(solution.features);
  const features =
    parsedFeatures.length > 0
      ? parsedFeatures
      : fallbackContent?.features ?? [];

  const rawDescription =
    typeof solution.description === 'string'
      ? solution.description.trim()
      : '';

  const description =
    rawDescription.length > 0
      ? rawDescription
      : fallbackContent?.description ?? '';

  return {
    id: solution.id,
    title: solution.title ?? fallbackContent?.title ?? solution.slug,
    description,
    slug: solution.slug,
    imageUrl: solution.image_url ?? fallbackContent?.imageUrl ?? null,
    features,
    gradient,
  } satisfies SolutionContent;
};

export const getFallbackSolution = (
  slug: string,
  language: TranslationLanguage = i18n.language
): SolutionContent | undefined => {
  const fallbackDefinition = findFallbackDefinition(slug);

  if (!fallbackDefinition) {
    return undefined;
  }

  return translateFallbackDefinition(fallbackDefinition, language);
};

export const getFallbackSolutions = (
  language: TranslationLanguage = i18n.language
): SolutionContent[] =>
  fallbackSolutionDefinitions.map((definition) =>
    translateFallbackDefinition(definition, language)
  );

export const fetchSupabaseSolutions = async (
  language: TranslationLanguage = i18n.language
): Promise<SolutionContent[]> => {
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
    mapSupabaseSolutionToContent(solution, { index, language })
  );
};
