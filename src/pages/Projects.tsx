import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Github, ExternalLink, Calendar, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import Meta from '@/components/Meta';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { supabase } from '@/integrations/supabase';
import { useTranslation, Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import useRepositorySync from '@/hooks/useRepositorySync';
import {
  fetchSupabaseSolutions,
  getFallbackSolutions,
  mapGitHubRepoToContent,
} from '@/lib/solutions';
import type { GitHubRepository } from '@/lib/solutions';
import type { SolutionContent } from '@/types/solutions';
import { getNormalizedLocale } from '@/lib/i18n';
import {
  SolutionCard,
  sectionContainer,
  sectionPaddingY,
} from '@monynha/ui';
import { cn } from '@/lib/utils';

interface Repository {
  id: string;
  name: string;
  description: string;
  github_url: string;
  demo_url: string | null;
  tags: string[] | null;
  created_at: string;
}

const GITHUB_REPOS_URL =
  'https://api.github.com/orgs/Monynha-Softwares/repos?per_page=100';

const Projects = () => {
  const { t, i18n } = useTranslation();
  useRepositorySync();

  const memoizedFallbackSolutions = useMemo(() => getFallbackSolutions(), []);

  const normalizedLocale = useMemo(
    () => getNormalizedLocale(i18n.language),
    [i18n.language]
  );

  const fallbackDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    []
  );

  const dateFormatter = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(normalizedLocale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Unsupported locale for project date formatting', error);
      return fallbackDateFormatter;
    }
  }, [fallbackDateFormatter, normalizedLocale]);

  const formatDate = useCallback(
    (dateString: string) => {
      try {
        return dateFormatter.format(new Date(dateString));
      } catch (error) {
        console.error('Error formatting project date', error);
        return fallbackDateFormatter.format(new Date(dateString));
      }
    },
    [dateFormatter, fallbackDateFormatter]
  );

  const {
    data: repositories = [],
    isLoading: repositoriesLoading,
    isError: repositoriesError,
  } = useQuery<Repository[]>({
    queryKey: ['repositories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('repositories')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return (data ?? []) as Repository[];
    },
  });

  const {
    data: supabaseSolutions = [],
    isLoading: supabaseSolutionsLoading,
    isError: supabaseSolutionsError,
  } = useQuery<SolutionContent[]>({
    queryKey: ['solutions'],
    queryFn: fetchSupabaseSolutions,
    staleTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Removed duplicate githubSolutions useQuery block

  // Removed duplicate memoizedFallbackSolutions declaration

  const {
    data: githubSolutions = [],
    isLoading: isGitHubLoading,
    isError: isGitHubError,
  } = useQuery<SolutionContent[]>({
    queryKey: ['projects-github-solutions'],
    queryFn: async () => {
      const response = await fetch(GITHUB_REPOS_URL, {
        headers: {
          Accept: 'application/vnd.github+json',
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API responded with ${response.status}`);
      }

      const repositories: GitHubRepository[] = await response.json();

      const toTimestamp = (repository: GitHubRepository) => {
        const reference =
          repository.pushed_at ?? repository.updated_at ?? repository.created_at;
        const timestamp = new Date(reference).getTime();
        return Number.isNaN(timestamp) ? 0 : timestamp;
      };

      const activeRepositories = repositories.filter(
        (repository) =>
          !repository.private && !repository.archived && !repository.disabled
      );

      const sortedRepositories = activeRepositories
        .slice()
        .sort((a, b) => toTimestamp(b) - toTimestamp(a));

      return sortedRepositories.map((repository, index) =>
        mapGitHubRepoToContent(repository, index)
      );
    },
    staleTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const primarySolutions = useMemo(() => {
    if (Array.isArray(supabaseSolutions) && supabaseSolutions.length > 0) {
      return supabaseSolutions.slice(0, 3);
    }

    return memoizedFallbackSolutions;
  }, [supabaseSolutions, memoizedFallbackSolutions]);

  const openSourceSolutions = useMemo(() => {
    const excludedSlugs = new Set(
      primarySolutions.map((solution) => solution.slug.toLowerCase())
    );

    const sourceArray =
      Array.isArray(githubSolutions) && githubSolutions.length > 0
        ? githubSolutions
        : memoizedFallbackSolutions;

    const filtered = sourceArray.filter((solution) => {
      const slug = solution.slug?.toLowerCase();
      return slug ? !excludedSlugs.has(slug) : true;
    });

    return filtered.length > 0 ? filtered : sourceArray;
  }, [githubSolutions, memoizedFallbackSolutions, primarySolutions]);

  if (repositoriesLoading) {

    return (
      <Layout>
        <Meta
          title={t('projects.metaTitle')}
          description={t('projects.description')}
          ogTitle={t('projects.metaTitle')}
          ogDescription={t('projects.description')}
          ogImage="/placeholder.svg"
        />
        <section
          className={cn(
            sectionPaddingY,
            'bg-background/95 transition-colors duration-300 dark:bg-background/80'
          )}
        >
          <div className={sectionContainer}>
            <div className="text-center">
              <div className="mx-auto max-w-md animate-pulse space-y-4">
                <div className="h-8 rounded-full bg-muted" />
                <div className="h-4 rounded-full bg-muted" />
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (repositoriesError && supabaseSolutionsError) {
    return (
      <Layout>
        <Meta
          title={t('projects.metaTitle')}
          description={t('projects.description')}
          ogTitle={t('projects.metaTitle')}
          ogDescription={t('projects.description')}
          ogImage="/placeholder.svg"
        />
        <section
          className={cn(
            sectionPaddingY,
            'bg-background/95 transition-colors duration-300 dark:bg-background/80'
          )}
        >
          <div className={sectionContainer}>
            <p className="text-center text-red-500">
              {t('projects.errorProjects')}
            </p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <Meta
        title={t('projects.metaTitle')}
        description={t('projects.description')}
        ogTitle={t('projects.metaTitle')}
        ogDescription={t('projects.description')}
        ogImage="/placeholder.svg"
      />
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">{t('navigation.home')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('navigation.projects')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <section
        className={cn(
          sectionPaddingY,
          'bg-background/95 transition-colors duration-300 dark:bg-background/80'
        )}
      >
        <div className={sectionContainer}>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              <Trans
                i18nKey="projects.title"
                components={[
                  <span
                    key="highlight"
                    className="bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent"
                  />,
                ]}
              />
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('projects.description')}
            </p>
          </div>
        </div>
      </section>

      <section
        className={cn(
          sectionPaddingY,
          'bg-muted/60 transition-colors duration-300 dark:bg-background/70'
        )}
      >
        <div className={sectionContainer}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t('solutionsPage.title')}
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              {t('solutionsPage.description')}
            </p>
          </div>

          {supabaseSolutionsLoading ? (
            <div className="text-center text-muted-foreground">
              {t('projects.loadingSolutions')}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {primarySolutions.map((solution) => (
                <SolutionCard
                  key={solution.id ?? solution.slug}
                  solution={solution}
                  actions={
                    <>
                      <Button asChild variant="outline" className="flex-1">
                        <Link
                          to={`/solutions/${solution.slug}`}
                          className="flex items-center justify-center"
                        >
                          {t('index.learnMore')}
                        </Link>
                      </Button>
                      <Button asChild className="flex-1">
                        <Link
                          to="/contact"
                          className="flex items-center justify-center gap-2"
                        >
                          {t('solutionsPage.requestDemo')}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </>
                  }
                />
              ))}
            </div>
          )}

          {supabaseSolutionsError && (
            <p className="mt-6 text-center text-sm text-red-500">
              {t('projects.errorSolutions')}
            </p>
          )}
        </div>
      </section>

      <section
        className={cn(
          sectionPaddingY,
          'bg-background transition-colors duration-300 dark:bg-background/70'
        )}
      >
        <div className={sectionContainer}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">
              <Trans
                i18nKey="projects.title"
                components={[
                  <span
                    key="highlight"
                    className="bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent"
                  />,
                ]}
              />
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              {t('projects.description')}
            </p>
          </div>

          {isGitHubLoading ? (
            <div className="text-center text-muted-foreground">
              {t('projects.loadingGithub')}
            </div>
          ) : (
            <>
              {isGitHubError && (
                <p className="mb-6 text-center text-sm text-red-500">
                  {t('projects.errorGithub')}
                </p>
              )}
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {openSourceSolutions.map((solution) => (
                  <SolutionCard
                    key={solution.id ?? solution.slug}
                    solution={solution}
                    actions={
                      <>
                        <Button asChild variant="outline" className="flex-1">
                          <Link
                            to={`/solutions/${solution.slug}`}
                            className="flex items-center justify-center"
                          >
                            {t('index.learnMore')}
                          </Link>
                        </Button>
                        {solution.externalUrl ? (
                          <Button
                            asChild
                            variant="secondary"
                            className="flex-1"
                          >
                            <a
                              href={solution.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2"
                            >
                              <Github className="h-4 w-4" />
                              {t('projects.viewGithub')}
                            </a>
                          </Button>
                        ) : (
                          <Button asChild className="flex-1">
                            <Link
                              to="/contact"
                              className="flex items-center justify-center gap-2"
                            >
                              {t('projects.contactUs')}
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </>
                    }
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section
        className={cn(
          sectionPaddingY,
          'bg-muted/60 transition-colors duration-300 dark:bg-background/70'
        )}
      >
        <div className={sectionContainer}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t('navigation.projects')}
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              {t('projects.description')}
            </p>
          </div>

          {repositoriesError && repositories.length === 0 ? (
            <div className="text-center text-red-500">
              {t('projects.errorProjects')}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {repositories.map((repo) => (
                <Card
                  key={repo.id}
                  className="card-hover rounded-2xl bg-card/95 shadow-md transition-colors duration-300 dark:bg-card/80"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl font-semibold text-foreground">
                        {repo.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(repo.created_at)}
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {repo.description}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {repo.tags && repo.tags.length > 0 && (
                      <div className="mb-6 flex flex-wrap gap-2">
                        {repo.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="rounded-full bg-muted/80 px-3 py-1 text-xs font-medium text-muted-foreground"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button asChild className="flex-1">
                        <a
                          href={repo.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          <Github className="h-4 w-4" />
                          {t('projects.viewGithub')}
                        </a>
                      </Button>
                      {repo.demo_url && (
                        <Button asChild variant="outline" className="flex-1">
                          <a
                            href={repo.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            {t('projects.liveDemo')}
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {repositoriesError && repositories.length > 0 && (
            <p className="mt-6 text-center text-sm text-red-500">
              {t('projects.errorProjectsPartial')}
            </p>
          )}
        </div>
      </section>

      <section className={cn(sectionPaddingY, 'bg-gradient-hero text-white')}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4 text-balance">{t('projects.like')}</h3>
          <p className="text-white/80 mb-8 dark:text-white/90">
            {t('projects.likeDescription')}
          </p>
          <Button asChild size="lg" variant="default" className="px-8">
            <Link to="/contact" className="flex items-center justify-center gap-2">
              {t('projects.contactUs')}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

    </Layout>
  );
}

export default Projects;
