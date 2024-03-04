import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import z from 'zod';
import { zodI18nMap } from 'zod-i18n-map';
import enZod from './locales/en/zod.json';
import en from './locales/en/en.json';

const resources = {
  en: {
    translation: en,
    zod: enZod,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  keySeparator: '.',
  interpolation: {
    escapeValue: false,
  },
});

z.setErrorMap(zodI18nMap);

export default i18n;
