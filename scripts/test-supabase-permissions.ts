import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
  type TypedSupabaseClient,
} from '../src/integrations/supabase';
import { fetchActiveSolutions } from '../src/lib/solutions';
import { createLead, fetchLeadsForAdmin } from '../src/lib/leads';
import {
  fetchNewsletterSubscribersForAdmin,
  subscribeToNewsletter,
} from '../src/lib/newsletter';

const log = console.log;
const warn = console.warn;

const withClient = async <T>(
  label: string,
  action: (client: TypedSupabaseClient) => Promise<T>,
  clientFactory: () => TypedSupabaseClient
) => {
  try {
    log(`\n[${label}]`);
    const client = clientFactory();
    const result = await action(client);
    return result;
  } catch (error) {
    warn(`Falha em ${label}:`, error);
    return null;
  }
};

const runVisitorChecks = async () => {
  const visitorClient = createSupabaseServerClient();
  await withClient('Visitante - leitura de soluções ativas', async (client) => {
    const solutions = await fetchActiveSolutions({}, client);
    log(`Soluções públicas disponíveis: ${solutions.length}`);
    return solutions;
  }, () => visitorClient);

  if (process.env.SUPABASE_TEST_MODE === 'true') {
    await withClient('Visitante - criação de lead', async (client) => {
      await createLead(
        {
          name: 'Teste Visitante',
          email: `visitante-${Date.now()}@example.com`,
          message: 'Lead gerado durante teste automatizado.',
          company: null,
          project: null,
        },
        client
      );
      log('Lead de teste criado com sucesso.');
    }, () => visitorClient);

    await withClient('Visitante - inscrição em newsletter', async (client) => {
      try {
        await subscribeToNewsletter(`newsletter-${Date.now()}@example.com`, client);
        log('Assinatura de newsletter realizada.');
      } catch (error) {
        warn('Assinatura de newsletter falhou (possivelmente e-mail duplicado).', error);
      }
    }, () => visitorClient);
  } else {
    warn('SUPABASE_TEST_MODE != "true" - inserções de visitante foram ignoradas.');
  }
};

const runUserChecks = async () => {
  const email = process.env.SUPABASE_TEST_USER_EMAIL;
  const password = process.env.SUPABASE_TEST_USER_PASSWORD;

  if (!email || !password) {
    warn('Credenciais de usuário de teste ausentes. Ignorando verificações de usuário autenticado.');
    return;
  }

  const anonClient = createSupabaseServerClient({ persistSession: true });
  const { data: authData, error } = await anonClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !authData.session) {
    warn('Não foi possível autenticar usuário de teste.', error);
    return;
  }

  const userClient = createSupabaseServerClient({
    accessToken: authData.session.access_token,
  });

  await withClient(
    'Usuário autenticado - tentativa de leitura de leads',
    async (client) => {
      try {
        const leads = await fetchLeadsForAdmin(client);
        log(`Usuário autenticado obteve ${leads.length} leads (verificar política de RLS).`);
      } catch (clientError) {
        warn('Leitura de leads bloqueada para usuário autenticado (esperado se não admin).', clientError);
      }
    },
    () => userClient
  );
};

const runAdminChecks = async () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    warn('SUPABASE_SERVICE_ROLE_KEY não configurado. Ignorando verificações administrativas.');
    return;
  }

  const adminClient = createSupabaseServiceRoleClient();
  await withClient('Admin - leitura de leads', fetchLeadsForAdmin, () => adminClient);
  await withClient(
    'Admin - leitura de assinantes da newsletter',
    fetchNewsletterSubscribersForAdmin,
    () => adminClient
  );
};

const run = async () => {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_PROJECT_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    warn('Variáveis de ambiente do Supabase não encontradas. Ignorando testes de permissão.');
    return;
  }

  log('Iniciando verificação de permissões do Supabase...');
  await runVisitorChecks();
  await runUserChecks();
  await runAdminChecks();
  log('\nVerificação concluída.');
};

void run().catch((error) => {
  console.error('Falha na verificação de permissões do Supabase', error);
  process.exitCode = 1;
});
