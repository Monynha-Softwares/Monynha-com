import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const AUTH_COOKIE_PREFIX = 'monynha_supabase_';
const AUTH_STORAGE_KEY = 'auth_token';
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

type EnvRecord = Record<string, string | undefined> | undefined;

const getMetaEnv = (): EnvRecord => {
  try {
    return (import.meta as unknown as { env?: Record<string, string | undefined> })
      .env;
  } catch {
    return undefined;
  }
};

const getEnvValue = (...keys: string[]): string | undefined => {
  const metaEnv = getMetaEnv();
  for (const key of keys) {
    const fromMeta = metaEnv?.[key];
    if (fromMeta) {
      return fromMeta;
    }

    if (typeof process !== 'undefined' && process.env?.[key]) {
      return process.env[key];
    }
  }

  return undefined;
};

const requireEnvValue = (...keys: string[]): string => {
  const value = getEnvValue(...keys);
  if (!value) {
    throw new Error(`Missing required environment variable: ${keys.join(' or ')}`);
  }
  return value;
};

const SUPABASE_URL = requireEnvValue('VITE_SUPABASE_URL', 'SUPABASE_URL');
const SUPABASE_ANON_KEY = requireEnvValue(
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_ANON_KEY'
);

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

let cookieStorage: CookieStorage | undefined;
let browserClient: SupabaseClient<Database> | undefined;
let serverClient: SupabaseClient<Database> | undefined;

const createBrowserClient = () => {
  if (!isBrowser) {
    throw new Error('Browser client cannot be created in a non-browser environment.');
  }

  cookieStorage = new CookieStorage(AUTH_COOKIE_PREFIX, {
    path: '/',
    maxAge: DEFAULT_MAX_AGE,
  });

  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: cookieStorage,
      storageKey: AUTH_STORAGE_KEY,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
};

const createServerClientInternal = (accessToken?: string) =>
  createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: Boolean(accessToken),
      autoRefreshToken: Boolean(accessToken),
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });

export const getSupabaseClient = (
  accessToken?: string
): SupabaseClient<Database> => {
  if (isBrowser) {
    if (!browserClient) {
      browserClient = createBrowserClient();
    }

    return browserClient;
  }

  if (accessToken) {
    return createServerClientInternal(accessToken);
  }

  if (!serverClient) {
    serverClient = createServerClientInternal();
  }

  return serverClient;
};

export const createSupabaseServerClient = (
  accessToken?: string
): SupabaseClient<Database> => createServerClientInternal(accessToken);

const getServiceRoleKey = (): string => {
  const key = getEnvValue('SUPABASE_SERVICE_ROLE_KEY', 'SERVICE_ROLE_KEY');
  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required to create a service role client.'
    );
  }
  return key;
};

export const createSupabaseServiceRoleClient = (): SupabaseClient<Database> => {
  if (isBrowser) {
    throw new Error('Service role client cannot be created in the browser.');
  }

  const serviceRoleKey = getServiceRoleKey();

  return createClient<Database>(SUPABASE_URL, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
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

export type SupabaseBrowserClient = SupabaseClient<Database>;
export { AUTH_STORAGE_KEY };
