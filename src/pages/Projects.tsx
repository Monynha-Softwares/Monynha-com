import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Github,
  ExternalLink,
  Calendar,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
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
  getFallbackSolutions,
  mapGitHubRepoToContent,
} from '@/lib/solutions';
import type { SolutionContent } from '@/types/solutions';
import type { GitHubRepository } from '@/lib/solutions';

interface Repository {
  id: string;
  name: string;
  description: string;
  github_url: string;
  demo_url: string | null;
  tags: string[];
  created_at: string;
}

const GITHUB_REPOS_URL =
  'https://api.github.com/orgs/Monynha-Softwares/repos?per_page=100';

const Projects = () => {
  const { t } = useTranslation();
  useRepositorySync();

  const memoizedFallbackSolutions = useMemo(
    () => getFallbackSolutions(),
    []
  );

  const {
    data: repositories = [],
    isLoading: isLoadingRepositories,
    isError: isErrorRepositories,
  } = useQuery({
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

      return data || [];
    },
  });

  const {
    data: githubProjects = [],
    isLoading: isLoadingGitHub,
    isError: isErrorGitHub,
  } = useQuery<SolutionContent[]>({
    queryKey: ['github-projects'],
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
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const displayGitHubProjects =
    githubProjects.length > 0 ? githubProjects : memoizedFallbackSolutions;

  const showInitialLoading =
    isLoadingRepositories &&
    repositories.length === 0 &&
    isLoadingGitHub &&
    githubProjects.length === 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (showInitialLoading) {
    return (
      <Layout>
        <Meta
          title="Open Source Projects - Monynha Softwares Agency"
          description={t('projects.description')}
          ogTitle="Open Source Projects - Monynha Softwares Agency"
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

  return (
    <Layout>
      <Meta
        title="Open Source Projects - Monynha Softwares Agency"
        description={t('projects.description')}
        ogTitle="Open Source Projects - Monynha Softwares Agency"
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
                  className="bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent"
                />,
              ]}
            />
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            {t('projects.description')}
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {isLoadingRepositories && repositories.length === 0 && (
            <>
              {[...Array(4)].map((_, index) => (
                <div
                  key={`repo-skeleton-${index}`}
                  className="border-0 shadow-soft rounded-2xl p-6 bg-muted animate-pulse h-64"
                />
              ))}
            </>
          )}

          {isErrorRepositories && repositories.length === 0 && (
            <div className="col-span-full text-center text-neutral-500">
              Error loading projects
            </div>
          )}

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
                  <Button
                    asChild
                    variant="default"
                    className="flex-1 bg-gradient-to-r from-brand-purple to-brand-blue hover:shadow-soft-lg transition-all ease-in-out duration-300"
                  >
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
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 border-neutral-200 hover:border-brand-blue hover:text-brand-blue transition-all ease-in-out duration-300"
                    >
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

          {!isLoadingRepositories && !isErrorRepositories && repositories.length === 0 && (
            <div className="col-span-full text-center text-neutral-500">
              No projects available at the moment.
            </div>
          )}
        </div>

        <div className="mt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              {t('solutionsPage.title')}
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
              {t('solutionsPage.description')}
            </p>
          </div>

          {isLoadingGitHub && githubProjects.length === 0 ? (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(3)].map((_, index) => (
                <div
                  key={`github-skeleton-${index}`}
                  className="border-0 shadow-soft rounded-2xl p-6 bg-muted animate-pulse h-80"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {displayGitHubProjects.map((solution) => (
                <Card
                  key={solution.id ?? solution.slug}
                  className="border-0 shadow-soft-lg flex flex-col overflow-hidden"
                >
                  {solution.imageUrl && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={solution.imageUrl}
                        alt={solution.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      <div
                        className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${solution.gradient}`}
                      />
                    </div>
                  )}
                  <CardContent className="p-8 flex flex-col flex-1">
                    <div
                      className={`h-1 w-16 bg-gradient-to-r ${solution.gradient} rounded-full mb-6`}
                    />
                    <Link to={`/solutions/${solution.slug}`} className="group">
                      <h3 className="text-xl font-semibold text-neutral-900 group-hover:text-brand-blue transition-colors">
                        {solution.title}
                      </h3>
                    </Link>
                    <p className="text-neutral-600 mt-4 leading-relaxed flex-1">
                      {solution.description}
                    </p>

                    {solution.features.length > 0 && (
                      <ul className="mt-6 space-y-3">
                        {solution.features.map((feature, featureIndex) => (
                          <li
                            key={`${solution.slug}-feature-${featureIndex}`}
                            className="flex items-start gap-3"
                          >
                            <span
                              className={`mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r ${solution.gradient}`}
                            >
                              <CheckCircle className="h-4 w-4 text-white" />
                            </span>
                            <span className="text-sm text-neutral-600 leading-relaxed">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                      <Button
                        asChild
                        variant="outline"
                        className="flex-1 border-neutral-200 hover:border-brand-blue hover:text-brand-blue transition-colors"
                      >
                        <Link
                          to={`/solutions/${solution.slug}`}
                          className="flex items-center justify-center gap-2"
                        >
                          {t('index.learnMore')}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="flex-1 bg-gradient-to-r from-brand-purple to-brand-blue hover:shadow-soft-lg transition-all"
                      >
                        <Link
                          to="/contact"
                          className="flex items-center justify-center gap-2"
                        >
                          {t('solutionsPage.requestDemo')}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {isErrorGitHub && githubProjects.length === 0 && (
            <div className="text-center text-neutral-500 mt-8">
              Error loading GitHub projects. Showing featured solutions instead.
            </div>
          )}
        </div>

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
            className="bg-gradient-to-r from-brand-pink to-brand-orange hover:shadow-soft-lg transition-all ease-in-out duration-300"
          >
            <Link to="/contact">{t('projects.contactUs')}</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Projects;
