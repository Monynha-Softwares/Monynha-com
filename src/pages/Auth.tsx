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

type AuthView = 'signin' | 'signup';

const Auth = () => {
  const [authView, setAuthView] = useState<AuthView>('signin');
  const [loadingView, setLoadingView] = useState<AuthView | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({ name: '', email: '', password: '' });

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const redirectPath = useMemo(() => {
    const state = location.state as { from?: { pathname?: string } } | null;
    return state?.from?.pathname ?? '/dashboard';
  }, [location.state]);

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
                      placeholder="••••••••"
                      autoComplete="new-password"
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
                  <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
