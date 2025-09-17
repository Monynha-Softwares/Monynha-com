import { useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Menu, X, User, LogOut, ArrowRight } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const solutionItems = [
  {
    key: 'boteco',
    href: '/solutions/boteco-pro',
    gradient: 'from-brand-purple via-brand-blue to-brand-pink',
  },
  {
    key: 'assistina',
    href: '/solutions/assistina',
    gradient: 'from-brand-pink to-brand-orange',
  },
  {
    key: 'integration',
    href: '/solutions',
    gradient: 'from-brand-blue to-brand-purple',
  },
] as const;

const projectItems = [
  {
    key: 'openSource',
    href: '/projects',
    gradient: 'from-brand-blue to-brand-purple',
  },
  {
    key: 'caseStudies',
    href: '/projects?view=cases',
    gradient: 'from-brand-orange to-brand-pink',
  },
  {
    key: 'partnerships',
    href: '/projects?view=partners',
    gradient: 'from-brand-purple to-brand-orange',
  },
  {
    key: 'github',
    href: 'https://github.com/Monynha-Softwares',
    gradient: 'from-brand-pink to-brand-blue',
    external: true,
  },
] as const;

type MenuTranslation = Record<
  string,
  {
    title: string;
    description: string;
  }
>;

const SiteHeader = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const solutionsContent = useMemo(
    () =>
      t('navigation.solutionsMenu.items', {
        returnObjects: true,
        lng: i18n.language,
      }) as MenuTranslation,
    [t, i18n.language]
  );

  const projectsContent = useMemo(
    () =>
      t('navigation.projectsMenu.items', {
        returnObjects: true,
        lng: i18n.language,
      }) as MenuTranslation,
    [t, i18n.language]
  );

  const isSolutionsActive = location.pathname.startsWith('/solutions');
  const isProjectsActive = location.pathname.startsWith('/projects');

