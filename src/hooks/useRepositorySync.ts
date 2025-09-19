import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase';

interface UseRepositorySyncOptions {
  enabled?: boolean;
  intervalMs?: number;
}

const parseInterval = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  return fallback;
};

const DEFAULT_INTERVAL = 1000 * 60 * 60 * 6; // 6 hours

export const useRepositorySync = (options: UseRepositorySyncOptions = {}) => {
  const { enabled = true, intervalMs } = options;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const resolvedInterval =
      intervalMs ??
      parseInterval(
        import.meta.env.VITE_REPOSITORY_SYNC_INTERVAL_MS as string | undefined,
        DEFAULT_INTERVAL
      );

    if (resolvedInterval <= 0) {
      return;
    }

    let isMounted = true;
    let timeoutId: number | undefined;

    const runSync = async () => {
      try {
        const { error } = await supabase.functions.invoke(
          'sync-github-repositories'
        );

        if (error) {
          console.error('Failed to sync repositories', error);
          return;
        }

        if (!isMounted) {
          return;
        }

        await queryClient.invalidateQueries({ queryKey: ['repositories'] });
      } catch (error) {
        console.error('Failed to sync repositories', error);
      } finally {
        if (isMounted) {
          timeoutId = window.setTimeout(runSync, resolvedInterval);
        }
      }
    };

    runSync();

    return () => {
      isMounted = false;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [enabled, intervalMs, queryClient]);
};

export default useRepositorySync;
