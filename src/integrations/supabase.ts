import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const AUTH_COOKIE_PREFIX = 'monynha_supabase_';
const AUTH_STORAGE_KEY = 'auth_token';
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

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
    if (typeof document === 'undefined') return null;
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
    if (typeof document === 'undefined') return;
    const cookieName = this.getCookieName(key);
    const secureSuffix =
      typeof window !== 'undefined' && window.location.protocol === 'https:'
        ? '; Secure'
        : '';
    document.cookie =
      `${cookieName}=; Path=${this.path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureSuffix}`;
  }

  setItem(key: string, value: string): void {
    if (typeof document === 'undefined') return;
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
    if (typeof document === 'undefined' || !document.cookie) {
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

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

const cookieStorage = isBrowser
  ? new CookieStorage(AUTH_COOKIE_PREFIX, { path: '/', maxAge: DEFAULT_MAX_AGE })
  : undefined;

type EnvSource = Record<string, string | undefined>;

const envSources: EnvSource[] = (() => {
  const sources: EnvSource[] = [];

  const metaEnv = (import.meta as unknown as { env?: EnvSource })?.env;
  if (metaEnv) {
    sources.push(metaEnv);
  }

  if (typeof process !== 'undefined' && process.env) {
    sources.push(process.env as EnvSource);
  }

  return sources;
})();

const resolveEnvVar = (key: string): string | undefined => {
  for (const source of envSources) {
    const value = source[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }
  return undefined;
};

const getEnvVar = (key: string, fallbackKeys: string[] = []): string | undefined => {
  const keysToCheck = [key, ...fallbackKeys];

  for (const currentKey of keysToCheck) {
    const resolved =
      resolveEnvVar(currentKey) ??
      (currentKey.startsWith('VITE_') ? undefined : resolveEnvVar(`VITE_${currentKey}`));

    if (resolved) {
      return resolved;
    }
  }

  return undefined;
};

const SUPABASE_URL = getEnvVar('SUPABASE_URL');
if (!SUPABASE_URL) {
  throw new Error('Supabase URL is not configured. Define SUPABASE_URL or VITE_SUPABASE_URL.');
}

const SUPABASE_ANON_KEY =
  getEnvVar('SUPABASE_ANON_KEY') ?? getEnvVar('SUPABASE_PUBLISHABLE_KEY');
if (!SUPABASE_ANON_KEY) {
  throw new Error(
    'Supabase anon key is not configured. Define SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY.'
  );
}

const createDefaultClient = (): SupabaseClient<Database> => {
  const authOptions: {
    storageKey: string;
    persistSession: boolean;
    autoRefreshToken: boolean;
    storage?: Storage;
  } = {
    storageKey: AUTH_STORAGE_KEY,
    persistSession: isBrowser,
    autoRefreshToken: isBrowser,
  };

  if (cookieStorage) {
    authOptions.storage = cookieStorage;
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: authOptions,
  });
};

let browserClient: SupabaseClient<Database> | undefined;

export const getSupabaseBrowserClient = (): SupabaseClient<Database> => {
  if (!browserClient) {
    browserClient = createDefaultClient();
  }

  return browserClient;
};

export interface CreateServerClientOptions {
  accessToken?: string;
  headers?: Record<string, string>;
  fetch?: typeof fetch;
}

export const createSupabaseServerClient = (
  options: CreateServerClientOptions = {}
): SupabaseClient<Database> => {
  const headers = {
    ...options.headers,
    ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
  } satisfies Record<string, string>;

  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: headers ? { headers } : undefined,
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    fetch: options.fetch,
  });
};

export interface CreateServiceRoleClientOptions {
  fetch?: typeof fetch;
}

export const createSupabaseServiceRoleClient = (
  options: CreateServiceRoleClientOptions = {}
): SupabaseClient<Database> => {
  const serviceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY must be defined to use the service role client.');
  }

  if (isBrowser) {
    throw new Error('The Supabase service role client cannot be instantiated in the browser.');
  }

  return createClient<Database>(SUPABASE_URL, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    fetch: options.fetch,
  });
};

export const supabase = getSupabaseBrowserClient();

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
