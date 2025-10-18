export const SPA_PREVIEW_BASE =
  process.env.PAYLOAD_PUBLIC_SPA_PREVIEW_URL ?? 'http://localhost:5173';

const FALLBACK_NEXT_BASE =
  process.env.PAYLOAD_PUBLIC_PREVIEW_URL ?? SPA_PREVIEW_BASE;

export const NEXT_PREVIEW_BASE =
  process.env.PAYLOAD_PUBLIC_NEXT_PREVIEW_URL ?? FALLBACK_NEXT_BASE;

const buildPreviewURL = (base: string, path: string): string => {
  try {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return new URL(normalizedPath, base).toString();
  } catch {
    return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  }
};

export const buildSpaPreviewUrl = (path: string): string =>
  buildPreviewURL(SPA_PREVIEW_BASE, path);

export const buildNextPreviewUrl = (path: string): string =>
  buildPreviewURL(NEXT_PREVIEW_BASE, path);
