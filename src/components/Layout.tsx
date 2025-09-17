import SiteHeader from './SiteHeader';
import Footer from './Footer';
import BackToTop from './BackToTop';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground transition-colors duration-300">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-mesh-brand bg-[length:320px_320px] opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 left-1/2 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-brand-purple/30 via-brand-blue/20 to-brand-pink/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-18%] right-[-10%] -z-10 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-brand-blue/20 via-brand-purple/14 to-brand-orange/20 blur-3xl"
      />
      <SiteHeader />
      <main className="relative z-10 flex-1 pt-24">{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Layout;
