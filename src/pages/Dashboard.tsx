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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import Loading from '@/components/Loading';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertTriangle,
  Copy,
  Loader2,
  LogOut,
  QrCode,
  RefreshCcw,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Lead = Database['public']['Tables']['leads']['Row'];
type NewsletterSubscriber =
  Database['public']['Tables']['newsletter_subscribers']['Row'];
type TotpFactor = {
  id: string;
  friendly_name?: string | null;
  factor_type: string;
  status: 'verified' | 'unverified';
};

type AdminDashboardPayload = {
  leads?: Lead[];
  newsletter_subscribers?: NewsletterSubscriber[];
};

const isTotpFactor = (factor: TotpFactor | undefined) =>
  Boolean(
    factor &&
      typeof factor.id === 'string' &&
      factor.factor_type === 'totp' &&
      (factor.status === 'verified' || factor.status === 'unverified')
  );

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
  const [totpFactors, setTotpFactors] = useState<TotpFactor[]>([]);
  const [isLoadingTotp, setIsLoadingTotp] = useState(false);
  const [isVerifyingTotp, setIsVerifyingTotp] = useState(false);
  const [pendingEnrollment, setPendingEnrollment] = useState<
    | {
        id: string;
        qrCode: string;
        secret: string;
        friendlyName?: string;
      }
    | null
  >(null);
  const [verificationCode, setVerificationCode] = useState('');
  const hasVerifiedTotp = useMemo(
    () => totpFactors.some((factor) => factor.status === 'verified'),
    [totpFactors]
  );

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
        if (isMounted.current) {
          setIsFetchingAdminData(true);
        }

        const { data: adminData, error: adminError } =
          await supabase.rpc('get_admin_dashboard_data');

        if (adminError) {
          throw adminError;
        }

        const parsedData = (adminData ?? {}) as AdminDashboardPayload;

        if (isMounted.current) {
          setLeads(Array.isArray(parsedData.leads) ? parsedData.leads : []);
          setSubscribers(
            Array.isArray(parsedData.newsletter_subscribers)
              ? parsedData.newsletter_subscribers
              : []
          );
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
  }, [toast, user]);

  const refreshTotpFactors = useCallback(async () => {
    if (!session) {
      return;
    }

    setIsLoadingTotp(true);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) {
        throw error;
      }

      const totp = Array.isArray(data?.totp)
        ? (data.totp.filter(isTotpFactor) as TotpFactor[])
        : [];

      if (isMounted.current) {
        setTotpFactors(totp);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar as configurações de MFA.';
      toast({
        title: 'Erro ao sincronizar MFA',
        description: message,
        variant: 'destructive',
      });
    } finally {
      if (isMounted.current) {
        setIsLoadingTotp(false);
      }
    }
  }, [session, toast]);

  const handleStartTotpEnrollment = useCallback(async () => {
    if (!session) return;

    setIsLoadingTotp(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'Monynha Softwares',
        friendlyName: `${profile?.name ?? 'Administrador'} · Authenticator`,
      });

      if (error || !data?.totp) {
        throw error ?? new Error('Resposta inválida do Supabase.');
      }

      if (isMounted.current) {
        setPendingEnrollment({
          id: data.id,
          qrCode: data.totp.qr_code,
          secret: data.totp.secret,
          friendlyName: data.friendly_name ?? undefined,
        });
        setVerificationCode('');
      }

      toast({
        title: 'Ativação de MFA iniciada',
        description:
          'Escaneie o QR Code com seu app autenticador e confirme o código gerado para finalizar.',
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível iniciar o cadastro de MFA.';
      toast({
        title: 'Erro ao configurar MFA',
        description: message,
        variant: 'destructive',
      });
    } finally {
      if (isMounted.current) {
        setIsLoadingTotp(false);
      }
    }
  }, [profile?.name, session, toast]);

  const handleVerifyTotpEnrollment = useCallback(async () => {
    if (!pendingEnrollment) return;

    const sanitizedCode = verificationCode.replace(/\s+/g, '');
    if (sanitizedCode.length < 6) {
      toast({
        title: 'Código incompleto',
        description: 'Informe os 6 dígitos gerados pelo autenticador.',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifyingTotp(true);
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: pendingEnrollment.id,
        code: sanitizedCode,
      });

      if (error) {
        throw error;
      }

      if (isMounted.current) {
        setPendingEnrollment(null);
        setVerificationCode('');
      }

      toast({
        title: 'MFA ativada com sucesso',
        description: 'Você precisará informar o código do autenticador nos próximos logins.',
      });

      await refreshTotpFactors();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível validar o código do autenticador.';
      toast({
        title: 'Erro ao validar MFA',
        description: message,
        variant: 'destructive',
      });
    } finally {
      if (isMounted.current) {
        setIsVerifyingTotp(false);
      }
    }
  }, [pendingEnrollment, refreshTotpFactors, toast, verificationCode]);

  const handleDisableTotp = useCallback(
    async (factorId: string) => {
      if (!session) return;

      setIsLoadingTotp(true);
      try {
        const { error } = await supabase.auth.mfa.unenroll({ factorId });
        if (error) {
          throw error;
        }

        toast({
          title: 'MFA removida',
          description: 'O autenticador selecionado foi desativado.',
        });

        await refreshTotpFactors();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Não foi possível remover o autenticador.';
        toast({
          title: 'Erro ao remover MFA',
          description: message,
          variant: 'destructive',
        });
      } finally {
        if (isMounted.current) {
          setIsLoadingTotp(false);
        }
      }
    },
    [refreshTotpFactors, session, toast]
  );

  const handleCancelEnrollment = () => {
    setPendingEnrollment(null);
    setVerificationCode('');
  };

  const handleCopySecret = async () => {
    if (!pendingEnrollment?.secret || typeof navigator === 'undefined') {
      return;
    }

    try {
      await navigator.clipboard.writeText(pendingEnrollment.secret);
      toast({
        title: 'Código copiado',
        description: 'Cole o código manualmente no aplicativo autenticador, se necessário.',
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível copiar o código secreto.';
      toast({
        title: 'Erro ao copiar',
        description: message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (session) {
      void refreshTotpFactors();
    } else if (isMounted.current) {
      setTotpFactors([]);
      setPendingEnrollment(null);
      setVerificationCode('');
    }
  }, [refreshTotpFactors, session]);

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

        <Card>
          <CardHeader>
            <CardTitle>Segurança da conta</CardTitle>
            <CardDescription>
              Proteja seu acesso ao painel configurando autenticação multifator (MFA).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingEnrollment ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <QrCode className="h-4 w-4 text-primary" />
                    Escaneie o QR Code no aplicativo autenticador
                  </div>
                  <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                    Use aplicativos como Authy, Google Authenticator ou 1Password para ler o código abaixo. Caso não seja
                    possível escanear, copie o código secreto e adicione manualmente.
                  </div>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex items-center justify-center rounded-md border bg-white p-3 shadow-sm">
                      <img
                        src={pendingEnrollment.qrCode}
                        alt="QR Code do autenticador"
                        className="h-40 w-40"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="mfa-secret">Código secreto</Label>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                          id="mfa-secret"
                          value={pendingEnrollment.secret}
                          readOnly
                          className="font-mono"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCopySecret}
                          className="gap-2"
                        >
                          <Copy className="h-4 w-4" /> Copiar código
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="mfa-code">Confirme o código de 6 dígitos</Label>
                    <div className="mt-3 flex justify-center">
                      <InputOTP
                        id="mfa-code"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(value) =>
                          setVerificationCode(value.replace(/[^0-9]/g, ''))
                        }
                        disabled={isVerifyingTotp}
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot key={`otp-slot-${index}`} index={index} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      Digite o código exibido no aplicativo autenticador.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      onClick={handleVerifyTotpEnrollment}
                      disabled={isVerifyingTotp || verificationCode.length < 6}
                      className="gap-2"
                    >
                      {isVerifyingTotp ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Validando...
                        </>
                      ) : (
                        'Confirmar código'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCancelEnrollment}
                      disabled={isVerifyingTotp}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    {hasVerifiedTotp ? (
                      <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <ShieldOff className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {hasVerifiedTotp
                          ? 'Autenticação multifator ativa'
                          : 'MFA ainda não configurada'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {hasVerifiedTotp
                          ? 'Será necessário informar o código do autenticador nos próximos logins.'
                          : 'Ative a MFA para reforçar a segurança e evitar acessos não autorizados.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      onClick={handleStartTotpEnrollment}
                      disabled={isLoadingTotp}
                    >
                      {isLoadingTotp ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Processando...
                        </>
                      ) : (
                        'Configurar MFA'
                      )}
                    </Button>
                  </div>
                </div>

                {totpFactors.length > 0 ? (
                  <div className="space-y-3">
                    {totpFactors.map((factor) => (
                      <div
                        key={factor.id}
                        className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-medium">
                            {factor.friendly_name ?? 'Autenticador configurado'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Status: {factor.status === 'verified' ? 'Verificado' : 'Pendente'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleDisableTotp(factor.id)}
                          disabled={isLoadingTotp}
                        >
                          Desativar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum autenticador está associado à sua conta. Inicie a configuração para ativar a MFA.
                  </p>
                )}
              </div>
            )}
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
