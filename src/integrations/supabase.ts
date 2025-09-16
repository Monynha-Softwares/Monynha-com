import { createClient, type SupabaseClient, type SupabaseClientOptions } from '@supabase/supabase-js';
import type { Database } from './supabase/types';

const getImportMetaEnv = () => {
  try {
    return (import.meta as unknown as { env?: Record<string, string | undefined> })?.env;
  } catch {
    return undefined;
  }
};

const getEnvVar = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key];
  }

  const viteEnv = getImportMetaEnv();
  return viteEnv?.[key];
};

const supabaseUrl =
  getEnvVar('VITE_SUPABASE_URL') ?? getEnvVar('SUPABASE_URL') ?? getEnvVar('SUPABASE_PROJECT_URL');
const supabaseAnonKey =
  getEnvVar('VITE_SUPABASE_ANON_KEY') ??
  getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY') ??
  getEnvVar('SUPABASE_ANON_KEY');

if (!supabaseUrl) {
  throw new Error('Missing Supabase URL. Set VITE_SUPABASE_URL or SUPABASE_URL environment variables.');
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing Supabase anonymous key. Set VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY environment variables.'
  );
}

type ClientOptions = SupabaseClientOptions<'public'>;

type SupabaseDatabase = Database;

type SupabaseTypedClient = SupabaseClient<SupabaseDatabase>;

const createClientWithOptions = (key: string, options: ClientOptions): SupabaseTypedClient =>
  createClient<SupabaseDatabase>(supabaseUrl, key, options);

const createBrowserClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('Cannot create a browser Supabase client on the server.');
  }

  return createClientWithOptions(supabaseAnonKey, {
    auth: {
      storage: window.localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};

const createServerClient = () =>
  createClientWithOptions(supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

let browserClient: SupabaseTypedClient | undefined;

export const getSupabaseBrowserClient = (): SupabaseTypedClient => {
  if (!browserClient) {
    browserClient = createBrowserClient();
  }
  return browserClient;
};

export const createSupabaseServerClient = (): SupabaseTypedClient => createServerClient();

export const getSupabaseClient = (): SupabaseTypedClient =>
  typeof window === 'undefined' ? createSupabaseServerClient() : getSupabaseBrowserClient();

export const supabase = getSupabaseClient();

export const createSupabaseServiceRoleClient = (): SupabaseTypedClient => {
  if (typeof window !== 'undefined') {
    throw new Error('The service role client can only be instantiated on the server.');
  }

  const serviceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
  }

  return createClientWithOptions(serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};

export type { SupabaseTypedClient as SupabaseClient };
export type { Database };
