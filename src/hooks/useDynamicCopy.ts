import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { fetchLocalizedCopy, type LocalizedCopy } from '@/lib/data/supabase';

export const useDynamicCopy = () => {
  const { i18n } = useTranslation();

  const query = useQuery<LocalizedCopy | null>({
    queryKey: ['site-settings', 'localized-copy'],
    queryFn: fetchLocalizedCopy,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!query.data) {
      return;
    }

    for (const [locale, bundle] of Object.entries(query.data)) {
      if (bundle && typeof bundle === 'object') {
        i18n.addResourceBundle(locale, 'translation', bundle, true, true);
      }
    }
  }, [i18n, query.data]);

  return query;
};

export default useDynamicCopy;
