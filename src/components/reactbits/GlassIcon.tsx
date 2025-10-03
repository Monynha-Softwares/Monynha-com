import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassIconProps {
  icon: ReactNode;
  title: string;
  description: string;
  href?: string;
  className?: string;
}

export const GlassIcon = ({
  icon,
  title,
  description,
  href,
  className,
}: GlassIconProps) => {
  const content = (
    <div
      className={cn(
        'group relative flex items-center gap-4 rounded-2xl border border-border/70 bg-card/70 p-4',
        'backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:shadow-[0_15px_35px_-20px_rgba(76,0,130,0.4)]',
        className
      )}
    >
      <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-transparent">
        <div className="absolute inset-0 bg-white/10 blur-2xl" aria-hidden />
        <span className="relative text-primary">{icon}</span>
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">
          {title}
        </p>
        <p className="text-fluid-base text-foreground">{description}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block"
        target={href.startsWith('http') ? '_blank' : undefined}
        rel="noreferrer"
      >
        {content}
      </a>
    );
  }

  return content;
};

GlassIcon.displayName = 'GlassIcon';
