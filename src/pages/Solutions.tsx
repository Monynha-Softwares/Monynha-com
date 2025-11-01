import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import Meta from '@/components/Meta';
import { PageBreadcrumb } from '@/components/PageBreadcrumb';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase';
import {
  getFallbackSolutions,
  mapSupabaseSolutionToContent,
} from '@/lib/solutions';
import {
  SolutionCard,
  sectionContainer,
  sectionPaddingY,
} from '@monynha/ui';
import { cn } from '@/lib/utils';

import type { SolutionContent } from '@/types/solutions';

const Solutions = () => {
  const { t } = useTranslation();

  const memoizedFallbackSolutions = useMemo(
    () => getFallbackSolutions(),
    []
  );

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
      <PageBreadcrumb currentPage={t('navigation.solutions')} />
      {/* Hero Section */}
      <section className={cn(sectionPaddingY, 'bg-white')}>
        <div className={sectionContainer}>
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
              {t('solutionsPage.title')}
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              {t('solutionsPage.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Detail */}
      <section className={cn(sectionPaddingY, 'bg-white')}>
        <div className={sectionContainer}>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {displaySolutions.map((solution) => (
              <SolutionCard
                key={solution.id ?? solution.slug}
                solution={solution}
                actions={
                  <>
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1"
                    >
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
              className="bg-white text-brand-purple hover:bg-blue-50 font-semibold px-8 py-4 rounded-2xl text-lg transition-all ease-in-out duration-300 shadow-md hover:shadow-soft-lg"
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
