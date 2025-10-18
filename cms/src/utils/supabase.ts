import { Pool } from 'pg';

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const LOCALES = ['pt-BR', 'en'];

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const resolveLocalizedString = (value: unknown, fallback = ''): string => {
  if (isNonEmptyString(value)) {
    return value.trim();
  }

  if (value && typeof value === 'object') {
    for (const locale of LOCALES) {
      const localizedValue = (value as Record<string, unknown>)[locale];
      if (isNonEmptyString(localizedValue)) {
        return localizedValue.trim();
      }
    }

    const firstString = Object.values(value).find(isNonEmptyString);
    if (firstString) {
      return firstString.trim();
    }
  }

  return fallback;
};

export const resolveLocalizedNullableString = (value: unknown): string | null => {
  const resolved = resolveLocalizedString(value, '').trim();
  return resolved.length > 0 ? resolved : null;
};

export const resolveLocalizedStringArray = (value: unknown): string[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item && typeof item === 'object' && 'text' in (item as Record<string, unknown>)) {
          return resolveLocalizedNullableString(
            (item as Record<string, unknown>).text
          );
        }
        return resolveLocalizedNullableString(item);
      })
      .filter((item): item is string => Boolean(item));
  }

  if (typeof value === 'object') {
    const records = Object.values(value);
    if (records.every((item) => Array.isArray(item))) {
      const merged = new Set<string>();
      for (const arrayItem of records as unknown[]) {
        for (const entry of arrayItem as unknown[]) {
          const resolved = resolveLocalizedNullableString(entry);
          if (resolved) {
            merged.add(resolved);
          }
        }
      }
      return Array.from(merged);
    }
  }

  const single = resolveLocalizedNullableString(value);
  return single ? [single] : [];
};

export const extractMediaUrl = (value: unknown): string | null => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value.startsWith('http://') || value.startsWith('https://') ? value : null;
  }

  if (typeof value === 'object') {
    const record = value as { url?: unknown };
    if (isNonEmptyString(record.url)) {
      return record.url;
    }
  }

  return null;
};
