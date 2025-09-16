import { createClient, type Session } from '@supabase/supabase-js';
import type { Database } from './supabase/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const isBrowser = typeof window !== 'undefined';
const DEFAULT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

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

  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Expires=${expires.toUTCString()}; Max-Age=${maxAge}; SameSite=Lax${secure ? '; Secure' : ''}`;
};

const removeCookie = (name: string) => {
  if (!isBrowser) return;
  const secure = window.location.protocol === 'https:';
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; SameSite=Lax${secure ? '; Secure' : ''}`;
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

const STORAGE_KEY = 'sb-monynha-auth';
const ACCESS_TOKEN_COOKIE = 'sb-monynha-access-token';
const REFRESH_TOKEN_COOKIE = 'sb-monynha-refresh-token';
const EXPIRES_AT_COOKIE = 'sb-monynha-session-exp';

const cookieStorage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = {
  getItem: (key) => getCookie(key),
  setItem: (key, value) => {
    const expires = parseSessionExpiry(value);
    setCookie(key, value, { expires });
  },
  removeItem: (key) => removeCookie(key),
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
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

if (isBrowser) {
  void supabase.auth.getSession().then(({ data: { session } }) => {
    syncSessionCookies(session);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    syncSessionCookies(session);
  });
}

export const clearSupabaseAuthCookies = () => {
  removeCookie(STORAGE_KEY);
  removeCookie(ACCESS_TOKEN_COOKIE);
  removeCookie(REFRESH_TOKEN_COOKIE);
  removeCookie(EXPIRES_AT_COOKIE);
};
