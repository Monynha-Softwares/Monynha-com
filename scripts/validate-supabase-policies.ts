import { createClient } from '@supabase/supabase-js';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from '../src/integrations/supabase';
import type { Database } from '../src/integrations/supabase/types';

interface TestResult {
  name: string;
  success: boolean;
  detail?: string;
}

const logResult = ({ name, success, detail }: TestResult) => {
  const status = success ? '✅' : '❌';
  const message = detail ? ` - ${detail}` : '';
  console.log(`${status} ${name}${message}`);
};

const runVisitorTests = async () => {
  const client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const { error } = await client
      .from('solutions')
      .select('id')
      .eq('active', true)
      .limit(1);

    if (error) {
      logResult({ name: 'Visitante pode ler solutions', success: false, detail: error.message });
    } else {
      logResult({ name: 'Visitante pode ler solutions', success: true });
    }
  } catch (error) {
    logResult({
      name: 'Visitante pode ler solutions',
      success: false,
      detail: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }

  try {
    const { error } = await client.from('leads').select('id').limit(1);

    if (error) {
      logResult({ name: 'Visitante NÃO pode ler leads', success: true });
    } else {
      logResult({
        name: 'Visitante NÃO pode ler leads',
        success: false,
        detail: 'Consulta retornou sucesso inesperado',
      });
    }
  } catch (error) {
    logResult({ name: 'Visitante NÃO pode ler leads', success: true });
  }
};

const runUserTests = async () => {
  const email = process.env.SUPABASE_TEST_USER_EMAIL;
  const password = process.env.SUPABASE_TEST_USER_PASSWORD;

  if (!email || !password) {
    console.warn('⚠️ SUPABASE_TEST_USER_EMAIL/SUPABASE_TEST_USER_PASSWORD não definidos. Pulando testes de usuário.');
    return;
  }

  const authClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { session },
    error: signInError,
  } = await authClient.auth.signInWithPassword({ email, password });

  if (signInError || !session) {
    const reason = signInError?.message ?? 'Falha ao autenticar usuário de teste';
    logResult({ name: 'Login usuário de teste', success: false, detail: reason });
    return;
  }

  logResult({ name: 'Login usuário de teste', success: true });

  const client = createSupabaseServerClient({ accessToken: session.access_token });

  try {
    const { error } = await client
      .from('profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (error) {
      logResult({ name: 'Usuário lê seu perfil', success: false, detail: error.message });
    } else {
      logResult({ name: 'Usuário lê seu perfil', success: true });
    }
  } catch (error) {
    logResult({
      name: 'Usuário lê seu perfil',
      success: false,
      detail: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }

  try {
    const { error } = await client.from('leads').select('id').limit(1);

    if (error) {
      logResult({ name: 'Usuário NÃO pode ler leads', success: true });
    } else {
      logResult({
        name: 'Usuário NÃO pode ler leads',
        success: false,
        detail: 'Consulta retornou sucesso inesperado',
      });
    }
  } catch (error) {
    logResult({ name: 'Usuário NÃO pode ler leads', success: true });
  }
};

const runAdminTests = async () => {
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

  if (!serviceRoleKey) {
    console.warn(
      '⚠️ SUPABASE_SERVICE_ROLE_KEY não definido. Pulando testes administrativos.'
    );
    return;
  }

  try {
    const serviceClient = createSupabaseServiceRoleClient(serviceRoleKey);

    const [leadsResponse, subscribersResponse] = await Promise.all([
      serviceClient.from('leads').select('id').limit(1),
      serviceClient.from('newsletter_subscribers').select('id').limit(1),
    ]);

    if (leadsResponse.error) {
      logResult({
        name: 'Admin pode ler leads',
        success: false,
        detail: leadsResponse.error.message,
      });
    } else {
      logResult({ name: 'Admin pode ler leads', success: true });
    }

    if (subscribersResponse.error) {
      logResult({
        name: 'Admin pode ler inscritos newsletter',
        success: false,
        detail: subscribersResponse.error.message,
      });
    } else {
      logResult({ name: 'Admin pode ler inscritos newsletter', success: true });
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Erro desconhecido';
    logResult({ name: 'Admin pode ler leads', success: false, detail });
    logResult({
      name: 'Admin pode ler inscritos newsletter',
      success: false,
      detail,
    });
  }
};

const main = async () => {
  console.log('Iniciando verificação de políticas Supabase...');
  await runVisitorTests();
  await runUserTests();
  await runAdminTests();
  console.log('Verificação concluída.');
};

main().catch((error) => {
  console.error('Falha ao executar testes de políticas Supabase', error);
  process.exit(1);
});
