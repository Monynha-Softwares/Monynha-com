import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getNormalizedLocale } from '@/lib/i18n';

type DateStyle = 'short' | 'medium' | 'long' | 'full';
type TimeStyle = 'short' | 'medium' | 'long' | 'full';

interface DateFormatterOptions {
  dateStyle?: DateStyle;
  timeStyle?: TimeStyle;
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
}

interface UseLocalizedDateFormatterReturn {
  formatDate: (date: string | Date | null | undefined) => string;
  dateFormatter: Intl.DateTimeFormat;
}

/**
 * Custom hook for localized date formatting with automatic fallback
 * @param options - Intl.DateTimeFormat options
 * @param fallbackOptions - Fallback options if normalized locale fails (defaults to en-US with same options)
 * @returns Object containing formatDate function and dateFormatter instance
 */
export const useLocalizedDateFormatter = (
  options: DateFormatterOptions = { dateStyle: 'medium' },
  fallbackOptions?: DateFormatterOptions
): UseLocalizedDateFormatterReturn => {
  const { i18n } = useTranslation();

  const normalizedLocale = useMemo(
    () => getNormalizedLocale(i18n.language),
    [i18n.language]
  );

  const fallbackDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', fallbackOptions ?? options),
    [fallbackOptions, options]
  );

  const dateFormatter = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(normalizedLocale, options);
    } catch (error) {
      console.error('Unsupported locale for date formatting', error);
      return fallbackDateFormatter;
    }
  }, [normalizedLocale, options, fallbackDateFormatter]);

  const formatDate = useCallback(
    (date: string | Date | null | undefined) => {
      if (!date) return '—';

      try {
        const dateObject = typeof date === 'string' ? new Date(date) : date;
        return dateFormatter.format(dateObject);
      } catch (error) {
        console.error('Error formatting date', error);
        try {
          const dateObject = typeof date === 'string' ? new Date(date) : date;
          return fallbackDateFormatter.format(dateObject);
        } catch {
          return '—';
        }
      }
    },
    [dateFormatter, fallbackDateFormatter]
  );

  return { formatDate, dateFormatter };
};
