import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
  { code: 'es', label: 'ES' },
  { code: 'fr', label: 'FR' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <div className="flex space-x-2">
      {languages.map((lng) => (
        <button
          key={lng.code}
          onClick={() => i18n.changeLanguage(lng.code)}
          className={`text-sm font-medium hover:text-brand-blue transition-colors ease-in-out duration-300 ${
            i18n.language === lng.code ? 'text-brand-blue' : 'text-neutral-700'
          }`}
        >
          {lng.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
