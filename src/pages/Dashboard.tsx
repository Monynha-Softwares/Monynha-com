import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProfileByUserId, isUserAdmin } from '@/lib/profiles';
import type { ProfileRecord } from '@/lib/profiles';
import type { LeadRecord } from '@/lib/leads';
import type { NewsletterSubscriberRecord } from '@/lib/newsletterSubscribers';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, LogOut, CalendarDays, Mail } from 'lucide-react';

type Profile = ProfileRecord;
type Lead = LeadRecord;
type NewsletterSubscriber = NewsletterSubscriberRecord;

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

const fetchAdminResource = async <T,>(path: string, accessToken: string): Promise<T> => {
  const response = await fetch(`/api/admin/${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  let payload: { data?: T; error?: string } | undefined;

  try {
    payload = await response.json();
  } catch (error) {
    console.error('Erro ao interpretar resposta administrativa:', error);
  }

  if (!response.ok) {
    const message = payload?.error ?? 'Não foi possível carregar os dados administrativos.';
    throw new Error(message);
  }

  if (!payload || payload.data === undefined) {
    throw new Error('Resposta inválida do servidor administrativo.');
  }

  return payload.data;
};

const Dashboard = () => {
  const { user, session, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: 'Não foi possível encerrar a sessão',
        description: message,
        variant: 'destructive',
      });
    }
  }, [navigate, signOut, toast]);

  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useQuery<Profile | null, Error>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return fetchProfileByUserId(user.id);
    },
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 5,
  });

  const isAdmin = isUserAdmin(profile);

  const {
    data: leads = [],
    isLoading: isLeadsLoading,
    error: leadsError,
  } = useQuery<Lead[], Error>({
    queryKey: ['leads', session?.access_token],
    queryFn: async () => {
      if (!session?.access_token) {
        return [];
      }

      return fetchAdminResource<Lead[]>('leads', session.access_token);
    },
    enabled: isAdmin && Boolean(session?.access_token),
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: subscribers = [],
    isLoading: isNewsletterLoading,
    error: newsletterError,
  } = useQuery<NewsletterSubscriber[], Error>({
    queryKey: ['newsletter-subscribers', session?.access_token],
    queryFn: async () => {
      if (!session?.access_token) {
        return [];
      }

      return fetchAdminResource<NewsletterSubscriber[]>(
        'newsletter-subscribers',
        session.access_token
      );
    },
    enabled: isAdmin && Boolean(session?.access_token),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="min-h-screen bg-muted/20 py-24 px-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Painel</h1>
            <p className="text-muted-foreground">
              Acompanhe seu perfil e os dados estratégicos da plataforma.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              void handleSignOut();
            }}
            className="w-full sm:w-auto"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Seu perfil</CardTitle>
            <CardDescription>Informações sincronizadas com o Supabase.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isProfileLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando perfil...
              </div>
            ) : profile ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="text-lg font-semibold">{profile.name || user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="flex items-center gap-2 text-lg font-medium">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {profile.email || user?.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Papel</p>
                  <Badge
                    variant={isAdmin ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {profile.role || 'usuário'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Criado em</p>
                  <p className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    {formatDateTime(profile.created_at)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Não encontramos um perfil vinculado à sua conta. Entre em contato com a
                equipe para concluir seu cadastro.
              </p>
            )}

            {profileError ? (
              <Alert variant="destructive">
                <AlertTitle>Erro ao carregar perfil</AlertTitle>
                <AlertDescription>{profileError.message}</AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>

        {isAdmin ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Leads</CardTitle>
                <CardDescription>Oportunidades capturadas pelos formulários do site.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLeadsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Carregando leads...
                  </div>
                ) : leadsError ? (
                  <Alert variant="destructive">
                    <AlertTitle>Erro ao carregar leads</AlertTitle>
                    <AlertDescription>{leadsError.message}</AlertDescription>
                  </Alert>
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
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {lead.email}
                          </TableCell>
                          <TableCell>{lead.company ?? '-'}</TableCell>
                          <TableCell>{formatDateTime(lead.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableCaption>Total de {leads.length} lead(s) cadastrados.</TableCaption>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Newsletter</CardTitle>
                <CardDescription>Assinantes interessados nas novidades.</CardDescription>
              </CardHeader>
              <CardContent>
                {isNewsletterLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Carregando assinantes...
                  </div>
                ) : newsletterError ? (
                  <Alert variant="destructive">
                    <AlertTitle>Erro ao carregar assinantes</AlertTitle>
                    <AlertDescription>{newsletterError.message}</AlertDescription>
                  </Alert>
                ) : subscribers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum email cadastrado na newsletter até o momento.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
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
                              variant={subscriber.active ? 'default' : 'secondary'}
                            >
                              {subscriber.active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDateTime(subscriber.subscribed_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableCaption>
                      Total de {subscribers.length} inscrito(s) na newsletter.
                    </TableCaption>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Acesso restrito</CardTitle>
              <CardDescription>
                Apenas administradores podem visualizar leads e assinantes da newsletter.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Se precisar dessas informações, entre em contato com a equipe Monynha para
                revisar seu nível de acesso.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
