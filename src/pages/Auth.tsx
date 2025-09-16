import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getSupabaseBrowserClient } from '@/integrations/supabase';
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
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/Loading';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';

type AuthTab = 'signin' | 'signup';

const supabase = getSupabaseBrowserClient();

const Auth = () => {
  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();

  const redirectState = location.state as { from?: { pathname?: string } } | null;
  const fromPath = redirectState?.from?.pathname ?? '/dashboard';

  useEffect(() => {
    if (!isAuthLoading && user) {
      navigate(fromPath, { replace: true });
    }
  }, [isAuthLoading, user, navigate, fromPath]);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSigningIn(true);

    try {
      const email = loginForm.email.trim();
      const password = loginForm.password;

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo de volta!',
      });

      navigate(fromPath, { replace: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: 'Erro ao fazer login',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSigningUp(true);

    try {
      const email = registerForm.email.trim();
      const password = registerForm.password;

      const signUpOptions: {
        emailRedirectTo?: string;
        data: { name: string };
      } = {
        data: {
          name: registerForm.name,
        },
      };

      if (typeof window !== 'undefined') {
        signUpOptions.emailRedirectTo = `${window.location.origin}/dashboard`;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: signUpOptions,
      });

      if (error) throw error;

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Verifique seu email para confirmar a conta.',
      });

      setActiveTab('signin');
      setLoginForm({ email, password: '' });
      setRegisterForm({ name: '', email: '', password: '' });
      setShowSignupPassword(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: 'Erro ao criar conta',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Loading />
      </div>
    );
  }

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
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as AuthTab)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Login</TabsTrigger>
              <TabsTrigger value="signup">Cadastro</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={loginForm.email}
                    onChange={(event) =>
                      setLoginForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showLoginPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={loginForm.password}
                      onChange={(event) =>
                        setLoginForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSigningIn || isSigningUp}>
                  {isSigningIn ? (
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
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    type="text"
                    autoComplete="name"
                    value={registerForm.name}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Seu nome"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    autoComplete="email"
                    value={registerForm.email}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-signup">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password-signup"
                      type={showSignupPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={registerForm.password}
                      onChange={(event) =>
                        setRegisterForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowSignupPassword((prev) => !prev)}
                    >
                      {showSignupPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mínimo de 6 caracteres
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isSigningUp || isSigningIn}>
                  {isSigningUp ? (
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
