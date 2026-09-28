import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, LOCALE_KEY, resolveLocale, writeStoredLocale } from '@/lib/locale';

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
}

describe('resolveLocale', () => {
  it('defaults to English when nothing is stored', () => {
    expect(resolveLocale(memoryStorage())).toBe(DEFAULT_LOCALE);
  });

  it('returns a stored supported locale', () => {
    expect(resolveLocale(memoryStorage({ [LOCALE_KEY]: ' zh ' }))).toBe('zh');
  });

  it('falls back to English for an unsupported value', () => {
    expect(resolveLocale(memoryStorage({ [LOCALE_KEY]: 'fr' }))).toBe(DEFAULT_LOCALE);
  });
});

describe('writeStoredLocale', () => {
  it('stores supported locales and ignores others', () => {
    const storage = memoryStorage();
    writeStoredLocale('fr', storage);
    expect(storage.getItem(LOCALE_KEY)).toBeNull();
    writeStoredLocale('zh', storage);
    expect(storage.getItem(LOCALE_KEY)).toBe('zh');
  });
});
