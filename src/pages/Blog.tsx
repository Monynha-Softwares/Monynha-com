import { useState, useMemo, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import Meta from '@/components/Meta';
import NewsletterSection from '@/components/NewsletterSection';
import {
  ArrowRight,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { getNormalizedLocale } from '@/lib/i18n';
import type { Database } from '@/integrations/supabase/types';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

const POSTS_PER_PAGE = 7;

const BLOG_CATEGORY_KEYS = [
  'blog.categories.all',
  'blog.categories.aiInsights',
  'blog.categories.development',
  'blog.categories.caseStudy',
  'blog.categories.business',
  'blog.categories.security',
  'blog.categories.integration',
];

type BlogPostRow = Pick<
  Database['public']['Tables']['blog_posts']['Row'],
  'id' | 'slug' | 'title' | 'excerpt' | 'image_url' | 'updated_at'
>;

type PaginationEntry = number | 'ellipsis';

const getPaginationRange = (
  currentPage: number,
  totalPages: number
): PaginationEntry[] => {
  if (totalPages <= 1) {
    return [1];
  }

  const range: PaginationEntry[] = [];
  const delta = 1;
  const left = Math.max(2, currentPage - delta);
  const right = Math.min(totalPages - 1, currentPage + delta);

  range.push(1);

  if (left > 2) {
    range.push('ellipsis');
  }

  for (let page = left; page <= right; page += 1) {
    range.push(page);
  }

  if (right < totalPages - 1) {
    range.push('ellipsis');
  }

  if (totalPages > 1) {
    range.push(totalPages);
  }

  return range;
};

const Blog = () => {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);

  const normalizedLocale = useMemo(
    () => getNormalizedLocale(i18n.language),
    [i18n.language]
  );

  const dateFormatter = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(normalizedLocale, {
        dateStyle: 'medium',
      });
    } catch (error) {
      console.error('Unsupported locale for blog date formatting', error);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
      });
    }
  }, [normalizedLocale]);

  const categories = useMemo(
    () => BLOG_CATEGORY_KEYS.map((key) => t(key)),
    [t]
  );

  const { data, isLoading, isError } = useQuery<{
    posts: BlogPostRow[];
    total: number;
  }>({
    queryKey: ['blog_posts', page],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const from = (page - 1) * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, image_url, updated_at', {
          count: 'exact',
        })
        .eq('published', true)
        .order('updated_at', { ascending: false })
        .range(from, to);

      if (error) {
        throw new Error(error.message);
      }

      return {
        posts: data ?? [],
        total: count ?? 0,
      };
    },
  });

  const totalPosts = data?.total ?? 0;
  const totalPages =
    totalPosts > 0 ? Math.ceil(totalPosts / POSTS_PER_PAGE) : 1;

  const formattedPosts = useMemo(
    () =>
      (data?.posts ?? []).map((post, index) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt ?? t('blog.fallbackExcerpt'),
        image: post.image_url ?? FALLBACK_IMAGE,
        author: t('blog.defaultAuthor'),
        date: dateFormatter.format(new Date(post.updated_at)),
        readTime: t('blog.readTimeDefault'),
        category: t('blog.defaultCategory'),
        featured: page === 1 && index === 0,
      })),
    [data?.posts, dateFormatter, page, t]
  );

  const featuredPost = page === 1 ? formattedPosts[0] : undefined;
  const regularPosts = page === 1 ? formattedPosts.slice(1) : formattedPosts;

  const paginationRange = useMemo(
    () => getPaginationRange(page, totalPages),
    [page, totalPages]
  );

  const showingRangeStart =
    totalPosts === 0 ? 0 : (page - 1) * POSTS_PER_PAGE + 1;
  const showingRangeEnd =
    totalPosts === 0
      ? 0
      : Math.min(showingRangeStart + formattedPosts.length - 1, totalPosts);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages || newPage === page) {
        return;
      }

      setPage(newPage);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [page, totalPages]
  );

  if (isLoading && !data) {
    return (
      <Layout>
        <Meta
          title={t('blog.metaTitle')}
          description={t('blog.description')}
          ogTitle={t('blog.metaTitle')}
          ogDescription={t('blog.description')}
          ogImage="/placeholder.svg"
        />
        <div className="container mx-auto px-4 py-16 text-center">
          {t('blog.loading')}
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <Meta
          title={t('blog.metaTitle')}
          description={t('blog.description')}
          ogTitle={t('blog.metaTitle')}
          ogDescription={t('blog.description')}
          ogImage="/placeholder.svg"
        />
        <div className="container mx-auto px-4 py-16 text-center">
          {t('blog.error')}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Meta
        title={t('blog.metaTitle')}
        description={t('blog.description')}
        ogTitle={t('blog.metaTitle')}
        ogDescription={t('blog.description')}
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
              <BreadcrumbPage>{t('navigation.blog')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <section className="py-24 bg-white transition-colors dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
              {t('blog.title')}
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
              {t('blog.description')}
            </p>
          </div>
        </div>
      </section>

      <section className="pb-12 bg-white transition-colors dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => (
              <Button
                key={category}
                variant={index === 0 ? 'default' : 'outline'}
                className={`rounded-full px-6 py-2 ${
                  index === 0
                    ? 'bg-gradient-brand text-white'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-brand-blue hover:text-brand-blue'
                }`}
                type="button"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {featuredPost && (
        <section className="pb-16 bg-white transition-colors dark:bg-neutral-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-0 shadow-soft-lg rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <Link
                  to={`/blog/${featuredPost.slug}`}
                  className="relative block"
                >
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    loading="lazy"
                    className="w-full h-80 lg:h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-brand text-white px-3 py-1 rounded-full text-sm font-medium">
                      {t('blog.featured')}
                    </span>
                  </div>
                </Link>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                    <span className="bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full font-medium">
                      {featuredPost.category}
                    </span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{featuredPost.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{featuredPost.readTime}</span>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <Button asChild size="lg" className="w-fit">
                    <Link
                      to={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center"
                    >
                      {t('blog.read')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      <section className="py-16 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {totalPosts === 0 ? (
            <div className="rounded-2xl bg-white transition-colors dark:bg-neutral-950 p-10 text-center text-neutral-600 dark:text-neutral-300 shadow-soft">
              {t('blog.empty')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <Card
                  key={post.id}
                  className="border-0 shadow-soft hover:shadow-soft-lg transition-all ease-in-out duration-300 card-hover rounded-2xl overflow-hidden bg-white transition-colors dark:bg-neutral-950"
                >
                  <Link to={`/blog/${post.slug}`} className="relative block">
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-brand-blue px-3 py-1 rounded-full text-sm font-medium">
                        {post.category}
                      </span>
                    </div>
                  </Link>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400 mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="block text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3 line-clamp-2 hover:text-brand-blue"
                    >
                      {post.title}
                    </Link>
                    <p className="text-neutral-600 dark:text-neutral-300 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <Button
                      asChild
                      variant="ghost"
                      className="text-brand-blue hover:text-brand-purple p-0 h-auto font-semibold"
                    >
                      <Link
                        to={`/blog/${post.slug}`}
                        className="inline-flex items-center"
                      >
                        {t('blog.readMore')}
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {totalPosts > POSTS_PER_PAGE && (
        <section className="bg-neutral-50 dark:bg-neutral-950 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {t('blog.pagination.showing', {
                  start: showingRangeStart,
                  end: showingRangeEnd,
                  total: totalPosts,
                })}
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      size="default"
                      className={cn(
                        'gap-1 pl-2.5',
                        page === 1 && 'pointer-events-none opacity-50'
                      )}
                      aria-disabled={page === 1}
                      onClick={(event) => {
                        event.preventDefault();
                        handlePageChange(page - 1);
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>{t('blog.pagination.previous')}</span>
                    </PaginationLink>
                  </PaginationItem>
                  {paginationRange.map((item, index) => (
                    <PaginationItem key={`${item}-${index}`}>
                      {item === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          isActive={item === page}
                          onClick={(event) => {
                            event.preventDefault();
                            handlePageChange(item);
                          }}
                        >
                          {item}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      size="default"
                      className={cn(
                        'gap-1 pr-2.5',
                        page === totalPages && 'pointer-events-none opacity-50'
                      )}
                      aria-disabled={page === totalPages}
                      onClick={(event) => {
                        event.preventDefault();
                        handlePageChange(page + 1);
                      }}
                    >
                      <span>{t('blog.pagination.next')}</span>
                      <ChevronRight className="h-4 w-4" />
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </section>
      )}

      <section className="py-24 bg-gradient-hero text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            {t('blog.newsletter.title')}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {t('blog.newsletter.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder={t('blog.newsletter.placeholder')}
              className="flex-1 px-4 py-3 rounded-xl border-0 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:ring-2 focus:ring-white focus:outline-none"
            />
            <Button className="bg-white transition-colors dark:bg-neutral-950 text-brand-purple hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl transition-all ease-in-out duration-300">
              {t('blog.newsletter.subscribe')}
            </Button>
          </div>
        </div>
      </section>
      <NewsletterSection />
    </Layout>
  );
};

export default Blog;
