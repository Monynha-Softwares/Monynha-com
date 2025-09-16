import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import Meta from '@/components/Meta';
import NewsletterSection from '@/components/NewsletterSection';
import { ArrowRight, Calendar, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
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
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface BlogPostPreview {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  updatedAt: string;
}

const POSTS_PER_PAGE = 6;
const DEFAULT_CATEGORY = 'AI Insights';
const DEFAULT_AUTHOR = 'Monynha Softwares Team';
const FALLBACK_IMAGE_URL =
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

const Blog = () => {
  const { t, i18n } = useTranslation();

  const categories = useMemo(
    () => [
      t('blog.categories.all'),
      'AI Insights',
      'Development',
      'Case Study',
      'Business',
      'Security',
      'Integration',
    ],
    [t]
  );

  const [currentPage, setCurrentPage] = useState(1);

  const defaultReadTimeLabel = useMemo(
    () => t('blog.readingTime', { count: 5 }),
    [t]
  );

  const formatDate = useMemo(
    () =>
      (dateString: string) =>
        new Intl.DateTimeFormat(i18n.language, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(new Date(dateString)),
    [i18n.language]
  );

  const {
    data: postsData,
    isLoading,
    isError,
  } = useQuery<{ posts: BlogPostPreview[]; total: number }>({
    queryKey: ['blog_posts', currentPage],
    queryFn: async () => {
      const from = (currentPage - 1) * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      const { data, count, error } = await supabase
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
        posts:
          data?.map((post) => ({
            id: post.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt || 'Read more about this topic...',
            image: post.image_url || FALLBACK_IMAGE_URL,
            updatedAt: post.updated_at,
          })) ?? [],
        total: count ?? data?.length ?? 0,
      };
    },
    keepPreviousData: true,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  const posts = postsData?.posts ?? [];
  const totalPosts = postsData?.total ?? 0;
  const totalPages = totalPosts > 0 ? Math.ceil(totalPosts / POSTS_PER_PAGE) : 0;

  useEffect(() => {
    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    } else if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages]
  );

  const featuredPost = currentPage === 1 && posts.length > 0 ? posts[0] : null;
  const regularPosts = currentPage === 1 ? posts.slice(1) : posts;

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || (totalPages > 0 && pageNumber > totalPages)) {
      return;
    }

    if (pageNumber === currentPage) {
      return;
    }

    setCurrentPage(pageNumber);

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Meta
          title="Insights & Updates - Monynha Softwares Agency"
          description={t('blog.description')}
          ogTitle="Insights & Updates - Monynha Softwares Agency"
          ogDescription={t('blog.description')}
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
          title="Insights & Updates - Monynha Softwares Agency"
          description={t('blog.description')}
          ogTitle="Insights & Updates - Monynha Softwares Agency"
          ogDescription={t('blog.description')}
          ogImage="/placeholder.svg"
        />
        <div className="container mx-auto px-4 py-16 text-center">
          Error loading posts
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Meta
        title="Insights & Updates - Monynha Softwares Agency"
        description={t('blog.description')}
        ogTitle="Insights & Updates - Monynha Softwares Agency"
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
      {/* Hero Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
              {t('blog.title')}
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              {t('blog.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={index === 0 ? 'default' : 'outline'}
                className={`rounded-full px-6 py-2 ${
                  index === 0
                    ? 'bg-gradient-brand text-white'
                    : 'border-neutral-200 text-neutral-600 hover:border-brand-blue hover:text-brand-blue'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="pb-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-0 shadow-soft-lg rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative">
                  <Link to={`/blog/${featuredPost.slug}`} className="block">
                    <img
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      loading="lazy"
                      className="w-full h-80 lg:h-full object-cover"
                    />
                  </Link>
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-brand text-white px-3 py-1 rounded-full text-sm font-medium">
                      {t('blog.featured')}
                    </span>
                  </div>
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 mb-4">
                    <span className="bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full font-medium">
                      {DEFAULT_CATEGORY}
                    </span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{DEFAULT_AUTHOR}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{defaultReadTimeLabel}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(featuredPost.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-lg text-neutral-600 mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <Button className="btn-primary w-fit" asChild>
                    <Link to={`/blog/${featuredPost.slug}`}>
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

      {/* Blog Grid */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {regularPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <Card
                  key={post.id}
                  className="border-0 shadow-soft hover:shadow-soft-lg transition-all ease-in-out duration-300 card-hover rounded-2xl overflow-hidden bg-white"
                >
                  <div className="relative">
                    <Link to={`/blog/${post.slug}`} className="block">
                      <img
                        src={post.image}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-48 object-cover"
                      />
                    </Link>
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-brand-blue px-3 py-1 rounded-full text-sm font-medium">
                        {DEFAULT_CATEGORY}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{DEFAULT_AUTHOR}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{defaultReadTimeLabel}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(post.updatedAt)}</span>
                      </div>
                    </div>
                    <Link to={`/blog/${post.slug}`} className="group block">
                      <h3 className="text-xl font-semibold text-neutral-900 mb-3 line-clamp-2 group-hover:text-brand-blue transition-colors">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-neutral-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <Button
                      variant="ghost"
                      className="text-brand-blue hover:text-brand-purple p-0 h-auto font-semibold"
                      asChild
                    >
                      <Link to={`/blog/${post.slug}`}>
                        {t('blog.readMore')}
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {posts.length === 0 && (
            <div className="text-center py-12 text-neutral-600">
              {t('blog.empty')}
            </div>
          )}
        </div>
      </section>

      {totalPages > 1 && (
        <div className="pb-16 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    onClick={(event) => {
                      event.preventDefault();
                      handlePageChange(currentPage - 1);
                    }}
                  />
                </PaginationItem>
                {pageNumbers.map((pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={pageNumber === currentPage}
                      onClick={(event) => {
                        event.preventDefault();
                        handlePageChange(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    onClick={(event) => {
                      event.preventDefault();
                      handlePageChange(currentPage + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}

      {/* Newsletter CTA */}
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
              className="flex-1 px-4 py-3 rounded-xl border-0 text-neutral-900 placeholder-neutral-500 focus:ring-2 focus:ring-white focus:outline-none"
            />
            <Button className="bg-white text-brand-purple hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl transition-all ease-in-out duration-300">
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
