import type { ReactNode } from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from '../lib/cn';

export interface SolutionCardContent {
  id?: string;
  title: string;
  description: string;
  slug: string;
  imageUrl?: string | null;
  features?: string[];
  gradient: string;
}

export interface SolutionCardProps {
  solution: SolutionCardContent;
  actions?: ReactNode;
  className?: string;
  hideImage?: boolean;
}

export const SolutionCard = ({
  solution,
  actions,
  className,
  hideImage = false,
}: SolutionCardProps) => {
  const { imageUrl, gradient, features = [] } = solution;

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-white/40 bg-white/95 text-left shadow-md transition-shadow hover:shadow-lg focus-within:shadow-lg',
        'focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-blue focus-within:ring-offset-2 focus-within:ring-offset-white',
        className
      )}
    >
      {!hideImage && imageUrl ? (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={solution.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div
            className={cn(
              'absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r',
              gradient
            )}
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-8">
        <span
          aria-hidden="true"
          className={cn(
            'h-1 w-16 rounded-full bg-gradient-to-r',
            gradient
          )}
        />

        <h3 className="mt-6 font-display text-2xl font-semibold text-neutral-900">
          {solution.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          {solution.description}
        </p>

        {features.length > 0 ? (
          <ul className="mt-6 flex flex-col gap-3 text-sm text-neutral-600">
            {features.map((feature, index) => (
              <li
                key={`${solution.slug}-feature-${index}`}
                className="flex items-start gap-3"
              >
                <span
                  className={cn(
                    'mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r text-white',
                    gradient
                  )}
                >
                  <CheckCircle className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {actions ? (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {actions}
          </div>
        ) : null}
      </div>
    </article>
  );
};

export default SolutionCard;
