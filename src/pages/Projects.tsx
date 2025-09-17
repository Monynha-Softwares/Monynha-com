import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Github, ExternalLink, Calendar, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import Meta from '@/components/Meta';
import { Button } from '@monynha/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@monynha/ui/card';
import { Badge } from '@monynha/ui/badge';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@monynha/ui/breadcrumb';
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
import SolutionCard from '@/components/solutions/SolutionCard';

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

  const combinedSolutions = useMemo(() => {
    const seen = new Set<string>();
    const merged: SolutionContent[] = [];

    const addSolution = (solution: SolutionContent) => {
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

    // Add solutions from supabase
    if (Array.isArray(supabaseSolutions)) {
      supabaseSolutions.forEach(addSolution);
    }

    // Add solutions from GitHub
    if (Array.isArray(githubSolutions)) {
      githubSolutions.forEach(addSolution);
    }

    // Add fallback solutions if nothing else
    if (merged.length === 0 && Array.isArray(memoizedFallbackSolutions)) {
      memoizedFallbackSolutions.forEach(addSolution);
    }

    return merged;
  }, [supabaseSolutions, githubSolutions, memoizedFallbackSolutions]);

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
              <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
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

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            <Trans
              i18nKey="projects.title"
              components={[
                <span
                  key="highlight"
                  className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent"
                />,
              ]}
            />
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            {t('projects.description')}
          </p>
        </div>

        {/* Solutions Section */}
        <section className="mb-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">
                {t('solutionsPage.title')}
              </h2>
              <p className="text-neutral-600 max-w-3xl mx-auto">
                {t('solutionsPage.description')}
              </p>
            </div>

            {(supabaseSolutionsLoading || isGitHubLoading) && combinedSolutions.length === 0 ? (
              <div className="text-center text-neutral-500">
                {t('projects.loadingSolutions')}
              </div>
            ) : combinedSolutions.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {combinedSolutions.map((solution) => (
                  <SolutionCard
                    key={solution.id ?? solution.slug}
                    solution={solution}
                    learnMoreHref={`/solutions/${solution.slug}`}
                    learnMoreLabel={t('index.learnMore')}
                    actionHref="/contact"
                    actionLabel={t('solutionsPage.requestDemo')}
                    actionIcon={<ArrowRight className="h-4 w-4" />}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-neutral-500">
                {t('projects.noSolutions', 'Solutions coming soon. Check back shortly!')}
              </p>
            )}

            {supabaseSolutionsError && (
              <p className="text-sm text-red-500 text-center mt-6">
                {t('projects.errorSolutions')}
              </p>
            )}
            {isGitHubError && (
              <p className="text-sm text-red-500 text-center mt-3">
                {t('projects.errorGithub')}
              </p>
            )}
          </div>
        </section>

        {/* Projects Grid */}
        <section>
          {repositoriesError && repositories.length === 0 ? (
            <div className="text-center text-red-500">
              {t('projects.errorProjects')}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {repositories.map((repo) => (
                <Card key={repo.id} className="card-hover border-0 shadow-soft">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl font-semibold text-neutral-900 mb-2">
                        {repo.name}
                      </CardTitle>
                      <div className="flex items-center text-sm text-neutral-500 gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(repo.created_at)}
                      </div>
                    </div>
                    <p className="text-neutral-600 leading-relaxed">
                      {repo.description}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Tags */}
                    {repo.tags && repo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {repo.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-all ease-in-out duration-300"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button asChild variant="default" className="flex-1">
                        <a
                          href={repo.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          <Github className="w-4 h-4" />
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
                            <ExternalLink className="w-4 h-4" />
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
            <p className="text-sm text-red-500 text-center mt-6">
              {t('projects.errorProjectsPartial')}
            </p>
          )}
        </section>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
            {t('projects.like')}
          </h3>
          <p className="text-neutral-600 mb-8 max-w-2xl mx-auto">
            {t('projects.likeDescription')}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-brand-accent to-brand-accentYellow hover:shadow-soft-lg transition-all ease-in-out duration-300"
          >
            <Link to="/contact">{t('projects.contactUs')}</Link>
          </Button>
        </div>
      </div>

    </Layout>
  );
}

export default Projects;
