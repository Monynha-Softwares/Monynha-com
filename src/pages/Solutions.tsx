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
import SolutionCardGrid from '@/components/solutions/SolutionCardGrid';
import { supabase } from '@/integrations/supabase';
import { mapSupabaseSolutions } from '@/lib/solutions';
import type { SolutionContent } from '@/types/solutions';

const Solutions = () => {
  const { t } = useTranslation();

  const {
    data: solutions = [],
    isLoading,
    isError,
  } = useQuery<SolutionContent[]>({
    queryKey: ['solutions', 'supabase'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        return [];
      }

      return mapSupabaseSolutions(data);
    },
  });

  const hasSolutions = solutions.length > 0;

  if (isLoading) {
    return (
      <Layout>
        <Meta
          title="Our Software Solutions - Monynha Softwares Agency"
          description={t('solutionsPage.description')}
          ogTitle="Our Software Solutions - Monynha Softwares Agency"
          ogDescription={t('solutionsPage.description')}
          ogImage="/placeholder.svg"
        />
        <div className="container mx-auto px-4 py-16 text-center">
          Loading...
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <Meta
          title="Our Software Solutions - Monynha Softwares Agency"
          description={t('solutionsPage.description')}
          ogTitle="Our Software Solutions - Monynha Softwares Agency"
          ogDescription={t('solutionsPage.description')}
          ogImage="/placeholder.svg"
        />
        <div className="container mx-auto px-4 py-16 text-center">
          Error loading solutions
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Meta
        title="Our Software Solutions - Monynha Softwares Agency"
        description={t('solutionsPage.description')}
        ogTitle="Our Software Solutions - Monynha Softwares Agency"
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
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {hasSolutions ? (
            <SolutionCardGrid
              solutions={solutions}
              learnMoreLabel={t('index.learnMore')}
              requestDemoLabel={t('solutionsPage.requestDemo')}
            />
          ) : (
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                {t('solutionsPage.emptyState.title')}
              </h2>
              <p className="text-neutral-600 mb-8">
                {t('solutionsPage.emptyState.description')}
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-brand-purple to-brand-blue"
              >
                <Link to="/contact" className="flex items-center gap-2">
                  {t('solutionsPage.discuss')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Custom Solutions CTA */}
      <section className="py-24 bg-gradient-hero text-white">
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
              className="bg-white text-brand-purple hover:bg-blue-50 font-semibold px-8 py-4 rounded-xl text-lg transition-all ease-in-out duration-300"
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
