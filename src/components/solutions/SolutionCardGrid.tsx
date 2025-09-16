import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { SolutionContent } from '@/types/solutions';

interface SolutionCardGridProps {
  solutions: SolutionContent[];
  learnMoreLabel: string;
  requestDemoLabel: string;
  requestDemoHref?: string;
}

const SolutionCardGrid = ({
  solutions,
  learnMoreLabel,
  requestDemoLabel,
  requestDemoHref = '/contact',
}: SolutionCardGridProps) => {
  if (solutions.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
      {solutions.map((solution) => {
        const key = solution.id ?? solution.slug;
        const isExternal = Boolean(solution.githubUrl);

        const titleContent = (
          <h2 className="text-2xl font-semibold text-neutral-900 group-hover:text-brand-blue transition-colors">
            {solution.title}
          </h2>
        );

        const title = isExternal ? (
          <a
            href={solution.githubUrl ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            {titleContent}
          </a>
        ) : (
          <Link to={`/solutions/${solution.slug}`} className="group">
            {titleContent}
          </Link>
        );

        return (
          <Card key={key} className="border-0 shadow-soft-lg flex flex-col overflow-hidden">
            {solution.imageUrl && (
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={solution.imageUrl}
                  alt={solution.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div
                  className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${solution.gradient}`}
                />
              </div>
            )}
            <CardContent className="p-8 flex flex-col flex-1">
              <div
                className={`h-1 w-16 bg-gradient-to-r ${solution.gradient} rounded-full mb-6`}
              />
              {title}
              <p className="text-neutral-600 mt-4 leading-relaxed flex-1">
                {solution.description}
              </p>

              {solution.features.length > 0 && (
                <ul className="mt-8 space-y-3">
                  {solution.features.map((feature, featureIndex) => (
                    <li
                      key={`${solution.slug}-feature-${featureIndex}`}
                      className="flex items-start gap-3"
                    >
                      <span
                        className={`mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r ${solution.gradient}`}
                      >
                        <CheckCircle className="h-4 w-4 text-white" />
                      </span>
                      <span className="text-sm text-neutral-600 leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 border-neutral-200 hover:border-brand-blue hover:text-brand-blue transition-colors"
                >
                  {isExternal ? (
                    <a
                      href={solution.githubUrl ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      {learnMoreLabel}
                    </a>
                  ) : (
                    <Link
                      to={`/solutions/${solution.slug}`}
                      className="flex items-center justify-center"
                    >
                      {learnMoreLabel}
                    </Link>
                  )}
                </Button>
                <Button
                  asChild
                  className="flex-1 bg-gradient-to-r from-brand-purple to-brand-blue hover:shadow-soft-lg transition-all"
                >
                  <Link
                    to={requestDemoHref}
                    className="flex items-center justify-center gap-2"
                  >
                    {requestDemoLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SolutionCardGrid;
