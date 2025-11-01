/**
 * Common React Query configuration options used across the application.
 * Centralizes query behavior to ensure consistency.
 */

/**
 * Standard query options for data that doesn't change frequently.
 * - staleTime: 10 minutes - data stays fresh for this duration
 * - retry: 1 - only retry failed queries once
 * - refetchOnWindowFocus: false - don't refetch when window regains focus
 */
export const LONG_STALE_QUERY_OPTIONS = {
  staleTime: 1000 * 60 * 10, // 10 minutes
  retry: 1,
  refetchOnWindowFocus: false,
} as const;
