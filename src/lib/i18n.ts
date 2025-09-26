const FALLBACK_LOCALE = 'en-US';

const LOCALE_FALLBACKS: Record<string, string> = {
  en: 'en-US',
  pt: 'pt-BR',
  es: 'es-ES',
  fr: 'fr-FR',
};

const sanitizeLocale = (language: string) =>
  language.replace('_', '-').split('@')[0].split('.')[0].trim();

export const getNormalizedLocale = (language: string | undefined | null) => {
  if (!language) {
    return FALLBACK_LOCALE;
  }

  const sanitized = sanitizeLocale(language);

  try {
    const [canonical] = Intl.getCanonicalLocales(sanitized);
    if (canonical) {
      return canonical;
    }
  } catch (error) {
    console.warn('Failed to canonicalize locale, falling back', {
      language,
      sanitized,
      error,
    });
  }

  const [base] = sanitized.split('-');
  if (base) {
    const mapped = LOCALE_FALLBACKS[base];
    if (mapped) {
      return mapped;
    }
  }

  return LOCALE_FALLBACKS.en ?? FALLBACK_LOCALE;
};
