import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
  { code: 'es', label: 'ES' },
  { code: 'fr', label: 'FR' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <div className="inline-flex items-center rounded-full border border-brand-purple/15 bg-white/80 p-1 text-xs shadow-[0_12px_32px_-20px_rgba(91,44,111,0.4)] backdrop-blur-sm transition-colors dark:border-neutral-700/60 dark:bg-neutral-900/70">
      {languages.map((lng) => {
        const isActive = i18n.language === lng.code;

        return (
          <button
            key={lng.code}
            type="button"
            aria-current={isActive ? 'true' : undefined}
            onClick={() => i18n.changeLanguage(lng.code)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900',
              isActive
                ? 'bg-gradient-brand text-white shadow-soft'
                : 'text-neutral-600 hover:text-brand-purple dark:text-neutral-300'
            )}
          >
            {lng.label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
