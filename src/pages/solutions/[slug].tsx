import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Layout from '@/components/Layout';
import Meta from '@/components/Meta';
import { supabase } from '@/integrations/supabase';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  getFallbackSolution,
  normalizeSolution,
  type SolutionContent,
  type SolutionRow,
} from '@/utils/solutions';

const SolutionDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();

  const {
    data: solutionData,
    isLoading,
    isError,
  } = useQuery<SolutionRow | null>({
    queryKey: ['solutions', slug],
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

      return data;
    },
    enabled: Boolean(slug),
  });

  const fallbackSolution = useMemo(() => (slug ? getFallbackSolution(slug) : undefined), [slug]);

  const resolvedSolution: SolutionContent | undefined = useMemo(() => {
    if (solutionData) {
      return normalizeSolution(solutionData);
    }

    return fallbackSolution;
  }, [solutionData, fallbackSolution]);

  const metaTitle = resolvedSolution
    ? `${resolvedSolution.title} - Monynha Softwares Agency`
    : 'Solution Details - Monynha Softwares Agency';

  const metaDescription = resolvedSolution?.description ?? t('solutionsPage.description');
  const ogImage = resolvedSolution?.imageUrl ?? '/placeholder.svg';

  if (isLoading) {
    return (
      <Layout>
        <Meta
          title={metaTitle}
          description={metaDescription}
          ogTitle={metaTitle}
          ogDescription={metaDescription}
          ogImage={ogImage}
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
          title={metaTitle}
          description={metaDescription}
          ogTitle={metaTitle}
          ogDescription={metaDescription}
          ogImage={ogImage}
        />
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-lg text-neutral-600">{t('solutionsPage.error')}</p>
          <div className="mt-6 flex justify-center">
            <Button asChild variant="outline">
              <Link to="/solutions">{t('solutionsPage.backToSolutions')}</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!resolvedSolution) {
    return (
      <Layout>
        <Meta
          title={metaTitle}
          description={metaDescription}
          ogTitle={metaTitle}
          ogDescription={metaDescription}
          ogImage={ogImage}
        />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-semibold text-neutral-900">
            {t('solutionsPage.notFound')}
          </h1>
          <p className="mt-4 text-neutral-600">{t('solutionsPage.description')}</p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg" variant="outline">
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
        title={metaTitle}
        description={metaDescription}
        ogTitle={metaTitle}
        ogDescription={metaDescription}
        ogImage={ogImage}
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
              <BreadcrumbLink asChild>
                <Link to="/solutions">{t('navigation.solutions')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{resolvedSolution.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div className="order-2 flex flex-col gap-6 lg:order-1">
              <div>
                <h1 className="text-4xl font-bold text-neutral-900 md:text-5xl">
                  {resolvedSolution.title}
                </h1>
                <p className="mt-4 text-lg text-neutral-600">
                  {resolvedSolution.description}
                </p>
              </div>

              {resolvedSolution.features.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">
                    {t('solutionsPage.featuresTitle')}
                  </h2>
                  <ul className="mt-4 space-y-4">
                    {resolvedSolution.features.map((feature, index) => (
                      <li
                        key={`${resolvedSolution.slug}-feature-detail-${index}`}
                        className="flex items-start gap-3 text-base text-neutral-700"
                      >
                        <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-brand-purple" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-4">
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
                <Button asChild size="lg" variant="outline">
                  <Link to="/solutions">{t('solutionsPage.backToSolutions')}</Link>
                </Button>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="overflow-hidden rounded-2xl border border-neutral-200 shadow-soft-lg">
                <img
                  src={resolvedSolution.imageUrl ?? '/placeholder.svg'}
                  alt={resolvedSolution.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SolutionDetails;
