import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase';
import { Button } from '@monynha/ui/button';
import { Input } from '@monynha/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@monynha/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@monynha/ui/tabs';
import { Label } from '@monynha/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
        title: t('auth.toast.signInSuccess.title'),
        description: t('auth.toast.signInSuccess.description'),
      });

      navigate(redirectPath, { replace: true });
    } catch (error) {
      const fallbackMessage = t('auth.toast.signInError.description');
      const message =
        error instanceof Error ? error.message : fallbackMessage;
      toast({
        title: t('auth.toast.signInError.title'),
        description: message || fallbackMessage,
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
        title: t('auth.toast.signUpSuccess.title'),
        description: t('auth.toast.signUpSuccess.description'),
      });

      setSignInForm({ email: signUpForm.email.trim(), password: '' });
      setSignUpForm({ name: '', email: '', password: '' });
      setAuthView('signin');
      setShowPassword(false);
    } catch (error) {
      const fallbackMessage = t('auth.toast.signUpError.description');
      const message =
        error instanceof Error ? error.message : fallbackMessage;
      toast({
        title: t('auth.toast.signUpError.title'),
        description: message || fallbackMessage,
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
            {t('auth.backHome')}
          </Link>
          <div className="text-center">
            <CardTitle className="text-2xl font-bold">Monynha Softwares</CardTitle>
            <CardDescription className="text-balance">
              {t('auth.subtitle')}
            </CardDescription>
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
              <TabsTrigger
                value="signin"
                className="whitespace-normal break-words leading-tight"
              >
                {t('auth.tabs.signin')}
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="whitespace-normal break-words leading-tight"
              >
                {t('auth.tabs.signup')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">{t('auth.labels.email')}</Label>
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
                    placeholder={t('auth.placeholders.email')}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">{t('auth.labels.password')}</Label>
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
                      {t('auth.actions.signingIn')}
                    </>
                  ) : (
                    t('auth.actions.signIn')
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">{t('auth.labels.name')}</Label>
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
                    placeholder={t('auth.placeholders.name')}
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t('auth.labels.email')}</Label>
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
                    placeholder={t('auth.placeholders.email')}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t('auth.labels.password')}</Label>
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
                  <p className="text-xs text-muted-foreground">
                    {t('auth.passwordHint')}
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loadingView === 'signup'}
                >
                  {loadingView === 'signup' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('auth.actions.signingUp')}
                    </>
                  ) : (
                    t('auth.actions.signUp')
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
