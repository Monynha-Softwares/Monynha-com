import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase/types';

type TypedClient = SupabaseClient<Database>;

const isBrowser = typeof window !== 'undefined';
const browserEnv =
  typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined'
    ? (import.meta.env as Record<string, string | undefined>)
    : ({} as Record<string, string | undefined>);
const serverEnv =
  typeof process !== 'undefined' && typeof process.env !== 'undefined'
    ? (process.env as Record<string, string | undefined>)
    : {};

const getEnvValue = (...keys: string[]) => {
  for (const key of keys) {
    const browserValue = browserEnv[key];
    if (browserValue) {
      return browserValue;
    }

    const serverValue = serverEnv[key];
    if (serverValue) {
      return serverValue;
    }
  }
  return undefined;
};

const SUPABASE_URL = getEnvValue('VITE_SUPABASE_URL', 'SUPABASE_URL');
if (!SUPABASE_URL) {
  throw new Error('Supabase URL environment variable is not set.');
}

const SUPABASE_ANON_KEY = getEnvValue(
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_ANON_KEY',
  'SUPABASE_PUBLISHABLE_KEY'
);
if (!SUPABASE_ANON_KEY) {
  throw new Error('Supabase anon key environment variable is not set.');
}

const DEFAULT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const STORAGE_KEY = 'sb-monynha-auth';
const ACCESS_TOKEN_COOKIE = 'sb-monynha-access-token';
const REFRESH_TOKEN_COOKIE = 'sb-monynha-refresh-token';
const EXPIRES_AT_COOKIE = 'sb-monynha-session-exp';

const escapeCookieName = (name: string) =>
  name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

const getCookie = (name: string) => {
  if (!isBrowser) return null;
  const matcher = document.cookie.match(
    new RegExp(`(?:^|; )${escapeCookieName(name)}=([^;]*)`)
  );
  return matcher ? decodeURIComponent(matcher[1]) : null;
};

const setCookie = (
  name: string,
  value: string,
  options?: { expires?: Date; maxAgeSeconds?: number }
) => {
  if (!isBrowser) return;

  const secure = window.location.protocol === 'https:';
  const expires =
    options?.expires ??
    new Date(Date.now() + (options?.maxAgeSeconds ?? DEFAULT_COOKIE_MAX_AGE) * 1000);
  const maxAge =
    options?.maxAgeSeconds ?? Math.max(0, Math.round((expires.getTime() - Date.now()) / 1000));

  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; Path=/; Expires=${expires.toUTCString()}; Max-Age=${maxAge}; SameSite=Lax${
    secure ? '; Secure' : ''
  }`;
};

const removeCookie = (name: string) => {
  if (!isBrowser) return;
  const secure = window.location.protocol === 'https:';
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; SameSite=Lax${
    secure ? '; Secure' : ''
  }`;
};

const parseSessionExpiry = (value: string) => {
  try {
    const session = JSON.parse(value) as Partial<Session>;
    if (session && typeof session.expires_at === 'number') {
      return new Date(session.expires_at * 1000);
    }
  } catch (error) {
    console.warn('Não foi possível interpretar a expiração da sessão Supabase.', error);
  }
  return undefined;
};

const cookieStorage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = {
  getItem: (key) => getCookie(key),
  setItem: (key, value) => {
    const expires = parseSessionExpiry(value);
    setCookie(key, value, { expires });
  },
  removeItem: (key) => removeCookie(key),
};

let browserClient: TypedClient | null = null;
let authListenersRegistered = false;

const createBrowserClient = (): TypedClient =>
  createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: cookieStorage,
      storageKey: STORAGE_KEY,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

const syncSessionCookies = (session: Session | null) => {
  if (!session) {
    removeCookie(ACCESS_TOKEN_COOKIE);
    removeCookie(REFRESH_TOKEN_COOKIE);
    removeCookie(EXPIRES_AT_COOKIE);
    return;
  }

  const expiresAt = session.expires_at
    ? new Date(session.expires_at * 1000)
    : new Date(Date.now() + DEFAULT_COOKIE_MAX_AGE * 1000);

  setCookie(ACCESS_TOKEN_COOKIE, session.access_token, { expires: expiresAt });

  if (session.refresh_token) {
    setCookie(REFRESH_TOKEN_COOKIE, session.refresh_token, {
      maxAgeSeconds: 60 * 60 * 24 * 30,
    });
  }

  if (session.expires_at) {
    setCookie(EXPIRES_AT_COOKIE, String(session.expires_at), { expires: expiresAt });
  }
};

const registerAuthListeners = (client: TypedClient) => {
  if (!isBrowser || authListenersRegistered) {
    return;
  }

  authListenersRegistered = true;

  void client.auth.getSession().then(({ data: { session } }) => {
    syncSessionCookies(session);
  });

  client.auth.onAuthStateChange((_event, session) => {
    syncSessionCookies(session);
  });
};

export const getSupabaseBrowserClient = (): TypedClient => {
  if (!browserClient) {
    browserClient = createBrowserClient();
    registerAuthListeners(browserClient);
  }

  return browserClient;
};

export const clearSupabaseAuthCookies = () => {
  removeCookie(STORAGE_KEY);
  removeCookie(ACCESS_TOKEN_COOKIE);
  removeCookie(REFRESH_TOKEN_COOKIE);
  removeCookie(EXPIRES_AT_COOKIE);
};

export interface SupabaseServerClientOptions {
  accessToken?: string;
  fetch?: typeof fetch;
  headers?: Record<string, string>;
}

export const createSupabaseServerClient = (
  options: SupabaseServerClientOptions = {}
): TypedClient => {
  const { accessToken, fetch: customFetch, headers } = options;

  const globalHeaders =
    accessToken || headers
      ? {
          ...(headers ?? {}),
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        }
      : undefined;

  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: Boolean(accessToken),
      detectSessionInUrl: false,
    },
    global: {
      ...(globalHeaders ? { headers: globalHeaders } : {}),
      ...(customFetch ? { fetch: customFetch } : {}),
    },
  });
};

const getServiceRoleKey = () => {
  if (isBrowser) {
    throw new Error('Service role key is only available on the server.');
  }

  const key =
    serverEnv.SUPABASE_SERVICE_ROLE_KEY ??
    serverEnv.SUPABASE_SERVICE_KEY ??
    serverEnv.SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set.');
  }

  return key;
};

export const createSupabaseServiceRoleClient = (): TypedClient => {
  const serviceRoleKey = getServiceRoleKey();

  return createClient<Database>(SUPABASE_URL, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};

export type { Database };
export type { TypedClient as SupabaseClientType };
