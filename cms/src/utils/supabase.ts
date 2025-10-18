import { Pool } from 'pg';

type LocalizedValue = string | Record<string, unknown> | null | undefined;

const DEFAULT_LOCALES = ['pt-BR', 'en'];

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const pickLocalizedValue = (value: LocalizedValue): string | null => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === 'object') {
    for (const locale of DEFAULT_LOCALES) {
      const localized = (value as Record<string, unknown>)[locale];
      if (typeof localized === 'string' && localized.trim().length > 0) {
        return localized.trim();
      }
    }

    for (const localized of Object.values(value)) {
      if (typeof localized === 'string' && localized.trim().length > 0) {
        return localized.trim();
      }
    }
  }

  return null;
};

export const resolveLocalizedText = (value: LocalizedValue, fallback = ''): string => {
  return pickLocalizedValue(value) ?? fallback;
};

export const resolveNullableLocalizedText = (
  value: LocalizedValue,
  fallback: string | null = null
): string | null => {
  const resolved = pickLocalizedValue(value);
  if (resolved && resolved.length > 0) {
    return resolved;
  }

  if (typeof fallback === 'string' && fallback.length > 0) {
    return fallback;
  }

  return null;
};

type ArrayValue =
  | Array<string | number | boolean | Record<string, unknown> | null | undefined>
  | null
  | undefined;

export const resolveStringArray = (value: ArrayValue, key = 'content'): string[] => {
  if (!value) {
    return [];
  }

  const seen = new Set<string>();
  const output: string[] = [];

  const pushValue = (candidate: string | null) => {
    if (!candidate) {
      return;
    }
    const trimmed = candidate.trim();
    if (!trimmed || seen.has(trimmed)) {
      return;
    }
    seen.add(trimmed);
    output.push(trimmed);
  };

  for (const entry of value) {
    if (typeof entry === 'string') {
      pushValue(entry);
      continue;
    }

    if (typeof entry === 'number' || typeof entry === 'boolean') {
      pushValue(String(entry));
      continue;
    }

    if (entry && typeof entry === 'object') {
      const record = entry as Record<string, unknown>;
      const localizedCandidate = record[key];
      pushValue(resolveNullableLocalizedText(localizedCandidate as LocalizedValue));
      continue;
    }
  }

  return output;
};
