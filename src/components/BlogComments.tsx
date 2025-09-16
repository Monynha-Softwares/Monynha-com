import { FormEvent, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { supabase } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const MAX_COMMENT_LENGTH = 1000;

type CommentRow = Database['public']['Tables']['comments']['Row'];
type ProfilePreview = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'name' | 'avatar_url'
>;

type CommentWithProfile = CommentRow & {
  profiles: ProfilePreview | null;
};

interface BlogCommentsProps {
  postId: string;
}

const BlogComments = ({ postId }: BlogCommentsProps) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  const {
    data: comments = [],
    isLoading,
    isError,
  } = useQuery<CommentWithProfile[]>({
    queryKey: ['post_comments', postId],
    enabled: Boolean(postId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(
          `
            id,
            post_id,
            author_id,
            content,
            created_at,
            profiles (
              name,
              avatar_url
            )
          `
        )
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return (data ?? []) as CommentWithProfile[];
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  const createInitials = useMemo(
    () =>
      (name: string) =>
        name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part.charAt(0).toUpperCase())
          .join('') || 'A',
    []
  );

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateString));

  const commentMutation = useMutation({
    mutationFn: async (commentContent: string) => {
      if (!user) {
        throw new Error(t('blog.comments.signInPrompt'));
      }

      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        author_id: user.id,
        content: commentContent,
      });

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['post_comments', postId] });
      toast({
        title: t('blog.comments.successTitle'),
        description: t('blog.comments.successDescription'),
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : t('blog.comments.errorDescription');

      toast({
        variant: 'destructive',
        title: t('blog.comments.errorTitle'),
        description: message,
      });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = content.trim();

    if (!trimmed || !user || commentMutation.isPending) {
      return;
    }

    commentMutation.mutate(trimmed);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-3xl font-semibold text-neutral-900">
            {t('blog.comments.title')}
          </h2>
          <p className="text-neutral-600 mt-2">
            {t('blog.comments.subtitle')}
          </p>
        </div>

        {isLoading ? (
          <p className="text-neutral-500">{t('blog.comments.loading')}</p>
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {t('blog.comments.error')}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-neutral-500">{t('blog.comments.empty')}</p>
        ) : (
          <ul className="space-y-8">
            {comments.map((comment) => {
              const displayName = comment.profiles?.name || t('blog.comments.anonymous');
              const initials = createInitials(displayName);

              return (
                <li key={comment.id} className="flex gap-4">
                  <Avatar className="h-12 w-12">
                    {comment.profiles?.avatar_url ? (
                      <AvatarImage src={comment.profiles.avatar_url} alt={displayName} />
                    ) : null}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                      <span className="font-semibold text-neutral-900">{displayName}</span>
                      <span>•</span>
                      <span>{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="mt-2 text-neutral-700 leading-relaxed whitespace-pre-line">
                      {comment.content}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-12 border-t border-neutral-200 pt-10">
          {isAuthLoading ? null : user ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={content}
                onChange={(event) => setContent(event.target.value.slice(0, MAX_COMMENT_LENGTH))}
                placeholder={t('blog.comments.form.placeholder')}
                rows={5}
                maxLength={MAX_COMMENT_LENGTH}
                className="resize-y"
                aria-label={t('blog.comments.form.placeholder')}
              />
              <div className="flex items-center justify-between text-sm text-neutral-500">
                <span>
                  {content.length}/{MAX_COMMENT_LENGTH}
                </span>
                <Button
                  type="submit"
                  className="btn-primary"
                  disabled={!content.trim() || commentMutation.isPending}
                >
                  {commentMutation.isPending
                    ? t('blog.comments.form.submitting')
                    : t('blog.comments.form.submit')}
                </Button>
              </div>
            </form>
          ) : (
            <div className="rounded-xl border border-dashed border-brand-blue/40 bg-brand-blue/5 p-6 text-center">
              <p className="text-neutral-700">
                {t('blog.comments.signInPrompt')}
              </p>
              <Button asChild className="mt-4">
                <Link to="/auth">{t('blog.comments.signInCta')}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BlogComments;
