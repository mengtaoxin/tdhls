import { create } from 'zustand';

import i18n from '@/i18n';
import { resolveLocale, writeStoredLocale, type AppLocale } from '@/lib/locale';

type LocaleState = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
};

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: resolveLocale(),

  setLocale(locale: AppLocale) {
    writeStoredLocale(locale);
    void i18n.changeLanguage(locale);
    set({ locale });
  },
}));
