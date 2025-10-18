export type LocalizedValue = string | { [locale: string]: string | null | undefined } | null | undefined;

const LOCALE_PRIORITY = ['pt-BR', 'en'];

export const getLocalizedRequiredString = (value: LocalizedValue): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object') {
    for (const locale of LOCALE_PRIORITY) {
      const localized = value[locale];
      if (typeof localized === 'string' && localized.trim().length > 0) {
        return localized;
      }
    }

    const fallback = Object.values(value).find(
      (entry): entry is string => typeof entry === 'string' && entry.trim().length > 0
    );
    if (fallback) {
      return fallback;
    }
  }

  return '';
};

export const getLocalizedOptionalString = (value: LocalizedValue): string | null => {
  const result = getLocalizedRequiredString(value);
  return result.trim().length > 0 ? result : null;
};
