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
import { SectionHeading, SolutionCard } from '@monynha/ui';

import type { SolutionContent } from '@/types/solutions';

const Solutions = () => {
  const { t } = useTranslation();

  const memoizedFallbackSolutions = useMemo(getFallbackSolutions, []);

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
        mapSupabaseSolutionToContent(solution, { index })
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
              <BreadcrumbPage>{t('navigation.solutions')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title={t('solutionsPage.title')}
            description={t('solutionsPage.description')}
          />

          <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {displaySolutions.map((solution) => (
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
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Solutions;
