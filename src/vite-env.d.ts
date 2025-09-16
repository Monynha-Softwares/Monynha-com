/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly NEXT_PUBLIC_LIQUIDETHER_ENABLED?: string;
  readonly NEXT_PUBLIC_LIQUIDETHER_RESOLUTION?: string;
  readonly NEXT_PUBLIC_LIQUIDETHER_INTENSITY?: string;
  readonly VITE_LIQUIDETHER_ENABLED?: string;
  readonly VITE_LIQUIDETHER_RESOLUTION?: string;
  readonly VITE_LIQUIDETHER_INTENSITY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
