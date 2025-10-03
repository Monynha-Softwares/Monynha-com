import SiteHeader from './SiteHeader';
import Footer from './Footer';
import BackToTop from './BackToTop';
import CreativeNavigation from './CreativeNavigation';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  headerVariant?: 'classic' | 'creative';
}

const Layout = ({ children, headerVariant = 'classic' }: LayoutProps) => {
  const isCreative = headerVariant === 'creative';
  const header = isCreative ? <CreativeNavigation /> : <SiteHeader />;
  const mainSpacing = isCreative ? 'pt-28 md:pt-32' : 'pt-20';

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {header}
      <main className={cn('flex-1', mainSpacing)}>{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Layout;
