import {
  createClient,
  type SupabaseClient,
  type SupabaseClientOptions,
} from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type ImportMetaWithEnv = ImportMeta & {
  env?: Record<string, string | undefined>;
};

const getEnvironmentValue = (key: string): string | undefined => {
  const meta = (typeof import.meta !== 'undefined'
    ? (import.meta as ImportMetaWithEnv)
    : undefined) as ImportMetaWithEnv | undefined;

  const metaValue = meta?.env?.[key];
  if (typeof metaValue === 'string' && metaValue.length > 0) {
    return metaValue;
  }

  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key];
  }

  return undefined;
};

const SUPABASE_URL =
  getEnvironmentValue('VITE_SUPABASE_URL') || getEnvironmentValue('SUPABASE_URL');

if (!SUPABASE_URL) {
  throw new Error('Supabase URL is not configured.');
}

const SUPABASE_ANON_KEY =
  getEnvironmentValue('VITE_SUPABASE_ANON_KEY') ||
  getEnvironmentValue('VITE_SUPABASE_PUBLISHABLE_KEY') ||
  getEnvironmentValue('SUPABASE_ANON_KEY');

if (!SUPABASE_ANON_KEY) {
  throw new Error('Supabase anon key is not configured.');
}

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

export type SupabaseDatabaseClient = SupabaseClient<Database>;

const createSupabaseClient = (
  supabaseKey: string,
  options?: SupabaseClientOptions<'public'>
): SupabaseDatabaseClient => createClient<Database>(SUPABASE_URL, supabaseKey, options);

let browserClient: SupabaseDatabaseClient | null = null;

const getOrCreateBrowserClient = () => {
  if (!browserClient) {
    browserClient = createSupabaseClient(SUPABASE_ANON_KEY, {
      auth: {
        storage: cookieStorage,
        storageKey: AUTH_STORAGE_KEY,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return browserClient;
};

export const getSupabaseBrowserClient = (): SupabaseDatabaseClient =>
  getOrCreateBrowserClient();

export const supabase = getSupabaseBrowserClient();

type ServerClientOptions = {
  accessToken?: string;
  headers?: Record<string, string>;
};

export const createSupabaseServerClient = (
  options: ServerClientOptions = {}
): SupabaseDatabaseClient => {
  const headers: Record<string, string> = { ...options.headers };

  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  const hasHeaders = Object.keys(headers).length > 0;

  return createSupabaseClient(SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: hasHeaders
      ? {
          headers,
        }
      : undefined,
  });
};

export const createSupabaseServiceRoleClient = (
  serviceRoleKey?: string
): SupabaseDatabaseClient => {
  if (typeof window !== 'undefined') {
    throw new Error('Service role client cannot be created in a browser environment.');
  }

  const key =
    serviceRoleKey ||
    getEnvironmentValue('SUPABASE_SERVICE_ROLE_KEY') ||
    getEnvironmentValue('SUPABASE_SERVICE_KEY');

  if (!key) {
    throw new Error('Supabase service role key is not configured.');
  }

  return createSupabaseClient(key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

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

export { AUTH_STORAGE_KEY, SUPABASE_URL, SUPABASE_ANON_KEY };
