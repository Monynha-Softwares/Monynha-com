import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
import * as i18nextModule from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';

const i18n = i18nextModule.default ?? i18nextModule;

process.env.NODE_ENV = 'test';

beforeEach(() => {
  jest.clearAllMocks();
});

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
}

if (typeof window !== 'undefined') {
  const noop = () => {};
  window.scrollTo = noop;
  // @ts-expect-error jsdom global polyfill
  global.scrollTo = noop;
}

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}
