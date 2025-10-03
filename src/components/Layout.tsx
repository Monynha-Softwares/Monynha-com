import SiteHeader from './SiteHeader';
import Footer from './Footer';
import BackToTop from './BackToTop';
import CreativeNavigation from './CreativeNavigation';
import { cn } from '@/lib/utils';

type LayoutVariant = 'classic' | 'creative';

interface LayoutProps {
  children: React.ReactNode;
  variant?: LayoutVariant;
  /**
   * @deprecated Use `variant` instead. Kept for backwards compatibility while we migrate layouts.
   */
  headerVariant?: LayoutVariant;
}

const creativeBackground = (
  <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.18),transparent_60%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.16),transparent_60%),radial-gradient(circle_at_50%_90%,rgba(244,114,182,0.18),transparent_65%)]" />
    <div className="absolute inset-x-0 top-[-25%] h-[55vh] bg-[conic-gradient(from_140deg_at_50%_35%,rgba(168,85,247,0.25),rgba(59,130,246,0.15),rgba(168,85,247,0.25))] blur-3xl" />
    <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:120px_120px] opacity-40 mix-blend-soft-light" />
  </div>
);

const Layout = ({ children, variant, headerVariant }: LayoutProps) => {
  const resolvedVariant: LayoutVariant = variant ?? headerVariant ?? 'classic';
  const isCreative = resolvedVariant === 'creative';
  const header = isCreative ? <CreativeNavigation /> : <SiteHeader />;
  const mainSpacing = isCreative ? 'pt-32 pb-24 md:pt-36' : 'pt-20';

  return (
    <div
      className={cn(
        'relative flex min-h-screen flex-col transition-colors duration-300',
        isCreative ? 'bg-[#05070f] text-slate-100' : 'bg-background text-foreground'
      )}
    >
      {isCreative && creativeBackground}
      {header}
      <main className={cn('relative z-10 flex-1', mainSpacing)}>{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export const LayoutCreative = ({ children }: Pick<LayoutProps, 'children'>) => (
  <Layout variant="creative">{children}</Layout>
);

export default Layout;
