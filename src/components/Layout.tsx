import Header from './Header';
import Footer from './Footer';
import BackToTop from './BackToTop';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      <Header />
      <main className="relative flex-1 pt-20 isolate">
        {children}
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Layout;
