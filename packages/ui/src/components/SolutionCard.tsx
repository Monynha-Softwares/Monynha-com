import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SolutionContent } from '../types';
import { featureIconWrapperClass, surfaceCardClass } from '../theme';

export interface SolutionCardProps {
  solution: SolutionContent;
  className?: string;
  contentClassName?: string;
  actions?: ReactNode;
}

const normalizeFeatures = (features: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  features
    .map((feature) => feature?.trim())
    .filter((value): value is string => Boolean(value && value.length > 0))
    .forEach((feature) => {
      if (!seen.has(feature)) {
        seen.add(feature);
        result.push(feature);
      }
    });

  return result;
};

export const SolutionCard = ({
  solution,
  className,
  contentClassName,
  actions,
}: SolutionCardProps) => {
  const { title, description, features, gradient, imageUrl, slug } = solution;
  const displayFeatures = normalizeFeatures(features);

  return (
    <Card
      className={cn(
        surfaceCardClass,
        'flex h-full flex-col overflow-hidden transition-shadow duration-300 hover:shadow-soft-lg',
        className
      )}
    >
      {imageUrl ? (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div
            className={cn(
              'absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r',
              gradient
            )}
            aria-hidden="true"
          />
        </div>
      ) : (
        <div
          className={cn('h-1 bg-gradient-to-r', gradient)}
          aria-hidden="true"
        />
      )}

      <CardContent className={cn('flex flex-1 flex-col p-8', contentClassName)}>
        <div
          className={cn(
            'h-1 w-16 rounded-full bg-gradient-to-r',
            gradient,
            'mb-6'
          )}
          aria-hidden="true"
        />
        <h3 className="text-2xl font-heading font-semibold text-neutral-900">
          {title}
        </h3>
        <p className="mt-4 flex-1 text-neutral-600 leading-relaxed">
          {description}
        </p>

        {displayFeatures.length > 0 && (
          <ul className="mt-8 space-y-3 text-neutral-600">
            {displayFeatures.map((feature, index) => (
              <li
                key={`${slug}-feature-${index}`}
                className="flex items-start gap-3"
              >
                <span
                  className={cn(
                    featureIconWrapperClass,
                    'bg-gradient-to-r',
                    gradient,
                    'mt-1'
                  )}
                >
                  <CheckCircle className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-sm leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {actions && (
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">{actions}</div>
        )}
      </CardContent>
    </Card>
  );
};
