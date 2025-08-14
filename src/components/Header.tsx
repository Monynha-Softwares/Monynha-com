import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  const navigation = [
    { name: t('navigation.home'), href: '/' },
    { name: t('navigation.solutions'), href: '/solutions' },
    { name: t('navigation.projects'), href: '/projects' },
    { name: t('navigation.about'), href: '/about' },
    { name: t('navigation.blog'), href: '/blog' },
    { name: t('navigation.contact'), href: '/contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity ease-in-out duration-300"
          >
            <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center">
              <span className="text-white text-lg font-bold">M</span>
            </div>
          <div className="flex flex-row items-center">
            <span className="font-brand font-semibold text-xl text-neutral-900 flex items-center">
              Mon<span className="text-brand-blue">y</span>nha</span>
                <svg xmlns="http://www.w3.org/2000/svg" height="18px" width="18px" viewBox="0 0 24 24" fill="#EA33F7" style={{verticalAlign: 'middle'}}>
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
          </div>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'font-medium transition-colors duration-200',
                    isActive
                      ? 'text-brand-blue underline underline-offset-4'
                      : 'text-neutral-700 hover:text-brand-blue'
                  )
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
          <LanguageSwitcher />

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-neutral-600">
                  Olá, {user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </Button>
              </div>
            ) : (
              <>
                <NavLink to="/auth">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Login</span>
                  </Button>
                </NavLink>
                <NavLink to="/contact">
                  <Button className="btn-primary">
                    {t('navigation.startProject')}
                  </Button>
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-neutral-50 transition-colors ease-in-out duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={t('navigation.toggleNavigation')}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-100 bg-white">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'px-2 py-1 font-medium transition-colors duration-200',
                      isActive
                        ? 'text-brand-blue underline underline-offset-4'
                        : 'text-neutral-700 hover:text-brand-blue'
                    )
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </NavLink>
              ))}
              {user ? (
                <div className="pt-4 flex flex-col space-y-2">
                  <span className="text-sm text-neutral-600 px-2">
                    Olá, {user.email}
                  </span>
                  <Button
                    variant="outline"
                    onClick={signOut}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </Button>
                </div>
              ) : (
                <div className="pt-4 flex flex-col space-y-2">
                  <NavLink to="/auth">
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <User className="h-4 w-4" />
                      <span>Login</span>
                    </Button>
                  </NavLink>
                  <NavLink to="/contact">
                    <Button className="btn-primary w-full">
                      {t('navigation.startProject')}
                    </Button>
                  </NavLink>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
