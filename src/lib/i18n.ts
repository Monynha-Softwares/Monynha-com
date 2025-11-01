export const getNormalizedLocale = (language: string | undefined | null) => {
  if (!language) {
    return 'en-US';
  }

  if (language.includes('-')) {
    return language;
  }

  switch (language) {
    case 'pt':
      return 'pt-BR';
    case 'en':
      return 'en-US';
    case 'es':
      return 'es-ES';
    case 'fr':
      return 'fr-FR';
    default:
      return language;
  }
};

/**
 * Creates a date formatter with fallback to en-US if the locale is not supported.
 * This utility centralizes date formatting logic used across the application.
 */
export const createDateFormatter = (
  locale: string,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat => {
  try {
    return new Intl.DateTimeFormat(locale, options);
  } catch (error) {
    console.error(`Unsupported locale "${locale}" for date formatting`, error);
    return new Intl.DateTimeFormat('en-US', options);
  }
};