const menuCardLinkClasses =
  'group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-surface transition-transform duration-300 hover:-translate-y-0.5 focus-visible:-translate-y-0.5';

  const renderGradientCard = (
    gradient: string,
    content: { title: string; description: string }
  ) => (
    <div
      className={cn(
        'bg-gradient-to-r p-[1px] shadow-soft transition-shadow duration-300 group-hover:shadow-soft-lg group-focus-visible:shadow-soft-lg',
        gradient,
        'rounded-2xl'
      )}
    >
      <div className="rounded-[1.05rem] bg-surface/95 dark:bg-surface-muted/90 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-foreground">
            {content.title}
          </span>
          <ArrowRight
            className="h-4 w-4 text-brand-blue opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
            aria-hidden="true"
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {content.description}
        </p>
      </div>
    </div>
  );

  const desktopNavLinkClasses =
    'px-4 py-2 text-sm font-medium text-muted-foreground transition-colors rounded-lg hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-surface';

  const desktopNavLinkActiveClasses =
    'text-brand-blue bg-surface/80 dark:bg-surface-muted/80 shadow-soft-lg';

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/40 dark:border-white/10 bg-white/70 dark:bg-neutral-950/80 shadow-[0_10px_35px_rgba(91,44,111,0.08)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-neutral-950/70">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <NavLink
          to="/"
          className="flex items-center space-x-3 rounded-xl px-2 py-1 transition-opacity duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-surface hover:opacity-80"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-soft-lg">
            <span className="text-lg font-bold">M</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-brand text-xl font-semibold text-foreground">
              Mon
              <span className="text-brand-blue">y</span>
              nha
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="18"
              width="18"
              viewBox="0 0 24 24"
              fill="#EA33F7"
              aria-hidden="true"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        </NavLink>

        <div className="hidden items-center gap-6 lg:flex">
          <NavigationMenu className="flex items-center">
            <NavigationMenuList className="items-center gap-1">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      cn(
                        desktopNavLinkClasses,
                        isActive && desktopNavLinkActiveClasses
                      )
                    }
                  >
                    {t('navigation.home')}
                  </NavLink>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger
                  data-active={isSolutionsActive}
                  className={cn(
                    'px-4 py-2 text-sm font-medium text-muted-foreground transition-colors rounded-lg hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-surface data-[state=open]:bg-surface/90 dark:data-[state=open]:bg-surface-muted/80 data-[state=open]:text-brand-blue data-[active=true]:bg-surface/80 dark:data-[active=true]:bg-surface-muted/70 data-[active=true]:text-brand-blue'
                  )}
                >
                  {t('navigation.solutions')}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="rounded-2xl shadow-soft-lg">
                  <div className="rounded-2xl bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink p-[1px]">
                  <div className="md:w-[560px] rounded-[1.05rem] bg-surface/95 dark:bg-surface-muted/90 p-6 backdrop-blur-sm">
                      <div className="grid gap-4 md:grid-cols-2">
                        {solutionItems.map((item) => {
                          const content = solutionsContent[item.key];
                          if (!content) {
                            return null;
                          }

                          return (
                            <NavigationMenuLink asChild key={item.key}>
                              <Link to={item.href} className={menuCardLinkClasses}>
                                {renderGradientCard(item.gradient, content)}
                              </Link>
                            </NavigationMenuLink>
                          );
                        })}
                      </div>
                      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                        <Button
                          asChild
                          variant="ghost"
                          className="px-4 text-sm font-semibold text-brand-blue transition-colors hover:bg-gradient-to-r hover:from-brand-purple hover:via-brand-blue hover:to-brand-pink hover:text-white focus-visible:ring-brand-blue"
                        >
                          <Link to="/solutions">
                            {t('navigation.solutionsMenu.viewAll')}
                          </Link>
                        </Button>
                        <Button
                          asChild
                          className="bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink text-white shadow-soft hover:shadow-soft-lg focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                        >
                          <Link to="/contact">
                            {t('navigation.startProject')}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger
                  data-active={isProjectsActive}
                  className={cn(
                    'px-4 py-2 text-sm font-medium text-muted-foreground transition-colors rounded-lg hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-surface data-[state=open]:bg-surface/90 dark:data-[state=open]:bg-surface-muted/80 data-[state=open]:text-brand-blue data-[active=true]:bg-surface/80 dark:data-[active=true]:bg-surface-muted/70 data-[active=true]:text-brand-blue'
                  )}
                >
                  {t('navigation.projects')}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="rounded-2xl shadow-soft-lg">
                  <div className="rounded-2xl bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink p-[1px]">
                    <div className="md:w-[560px] rounded-[1.05rem] bg-surface/95 dark:bg-surface-muted/90 p-6 backdrop-blur-sm">
                      <div className="grid gap-4 md:grid-cols-2">
                        {projectItems.map((item) => {
                          const content = projectsContent[item.key];
                          if (!content) {
                            return null;
                          }

                          if (item.external) {
                            return (
                              <NavigationMenuLink asChild key={item.key}>
                                <a
                                  href={item.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={menuCardLinkClasses}
                                >
                                  {renderGradientCard(item.gradient, content)}
                                </a>
                              </NavigationMenuLink>
                            );
                          }

                          return (
                            <NavigationMenuLink asChild key={item.key}>
                              <Link to={item.href} className={menuCardLinkClasses}>
                                {renderGradientCard(item.gradient, content)}
                              </Link>
                            </NavigationMenuLink>
                          );
                        })}
                      </div>
                      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                        <Button
                          asChild
                          variant="ghost"
                          className="px-4 text-sm font-semibold text-brand-blue transition-colors hover:bg-gradient-to-r hover:from-brand-purple hover:via-brand-blue hover:to-brand-pink hover:text-white focus-visible:ring-brand-blue"
                        >
                          <Link to="/projects">
                            {t('navigation.projectsMenu.viewAll')}
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          className="border-brand-blue/20 text-brand-blue hover:border-brand-blue hover:bg-brand-blue/10 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                        >
                          <Link to="/contact">{t('navigation.startProject')}</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <NavLink
                    to="/about"
                    className={({ isActive }) =>
                      cn(
                        desktopNavLinkClasses,
                        isActive && desktopNavLinkActiveClasses
                      )
                    }
                  >
                    {t('navigation.about')}
                  </NavLink>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <NavLink
                    to="/blog"
                    className={({ isActive }) =>
                      cn(
                        desktopNavLinkClasses,
                        isActive && desktopNavLinkActiveClasses
                      )
                    }
                  >
                    {t('navigation.blog')}
                  </NavLink>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <NavLink
                    to="/contact"
                    className={({ isActive }) =>
                      cn(
                        desktopNavLinkClasses,
                        isActive && desktopNavLinkActiveClasses
                      )
                    }
                  >
                    {t('navigation.contact')}
                  </NavLink>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
            <NavigationMenuIndicator className="bg-transparent">
              <div className="relative top-[60%] h-2 w-2 rotate-45 bg-gradient-to-br from-brand-purple to-brand-blue" />
            </NavigationMenuIndicator>
          </NavigationMenu>
          <LanguageSwitcher />
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Olá, {user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="flex items-center gap-2 border-brand-blue/30 text-muted-foreground transition-colors hover:border-brand-blue hover:text-brand-blue focus-visible:ring-brand-blue"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <NavLink to="/auth">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-brand-purple/30 text-muted-foreground transition-colors hover:border-brand-blue hover:text-brand-blue focus-visible:ring-brand-blue"
                >
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </NavLink>
              <NavLink to="/contact">
                <Button className="bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink text-white shadow-soft hover:shadow-soft-lg">
                  {t('navigation.startProject')}
                </Button>
              </NavLink>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                aria-label={t('navigation.toggleNavigation')}
                className="flex items-center justify-center rounded-xl border border-transparent dark:border-white/20 bg-surface/80 dark:bg-surface-muted/70 p-2 text-muted-foreground shadow-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-surface hover:text-brand-blue"
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full border-l border-white/40 dark:border-white/10 bg-surface/95 dark:bg-surface-muted/90 px-6 py-8 backdrop-blur-sm sm:max-w-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-foreground">
                  {t('navigation.toggleNavigation')}
                </span>
                <LanguageSwitcher />
              </div>

              <nav className="mt-8 flex flex-col gap-4 text-base font-medium text-foreground">
                <SheetClose asChild>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      cn(
                        'rounded-lg px-3 py-2 transition-colors hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-surface',
                        isActive && 'text-brand-blue'
                      )
                    }
                  >
                    {t('navigation.home')}
                  </NavLink>
                </SheetClose>

                <Accordion type="single" collapsible className="w-full border-none">
                  <AccordionItem value="solutions" className="border-none">
                    <AccordionTrigger className="rounded-lg bg-surface/90 dark:bg-surface-muted/60 px-3 py-2 text-left text-base font-semibold text-foreground">
                      {t('navigation.solutions')}
                    </AccordionTrigger>
                    <AccordionContent className="px-1">
                      <div className="mt-3 flex flex-col gap-3">
                        {solutionItems.map((item) => {
                          const content = solutionsContent[item.key];
                          if (!content) {
                            return null;
                          }

                          return (
                            <SheetClose asChild key={item.key}>
                              <Link to={item.href} className={menuCardLinkClasses}>
                                {renderGradientCard(item.gradient, content)}
                              </Link>
                            </SheetClose>
                          );
                        })}
                      </div>
                      <div className="mt-4 grid gap-3">
                        <SheetClose asChild>
                          <Link
                            to="/solutions"
                            className="inline-flex items-center justify-center rounded-lg border border-brand-blue/20 px-4 py-2 text-sm font-semibold text-brand-blue transition-colors hover:border-brand-blue hover:bg-brand-blue/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-surface"
                          >
                            {t('navigation.solutionsMenu.viewAll')}
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            to="/contact"
                            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink px-4 py-2 text-sm font-semibold text-white shadow-soft"
                          >
                            {t('navigation.startProject')}
                          </Link>
                        </SheetClose>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="projects" className="border-none">
                    <AccordionTrigger className="mt-2 rounded-lg bg-surface/90 dark:bg-surface-muted/60 px-3 py-2 text-left text-base font-semibold text-foreground">
                      {t('navigation.projects')}
                    </AccordionTrigger>
                    <AccordionContent className="px-1">
                      <div className="mt-3 flex flex-col gap-3">
                        {projectItems.map((item) => {
                          const content = projectsContent[item.key];
                          if (!content) {
                            return null;
                          }

                          if (item.external) {
                            return (
                              <SheetClose asChild key={item.key}>
                                <a
                                  href={item.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={menuCardLinkClasses}
                                >
                                  {renderGradientCard(item.gradient, content)}
                                </a>
                              </SheetClose>
                            );
                          }

                          return (
                            <SheetClose asChild key={item.key}>
                              <Link to={item.href} className={menuCardLinkClasses}>
                                {renderGradientCard(item.gradient, content)}
                              </Link>
                            </SheetClose>
                          );
                        })}
                      </div>
                      <div className="mt-4 grid gap-3">
                        <SheetClose asChild>
                          <Link
                            to="/projects"
                            className="inline-flex items-center justify-center rounded-lg border border-brand-blue/20 px-4 py-2 text-sm font-semibold text-brand-blue transition-colors hover:border-brand-blue hover:bg-brand-blue/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-surface"
                          >
                            {t('navigation.projectsMenu.viewAll')}
                          </Link>
                        </SheetClose>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <SheetClose asChild>
                  <NavLink
                    to="/about"
                    className={({ isActive }) =>
                      cn(
                        'rounded-lg px-3 py-2 transition-colors hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-surface',
                        isActive && 'text-brand-blue'
                      )
                    }
                  >
                    {t('navigation.about')}
                  </NavLink>
                </SheetClose>
                <SheetClose asChild>
                  <NavLink
                    to="/blog"
                    className={({ isActive }) =>
                      cn(
                        'rounded-lg px-3 py-2 transition-colors hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-surface',
                        isActive && 'text-brand-blue'
                      )
                    }
                  >
                    {t('navigation.blog')}
                  </NavLink>
                </SheetClose>
                <SheetClose asChild>
                  <NavLink
                    to="/contact"
                    className={({ isActive }) =>
                      cn(
                        'rounded-lg px-3 py-2 transition-colors hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-surface',
                        isActive && 'text-brand-blue'
                      )
                    }
                  >
                    {t('navigation.contact')}
                  </NavLink>
                </SheetClose>
              </nav>

              <div className="mt-8 border-t border-border/60 dark:border-border pt-6">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <span className="text-sm text-muted-foreground">
                      Olá, {user.email}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => {
                        signOut();
                        setMobileOpen(false);
                      }}
                      className="flex w-full items-center justify-center gap-2 border-brand-blue/30 text-muted-foreground hover:border-brand-blue hover:text-brand-blue"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sair</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <SheetClose asChild>
                      <Link
                        to="/auth"
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-purple/30 px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-brand-blue hover:text-brand-blue"
                      >
                        <User className="h-4 w-4" />
                        <span>Login</span>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to="/contact"
                        className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-brand-purple via-brand-blue to-brand-pink px-4 py-2 text-sm font-semibold text-white shadow-soft"
                      >
                        {t('navigation.startProject')}
                      </Link>
                    </SheetClose>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
