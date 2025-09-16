import Header from './Header';
import Footer from './Footer';
import BackToTop from './BackToTop';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="relative z-0 flex-1 pt-20">{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Layout;
