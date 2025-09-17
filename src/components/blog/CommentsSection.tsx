import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@monynha/ui/card';
import { Button } from '@monynha/ui/button';
import { Textarea } from '@monynha/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@monynha/ui/avatar';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getNormalizedLocale } from '@/lib/i18n';

interface CommentsSectionProps {
  postId: string;
}

type CommentRow = Database['public']['Tables']['comments']['Row'];
type ProfileRow = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'name' | 'avatar_url'
>;

type CommentWithAuthor = CommentRow & {
  author: ProfileRow | null;
};

const getInitials = (name: string) => {
  const parts = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '');

  if (parts.length === 0) {
    return 'U';
  }

  return parts.slice(0, 2).join('') || 'U';
};

const CommentsSection = ({ postId }: CommentsSectionProps) => {
  const { t, i18n } = useTranslation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  const normalizedLocale = useMemo(
    () => getNormalizedLocale(i18n.language),
    [i18n.language]
  );

  const dateFormatter = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(normalizedLocale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch (error) {
      console.error('Unsupported locale for comment date formatting', error);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    }
  }, [normalizedLocale]);

  const {
    data: comments,
    isLoading,
    isError,
  } = useQuery<CommentWithAuthor[]>({
    queryKey: ['comments', postId],
    enabled: Boolean(postId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('id, post_id, user_id, content, created_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.length) {
        return [];
      }

      const userIds = Array.from(
        new Set(data.map((comment) => comment.user_id).filter(Boolean))
      );

      let profilesMap = new Map<string, ProfileRow>();

      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, name, avatar_url')
          .in('user_id', userIds);

        if (profilesError) {
          console.error('Error fetching comment author profiles', profilesError);
        } else if (profilesData) {
          profilesMap = new Map(
            profilesData.map((profile) => [profile.user_id, profile])
          );
        }
      }

      return data.map((comment) => ({
        ...comment,
        author: profilesMap.get(comment.user_id) ?? null,
      }));
    },
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id) {
        throw new Error(t('blog.comments.signInRequiredDescription'));
      }

      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        user_id: user.id,
        content,
      });

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      setNewComment('');
      toast({
        title: t('blog.comments.successTitle'),
        description: t('blog.comments.successDescription'),
      });
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: (error: Error) => {
      console.error('Error creating comment', error);
      toast({
        title: t('blog.comments.errorTitle'),
        description:
          error.message || t('blog.comments.errorDescription'),
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      toast({
        title: t('blog.comments.signInRequiredTitle'),
        description: t('blog.comments.signInRequiredDescription'),
        variant: 'destructive',
      });
      return;
    }

    const trimmedComment = newComment.trim();

    if (!trimmedComment) {
      toast({
        title: t('blog.comments.validationErrorTitle'),
        description: t('blog.comments.validationErrorDescription'),
        variant: 'destructive',
      });
      return;
    }

    addComment.mutate(trimmedComment);
  };

  const commentCount = comments?.length ?? 0;

  return (
    <section className="mt-16">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-neutral-900">
            {t('blog.comments.title')}
          </h2>
          <p className="text-sm text-neutral-500">
            {t('blog.comments.count', { count: commentCount })}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {isLoading && (
          <Card className="border-0 bg-white shadow-soft">
            <CardContent className="p-6 text-neutral-500">
              {t('blog.comments.loading')}
            </CardContent>
          </Card>
        )}

        {isError && (
          <Card className="border border-red-200 bg-red-50">
            <CardContent className="p-6 text-red-600">
              {t('blog.comments.error')}
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && commentCount === 0 && (
          <Card className="border-0 bg-white shadow-soft">
            <CardContent className="p-6 text-neutral-600">
              {t('blog.comments.empty')}
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError &&
          comments?.map((comment) => {
            const authorName = comment.author?.name ?? t('blog.comments.anonymous');
            const formattedDate = dateFormatter.format(
              new Date(comment.created_at)
            );

            return (
              <Card
                key={comment.id}
                className="border-0 bg-white shadow-soft transition hover:shadow-soft-lg"
              >
                <CardContent className="flex gap-4 p-6">
                  <Avatar>
                    {comment.author?.avatar_url ? (
                      <AvatarImage
                        src={comment.author.avatar_url}
                        alt={authorName}
                      />
                    ) : (
                      <AvatarFallback>{getInitials(authorName)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                      <p className="font-medium text-neutral-900">
                        {authorName}
                      </p>
                      <p className="text-sm text-neutral-500">{formattedDate}</p>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-neutral-700">
                      {comment.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      <div className="mt-10">
        {isAuthLoading ? (
          <Card className="border-0 bg-white shadow-soft">
            <CardContent className="p-6 text-neutral-500">
              {t('blog.comments.authenticating')}
            </CardContent>
          </Card>
        ) : user ? (
          <Card className="border-0 bg-white shadow-soft-lg">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                  value={newComment}
                  onChange={(event) => setNewComment(event.target.value)}
                  placeholder={t('blog.comments.placeholder')}
                  rows={4}
                  maxLength={1000}
                  className="resize-none text-base"
                />
                <div className="flex items-center justify-between text-sm text-neutral-500">
                  <span>
                    {t('blog.comments.characters', { count: newComment.length, max: 1000 })}
                  </span>
                  <Button
                    type="submit"
                    variant="default"
                    disabled={addComment.isPending}
                  >
                    {addComment.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t('blog.comments.submit')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-dashed border-brand-secondary/30 bg-white">
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center text-neutral-600">
              <p>{t('blog.comments.signInPrompt')}</p>
              <Button asChild variant="default">
                <Link to="/auth">{t('blog.comments.signInCta')}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default CommentsSection;
