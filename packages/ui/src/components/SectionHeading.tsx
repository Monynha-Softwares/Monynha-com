import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface SectionHeadingProps {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  align?: 'center' | 'start';
  className?: string;
  descriptionClassName?: string;
}

export const SectionHeading = ({
  title,
  description,
  eyebrow,
  align = 'center',
  className,
  descriptionClassName,
}: SectionHeadingProps) => {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div
      className={cn(
        'max-w-3xl space-y-4',
        alignment,
        className
      )}
    >
      {eyebrow ? (
        <span className="inline-flex items-center justify-center rounded-full bg-brand-violet/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-violet">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-display text-3xl font-semibold text-neutral-900 sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'text-base leading-relaxed text-neutral-600 sm:text-lg',
            descriptionClassName
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
};

export default SectionHeading;
