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
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';

type AuthView = 'signin' | 'signup' | 'reset' | 'update-password';

const Auth = () => {
  const [authView, setAuthView] = useState<AuthView>('signin');
  const [loadingView, setLoadingView] = useState<AuthView | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({ name: '', email: '', password: '' });
  const [resetEmail, setResetEmail] = useState('');
  const [newPasswordForm, setNewPasswordForm] = useState({
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const redirectPath = useMemo(() => {
    const state = location.state as { from?: { pathname?: string } } | null;
    return state?.from?.pathname ?? '/dashboard';
  }, [location.state]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const type = searchParams.get('type');

    if (type === 'recovery') {
      setAuthView('update-password');
      setShowPassword(false);
    }
  }, [location.search]);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        navigate(redirectPath, { replace: true });
      }
    };

    checkUser();
  }, [navigate, redirectPath]);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadingView('signin');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInForm.email.trim(),
        password: signInForm.password,
      });

      if (error) {
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

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadingView('reset');

    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth?type=recovery`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(
        resetEmail.trim(),
        { redirectTo }
      );

      if (error) {
        throw error;
      }

      toast({
        title: 'Verifique seu email',
        description: 'Enviamos um link seguro para redefinição de senha.',
      });

      setSignInForm((current) => ({ ...current, email: resetEmail.trim() }));
      setResetEmail('');
      setAuthView('signin');
      setShowPassword(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível enviar o email de redefinição.';
      toast({
        title: 'Erro ao solicitar redefinição',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoadingView(null);
    }
  };

  const handleUpdatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadingView('update-password');

    if (newPasswordForm.password.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'Utilize ao menos 6 caracteres para a nova senha.',
        variant: 'destructive',
      });
      setLoadingView(null);
      return;
    }

    if (newPasswordForm.password !== newPasswordForm.confirmPassword) {
      toast({
        title: 'Senhas diferentes',
        description: 'As senhas informadas precisam ser iguais.',
        variant: 'destructive',
      });
      setLoadingView(null);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPasswordForm.password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Senha atualizada',
        description: 'Sua senha foi redefinida com sucesso.',
      });

      setNewPasswordForm({ password: '', confirmPassword: '' });
      navigate('/dashboard', { replace: true });
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
          <div className="text-center">
            <CardTitle className="text-2xl font-bold">Monynha Softwares</CardTitle>
            <CardDescription>Faça login ou crie sua conta</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {authView === 'signin' || authView === 'signup' ? (
            <Tabs
              value={authView}
              onValueChange={(value) => {
                setAuthView(value as AuthView);
                setShowPassword(false);
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
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword((previous) => !previous)}
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
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full px-0 text-sm"
                    onClick={() => {
                      setResetEmail(signInForm.email);
                      setAuthView('reset');
                      setShowPassword(false);
                    }}
                  >
                    Esqueci minha senha
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome</Label>
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
                    <Input
                      id="signup-password"
                      type="password"
                      value={signUpForm.password}
                      onChange={(event) =>
                        setSignUpForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      placeholder="Crie uma senha segura"
                      autoComplete="new-password"
                      required
                      minLength={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loadingView === 'signup'}
                  >
                    {loadingView === 'signup' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      'Criar conta'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          ) : authView === 'reset' ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(event) => setResetEmail(event.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Você receberá um email com instruções para definir uma nova senha.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={loadingView === 'reset'}
                >
                  {loadingView === 'reset' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar link de redefinição'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setAuthView('signin');
                    setLoadingView(null);
                    setShowPassword(false);
                  }}
                >
                  Voltar ao login
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPasswordForm.password}
                  onChange={(event) =>
                    setNewPasswordForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Digite a nova senha"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={newPasswordForm.confirmPassword}
                  onChange={(event) =>
                    setNewPasswordForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={loadingView === 'update-password'}
                >
                  {loadingView === 'update-password' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    'Salvar nova senha'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setAuthView('signin');
                    setLoadingView(null);
                    setShowPassword(false);
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
