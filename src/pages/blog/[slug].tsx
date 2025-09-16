import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import Layout from '@/components/Layout';
import Meta from '@/components/Meta';
import NewsletterSection from '@/components/NewsletterSection';
import BlogComments from '@/components/BlogComments';
import { supabase } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';

const DEFAULT_CATEGORY = 'AI Insights';
const DEFAULT_AUTHOR = 'Monynha Softwares Team';
const FALLBACK_IMAGE_URL =
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

type BlogPostRow = Database['public']['Tables']['blog_posts']['Row'];

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();

  const {
    data: post,
    isLoading,
    isError,
  } = useQuery<BlogPostRow | null>({
    queryKey: ['blog_post', slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      if (!slug) {
        return null;
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, content, image_url, created_at, updated_at')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  const formatDate = useMemo(
    () =>
      (dateString?: string | null) =>
        dateString
          ? new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long' }).format(
              new Date(dateString)
            )
          : '',
    [i18n.language]
  );

  const readingTime = useMemo(() => {
    if (!post?.content) {
      return 0;
    }

    const plainText = post.content.replace(/<[^>]+>/g, ' ');
    const words = plainText.trim().split(/\s+/).filter(Boolean);
    return Math.max(1, Math.round(words.length / 200));
  }, [post?.content]);

  const formattedContent = useMemo(() => {
    if (!post?.content) {
      return [] as string[];
    }

    return post.content
      .split(/\n{2,}/)
      .map((block) => block.replace(/\n+/g, ' ').trim())
      .filter(Boolean);
  }, [post?.content]);

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
        <div className="container mx-auto px-4 py-16 text-center">Loading...</div>
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
          {t('blog.errorLoadingPost')}
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <Meta
          title="Insights & Updates - Monynha Softwares Agency"
          description={t('blog.description')}
          ogTitle="Insights & Updates - Monynha Softwares Agency"
          ogDescription={t('blog.description')}
          ogImage="/placeholder.svg"
        />
        <div className="container mx-auto px-4 py-24 text-center space-y-6">
          <h1 className="text-3xl font-semibold text-neutral-900">
            {t('blog.notFound')}
          </h1>
          <Button asChild className="btn-primary">
            <Link to="/blog">{t('blog.backToBlog')}</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const publishedDate = formatDate(post.updated_at ?? post.created_at);
  const readingTimeLabel = t('blog.readingTime', { count: readingTime || 1 });
  const publishedLabel = publishedDate
    ? t('blog.publishedOn', { date: publishedDate })
    : undefined;

  return (
    <Layout>
      <Meta
        title={`${post.title} - Monynha Softwares Agency`}
        description={post.excerpt ?? t('blog.description')}
        ogTitle={`${post.title} - Monynha Softwares Agency`}
        ogDescription={post.excerpt ?? t('blog.description')}
        ogImage={post.image_url ?? '/placeholder.svg'}
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
                <Link to="/blog">{t('navigation.blog')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{post.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <section className="py-10 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" className="mb-8 px-0" asChild>
            <Link to="/blog" className="inline-flex items-center text-neutral-600 hover:text-brand-blue">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('blog.backToBlog')}
            </Link>
          </Button>
          <div className="space-y-6">
            <span className="bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full text-sm font-medium">
              {DEFAULT_CATEGORY}
            </span>
            <h1 className="text-4xl font-bold text-neutral-900">{post.title}</h1>
            {post.excerpt && (
              <p className="text-xl text-neutral-600">{post.excerpt}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{DEFAULT_AUTHOR}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{readingTimeLabel}</span>
              </div>
              {publishedLabel && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{publishedLabel}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white pb-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <img
            src={post.image_url ?? FALLBACK_IMAGE_URL}
            alt={post.title}
            loading="lazy"
            className="w-full h-[320px] sm:h-[420px] lg:h-[520px] object-cover rounded-3xl shadow-soft"
          />
        </div>
      </section>

      <article className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none text-neutral-700">
            {formattedContent.length > 0 ? (
              formattedContent.map((paragraph, index) => (
                <p key={index} className="leading-relaxed">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="leading-relaxed whitespace-pre-line">{post.content}</p>
            )}
          </div>
        </div>
      </article>

      {post.id && <BlogComments postId={post.id} />}

      <NewsletterSection />
    </Layout>
  );
};

export default BlogPostPage;
