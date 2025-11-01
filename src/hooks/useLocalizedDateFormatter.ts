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

interface UseLocalizedDateFormatterOptions {
  /**
   * Intl.DateTimeFormat options for date formatting
   */
  dateOptions?: DateFormatterOptions;
  /**
   * Fallback options if normalized locale fails (defaults to en-US with same options)
   */
  fallbackOptions?: DateFormatterOptions;
  /**
   * String to return when date is null/undefined (defaults to '—')
   */
  nullFallback?: string;
}

interface UseLocalizedDateFormatterReturn {
  formatDate: (date: string | Date | null | undefined) => string;
  dateFormatter: Intl.DateTimeFormat;
}

/**
 * Helper function to convert date input to Date object
 */
const toDateObject = (date: string | Date): Date =>
  typeof date === 'string' ? new Date(date) : date;

/**
 * Custom hook for localized date formatting with automatic fallback
 * @param options - Configuration options for the date formatter
 * @returns Object containing formatDate function and dateFormatter instance
 */
export const useLocalizedDateFormatter = (
  options: UseLocalizedDateFormatterOptions = {}
): UseLocalizedDateFormatterReturn => {
  const {
    dateOptions = { dateStyle: 'medium' },
    fallbackOptions,
    nullFallback = '—',
  } = options;

  const { i18n } = useTranslation();

  const normalizedLocale = useMemo(
    () => getNormalizedLocale(i18n.language),
    [i18n.language]
  );

  const fallbackDateFormatter = useMemo(
    () => new Intl.DateTimeFormat('en-US', fallbackOptions ?? dateOptions),
    [fallbackOptions, dateOptions]
  );

  const dateFormatter = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(normalizedLocale, dateOptions);
    } catch (error) {
      console.error('Unsupported locale for date formatting', error);
      return fallbackDateFormatter;
    }
  }, [normalizedLocale, dateOptions, fallbackDateFormatter]);

  const formatDate = useCallback(
    (date: string | Date | null | undefined) => {
      if (!date) return nullFallback;

      try {
        const dateObject = toDateObject(date);
        return dateFormatter.format(dateObject);
      } catch (error) {
        console.error('Error formatting date', error);
        try {
          const dateObject = toDateObject(date);
          return fallbackDateFormatter.format(dateObject);
        } catch {
          return nullFallback;
        }
      }
    },
    [dateFormatter, fallbackDateFormatter, nullFallback]
  );

  return { formatDate, dateFormatter };
};
