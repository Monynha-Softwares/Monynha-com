import SiteHeader from './SiteHeader';
import Footer from './Footer';
import BackToTop from './BackToTop';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-surface text-foreground transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -top-40 right-[-12%] h-[420px] w-[420px] rounded-full bg-brand-blue/20 blur-3xl" />
        <div className="absolute bottom-[-30%] left-[-15%] h-[360px] w-[360px] rounded-full bg-brand-pink/20 blur-[140px]" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-purple/15 blur-[130px]" />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
        <BackToTop />
      </div>
    </div>
  );
};

export default Layout;
