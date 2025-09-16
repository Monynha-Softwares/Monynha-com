import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase';
import {
  fallbackSolutions,
  normalizeSolution,
  type SolutionContent,
  type SolutionRow,
} from '@/utils/solutions';

const Solutions = () => {
  const { t } = useTranslation();

  const metaDescription = t('solutionsPage.description');

  const {
    data: solutionsData = [],
    isLoading,
    isError,
  } = useQuery<SolutionRow[]>({
    queryKey: ['solutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data ?? [];
    },
  });

  const solutionsToDisplay = useMemo<SolutionContent[]>(() => {
    if (!solutionsData.length) {
      return fallbackSolutions;
    }

    return solutionsData.map((solution) => normalizeSolution(solution));
  }, [solutionsData]);

  if (isLoading) {
    return (
      <Layout>
        <Meta
          title="Our Software Solutions - Monynha Softwares Agency"
          description={metaDescription}
          ogTitle="Our Software Solutions - Monynha Softwares Agency"
          ogDescription={metaDescription}
          ogImage="/placeholder.svg"
        />
        <div className="container mx-auto px-4 py-24">
          <div className="mx-auto max-w-3xl animate-pulse space-y-6 text-center">
            <div className="mx-auto h-10 w-48 rounded-full bg-muted" />
            <div className="mx-auto h-4 w-80 rounded-full bg-muted" />
            <div className="mx-auto h-4 w-72 rounded-full bg-muted" />
          </div>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <Meta
          title="Our Software Solutions - Monynha Softwares Agency"
          description={metaDescription}
          ogTitle="Our Software Solutions - Monynha Softwares Agency"
          ogDescription={metaDescription}
          ogImage="/placeholder.svg"
        />
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-lg text-neutral-600">{t('solutionsPage.error')}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Meta
        title="Our Software Solutions - Monynha Softwares Agency"
        description={metaDescription}
        ogTitle="Our Software Solutions - Monynha Softwares Agency"
        ogDescription={metaDescription}
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

      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-neutral-900 md:text-5xl">
            {t('solutionsPage.title')}
          </h1>
          <p className="mt-4 text-lg text-neutral-600">{metaDescription}</p>
          <div className="mt-8 flex justify-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-brand-purple to-brand-blue px-8 py-6 text-lg font-semibold text-white shadow-soft-lg transition-all duration-300 ease-in-out hover:shadow-soft-xl"
            >
              <Link to="/contact">
                {t('solutionsPage.requestDemo')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-2 lg:px-8 xl:grid-cols-3">
          {solutionsToDisplay.map((solution) => (
            <Card
              key={solution.id ?? solution.slug}
              className="flex h-full flex-col border-0 shadow-soft-lg"
            >
              {solution.imageUrl && (
                <div className="h-48 w-full overflow-hidden">
                  <img
                    src={solution.imageUrl}
                    alt={solution.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <CardHeader className="space-y-3">
                <CardTitle className="text-2xl font-semibold text-neutral-900">
                  {solution.title}
                </CardTitle>
                <CardDescription className="text-base text-neutral-600">
                  {solution.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pt-0">
                {solution.features.length > 0 && (
                  <div>
                    <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-purple">
                      {t('solutionsPage.featuresTitle')}
                    </p>
                    <ul className="space-y-3">
                      {solution.features.map((feature, index) => (
                        <li
                          key={`${solution.slug}-feature-${index}`}
                          className="flex items-start gap-3 text-sm text-neutral-700"
                        >
                          <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-brand-purple" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-brand-purple text-brand-purple transition-all duration-300 ease-in-out hover:bg-brand-purple/10 hover:text-brand-purple"
                >
                  <Link to={`/solutions/${solution.slug}`}>
                    {t('solutionsPage.viewDetails')}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-gradient-hero py-24 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold md:text-4xl">
            {t('solutionsPage.customTitle')}
          </h2>
          <p className="mt-4 text-xl text-blue-100">
            {t('solutionsPage.customDescription')}
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white px-8 py-4 text-lg font-semibold text-brand-purple transition-all duration-300 ease-in-out hover:bg-blue-50 hover:text-brand-purple"
            >
              <Link to="/contact">
                {t('solutionsPage.discuss')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Solutions;
