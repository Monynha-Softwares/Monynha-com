import React, { ReactNode, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Clock, User } from 'lucide-react';
import Layout from '@/components/Layout';
import Meta from '@/components/Meta';
import NewsletterSection from '@/components/NewsletterSection';
import CommentsSection from '@/components/blog/CommentsSection';
import { supabase } from '@/integrations/supabase';
import { useLocalizedDateFormatter } from '@/hooks/useLocalizedDateFormatter';
import type { Database } from '@/integrations/supabase/types';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

type BlogPost = Database['public']['Tables']['blog_posts']['Row'];

type LexicalNode = {
  type: string;
  text?: string;
  tag?: string;
  url?: string;
  format?: number | string;
  children?: LexicalNode[];
};

const headingStyles: Record<string, string> = {
  h1: 'text-4xl font-bold text-neutral-900 dark:text-neutral-100',
  h2: 'text-3xl font-bold text-neutral-900 dark:text-neutral-100',
  h3: 'text-2xl font-semibold text-neutral-900 dark:text-neutral-100',
  h4: 'text-xl font-semibold text-neutral-900 dark:text-neutral-100',
  h5: 'text-lg font-semibold text-neutral-900 dark:text-neutral-100',
  h6: 'text-lg font-semibold text-neutral-900 dark:text-neutral-100',
  default: 'text-3xl font-bold text-neutral-900 dark:text-neutral-100',
};

const renderNodes = (
  nodes: LexicalNode[] | undefined,
  keyPrefix: string
): ReactNode[] =>
  (nodes ?? []).map((child, index) =>
    renderLexicalNode(child, `${keyPrefix}-${index}`)
  );

const renderTextNode = (node: LexicalNode, key: string): ReactNode => {
  let content: ReactNode = node.text ?? '';
  let wrapIndex = 0;

  const wrapWith = (tag: keyof JSX.IntrinsicElements, className?: string) => {
    wrapIndex += 1;
    content = React.createElement(
      tag,
      { key: `${key}-${tag}-${wrapIndex}`, className },
      content
    );
  };

  const { format } = node;

  if (typeof format === 'number') {
    if ((format & 16) === 16) {
      wrapWith(
        'code',
        'rounded bg-neutral-900 px-1.5 py-0.5 font-mono text-sm text-white'
      );
    } else {
      if ((format & 1) === 1) wrapWith('strong');
      if ((format & 2) === 2) wrapWith('em');
      if ((format & 4) === 4) wrapWith('span', 'underline');
      if ((format & 8) === 8) wrapWith('span', 'line-through');
    }
  } else if (typeof format === 'string') {
    const tokens = format.split(' ');
    if (tokens.includes('code')) {
      wrapWith(
        'code',
        'rounded bg-neutral-900 px-1.5 py-0.5 font-mono text-sm text-white'
      );
    }
    if (tokens.includes('bold')) wrapWith('strong');
    if (tokens.includes('italic')) wrapWith('em');
    if (tokens.includes('underline')) wrapWith('span', 'underline');
    if (tokens.includes('strikethrough')) wrapWith('span', 'line-through');
  }

  if (typeof content === 'string') {
    content = <span key={`${key}-text`}>{content}</span>;
  }

  return <React.Fragment key={key}>{content}</React.Fragment>;
};

