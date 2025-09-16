import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type EnvRecord = Record<string, string | undefined>;

const AUTH_COOKIE_PREFIX = 'monynha_supabase_';
const AUTH_STORAGE_KEY = 'auth_token';
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

const collectEnvironment = (): EnvRecord => {
  const env: EnvRecord = {};

  if (typeof import.meta !== 'undefined') {
    const meta = import.meta as ImportMeta & { env?: EnvRecord };
    if (meta.env) {
      for (const [key, value] of Object.entries(meta.env)) {
        if (typeof value === 'string' && value.length > 0) {
          env[key] = value;
        }
      }
    }
  }

  if (typeof process !== 'undefined' && typeof process.env !== 'undefined') {
    const processEnv = process.env as EnvRecord;
    for (const [key, value] of Object.entries(processEnv)) {
      if (typeof value === 'string' && value.length > 0 && env[key] === undefined) {
        env[key] = value;
      }
    }
  }

  return env;
};

const ENVIRONMENT = collectEnvironment();

const getEnvValue = (...keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = ENVIRONMENT[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }
  return undefined;
};

const SUPABASE_URL = getEnvValue('VITE_SUPABASE_URL', 'SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnvValue(
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_ANON_KEY'
);

if (!SUPABASE_URL) {
  throw new Error(
    'Supabase URL is not configured. Set VITE_SUPABASE_URL (client) or SUPABASE_URL (server).'
  );
}

if (!SUPABASE_ANON_KEY) {
  throw new Error(
    'Supabase anonymous key is not configured. Set VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY.'
  );
}

class CookieStorage implements Storage {
  private readonly path: string;
  private readonly maxAge: number;

  constructor(
    private readonly prefix = AUTH_COOKIE_PREFIX,
    options?: { path?: string; maxAge?: number }
  ) {
    this.path = options?.path ?? '/';
    this.maxAge = options?.maxAge ?? DEFAULT_MAX_AGE;
  }

  get length(): number {
    return this.getPrefixedKeys().length;
  }

  clear(): void {
    this.getPrefixedKeys().forEach((key) => this.removeItem(key));
  }

  getItem(key: string): string | null {
    if (!isBrowser) return null;
    const cookieName = this.getCookieName(key);
    const entry = this.getCookies().find(({ name }) => name === cookieName);
    if (!entry) return null;
    return decodeURIComponent(entry.value);
  }

  key(index: number): string | null {
    const keys = this.getPrefixedKeys();
    return index >= 0 && index < keys.length ? keys[index] : null;
  }

  removeItem(key: string): void {
    if (!isBrowser) return;
    const cookieName = this.getCookieName(key);
    const secureSuffix =
      typeof window !== 'undefined' && window.location.protocol === 'https:'
        ? '; Secure'
        : '';
    document.cookie =
      `${cookieName}=; Path=${this.path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureSuffix}`;
  }

  setItem(key: string, value: string): void {
    if (!isBrowser) return;
    const cookieName = this.getCookieName(key);
    const secureSuffix =
      typeof window !== 'undefined' && window.location.protocol === 'https:'
        ? '; Secure'
        : '';
    document.cookie =
      `${cookieName}=${encodeURIComponent(value)}; Path=${this.path}; Max-Age=${this.maxAge}; SameSite=Lax${secureSuffix}`;
  }

  private getCookieName(key: string): string {
    return `${this.prefix}${key}`;
  }

  private getCookies(): Array<{ name: string; value: string }> {
    if (!isBrowser || !document.cookie) {
      return [];
    }

    return document.cookie.split('; ').map((cookie) => {
      const [rawName, ...rest] = cookie.split('=');
      return {
        name: decodeURIComponent(rawName),
        value: rest.join('='),
      };
    });
  }

  private getPrefixedKeys(): string[] {
    return this.getCookies()
      .filter(({ name }) => name.startsWith(this.prefix))
      .map(({ name }) => name.slice(this.prefix.length));
  }
}

export type TypedSupabaseClient = SupabaseClient<Database>;

const cookieStorage = isBrowser
  ? new CookieStorage(AUTH_COOKIE_PREFIX, { path: '/', maxAge: DEFAULT_MAX_AGE })
  : undefined;

const createBrowserClient = (): TypedSupabaseClient =>
  createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: cookieStorage,
      storageKey: AUTH_STORAGE_KEY,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

let browserClient: TypedSupabaseClient | null = null;

export const getSupabaseBrowserClient = (): TypedSupabaseClient => {
  if (!isBrowser) {
    throw new Error('Supabase browser client requested outside browser context.');
  }

  if (!browserClient) {
    browserClient = createBrowserClient();
  }

  return browserClient;
};

export interface ServerClientOptions {
  accessToken?: string;
  fetch?: typeof fetch;
  persistSession?: boolean;
}

export const createSupabaseServerClient = ({
  accessToken,
  fetch: fetchImplementation,
  persistSession = false,
}: ServerClientOptions = {}): TypedSupabaseClient => {
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession,
      autoRefreshToken: persistSession,
      detectSessionInUrl: false,
    },
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      fetch: fetchImplementation ?? (typeof fetch === 'function' ? fetch : undefined),
    },
  });
};

const resolveServiceRoleKey = (): string => {
  const key = getEnvValue('SUPABASE_SERVICE_ROLE_KEY');
  if (!key) {
    throw new Error('Supabase service role key is not configured.');
  }
  return key;
};

export interface ServiceRoleClientOptions {
  fetch?: typeof fetch;
}

export const createSupabaseServiceRoleClient = ({
  fetch: fetchImplementation,
}: ServiceRoleClientOptions = {}): TypedSupabaseClient => {
  if (isBrowser) {
    throw new Error('Service role client must only be created server-side.');
  }

  return createClient<Database>(SUPABASE_URL, resolveServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: fetchImplementation ?? (typeof fetch === 'function' ? fetch : undefined),
    },
  });
};

let supabaseInstance: TypedSupabaseClient | null = null;

export const getSupabaseClient = (): TypedSupabaseClient => {
  if (!supabaseInstance) {
    supabaseInstance = isBrowser ? createBrowserClient() : createSupabaseServerClient();
  }
  return supabaseInstance;
};

export const supabase = getSupabaseClient();

export const clearSupabaseSession = () => {
  if (cookieStorage) {
    cookieStorage.clear();
  } else if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.warn('Unable to clear Supabase session storage', error);
    }
  }
};

export { AUTH_STORAGE_KEY };
