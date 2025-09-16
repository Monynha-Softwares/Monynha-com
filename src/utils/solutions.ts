import type { Database } from '@/integrations/supabase/types';

export type SolutionRow = Database['public']['Tables']['solutions']['Row'];

export type SolutionContent = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  features: string[];
};

export const fallbackSolutions: SolutionContent[] = [
  {
    slug: 'boteco-pro',
    title: 'Boteco Pro',
    description:
      'Complete management solution for restaurants and bars with AI-powered analytics, inventory insights, and customer engagement tools.',
    imageUrl:
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    features: [
      'Real-time analytics dashboard',
      'Inventory and supplier tracking',
      'AI-driven demand forecasting',
      'Staff scheduling and performance monitoring',
      'Secure multi-channel payments',
    ],
  },
  {
    slug: 'assistina',
    title: 'AssisTina AI',
    description:
      'Personalized virtual assistant that automates customer service and internal workflows with natural language understanding.',
    imageUrl:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    features: [
      'Omnichannel customer support',
      'Workflow and task automation',
      'Machine learning personalization',
      'Sentiment analysis and reporting',
      'Dashboard with actionable insights',
    ],
  },
];

const fallbackBySlug = fallbackSolutions.reduce<Record<string, SolutionContent>>(
  (accumulator, solution) => {
    accumulator[solution.slug] = solution;
    return accumulator;
  },
  {}
);

const candidateKeys = ['title', 'name', 'label', 'description'];

const parseFeatureFromObject = (value: Record<string, unknown>): string | null => {
  for (const key of candidateKeys) {
    const candidate = value[key];
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }

  return null;
};

const parseFeatureEntry = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return parseFeatureFromObject(value as Record<string, unknown>);
  }

  return null;
};

const parseFeatureArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => parseFeatureEntry(entry))
    .filter((entry): entry is string => Boolean(entry));
};

export const extractFeatureList = (
  features: SolutionRow['features']
): string[] => {
  if (!features) {
    return [];
  }

  if (Array.isArray(features)) {
    return parseFeatureArray(features);
  }

  if (typeof features === 'string') {
    try {
      const parsed = JSON.parse(features);
      const parsedArray = parseFeatureArray(parsed);
      if (parsedArray.length > 0) {
        return parsedArray;
      }
    } catch (error) {
      // Ignore JSON parsing failures and fallback to comma separated parsing
    }

    return features
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof features === 'object') {
    const record = features as Record<string, unknown>;

    if (Array.isArray(record.features)) {
      const parsedArray = parseFeatureArray(record.features);
      if (parsedArray.length > 0) {
        return parsedArray;
      }
    }

    const parsedEntry = parseFeatureEntry(record);
    if (parsedEntry) {
      return [parsedEntry];
    }
  }

  return [];
};

export const normalizeSolution = (solution: SolutionRow): SolutionContent => {
  const fallback = fallbackBySlug[solution.slug];
  const features = extractFeatureList(solution.features);

  return {
    id: solution.id,
    slug: solution.slug,
    title: solution.title || fallback?.title || solution.slug,
    description: solution.description || fallback?.description || '',
    imageUrl: solution.image_url ?? fallback?.imageUrl ?? null,
    features: features.length > 0 ? features : fallback?.features ?? [],
  };
};

export const getFallbackSolution = (slug: string): SolutionContent | undefined =>
  fallbackBySlug[slug];
