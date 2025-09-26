import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import Meta from '@/components/Meta';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase';
import {
  getFallbackSolutions,
  mapSupabaseSolutionToContent,
} from '@/lib/solutions';
import { SolutionCard, sectionContainer, sectionPaddingY } from '@monynha/ui';
import { cn } from '@/lib/utils';

import type { SolutionContent } from '@/types/solutions';

const Solutions = () => {
  const { t } = useTranslation();

  const memoizedFallbackSolutions = useMemo(() => getFallbackSolutions(), []);

  const {
    data: solutions = [],
    isLoading,
    isError,
  } = useQuery<SolutionContent[]>({
    queryKey: ['solutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return (data ?? []).map((solution, index) =>
        mapSupabaseSolutionToContent(solution, index)
      );
    },

    staleTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const displaySolutions =
    solutions.length > 0 ? solutions : memoizedFallbackSolutions;

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
          {t('solutionsPage.loading')}
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
          {t('solutionsPage.error')}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Meta
        title={t('solutionsPage.metaTitle')}
        description={t('solutionsPage.description')}
        ogTitle={t('solutionsPage.metaTitle')}
        ogDescription={t('solutionsPage.description')}
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
              <BreadcrumbPage>{t('navigation.solutions')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950/20 via-brand-purple/20 to-brand-blue/30 dark:from-neutral-950/40 dark:via-neutral-950/60 dark:to-brand-purple/40" />
        <div className={cn(sectionPaddingY, 'relative z-10')}>
          <div className={cn(sectionContainer, 'text-center mb-16')}>
            <h1 className="mb-6 text-4xl font-bold lg:text-5xl">
              {t('solutionsPage.title')}
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-blue-100/90 dark:text-blue-100">
              {t('solutionsPage.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Detail */}
      <section
        className={cn(
          sectionPaddingY,
          'bg-white transition-colors dark:bg-neutral-950'
        )}
      >
        <div className={sectionContainer}>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {displaySolutions.map((solution) => (
              <SolutionCard
                key={solution.id ?? solution.slug}
                solution={solution}
                className="min-h-[32rem]"
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
                    <Button asChild variant="gradient" className="flex-1">
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
        </div>
      </section>

      {/* Custom Solutions CTA */}
      <section className={cn(sectionPaddingY, 'bg-gradient-hero text-white')}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            {t('solutionsPage.customTitle')}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {t('solutionsPage.customDescription')}
          </p>
          <Link to="/contact">
            <Button
              size="lg"
              className="rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-brand-purple transition-all duration-300 ease-in-out hover:bg-blue-50 shadow-md hover:shadow-soft-lg dark:text-white dark:hover:bg-neutral-800"
            >
              {t('solutionsPage.discuss')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Solutions;
