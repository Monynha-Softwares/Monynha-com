import type { SolutionContent } from '@monynha/ui';
import { solutionGradientOptions } from '@monynha/ui';

export const gradientOptions = [...solutionGradientOptions];

export const normalizeSolutionSlug = (value: string): string =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w-]+/g, '-')
    .replace(/--+/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '');

export const fallbackSolutions: SolutionContent[] = [
  {
    title: 'Boteco Pro',
    slug: 'boteco-pro',
    description:
      'Complete management solution for restaurants and bars with AI-powered analytics, inventory management, and customer insights.',
    imageUrl:
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    features: [
      'Real-time analytics to monitor sales, inventory, and customer behavior.',
      'Smart staff scheduling and performance tracking tools.',
      'Streamlined order processing with mobile POS support.',
      'Secure multi-method payments protected against fraud.',
    ],
    gradient: gradientOptions[0],
  },
  {
    title: 'AssisTina AI',
    slug: 'assistina',
    description:
      'Intelligent AI assistant that learns your business processes and automates routine tasks, increasing efficiency and productivity.',
    imageUrl:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    features: [
      'Adaptive machine learning workflows tailored to your operations.',
      'Natural language conversations across voice and text channels.',
      'Automated scheduling, reminders, and follow-up tasks.',
      'Custom integrations with your existing business tools.',
    ],
    gradient: gradientOptions[1],
  },
];

export const fallbackSolutionsMap = fallbackSolutions.reduce<
  Record<string, SolutionContent>
>((accumulator, solution) => {
  const normalizedSlug = normalizeSolutionSlug(solution.slug);
  accumulator[solution.slug] = solution;
  accumulator[normalizedSlug] = solution;
  return accumulator;
}, {});
