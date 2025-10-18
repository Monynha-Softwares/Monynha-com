import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import Loading from '@/components/Loading';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, Loader2, LogOut, RefreshCcw } from 'lucide-react';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Lead = Database['public']['Tables']['leads']['Row'];
type NewsletterSubscriber =
  Database['public']['Tables']['newsletter_subscribers']['Row'];
type AdminDashboardData = {
  leads: Lead[];
  newsletter_subscribers: NewsletterSubscriber[];
};

type TotpFactor = {
  id: string;
  friendly_name?: string;
  factor_type: 'totp' | 'phone' | (string & {});
  status: 'verified' | 'unverified';
  created_at: string;
  updated_at: string;
};

type TotpEnrollmentState = {
  factorId: string;
  qrCode: string;
  secret: string;
};

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
  const [requiresMfaChallenge, setRequiresMfaChallenge] = useState(false);
  const [totpFactor, setTotpFactor] = useState<TotpFactor | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false);
  const [isEnrollingMfa, setIsEnrollingMfa] = useState(false);
  const [isDisablingMfa, setIsDisablingMfa] = useState(false);
  const [enrollmentState, setEnrollmentState] = useState<TotpEnrollmentState | null>(
    null
  );
  const [enrollmentCode, setEnrollmentCode] = useState('');
  const [isProcessingEnrollment, setIsProcessingEnrollment] = useState(false);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchAdminData = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_admin_dashboard_data');

    if (error) {
      throw error;
    }

    const payload = (data as AdminDashboardData | null) ?? null;

    if (isMounted.current) {
      setLeads(payload?.leads ?? []);
      setSubscribers(payload?.newsletter_subscribers ?? []);
    }
  }, []);

  const clearAdminData = useCallback(() => {
    if (isMounted.current) {
      setLeads([]);
      setSubscribers([]);
    }
  }, []);

  const ensureAdminAccess = useCallback(
    async (currentProfile: Profile) => {
      if (currentProfile.role !== 'admin') {
        if (isMounted.current) {
          setRequiresMfaChallenge(false);
          setTotpFactor(null);
        }
        return true;
      }

      try {
        const { data: factorsData, error: factorsError } =
          await supabase.auth.mfa.listFactors();

        if (factorsError) {
          throw factorsError;
        }

        const totp = (factorsData?.totp?.[0] as TotpFactor | undefined) ?? null;

        if (isMounted.current) {
          setTotpFactor(totp);
        }

        if (!totp) {
          if (isMounted.current) {
            setRequiresMfaChallenge(false);
          }
          return true;
        }

        const { data: aalData, error: aalError } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

        if (aalError) {
          throw aalError;
        }

        const hasAal2 = aalData?.currentLevel === 'aal2';

        if (isMounted.current) {
          setRequiresMfaChallenge(!hasAal2);
        }

        return hasAal2;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Não foi possível validar o status de MFA.';
        console.error('Erro ao verificar MFA', error);
        toast({
          title: 'Verificação de MFA falhou',
          description: message,
          variant: 'destructive',
        });

        if (isMounted.current) {
          setRequiresMfaChallenge(false);
          setTotpFactor(null);
        }

        return true;
      }
    },
    [toast]
  );

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

      const canLoadAdminData = await ensureAdminAccess(resolvedProfile);

      if (resolvedProfile.role === 'admin' && canLoadAdminData) {
        if (isMounted.current) {
          setIsFetchingAdminData(true);
        }

        await fetchAdminData();
      } else if (resolvedProfile.role !== 'admin' || !canLoadAdminData) {
        clearAdminData();
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
  }, [
    clearAdminData,
    ensureAdminAccess,
    fetchAdminData,
    toast,
    user,
  ]);

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

  const handleVerifyMfa = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!totpFactor) return;

    setIsVerifyingMfa(true);
    setMfaError(null);

    try {
      const code = mfaCode.trim();
      if (!code) {
        throw new Error('Informe o código do autenticador.');
      }

      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: totpFactor.id,
        code,
      });

      if (error) {
        throw error;
      }

      if (isMounted.current) {
        setRequiresMfaChallenge(false);
        setMfaCode('');
        setMfaError(null);
        setTotpFactor((current) =>
          current ? { ...current, status: 'verified' } : current
        );
        setIsFetchingAdminData(true);
      }

      toast({
        title: 'Verificação concluída',
        description:
          'Código confirmado com sucesso. Dados administrativos liberados.',
      });

      await fetchAdminData();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível verificar o código de MFA.';

      if (isMounted.current) {
        setMfaError(message);
      }

      toast({
        title: 'Falha na verificação',
        description: message,
        variant: 'destructive',
      });
    } finally {
      if (isMounted.current) {
        setIsVerifyingMfa(false);
        setIsFetchingAdminData(false);
      }
    }
  };

  const handleStartMfaEnrollment = async () => {
    setIsEnrollingMfa(true);

    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator app',
      });

      if (error || !data) {
        throw error ?? new Error('Não foi possível iniciar a configuração de MFA.');
      }

      const qrCode = data.totp?.qr_code ?? '';
      const secret = data.totp?.secret ?? '';

      if (isMounted.current) {
        setEnrollmentState({
          factorId: data.id,
          qrCode,
          secret,
        });
        setTotpFactor({
          id: data.id,
          friendly_name: data.friendly_name,
          factor_type: 'totp',
          status: data.status,
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
        setRequiresMfaChallenge(true);
      }

      toast({
        title: 'Autenticação em duas etapas iniciada',
        description:
          'Escaneie o QR code com seu aplicativo autenticador e confirme o código gerado.',
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível iniciar a configuração de MFA.';

      toast({
        title: 'Erro ao iniciar MFA',
        description: message,
        variant: 'destructive',
      });
    } finally {
      if (isMounted.current) {
        setIsEnrollingMfa(false);
      }
    }
  };

  const handleCancelEnrollment = async () => {
    if (!enrollmentState) return;

    setIsProcessingEnrollment(true);

    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: enrollmentState.factorId,
      });

      if (error) {
        throw error;
      }

      if (isMounted.current) {
        setEnrollmentState(null);
        setEnrollmentCode('');
        setTotpFactor(null);
        setRequiresMfaChallenge(false);
      }

      toast({
        title: 'Configuração cancelada',
        description: 'A autenticação em duas etapas foi cancelada.',
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível cancelar a configuração.';

      toast({
        title: 'Erro ao cancelar MFA',
        description: message,
        variant: 'destructive',
      });
    } finally {
      if (isMounted.current) {
        setIsProcessingEnrollment(false);
      }
    }
  };

  const handleConfirmEnrollment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!enrollmentState) return;

    setIsProcessingEnrollment(true);

    try {
      const code = enrollmentCode.trim();
      if (!code) {
        throw new Error('Informe o código gerado pelo autenticador.');
      }

      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId: enrollmentState.factorId,
        });

      if (challengeError || !challengeData) {
        throw challengeError ?? new Error('Não foi possível gerar o desafio de MFA.');
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrollmentState.factorId,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) {
        throw verifyError;
      }

      if (isMounted.current) {
        setEnrollmentState(null);
        setEnrollmentCode('');
        setTotpFactor((current) =>
          current ? { ...current, status: 'verified' } : current
        );
        setRequiresMfaChallenge(false);
      }

      toast({
        title: 'MFA ativada',
        description: 'Autenticação em duas etapas configurada com sucesso.',
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível verificar o código informado.';

      toast({
        title: 'Erro ao confirmar MFA',
        description: message,
        variant: 'destructive',
      });
    } finally {
      if (isMounted.current) {
        setIsProcessingEnrollment(false);
      }
    }
  };

  const handleDisableMfa = async () => {
    if (!totpFactor) return;

    setIsDisablingMfa(true);

    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: totpFactor.id,
      });

      if (error) {
        throw error;
      }

      if (isMounted.current) {
        setTotpFactor(null);
        setRequiresMfaChallenge(false);
      }

      toast({
        title: 'MFA desativada',
        description: 'A autenticação em duas etapas foi removida desta conta.',
      });

      void loadDashboard();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível desativar a autenticação em duas etapas.';

      toast({
        title: 'Erro ao desativar MFA',
        description: message,
        variant: 'destructive',
      });
    } finally {
      if (isMounted.current) {
        setIsDisablingMfa(false);
      }
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
              Redefina sua senha e habilite autenticação em duas etapas para proteger o acesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-md bg-muted/50 p-4 text-sm text-muted-foreground">
              Use a opção <strong>"Esqueci minha senha"</strong> na tela de login para receber um link de redefinição seguro.
            </div>

            {enrollmentState ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Escaneie o QR code abaixo com um aplicativo autenticador (Google Authenticator, 1Password, etc.) e confirme o código de seis dígitos.
                </p>
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                  {enrollmentState.qrCode ? (
                    <img
                      src={enrollmentState.qrCode}
                      alt="QR code para configurar MFA"
                      className="h-40 w-40 rounded border bg-white p-2 shadow"
                    />
                  ) : null}
                  <div className="space-y-2 text-center sm:text-left">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Chave secreta
                    </p>
                    <code className="rounded bg-slate-100 px-3 py-2 text-sm font-semibold tracking-wider text-slate-700">
                      {enrollmentState.secret}
                    </code>
                  </div>
                </div>
                <form onSubmit={handleConfirmEnrollment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mfa-setup-code">Código do autenticador</Label>
                    <Input
                      id="mfa-setup-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={enrollmentCode}
                      onChange={(event) => setEnrollmentCode(event.target.value)}
                      placeholder="000000"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="submit" disabled={isProcessingEnrollment} className="gap-2">
                      {isProcessingEnrollment && <Loader2 className="h-4 w-4 animate-spin" />}
                      Confirmar código
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEnrollment}
                      disabled={isProcessingEnrollment}
                    >
                      Cancelar configuração
                    </Button>
                  </div>
                </form>
              </div>
            ) : totpFactor ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Autenticação em duas etapas ativa. Será solicitado um código do autenticador para visualizar dados administrativos.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Última atualização: {formatDate(totpFactor.updated_at)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDisableMfa}
                  disabled={isDisablingMfa}
                  className="w-full sm:w-auto gap-2"
                >
                  {isDisablingMfa && <Loader2 className="h-4 w-4 animate-spin" />}
                  Desativar autenticação em duas etapas
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Reforce a segurança exigindo um código temporário gerado por aplicativo sempre que acessar áreas administrativas.
                </p>
                <Button
                  onClick={handleStartMfaEnrollment}
                  disabled={isEnrollingMfa}
                  className="w-full sm:w-auto gap-2"
                >
                  {isEnrollingMfa && <Loader2 className="h-4 w-4 animate-spin" />}
                  Ativar autenticação em duas etapas
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {profile?.role === 'admin' && (
          <div className="space-y-6">
            {requiresMfaChallenge && totpFactor && (
              <Card>
                <CardHeader>
                  <CardTitle>Confirmação de duas etapas</CardTitle>
                  <CardDescription>
                    Informe o código gerado pelo autenticador para liberar os dados administrativos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleVerifyMfa} className="space-y-4 max-w-sm">
                    <div className="space-y-2">
                      <Label htmlFor="mfa-code">Código do autenticador</Label>
                      <Input
                        id="mfa-code"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={mfaCode}
                        onChange={(event) => setMfaCode(event.target.value)}
                        placeholder="000000"
                        required
                      />
                    </div>
                    {mfaError && (
                      <p className="text-sm text-destructive">{mfaError}</p>
                    )}
                    <Button type="submit" className="gap-2" disabled={isVerifyingMfa}>
                      {isVerifyingMfa && <Loader2 className="h-4 w-4 animate-spin" />}
                      Validar código
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Leads</CardTitle>
                  <CardDescription>Contatos recebidos pelas páginas públicas.</CardDescription>
                </CardHeader>
                <CardContent>
                  {requiresMfaChallenge ? (
                    <p className="text-sm text-muted-foreground">
                      Conclua a verificação em duas etapas para visualizar os dados de leads.
                    </p>
                  ) : isFetchingAdminData ? (
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
                  {requiresMfaChallenge ? (
                    <p className="text-sm text-muted-foreground">
                      Confirme o código MFA para liberar a lista de assinantes.
                    </p>
                  ) : isFetchingAdminData ? (
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
