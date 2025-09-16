import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const AUTH_COOKIE_PREFIX = 'monynha_supabase_';
const AUTH_STORAGE_KEY = 'auth_token';
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

type EnvSource = Record<string, string | undefined>;

const getImportMetaEnv = (): EnvSource => {
  try {
    return ((import.meta as ImportMeta & { env?: EnvSource }).env ?? {}) as EnvSource;
  } catch (error) {
    console.warn('Unable to access import.meta.env. Falling back to process.env.', error);
    return {};
  }
};

const importMetaEnv = getImportMetaEnv();

const getEnvValue = (
  keys: string[],
  options: { required?: boolean } = { required: true }
): string | undefined => {
  for (const key of keys) {
    const processValue =
      typeof process !== 'undefined' && typeof process.env !== 'undefined'
        ? process.env[key]
        : undefined;

    if (processValue && processValue.length > 0) {
      return processValue;
    }

    const importMetaValue = importMetaEnv[key];
    if (importMetaValue && importMetaValue.length > 0) {
      return importMetaValue;
    }
  }

  if (options.required === false) {
    return undefined;
  }

  throw new Error(`Missing required Supabase environment variable. Tried keys: ${keys.join(', ')}`);
};

const SUPABASE_URL = getEnvValue(['VITE_SUPABASE_URL', 'SUPABASE_URL']) as string;
const SUPABASE_ANON_KEY = getEnvValue([
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_ANON_KEY',
]) as string;

const SUPABASE_SERVICE_ROLE_KEY = getEnvValue(['SUPABASE_SERVICE_ROLE_KEY'], {
  required: false,
});

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

type MonynhaSupabaseClient = SupabaseClient<Database>;

const createBrowserSupabaseClient = (): MonynhaSupabaseClient =>
  createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: cookieStorage,
      storageKey: AUTH_STORAGE_KEY,
      persistSession: true,
      autoRefreshToken: true,
    },
  });

let browserClient: MonynhaSupabaseClient | undefined;

export const getSupabaseBrowserClient = (): MonynhaSupabaseClient => {
  if (!browserClient) {
    browserClient = createBrowserSupabaseClient();
  }

  return browserClient;
};

export const createServerSupabaseClient = (
  accessToken?: string
): MonynhaSupabaseClient =>
  createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });

export const createServiceRoleSupabaseClient = (): MonynhaSupabaseClient => {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured. This is required for admin operations.'
    );
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
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
