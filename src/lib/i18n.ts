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
 * Creates a date formatter with fallback handling
 * @param locale - The locale to use for formatting
 * @param options - Intl.DateTimeFormat options
 * @returns A DateTimeFormat instance with fallback to en-US on error
 */
export const createDateFormatter = (
  locale: string | undefined | null,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
): Intl.DateTimeFormat => {
  const normalizedLocale = getNormalizedLocale(locale);
  
  try {
    return new Intl.DateTimeFormat(normalizedLocale, options);
  } catch (error) {
    console.error(`Unsupported locale for date formatting: ${normalizedLocale}`, error);
    return new Intl.DateTimeFormat('en-US', options);
  }
};

/**
 * Formats a date string with fallback handling
 * @param dateString - The date string to format
 * @param formatter - The DateTimeFormat instance to use
 * @param fallbackFormatter - Optional fallback formatter
 * @returns Formatted date string or em-dash if invalid
 */
export const formatDate = (
  dateString: string | null | undefined,
  formatter: Intl.DateTimeFormat,
  fallbackFormatter?: Intl.DateTimeFormat
): string => {
  if (!dateString) return '—';

  try {
    return formatter.format(new Date(dateString));
  } catch (error) {
    console.error('Error formatting date', error);
    if (fallbackFormatter) {
      try {
        return fallbackFormatter.format(new Date(dateString));
      } catch {
        return '—';
      }
    }
    return '—';
  }
};
