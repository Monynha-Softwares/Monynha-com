import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import Meta from '@/components/Meta';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase';
import type { GitHubRepository } from '@/lib/solutions';
import type { SolutionContent } from '@/types/solutions';
import {
  getFallbackSolution,
  mapGitHubRepoToContent,
  mapSupabaseSolutionToContent,
} from '@/lib/solutions';

const getRepositoryUrl = (repositorySlug: string) =>
  `https://api.github.com/repos/Monynha-Softwares/${encodeURIComponent(
    repositorySlug
  )}`;

const SolutionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();

  const fallbackSolution = useMemo(
    () => (slug ? getFallbackSolution(slug) : undefined),
    [slug]
  );

  const {
    data: solution,
    isLoading,
    isError,
  } = useQuery<SolutionContent | null>({
    queryKey: ['solution', slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      if (!slug) {
        return null;
      }

      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('slug', slug)
        .eq('active', true)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        return mapSupabaseSolutionToContent(data);
      }

      const response = await fetch(getRepositoryUrl(slug), {
        headers: {
          Accept: 'application/vnd.github+json',
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`GitHub API responded with ${response.status}`);
      }

      const repository: GitHubRepository = await response.json();

      if (repository.private || repository.archived || repository.disabled) {
        return null;
      }

      return mapGitHubRepoToContent(repository, 0);
    },
    staleTime: 1000 * 60 * 10,
    retry: 1,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const displaySolution = solution ?? fallbackSolution ?? null;

  if (isLoading) {
    return (
      <Layout>
        <Meta
          title={t('solutionsPage.metaTitle')}
          description={t('solutionsPage.description')}
          ogTitle={t('solutionsPage.metaTitle')}
          ogDescription={t('solutionsPage.description')}
          ogImage="/placeholder.svg"
        />
        <div className="container mx-auto px-4 py-16 text-center">
          {t('solutionsPage.detailLoading')}
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <Meta
          title={t('solutionsPage.metaTitle')}
          description={t('solutionsPage.description')}
          ogTitle={t('solutionsPage.metaTitle')}
          ogDescription={t('solutionsPage.description')}
          ogImage="/placeholder.svg"
        />
        <div className="container mx-auto px-4 py-16 text-center">
          {t('solutionsPage.detailError')}
        </div>
      </Layout>
    );
  }

  if (!displaySolution) {
    return (
      <Layout>
        <Meta
          title={t('solutionsPage.metaTitle')}
          description={t('solutionsPage.description')}
          ogTitle={t('solutionsPage.metaTitle')}
          ogDescription={t('solutionsPage.description')}
          ogImage="/placeholder.svg"
        />
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-lg mx-auto space-y-6">
            <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
              {t('solutionsPage.notFound')}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300">
              {t('solutionsPage.description')}
            </p>
            <Button asChild>
              <Link to="/solutions">{t('solutionsPage.backToSolutions')}</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Meta
        title={`${displaySolution.title} - Monynha Softwares Agency`}
        description={displaySolution.description}
        ogTitle={`${displaySolution.title} - Monynha Softwares Agency`}
        ogDescription={displaySolution.description}
        ogImage={displaySolution.imageUrl ?? '/placeholder.svg'}
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
              <BreadcrumbLink asChild>
                <Link to="/solutions">{t('navigation.solutions')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{displaySolution.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-start">
            <div>
              <div
                className={`h-1 w-16 bg-gradient-to-r ${displaySolution.gradient} rounded-full mb-6`}
              />
              <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                {displaySolution.title}
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {displaySolution.description}
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 sm:flex-none sm:w-auto border-neutral-200 dark:border-neutral-800 hover:border-brand-blue hover:text-brand-blue transition-colors"
                >
                  <Link to="/solutions" className="flex items-center justify-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    {t('solutionsPage.backToSolutions')}
                  </Link>
                </Button>
                <Button
                  asChild
                  className="flex-1 sm:flex-none sm:w-auto bg-gradient-to-r from-brand-purple to-brand-blue hover:shadow-soft-lg transition-all"
                >
                  <Link to="/contact" className="flex items-center justify-center gap-2">
                    {t('solutionsPage.requestDemo')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {displaySolution.imageUrl && (
              <Card className="border-0 shadow-soft-lg overflow-hidden rounded-2xl">
                <img
                  src={displaySolution.imageUrl}
                  alt={displaySolution.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div
                  className={`h-1 bg-gradient-to-r ${displaySolution.gradient}`}
                />
              </Card>
            )}
          </div>
        </div>
      </section>

      {displaySolution.features.length > 0 && (
        <section className="py-16 bg-neutral-50 dark:bg-neutral-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-8">
              {t('solutionsPage.featuresTitle')}
            </h2>
            <div className="space-y-4">
              {displaySolution.features.map((feature, index) => (
                <div
                  key={`${displaySolution.slug}-detail-feature-${index}`}
                  className="bg-white transition-colors dark:bg-neutral-950 rounded-2xl shadow-soft p-6 flex items-start gap-4"
                >
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r ${displaySolution.gradient}`}
                  >
                    <CheckCircle className="h-5 w-5 text-white" />
                  </span>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-24 bg-gradient-hero text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            {t('solutionsPage.customTitle')}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {t('solutionsPage.customDescription')}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white transition-colors dark:bg-neutral-950 text-brand-purple hover:bg-blue-50 font-semibold px-8 py-4 rounded-xl text-lg transition-all ease-in-out duration-300"
          >
            <Link to="/contact" className="flex items-center justify-center gap-2">
              {t('solutionsPage.discuss')}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default SolutionDetail;
