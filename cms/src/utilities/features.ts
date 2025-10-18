import type { LocalizedValue } from './localization';
import { getLocalizedRequiredString } from './localization';

type FeatureEntry =
  | string
  | {
      value?: LocalizedValue;
      label?: LocalizedValue;
      text?: LocalizedValue;
    }
  | null
  | undefined;

export const extractFeatureList = (value: FeatureEntry[] | null | undefined): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const features: string[] = [];

  for (const entry of value) {
    if (!entry) {
      continue;
    }

    if (typeof entry === 'string') {
      const normalized = entry.trim();
      if (normalized) {
        features.push(normalized);
      }
      continue;
    }

    const candidate =
      getLocalizedRequiredString(entry.value as LocalizedValue) ||
      getLocalizedRequiredString(entry.label as LocalizedValue) ||
      getLocalizedRequiredString(entry.text as LocalizedValue);

    const normalized = candidate.trim();
    if (normalized) {
      features.push(normalized);
    }
  }

  return Array.from(new Set(features));
};
