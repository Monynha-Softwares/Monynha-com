import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Github,
  ExternalLink,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import Layout from '@/components/Layout';
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
import { SectionHeading, SolutionCard } from '@monynha/ui';

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

  const memoizedFallbackSolutions = useMemo(getFallbackSolutions, []);

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

  const {
    data: githubSolutions = [],
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

  const combinedSolutions = useMemo(() => {
    const seen = new Set<string>();
    const merged: SolutionContent[] = [];

    const addSolution = (solution: SolutionContent | undefined) => {
      if (!solution) {
        return;
      }

      const key = solution.slug
        ? solution.slug.toLowerCase()
        : solution.title.toLowerCase();

      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      merged.push(solution);
    };

    supabaseSolutions.forEach(addSolution);
    githubSolutions.forEach(addSolution);

    if (merged.length === 0) {
      memoizedFallbackSolutions.forEach(addSolution);
    }

    return merged;
  }, [githubSolutions, memoizedFallbackSolutions, supabaseSolutions]);

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
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="mx-auto mb-4 h-8 w-64 rounded bg-muted"></div>
              <div className="mx-auto h-4 w-96 rounded bg-muted"></div>
            </div>
          </div>
        </div>
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
        <div className="container mx-auto px-4 py-16 text-center">
          {t('projects.errorProjects')}
        </div>
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
      <div className="mx-auto max-w-7xl px-4 pt-4">
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

      <div className="container mx-auto px-4 py-16">
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-display font-semibold text-neutral-900 md:text-5xl">
            <Trans
              i18nKey="projects.title"
              components={[
                <span
                  key="highlight"
                  className="bg-gradient-to-r from-brand-violet to-brand-blue bg-clip-text text-transparent"
                />,
              ]}
            />
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl text-neutral-600">
            {t('projects.description')}
          </p>
        </div>

        <section className="mb-20">
          <SectionHeading
            title={t('projects.solutionsHeading')}
            description={t('projects.solutionsSubheading')}
          />

          <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {supabaseSolutionsLoading && combinedSolutions.length === 0 ? (
              <p className="col-span-full text-center text-neutral-500">
                {t('projects.loadingSolutions')}
              </p>
            ) : (
              combinedSolutions.map((solution) => (
                <SolutionCard
                  key={solution.id ?? solution.slug}
                  solution={solution}
                  actions={
                    <>
                      <Button
                        asChild
                        variant="outline"
                        className="flex-1 border-neutral-200 hover:border-brand-blue hover:text-brand-blue"
                      >
                        <Link
                          to={`/solutions/${solution.slug}`}
                          className="flex items-center justify-center"
                        >
                          {t('index.learnMore')}
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="flex-1 bg-gradient-to-r from-brand-violet to-brand-blue hover:shadow-soft-lg"
                      >
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
              ))
            )}
          </div>

          {supabaseSolutionsError && (
            <p className="mt-6 text-center text-sm text-red-500">
              {t('projects.errorSolutions')}
            </p>
          )}

          {isGitHubError && (
            <p className="mt-2 text-center text-sm text-red-500">
              {t('projects.errorGithub')}
            </p>
          )}
        </section>

        <section>
          <SectionHeading
            title={t('projects.repositoriesHeading')}
            description={t('projects.repositoriesDescription')}
            align="start"
            className="max-w-4xl"
          />

          {repositoriesError && repositories.length === 0 ? (
            <div className="text-center text-red-500">
              {t('projects.errorProjects')}
            </div>
          ) : (
            <div className="mx-auto mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-2">
              {repositories.map((repo) => (
                <Card
                  key={repo.id}
                  className="card-hover rounded-2xl border border-neutral-100 bg-white/95 shadow-md"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl font-semibold text-neutral-900">
                        {repo.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-sm text-neutral-500">
                        <Calendar className="h-4 w-4" />
                        {formatDate(repo.created_at)}
                      </div>
                    </div>
                    <p className="mt-3 text-neutral-600 leading-relaxed">
                      {repo.description}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {repo.tags && repo.tags.length > 0 && (
                      <div className="mb-6 flex flex-wrap gap-2">
                        {repo.tags.map((tag, index) => (
                          <Badge
                            key={`${repo.id}-tag-${index}`}
                            variant="secondary"
                            className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        asChild
                        variant="default"
                        className="flex-1 bg-gradient-to-r from-brand-violet to-brand-blue hover:shadow-soft-lg"
                      >
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
                        <Button
                          asChild
                          variant="outline"
                          className="flex-1 border-neutral-200 hover:border-brand-blue hover:text-brand-blue"
                        >
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
        </section>

        <div className="mt-20 text-center">
          <h3 className="text-2xl font-semibold text-neutral-900">
            {t('projects.like')}
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-neutral-600">
            {t('projects.likeDescription')}
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-gradient-to-r from-brand-magenta to-brand-blue hover:shadow-soft-lg"
          >
            <Link to="/contact">{t('projects.contactUs')}</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Projects;
