import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach } from 'vitest';

import i18n from '@/i18n';
import { resolvePlayerPrefs } from '@/lib/hls/playerPrefs';
import { DEFAULT_LOCALE } from '@/lib/locale';
import { useLocaleStore } from '@/stores/locale';
import { usePlayerPrefsStore } from '@/stores/playerPrefs';

afterEach(() => {
  cleanup();
});

beforeEach(async () => {
  localStorage.clear();
  await i18n.changeLanguage(DEFAULT_LOCALE);
  useLocaleStore.setState({ locale: DEFAULT_LOCALE });
  usePlayerPrefsStore.setState(resolvePlayerPrefs());
});

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});
