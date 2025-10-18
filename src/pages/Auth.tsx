import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { AuthApiError } from '@supabase/supabase-js';
import { ArrowLeft, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';

type AuthView = 'signin' | 'signup';
type AuthMode = 'auth' | 'forgot-password' | 'update-password' | 'mfa';

type TotpFactor = {
  id: string;
  factor_type: string;
  friendly_name?: string | null;
  status: 'verified' | 'unverified';
};

const Auth = () => {
  const [authView, setAuthView] = useState<AuthView>('signin');
  const [mode, setMode] = useState<AuthMode>('auth');
  const [loadingView, setLoadingView] = useState<AuthView | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({ name: '', email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetForm, setResetForm] = useState({ password: '', confirmPassword: '' });
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [mfaChallenge, setMfaChallenge] = useState<
    { factorId: string; challengeId: string } | null
  >(null);
  const [mfaCode, setMfaCode] = useState('');
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const redirectPath = useMemo(() => {
    const state = location.state as { from?: { pathname?: string } } | null;
    return state?.from?.pathname ?? '/dashboard';
  }, [location.state]);

  const cardTitle = useMemo(
    () => (mode === 'mfa' ? 'Confirme seu acesso' : 'Monynha Softwares'),
    [mode]
  );

  const cardDescription = useMemo(() => {
    switch (mode) {
      case 'forgot-password':
        return 'Informe seu email para receber um link seguro de redefinição.';
      case 'update-password':
        return 'Crie uma nova senha forte para proteger sua conta.';
      case 'mfa':
        return 'Valide o código do seu aplicativo autenticador para concluir o login.';
      default:
        return 'Faça login ou crie sua conta';
    }
  }, [mode]);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session && mode !== 'update-password' && mode !== 'mfa') {
        navigate(redirectPath, { replace: true });
      }
    };

    checkUser();
  }, [mode, navigate, redirectPath]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const { hash } = window.location;
    if (!hash || !hash.includes('type=recovery')) {
      return;
    }

    const exchangeRecoverySession = async () => {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(hash);
        if (error) {
          throw error;
        }

        setMode('update-password');
        setAuthView('signin');
        toast({
          title: 'Defina uma nova senha',
          description: 'Escolha uma senha forte para continuar usando sua conta.',
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Não foi possível validar o link de redefinição.';
        toast({
          title: 'Erro ao validar token',
          description: message,
          variant: 'destructive',
        });
      } finally {
        if (typeof window !== 'undefined') {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    void exchangeRecoverySession();
  }, [toast]);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadingView('signin');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInForm.email.trim(),
        password: signInForm.password,
      });

      if (error) {
        if (
          error instanceof AuthApiError &&
          (error.code === 'mfa_required' ||
            error.message.toLowerCase().includes('mfa'))
        ) {
          const { data: factorsData, error: factorsError } =
            await supabase.auth.mfa.listFactors();
          if (factorsError) {
            throw factorsError;
          }

          const factors = Array.isArray(factorsData?.totp)
            ? (factorsData.totp as TotpFactor[])
            : [];

          const totpFactor =
            factors.find((factor) => factor.status === 'verified') || factors[0];

          if (!totpFactor) {
            throw new Error('Nenhum autenticador está verificado para este usuário.');
          }

          const { data: challengeData, error: challengeError } =
            await supabase.auth.mfa.challenge({ factorId: totpFactor.id });

          if (challengeError || !challengeData) {
            throw challengeError ?? new Error('Não foi possível iniciar o desafio MFA.');
          }

          setMfaChallenge({
            factorId: totpFactor.id,
            challengeId: challengeData.id,
          });
          setMfaCode('');
          setMode('mfa');
          toast({
            title: 'Código MFA necessário',
            description:
              'Abra o aplicativo autenticador cadastrado e informe o código de 6 dígitos para concluir o acesso.',
          });
          setLoadingView(null);
          return;
        }

        throw error;
      }

      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo de volta!',
      });

      navigate(redirectPath, { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível fazer login.';
      toast({
        title: 'Erro ao fazer login',
        description: message,
        variant: 'destructive',
      });
      setMode('auth');
      setMfaChallenge(null);
    } finally {
      setLoadingView(null);
    }
  };

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadingView('signup');

    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/dashboard`
          : undefined;

      const { error } = await supabase.auth.signUp({
        email: signUpForm.email.trim(),
        password: signUpForm.password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            name: signUpForm.name.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Verifique seu email para confirmar a conta.',
      });

      setSignInForm({ email: signUpForm.email.trim(), password: '' });
      setSignUpForm({ name: '', email: '', password: '' });
      setAuthView('signin');
      setShowPassword(false);
      setMode('auth');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível criar a conta.';
      toast({
        title: 'Erro ao criar conta',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoadingView(null);
    }
  };

  const handleForgotPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSendingReset(true);

    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(
        forgotEmail.trim(),
        { redirectTo }
      );

      if (error) {
        throw error;
      }

      toast({
        title: 'Email de redefinição enviado',
        description: 'Confira sua caixa de entrada e siga as instruções para criar uma nova senha.',
      });

      setForgotEmail('');
      setMode('auth');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível enviar o email de redefinição.';
      toast({
        title: 'Erro ao enviar email',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleUpdatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (resetForm.password.trim().length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A nova senha deve conter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    if (resetForm.password !== resetForm.confirmPassword) {
      toast({
        title: 'As senhas não coincidem',
        description: 'Digite a mesma senha nos dois campos para continuar.',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: resetForm.password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Senha atualizada',
        description: 'Faça login novamente utilizando a nova senha.',
      });

      setResetForm({ password: '', confirmPassword: '' });
      setMode('auth');
      setAuthView('signin');
      navigate(redirectPath, { replace: true });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar a senha.';
      toast({
        title: 'Erro ao atualizar senha',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleVerifyMfa = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!mfaChallenge) {
      toast({
        title: 'Desafio inválido',
        description: 'Reinicie o processo de login para gerar um novo código.',
        variant: 'destructive',
      });
      setMode('auth');
      return;
    }

    const sanitizedCode = mfaCode.replace(/\s+/g, '');
    if (sanitizedCode.length < 6) {
      toast({
        title: 'Código incompleto',
        description: 'Informe os 6 dígitos exibidos no aplicativo autenticador.',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifyingMfa(true);

    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId: mfaChallenge.factorId,
        challengeId: mfaChallenge.challengeId,
        code: sanitizedCode,
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Login confirmado',
        description: 'Autenticação multifator realizada com sucesso.',
      });

      setMode('auth');
      setMfaChallenge(null);
      setMfaCode('');
      navigate(redirectPath, { replace: true });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível validar o código MFA.';
      toast({
        title: 'Erro na verificação MFA',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsVerifyingMfa(false);
      setLoadingView(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <Link
            to="/"
            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para home
          </Link>
          <div className="space-y-2 text-center">
            {mode === 'mfa' && (
              <div className="flex justify-center">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              </div>
            )}
            <CardTitle className="text-2xl font-bold">{cardTitle}</CardTitle>
            <CardDescription>{cardDescription}</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {mode === 'auth' ? (
            <Tabs
              value={authView}
              onValueChange={(value) => {
                setAuthView(value as AuthView);
                setShowPassword(false);
                setMode('auth');
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Login</TabsTrigger>
                <TabsTrigger value="signup">Cadastro</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signInForm.email}
                      onChange={(event) =>
                        setSignInForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      placeholder="seu@email.com"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={signInForm.password}
                        onChange={(event) =>
                          setSignInForm((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute inset-y-0 right-0 flex items-center"
                        onClick={() => setShowPassword((current) => !current)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loadingView === 'signin'}
                  >
                    {loadingView === 'signin' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                  <div className="text-center text-sm">
                    <button
                      type="button"
                      className="text-primary underline-offset-4 hover:underline"
                      onClick={() => {
                        setMode('forgot-password');
                        setLoadingView(null);
                      }}
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome completo</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={signUpForm.name}
                      onChange={(event) =>
                        setSignUpForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Seu nome"
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signUpForm.email}
                      onChange={(event) =>
                        setSignUpForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      placeholder="seu@email.com"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={signUpForm.password}
                        onChange={(event) =>
                          setSignUpForm((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                        placeholder="Crie uma senha forte"
                        autoComplete="new-password"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute inset-y-0 right-0 flex items-center"
                        onClick={() => setShowPassword((current) => !current)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Utilize pelo menos 6 caracteres combinando letras, números e símbolos.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loadingView === 'signup'}
                  >
                    {loadingView === 'signup' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Criando conta...
                      </>
                    ) : (
                      'Criar conta'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          ) : mode === 'forgot-password' ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email cadastrado</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(event) => setForgotEmail(event.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSendingReset}>
                {isSendingReset ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
                  </>
                ) : (
                  'Enviar email de redefinição'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setMode('auth');
                  setLoadingView(null);
                }}
              >
                Voltar para o login
              </Button>
            </form>
          ) : mode === 'update-password' ? (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={resetForm.password}
                  onChange={(event) =>
                    setResetForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Informe uma nova senha"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirme a senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={resetForm.confirmPassword}
                  onChange={(event) =>
                    setResetForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isUpdatingPassword}>
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Atualizando...
                  </>
                ) : (
                  'Salvar nova senha'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setMode('auth');
                  setResetForm({ password: '', confirmPassword: '' });
                }}
              >
                Cancelar e voltar
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyMfa} className="space-y-6">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Abrimos um desafio MFA para a sua conta. Digite o código de 6 dígitos exibido
                  no aplicativo autenticador configurado.
                </p>
              </div>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={mfaCode}
                  onChange={(value) => setMfaCode(value.replace(/[^0-9]/g, ''))}
                  disabled={isVerifyingMfa}
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={isVerifyingMfa || mfaCode.length < 6}
                >
                  {isVerifyingMfa ? (
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
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setMode('auth');
                    setMfaChallenge(null);
                    setMfaCode('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
