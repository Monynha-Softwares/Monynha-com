export const gradientOptions = [
  'from-brand-purple to-brand-blue',
  'from-brand-pink to-brand-orange',
  'from-brand-blue to-brand-purple',
  'from-brand-orange to-brand-pink',
];

export const normalizeSolutionSlug = (value: string): string =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w-]+/g, '-')
    .replace(/--+/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '');

export interface FallbackSolutionDefinition {
  key: string;
  slug: string;
  imageUrl?: string | null;
  gradient: string;
}

export const fallbackSolutionDefinitions: FallbackSolutionDefinition[] = [
  {
    key: 'boteco',
    slug: 'boteco-pro',
    imageUrl:
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    gradient: gradientOptions[0],
  },
  {
    key: 'assistina',
    slug: 'assistina',
    imageUrl:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    gradient: gradientOptions[1],
  },
];

export const fallbackSolutionDefinitionMap = fallbackSolutionDefinitions.reduce<
  Record<string, FallbackSolutionDefinition>
>((accumulator, definition) => {
  const normalizedSlug = normalizeSolutionSlug(definition.slug);
  accumulator[definition.slug] = definition;
  accumulator[normalizedSlug] = definition;
  accumulator[definition.key] = definition;
  return accumulator;
}, {});
