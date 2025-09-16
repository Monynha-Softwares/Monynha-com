import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProfileByUserId } from '@/lib/profiles';
import type { ProfileRow } from '@/lib/profiles';
import type { LeadRow } from '@/lib/leads';
import type { NewsletterSubscriberRow } from '@/lib/newsletter';
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, Loader2, LogOut, RefreshCcw } from 'lucide-react';

type Profile = ProfileRow;
type Lead = LeadRow;
type NewsletterSubscriber = NewsletterSubscriberRow;

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—';

  try {
    return format(new Date(value), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data', error);
    return '—';
  }
};

const Dashboard = () => {
  const { user, session, signOut } = useAuth();
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
      const profileData = await fetchProfileByUserId(user.id);

      const resolvedProfile: Profile =
        profileData ??
        ({
          id: user.id,
          user_id: user.id,
          email: user.email ?? '',
          name: (user.user_metadata?.name as string | undefined) ??
            user.email ??
            'Usuário',
          role: (user.user_metadata?.role as string | undefined) ?? 'user',
          avatar_url: (user.user_metadata?.avatar_url as string | null) ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Profile);

      if (isMounted.current) {
        setProfile(resolvedProfile);
      }

      if (resolvedProfile.role === 'admin') {
        if (!session?.access_token) {
          throw new Error(
            'Não foi possível validar suas credenciais de administrador.'
          );
        }

        if (isMounted.current) {
          setIsFetchingAdminData(true);
        }

        const response = await fetch('/api/admin/dashboard', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const payload = await response
          .json()
          .catch(() => ({}) as Record<string, unknown>);

        if (!response.ok) {
          const message =
            (payload && typeof payload.error === 'string'
              ? payload.error
              : undefined) ||
            `Falha ao carregar dados administrativos (${response.status}).`;
          throw new Error(message);
        }

        const adminData = payload as {
          leads?: Lead[];
          subscribers?: NewsletterSubscriber[];
        };

        if (isMounted.current) {
          setLeads(adminData.leads ?? []);
          setSubscribers(adminData.subscribers ?? []);
        }
      } else if (isMounted.current) {
        setLeads([]);
        setSubscribers([]);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o dashboard.';

      if (isMounted.current) {
        setErrorMessage(message);
        toast({
          title: 'Erro ao carregar dados',
          description: message,
          variant: 'destructive',
        });
      }
    } finally {
      if (isMounted.current) {
        setIsFetching(false);
        setIsFetchingAdminData(false);
      }
    }
  }, [session, toast, user]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleRefresh = () => {
    void loadDashboard();
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      toast({
        title: 'Sessão encerrada',
        description: 'Você saiu da aplicação com sucesso.',
      });
      navigate('/auth', { replace: true });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível encerrar a sessão.';
      toast({
        title: 'Erro ao sair',
        description: message,
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

  const roleLabel = profile?.role === 'admin' ? 'Administrador' : 'Usuário';
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
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                {profile
                  ? `Bem-vindo, ${profile.name}`
                  : 'Confira as informações da sua conta.'}
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
              Atualizar
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
                  Saindo...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  Sair
                </>
              )}
            </Button>
          </div>
        </header>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Ocorreu um problema</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.name} />
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">
                    {profile?.name ?? 'Perfil do usuário'}
                  </CardTitle>
                  <CardDescription>
                    {profile?.email ?? user?.email ?? 'Email não disponível'}
                  </CardDescription>
                </div>
              </div>
            <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'}>
              {roleLabel}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nome</p>
                <p className="text-base font-semibold text-foreground">
                  {profile?.name ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base font-semibold text-foreground">
                  {profile?.email ?? user?.email ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Função</p>
                <p className="text-base font-semibold text-foreground">{roleLabel}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Última atualização</p>
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
                <CardTitle>Leads</CardTitle>
                <CardDescription>Contatos recebidos pelas páginas públicas.</CardDescription>
              </CardHeader>
              <CardContent>
                {isFetchingAdminData ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando dados de leads...
                  </div>
                ) : leads.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum lead registrado até o momento.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Projeto</TableHead>
                        <TableHead className="max-w-sm">Mensagem</TableHead>
                        <TableHead className="text-right">Enviado em</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell>{lead.email}</TableCell>
                          <TableCell>{lead.company ?? '—'}</TableCell>
                          <TableCell>{lead.project ?? '—'}</TableCell>
                          <TableCell className="max-w-sm truncate">{lead.message}</TableCell>
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
                <CardTitle>Newsletter</CardTitle>
                <CardDescription>Assinantes cadastrados na base de emails.</CardDescription>
              </CardHeader>
              <CardContent>
                {isFetchingAdminData ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando assinantes...
                  </div>
                ) : subscribers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum inscrito encontrado.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Inscrito em</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscribers.map((subscriber) => (
                        <TableRow key={subscriber.id}>
                          <TableCell className="font-medium">{subscriber.email}</TableCell>
                          <TableCell>
                            <Badge variant={subscriber.active ? 'default' : 'secondary'}>
                              {subscriber.active ? 'Ativo' : 'Inativo'}
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
