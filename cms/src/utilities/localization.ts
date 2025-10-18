/* eslint-disable @typescript-eslint/no-explicit-any */
const LOCALE_PRIORITIES = ['pt-BR', 'en'];

export const resolveLocalizedText = (value: any, fallback = ''): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object') {
    for (const locale of LOCALE_PRIORITIES) {
      const localizedValue = value?.[locale];
      if (typeof localizedValue === 'string' && localizedValue.trim().length > 0) {
        return localizedValue;
      }
    }

    const firstValue = Object.values(value).find(
      (entry) => typeof entry === 'string' && entry.trim().length > 0
    );

    if (typeof firstValue === 'string') {
      return firstValue;
    }
  }

  return fallback;
};

export const resolveOptionalLocalizedText = (value: any): string | null => {
  const resolved = resolveLocalizedText(value, '').trim();
  return resolved.length > 0 ? resolved : null;
};
