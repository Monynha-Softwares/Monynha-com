import { type ComponentProps, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

import BackToTop from './BackToTop';
import CreativeNavigation from './CreativeNavigation';
import Footer from './Footer';
import SiteHeader from './SiteHeader';

export type LayoutVariant = 'legacy' | 'creative';

export interface LayoutProps {
  children: ReactNode;
  variant?: LayoutVariant;
  creativeNavigationProps?: ComponentProps<typeof CreativeNavigation>;
}

const Layout = ({ children, variant = 'legacy', creativeNavigationProps }: LayoutProps) => {
  const useCreativeVariant = variant === 'creative';

  return (
    <div
      className={cn(
        'relative flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300',
        useCreativeVariant && 'bg-muted/40',
      )}
    >
      {useCreativeVariant ? <CreativeNavigation {...creativeNavigationProps} /> : <SiteHeader />}
      <main
        className={cn(
          'flex-1 pt-20',
          useCreativeVariant && 'relative overflow-hidden pb-16 pt-28 sm:pb-24 sm:pt-32',
        )}
      >
        {useCreativeVariant ? (
          <div className="creative-shell">
            <div className="creative-shell__backdrop" aria-hidden />
            <div className="creative-shell__glow" aria-hidden />
            <div className="creative-shell__grid" aria-hidden />
            <div className="creative-shell__content">{children}</div>
          </div>
        ) : (
          children
        )}
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Layout;
