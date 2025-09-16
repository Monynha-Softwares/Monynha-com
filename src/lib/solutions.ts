import type { Database } from '@/integrations/supabase/types';
import { fallbackSolutions, fallbackSolutionsMap, gradientOptions } from '@/data/solutions';
import type { SolutionContent } from '@/types/solutions';

type SolutionRow = Database['public']['Tables']['solutions']['Row'];

type JsonValue = SolutionRow['features'];

const serializeFeature = (feature: unknown): string | null => {
  if (typeof feature === 'string') {
    return feature.trim() ? feature : null;
  }

  if (feature && typeof feature === 'object' && 'title' in (feature as Record<string, unknown>)) {
    const title = (feature as Record<string, unknown>).title;
    if (typeof title === 'string' && title.trim()) {
      return title;
    }
  }

  if (feature == null) {
    return null;
  }

  try {
    const serialized = JSON.stringify(feature);
    return serialized === '{}' ? null : serialized;
  } catch (error) {
    console.warn('Unable to serialize feature', feature, error);
    return null;
  }
};

export const parseFeatures = (features: JsonValue): string[] => {
  if (!features) {
    return [];
  }

  if (Array.isArray(features)) {
    return features
      .map((feature) => serializeFeature(feature))
      .filter((feature): feature is string => Boolean(feature && feature.trim()));
  }

  if (typeof features === 'string') {
    try {
      const parsed = JSON.parse(features);
      if (Array.isArray(parsed)) {
        return parsed
          .map((feature) => serializeFeature(feature))
          .filter((feature): feature is string => Boolean(feature && feature.trim()));
      }
    } catch (error) {
      console.warn('Unable to parse features JSON string', error);
    }
  }

  return [];
};

export const mapSolutionRowToContent = (
  solution: SolutionRow,
  index: number
): SolutionContent => {
  const fallback = fallbackSolutionsMap[solution.slug];
  const parsedFeatures = parseFeatures(solution.features);
  const gradient = fallback?.gradient ?? gradientOptions[index % gradientOptions.length];

  return {
    id: solution.id,
    title: solution.title,
    description: solution.description,
    slug: solution.slug,
    imageUrl: solution.image_url ?? fallback?.imageUrl ?? null,
    features: parsedFeatures.length > 0 ? parsedFeatures : fallback?.features ?? [],
    gradient,
  };
};

export const getFallbackSolution = (slug: string): SolutionContent | undefined => {
  const fallback = fallbackSolutionsMap[slug];
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