const renderLexicalNode = (node: LexicalNode, key: string): ReactNode => {
  switch (node.type) {
    case 'root':
      return (
        <React.Fragment key={key}>
          {renderNodes(node.children, key)}
        </React.Fragment>
      );
    case 'paragraph':
      return (
        <p
          key={key}
          className="leading-relaxed text-neutral-700 dark:text-neutral-300"
        >
          {renderNodes(node.children, key)}
        </p>
      );
    case 'heading': {
      const Tag = (node.tag ?? 'h2') as keyof JSX.IntrinsicElements;
      const baseClass =
        headingStyles[node.tag ?? 'default'] ?? headingStyles.default;
      return (
        <Tag key={key} className={`${baseClass} mt-10 first:mt-0`}>
          {renderNodes(node.children, key)}
        </Tag>
      );
    }
    case 'quote':
      return (
        <blockquote
          key={key}
          className="border-l-4 border-brand-blue/40 pl-4 italic text-neutral-600 dark:text-neutral-300"
        >
          {renderNodes(node.children, key)}
        </blockquote>
      );
    case 'list': {
      const ListTag = node.tag === 'ol' ? 'ol' : 'ul';
      const listClasses =
        ListTag === 'ol'
          ? 'ml-6 list-decimal space-y-2 text-neutral-700 dark:text-neutral-300'
          : 'ml-6 list-disc space-y-2 text-neutral-700 dark:text-neutral-300';
      return (
        <ListTag key={key} className={listClasses}>
          {renderNodes(node.children, key)}
        </ListTag>
      );
    }
    case 'listitem':
      return (
        <li
          key={key}
          className="leading-relaxed text-neutral-700 dark:text-neutral-300"
        >
          {renderNodes(node.children, key)}
        </li>
      );
    case 'code': {
      const codeChildren = node.text
        ? node.text
        : renderNodes(node.children, `${key}-code`);
      return (
        <pre
          key={key}
          className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-sm text-neutral-100"
        >
          <code>{codeChildren}</code>
        </pre>
      );
    }
    case 'linebreak':
      return <br key={key} />;
    case 'link':
      return (
        <a
          key={key}
          href={node.url ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-blue underline-offset-4 hover:underline"
        >
          {renderNodes(node.children, key)}
        </a>
      );
    case 'text':
      return renderTextNode(node, key);
    default:
      if (node.children) {
        return (
          <React.Fragment key={key}>
            {renderNodes(node.children, key)}
          </React.Fragment>
        );
      }
      return null;
  }
};

const renderBlogContent = (content: string): ReactNode[] => {
  if (!content) {
    return [];
  }

  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object' && 'root' in parsed) {
      const root = parsed as { root?: { children?: LexicalNode[] } };
      return renderNodes(root.root?.children, 'node');
    }
  } catch (error) {
    console.warn(
      'Unable to parse rich text content, falling back to plain text.',
      error
    );
  }

  return content
    .split(/\n{2,}/)
    .filter((paragraph) => paragraph.trim().length > 0)
    .map((paragraph, index) => (
      <p
        key={`paragraph-${index}`}
        className="leading-relaxed text-neutral-700 dark:text-neutral-300"
      >
        {paragraph.trim()}
      </p>
    ));
};

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();

  const { formatDate } = useLocalizedDateFormatter({
    dateOptions: { dateStyle: 'long' },
  });

  const {
    data: post,
    isLoading,
    isError,
  } = useQuery<BlogPost | null>({
    queryKey: ['blog_post', slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      if (!slug) {
        return null;
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .select(
          'id, slug, title, content, excerpt, image_url, updated_at, created_at, published'
        )
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });

  const renderedContent = useMemo(
    () => renderBlogContent(post?.content ?? ''),
    [post?.content]
  );

  const updatedDate = post ? formatDate(post.updated_at) : '';

  const fallbackMetaTitle = t('blog.metaTitle');
  const metaTitle = post
    ? `${post.title} - Monynha Softwares Agency`
    : fallbackMetaTitle;

  const metaDescription = post?.excerpt ?? t('blog.description');
  const metaImage = post?.image_url ?? '/placeholder.svg';
  const defaultAuthor = t('blog.defaultAuthor');
  const readTimeLabel = t('blog.readTimeDefault');

  if (isLoading) {
    return (
      <Layout>
        <Meta
          title={metaTitle}
          description={metaDescription}
          ogTitle={metaTitle}
          ogDescription={metaDescription}
          ogImage={metaImage}
        />
        <div className="container mx-auto px-4 py-16 text-center">
          {t('blog.post.loading')}
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
          ogImage={metaImage}
        />
        <div className="container mx-auto px-4 py-16 text-center">
          {t('blog.post.error')}
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <Meta
          title={metaTitle}
          description={metaDescription}
          ogTitle={metaTitle}
          ogDescription={metaDescription}
          ogImage={metaImage}
        />
        <div className="container mx-auto px-4 py-16 text-center space-y-4">
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            {t('blog.post.notFound')}
          </p>
          <ButtonLink />
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
        ogImage={metaImage}
      />
      <div className="max-w-4xl mx-auto px-4 pt-4">
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
      <section className="py-16 bg-white transition-colors dark:bg-neutral-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="mb-8 inline-flex items-center text-sm font-medium text-brand-blue hover:text-brand-purple"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('blog.post.back')}
          </Link>

          <article className="space-y-10">
            <header className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                  {post.title}
                </h1>
                {post.excerpt && (
                  <p className="text-xl text-neutral-600 dark:text-neutral-300">
                    {post.excerpt}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>
                    {t('blog.post.author', { author: defaultAuthor })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{readTimeLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex h-1.5 w-1.5 rounded-full bg-neutral-300"
                    aria-hidden
                  />
                  <span>{t('blog.post.published', { date: updatedDate })}</span>
                </div>
              </div>
            </header>

            {post.image_url && (
              <div className="overflow-hidden rounded-3xl bg-neutral-100 shadow-soft">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            <div className="space-y-6 text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
              {renderedContent.length > 0 ? (
                renderedContent
              ) : (
                <p>{post.content}</p>
              )}
            </div>
          </article>

          <CommentsSection postId={post.id} />
        </div>
      </section>
      <NewsletterSection />
    </Layout>
  );
};

const ButtonLink = () => {
  const { t } = useTranslation();
  return (
    <Link
      to="/blog"
      className="inline-flex items-center justify-center rounded-full border border-brand-blue/40 px-6 py-2 text-sm font-semibold text-brand-blue transition hover:border-brand-purple hover:text-brand-purple"
    >
      {t('blog.post.back')}
    </Link>
  );
};

export default BlogPostPage;
