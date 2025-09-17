import SiteHeader from './SiteHeader';
import Footer from './Footer';
import BackToTop from './BackToTop';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-14rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-purple/35 via-brand-blue/25 to-brand-pink/30 blur-3xl dark:from-brand-purple/45 dark:via-brand-blue/35 dark:to-brand-pink/40" />
        <div className="absolute right-[-12rem] top-1/3 h-[22rem] w-[22rem] rounded-full bg-brand-blue/15 blur-3xl dark:bg-brand-blue/25" />
        <div className="absolute bottom-[-10rem] left-[-8rem] h-[20rem] w-[20rem] rounded-full bg-brand-pink/10 blur-[140px] dark:bg-brand-pink/20" />
      </div>
      <SiteHeader />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Layout;
