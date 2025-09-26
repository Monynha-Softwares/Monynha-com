import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ThemeToggleVariant = 'header' | 'surface';

interface ThemeToggleProps {
  className?: string;
  variant?: ThemeToggleVariant;
}

const variantClasses: Record<ThemeToggleVariant, string> = {
  header:
    'border-white/30 bg-white/20 text-white shadow-soft hover:bg-white/30 focus-visible:ring-white dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-100 dark:hover:bg-neutral-800',
  surface:
    'border-neutral-200 bg-white/90 text-neutral-700 shadow-soft hover:bg-neutral-100 focus-visible:ring-primary/40 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-100 dark:hover:bg-neutral-800',
};

const ThemeToggle = ({ className, variant = 'header' }: ThemeToggleProps) => {
  const { t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = (resolvedTheme ?? 'system') === 'dark';

  const handleToggle = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('monynha-theme', nextTheme);
      }
    } catch (error) {
      console.warn('Failed to persist theme preference', error);
    }
  };

  const label = isDark
    ? t('navigation.themeToggle.light', 'Switch to light mode')
    : t('navigation.themeToggle.dark', 'Switch to dark mode');

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      onClick={handleToggle}
      className={cn(
        'relative h-11 w-11 rounded-full border transition-colors',
        variantClasses[variant],
        className
      )}
    >
      <Sun
        aria-hidden="true"
        className={cn(
          'h-5 w-5 transition-all duration-200',
          mounted && isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        )}
      />
      <Moon
        aria-hidden="true"
        className={cn(
          'absolute h-5 w-5 transition-all duration-200',
          mounted && isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        )}
      />
      <span className="sr-only">{label}</span>
    </Button>
  );
};

export default ThemeToggle;
