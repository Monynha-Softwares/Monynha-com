import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase';
import type { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Loading from '@/components/Loading';
import { AlertTriangle, Loader2, LogOut, RefreshCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getNormalizedLocale } from '@/lib/i18n';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Lead = Database['public']['Tables']['leads']['Row'];
type NewsletterSubscriber =
  Database['public']['Tables']['newsletter_subscribers']['Row'];

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isMounted = useRef(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isFetchingAdminData, setIsFetchingAdminData] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadDashboard = useCallback(async () => {
    if (!user) return;

    if (isMounted.current) {
      setIsFetching(true);
      setErrorMessage(null);
    }

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      const resolvedProfile: Profile =
        profileData ??
        ({
          id: user.id,
          user_id: user.id,
          email: user.email ?? '',
          name:
            (user.user_metadata?.name as string | undefined) ??
            user.email ??
            t('dashboard.profile.roleUser'),
          role: (user.user_metadata?.role as string | undefined) ?? 'user',
          avatar_url: (user.user_metadata?.avatar_url as string | null) ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Profile);

      if (isMounted.current) {
        setProfile(resolvedProfile);
      }

      if (resolvedProfile.role === 'admin') {
        if (isMounted.current) {
          setIsFetchingAdminData(true);
        }

        const [leadsResponse, newsletterResponse] = await Promise.all([
          supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('newsletter_subscribers')
            .select('*')
            .order('subscribed_at', { ascending: false }),
        ]);

        if (leadsResponse.error) {
          throw leadsResponse.error;
        }

        if (newsletterResponse.error) {
          throw newsletterResponse.error;
        }

        if (isMounted.current) {
          setLeads(leadsResponse.data ?? []);
          setSubscribers(newsletterResponse.data ?? []);
        }
      } else if (isMounted.current) {
        setLeads([]);
        setSubscribers([]);
      }
    } catch (error) {
      const fallbackMessage = t('dashboard.errors.loadDashboard');
      const message = error instanceof Error ? error.message : fallbackMessage;

      if (isMounted.current) {
        setErrorMessage(message || fallbackMessage);
        toast({
          title: t('dashboard.toast.loadError.title'),
          description: message || fallbackMessage,
          variant: 'destructive',
        });
      }
    } finally {
      if (isMounted.current) {
        setIsFetching(false);
        setIsFetchingAdminData(false);
      }
    }
  }, [t, toast, user]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const normalizedLocale = useMemo(
    () => getNormalizedLocale(i18n.language),
    [i18n.language]
  );

  const fallbackDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    []
  );

  const dateTimeFormatter = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(normalizedLocale, {
        dateStyle: 'short',
        timeStyle: 'short',
      });
    } catch (error) {
      console.error('Unsupported locale for dashboard date formatting', error);
      return fallbackDateFormatter;
    }
  }, [fallbackDateFormatter, normalizedLocale]);

  const formatDate = useCallback(
    (value: string | null | undefined) => {
      if (!value) return '—';

      try {
        return dateTimeFormatter.format(new Date(value));
      } catch (error) {
        console.error('Error formatting dashboard date', error);
        return fallbackDateFormatter.format(new Date(value));
      }
    },
    [dateTimeFormatter, fallbackDateFormatter]
  );

  const handleRefresh = () => {
    void loadDashboard();
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      toast({
        title: t('dashboard.toast.signOutSuccess.title'),
        description: t('dashboard.toast.signOutSuccess.description'),
      });
      navigate('/auth', { replace: true });
    } catch (error) {
      const fallbackMessage = t('dashboard.toast.signOutError.description');
      const message = error instanceof Error ? error.message : fallbackMessage;
      toast({
        title: t('dashboard.toast.signOutError.title'),
        description: message || fallbackMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  const avatarFallback = useMemo(() => {
    const source = profile?.name || user?.email || '';
    if (!source) return 'MS';

    const initials = source
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment.charAt(0).toUpperCase())
      .join('');

    return initials || source.charAt(0).toUpperCase();
  }, [profile?.name, user?.email]);

  const roleLabel =
    profile?.role === 'admin'
      ? t('dashboard.profile.roleAdmin')
      : t('dashboard.profile.roleUser');
  const isLoadingInitialState = isFetching && !profile;
  const isRefreshing = isFetching || isFetchingAdminData;

  if (isLoadingInitialState) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('dashboard.title')}
            </h1>
            <p className="text-muted-foreground">
              {profile
                ? t('dashboard.welcome', { name: profile.name })
                : t('dashboard.welcomeFallback')}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCcw
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              {t('dashboard.refresh')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="gap-2"
            >
              {isSigningOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('dashboard.signingOut')}
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  {t('dashboard.signOut')}
                </>
              )}
            </Button>
          </div>
        </header>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('dashboard.alertTitle')}</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={profile?.avatar_url ?? undefined}
                  alt={profile?.name}
                />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {profile?.name ?? t('dashboard.profile.fallbackTitle')}
                </CardTitle>
                <CardDescription>
                  {profile?.email ??
                    user?.email ??
                    t('dashboard.profile.emailUnavailable')}
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={profile?.role === 'admin' ? 'default' : 'secondary'}
            >
              {roleLabel}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('dashboard.profile.name')}
                </p>
                <p className="text-base font-semibold text-foreground">
                  {profile?.name ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('dashboard.profile.email')}
                </p>
                <p className="text-base font-semibold text-foreground">
                  {profile?.email ?? user?.email ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('dashboard.profile.role')}
                </p>
                <p className="text-base font-semibold text-foreground">
                  {roleLabel}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('dashboard.profile.updatedAt')}
                </p>
                <p className="text-base font-semibold text-foreground">
                  {formatDate(profile?.updated_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {profile?.role === 'admin' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.leads.title')}</CardTitle>
                <CardDescription>
                  {t('dashboard.leads.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isFetchingAdminData ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('dashboard.leads.loading')}
                  </div>
                ) : leads.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.leads.empty')}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {t('dashboard.leads.columns.name')}
                        </TableHead>
                        <TableHead>
                          {t('dashboard.leads.columns.email')}
                        </TableHead>
                        <TableHead>
                          {t('dashboard.leads.columns.company')}
                        </TableHead>
                        <TableHead>
                          {t('dashboard.leads.columns.project')}
                        </TableHead>
                        <TableHead className="max-w-sm">
                          {t('dashboard.leads.columns.message')}
                        </TableHead>
                        <TableHead className="text-right">
                          {t('dashboard.leads.columns.createdAt')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">
                            {lead.name}
                          </TableCell>
                          <TableCell>{lead.email}</TableCell>
                          <TableCell>{lead.company ?? '—'}</TableCell>
                          <TableCell>{lead.project ?? '—'}</TableCell>
                          <TableCell className="max-w-sm truncate">
                            {lead.message}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatDate(lead.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.newsletter.title')}</CardTitle>
                <CardDescription>
                  {t('dashboard.newsletter.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isFetchingAdminData ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('dashboard.newsletter.loading')}
                  </div>
                ) : subscribers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.newsletter.empty')}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {t('dashboard.newsletter.columns.email')}
                        </TableHead>
                        <TableHead>
                          {t('dashboard.newsletter.columns.status')}
                        </TableHead>
                        <TableHead className="text-right">
                          {t('dashboard.newsletter.columns.subscribedAt')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscribers.map((subscriber) => (
                        <TableRow key={subscriber.id}>
                          <TableCell className="font-medium">
                            {subscriber.email}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                subscriber.active ? 'default' : 'secondary'
                              }
                            >
                              {subscriber.active
                                ? t('dashboard.newsletter.status.active')
                                : t('dashboard.newsletter.status.inactive')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatDate(subscriber.subscribed_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
