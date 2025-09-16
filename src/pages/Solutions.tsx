import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
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
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getFallbackSolutions, fetchSupabaseSolutions } from '@/lib/solutions';
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
    queryFn: fetchSupabaseSolutions,
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
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {displaySolutions.map((solution) => (
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
                    <h2 className="text-2xl font-semibold text-neutral-900 group-hover:text-brand-blue transition-colors">
                      {solution.title}
                    </h2>
                  </Link>
                  <p className="text-neutral-600 mt-4 leading-relaxed flex-1">
                    {solution.description}
                  </p>

                  {solution.features.length > 0 && (
                    <ul className="mt-8 space-y-3">
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

                  <div className="mt-10 flex flex-col sm:flex-row gap-3">
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 border-neutral-200 hover:border-brand-blue hover:text-brand-blue transition-colors"
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
