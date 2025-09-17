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
