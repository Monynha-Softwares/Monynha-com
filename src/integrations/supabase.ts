import { createClient, type SupabaseClient as SupabaseClientBase } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type Client = SupabaseClientBase<Database>;

type ServerClientOptions = {
  accessToken?: string;
  headers?: Record<string, string>;
};

const getImportMetaEnv = (): Record<string, string | undefined> | undefined => {
  try {
    // Access import.meta via eval to avoid syntax errors in non-module contexts (e.g., Jest).
    const meta = eval('import.meta') as
      | { env?: Record<string, string | undefined> }
      | undefined;
    if (meta?.env) {
      return meta.env;
    }
  } catch (error) {
    // Silent fallback: environments like Jest (CommonJS) don't expose import.meta.
  }
  return undefined;
};

const getProcessEnv = (): Record<string, string | undefined> | undefined => {
  const processLike = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return processLike?.env;
};

const getEnvVar = (key: string): string | undefined => {
  const importMetaEnv = getImportMetaEnv();
  if (importMetaEnv?.[key]) {
    return importMetaEnv[key];
  }

  const processEnv = getProcessEnv();
  if (processEnv?.[key]) {
    return processEnv[key];
  }

  return undefined;
};

const SUPABASE_URL =
  getEnvVar('VITE_SUPABASE_URL') ?? getEnvVar('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY =
  getEnvVar('VITE_SUPABASE_ANON_KEY') ??
  getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY') ??
  getEnvVar('SUPABASE_ANON_KEY') ??
  '';

if (!SUPABASE_URL) {
  throw new Error('Supabase URL is not configured.');
}

if (!SUPABASE_ANON_KEY) {
  throw new Error('Supabase anon key is not configured.');
}

let browserClient: Client | null = null;
let serviceRoleClient: Client | null = null;

const createBrowserClient = (): Client => {
  if (typeof window === 'undefined') {
    throw new Error('Browser Supabase client requested in a non-browser environment.');
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: window.localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
};

const createServerClient = ({
  accessToken,
  headers,
}: ServerClientOptions = {}): Client => {
  const mergedHeaders: Record<string, string> = { ...(headers ?? {}) };

  if (accessToken) {
    mergedHeaders.Authorization = `Bearer ${accessToken}`;
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: Object.keys(mergedHeaders).length ? { headers: mergedHeaders } : undefined,
  });
};

const getServiceRoleKey = (): string | undefined => {
  return (
    getProcessEnv()?.SUPABASE_SERVICE_ROLE_KEY ??
    getProcessEnv()?.SERVICE_ROLE_KEY ??
    getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
  );
};

/**
 * Returns a Supabase client configured for browser environments (CSR).
 */
export const getSupabaseBrowserClient = (): Client => {
  if (!browserClient) {
    browserClient = createBrowserClient();
  }
  return browserClient;
};

/**
 * Creates a Supabase client for server-side environments (SSR).
 */
export const createSupabaseServerClient = (
  options: ServerClientOptions = {}
): Client => {
  return createServerClient(options);
};

/**
 * Lazily resolves a Supabase client that uses the service role key.
 * Only available in server-side contexts (never bundle in the browser).
 */
export const getSupabaseServiceRoleClient = (): Client => {
  if (typeof window !== 'undefined') {
    throw new Error('Service role client must not be instantiated in the browser.');
  }

  if (!serviceRoleClient) {
    const serviceRoleKey = getServiceRoleKey();

    if (!serviceRoleKey) {
      throw new Error('Supabase service role key is not configured.');
    }

    serviceRoleClient = createClient<Database>(SUPABASE_URL, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return serviceRoleClient;
};

/**
 * Returns a Supabase client appropriate for the current environment.
 * Defaults to a browser client when executed client-side.
 */
export const getSupabaseClient = (
  options?: ServerClientOptions
): Client => {
  if (typeof window !== 'undefined') {
    return getSupabaseBrowserClient();
  }

  return createServerClient(options);
};

export type SupabaseClient = Client;
export type SupabaseDatabase = Database;
