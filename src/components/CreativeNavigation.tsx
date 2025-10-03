import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { GooeyNav } from '@/components/reactbits/GooeyNav';
import type { FlowingMenuItem } from '@/components/reactbits/FlowingMenu';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

const accentPalette: readonly string[] = [
  'linear-gradient(135deg, rgba(168, 85, 247, 0.65), rgba(59, 130, 246, 0.65))',
  'linear-gradient(135deg, rgba(56, 189, 248, 0.65), rgba(249, 115, 22, 0.65))',
  'linear-gradient(135deg, rgba(236, 72, 153, 0.65), rgba(14, 165, 233, 0.65))',
  'linear-gradient(135deg, rgba(244, 114, 182, 0.65), rgba(99, 102, 241, 0.65))',
  'linear-gradient(135deg, rgba(34, 197, 94, 0.65), rgba(147, 51, 234, 0.65))',
  'linear-gradient(135deg, rgba(251, 191, 36, 0.65), rgba(59, 130, 246, 0.65))',
] as const;

const useNavigationLinks = (t: ReturnType<typeof useTranslation>['t']) =>
  useMemo<FlowingMenuItem[]>(() => {
    const baseLinks: Array<{ href: string; label: string }> = [
      { href: '/', label: t('navigation.home', 'Home') },
      { href: '/solutions', label: t('navigation.solutions', 'Solutions') },
      { href: '/projects', label: t('navigation.projects', 'Projects') },
      { href: '/blog', label: t('navigation.blog', 'Blog') },
      { href: '/about', label: t('navigation.about', 'About') },
      { href: '/contact', label: t('navigation.contact', 'Contact') },
    ];

    return baseLinks.map((link, index) => ({
      ...link,
      accent: accentPalette[index % accentPalette.length],
    }));
  }, [t]);

const brand = (
  <Link
    to="/"
    className="group flex min-w-0 items-center gap-3 rounded-full px-2 py-1 transition-opacity duration-300 hover:opacity-90"
  >
    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/85 via-secondary/70 to-primary/80 text-background shadow-creative-glow">
      M
    </span>
    <span className="flex min-w-0 flex-col leading-tight">
      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
        Monynha
      </span>
      <span className="font-brand text-lg font-semibold text-foreground">Creative Lab</span>
    </span>
  </Link>
);

const renderAuthActions = (
  isAuthenticated: boolean,
  startProjectLabel: string,
  signInLabel: string,
  signOutLabel: string,
  signingOutLabel: string,
  onSignOut: () => Promise<void>,
  isSigningOut: boolean,
  buttonClassName?: string,
) => {
  if (isAuthenticated) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onSignOut}
        disabled={isSigningOut}
        className={cn('px-4', buttonClassName)}
      >
        {isSigningOut ? signingOutLabel : signOutLabel}
      </Button>
    );
  }

  return (
    <>
      <Button variant="ghost" size="sm" asChild className={cn('px-4', buttonClassName)}>
        <Link to="/auth">{signInLabel}</Link>
      </Button>
      <Button variant="gradient" size="sm" asChild className={cn(buttonClassName)}>
        <Link to="/contact">{startProjectLabel}</Link>
      </Button>
    </>
  );
};

const CreativeNavigation = () => {
  const { t } = useTranslation();
  const { user, signOut, isLoading } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const links = useNavigationLinks(t);

  const handleSignOut = useCallback(async () => {
    if (isSigningOut) return;
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      console.error('Failed to sign out', error);
    } finally {
      setIsSigningOut(false);
    }
  }, [isSigningOut, signOut]);

  const isLinkActive = useCallback((href: string, pathname: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }, []);

  const startProjectLabel = t('navigation.startProject', 'Start Your Project');
  const signInLabel = t('auth.actions.signIn', 'Sign in');
  const signOutLabel = t('dashboard.signOut', 'Sign out');
  const signingOutLabel = t('dashboard.signingOut', 'Signing out...');
  const toggleLabel = t('navigation.toggleNavigation', 'Toggle navigation');

  const languageSwitcherPill = (
    <div className="rounded-full border border-border/60 bg-card/80 px-3 py-1 text-xs font-semibold uppercase text-muted-foreground shadow-creative-card">
      <LanguageSwitcher />
    </div>
  );

  const desktopActions = (
    <>
      {languageSwitcherPill}
      <ThemeToggle variant="surface" className="h-10 w-10" />
      {renderAuthActions(
        Boolean(user),
        startProjectLabel,
        signInLabel,
        signOutLabel,
        signingOutLabel,
        handleSignOut,
        isSigningOut || isLoading,
      )}
    </>
  );

  const mobileMenuContent = (
    <div className="rounded-3xl border border-border/60 bg-card/80 p-4 shadow-creative-card backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {languageSwitcherPill}
        <ThemeToggle variant="surface" className="h-10 w-10" />
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {renderAuthActions(
          Boolean(user),
          startProjectLabel,
          signInLabel,
          signOutLabel,
          signingOutLabel,
          handleSignOut,
          isSigningOut || isLoading,
          'w-full justify-center',
        )}
      </div>
    </div>
  );

  return (
    <GooeyNav
      brand={brand}
      links={links}
      isActive={isLinkActive}
      actions={desktopActions}
      mobileMenuContent={mobileMenuContent}
      toggleLabel={toggleLabel}
      className="shadow-creative-card"
    />
  );
};

export default CreativeNavigation;
