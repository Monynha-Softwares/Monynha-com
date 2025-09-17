import type { ReactNode } from 'react';
import { Button } from '@monynha/ui/button';
import { Card, CardContent } from '@monynha/ui/card';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SolutionContent } from '@/types/solutions';
import { cn } from '@monynha/ui';

interface SolutionCardProps {
  solution: SolutionContent;
  learnMoreHref?: string;
  learnMoreLabel?: string;
  actionHref?: string;
  actionLabel?: string;
  actionIcon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

const SolutionCard = ({
  solution,
  learnMoreHref,
  learnMoreLabel,
  actionHref,
  actionLabel,
  actionIcon,
  className,
  children,
}: SolutionCardProps) => {
  const hasFeatures = Array.isArray(solution.features) && solution.features.length > 0;

  return (
    <Card
      key={solution.id ?? solution.slug}
      className={cn('border-0 shadow-soft-lg flex flex-col overflow-hidden rounded-2xl', className)}
    >
      {solution.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={solution.imageUrl}
            alt={solution.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className={cn('absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r', solution.gradient)} />
        </div>
      )}
      <CardContent className="p-8 flex flex-col flex-1">
        <div className={cn('h-1 w-16 bg-gradient-to-r rounded-full mb-6', solution.gradient)} />
        <Link to={`/solutions/${solution.slug}`} className="group">
          <h3 className="text-2xl font-semibold text-neutral-900 group-hover:text-brand-secondary transition-colors">
            {solution.title}
          </h3>
        </Link>
        <p className="text-neutral-600 mt-4 leading-relaxed flex-1">{solution.description}</p>

        {hasFeatures && (
          <ul className="mt-8 space-y-3">
            {solution.features.map((feature, index) => (
              <li key={`${solution.slug}-feature-${index}`} className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r text-white',
                    solution.gradient
                  )}
                >
                  <CheckCircle className="h-4 w-4" />
                </span>
                <span className="text-sm text-neutral-600 leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {children ?? (
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            {learnMoreHref && learnMoreLabel && (
              <CardActionButton href={learnMoreHref} variant="secondary">
                {learnMoreLabel}
              </CardActionButton>
            )}
            {actionHref && actionLabel && (
              <CardActionButton href={actionHref} variant="default">
                <span className="flex items-center gap-2">
                  {actionLabel}
                  {actionIcon}
                </span>
              </CardActionButton>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface CardActionButtonProps {
  href: string;
  children: ReactNode;
  variant?: 'default' | 'secondary';
}

const CardActionButton = ({ href, children, variant = 'default' }: CardActionButtonProps) => (
  <Button asChild variant={variant} className="flex-1">
    <Link to={href} className="inline-flex items-center justify-center gap-2">
      {children}
    </Link>
  </Button>
);

export default SolutionCard;
