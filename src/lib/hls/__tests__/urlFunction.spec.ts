import { describe, expect, it } from 'vitest';

import {
  DEFAULT_URL_FUNCTION,
  applyUrlFunction,
  getUrlFunctionCompileError,
} from '@/lib/hls/urlFunction';

describe('urlFunction', () => {
  it('returns the input url unchanged with the default function', () => {
    const url = 'https://example.com/live/index.m3u8';

    expect(applyUrlFunction(DEFAULT_URL_FUNCTION, url)).toBe(url);
  });

  it('passes the input url to a custom function and uses its string result', () => {
    const source = 'function (url) { return url.replace("a.m3u8", "b.m3u8"); }';

    expect(applyUrlFunction(source, 'https://example.com/a.m3u8')).toBe(
      'https://example.com/b.m3u8',
    );
  });

  it('supports arrow function expressions', () => {
    const source = '(url) => `${url}?token=1`';

    expect(applyUrlFunction(source, 'https://example.com/a.m3u8')).toBe(
      'https://example.com/a.m3u8?token=1',
    );
  });

  it('falls back to the input url when the source has a syntax error', () => {
    const url = 'https://example.com/a.m3u8';

    expect(applyUrlFunction('function (url) {', url)).toBe(url);
  });

  it('falls back to the input url when the function throws', () => {
    const url = 'https://example.com/a.m3u8';

    expect(applyUrlFunction('function (url) { throw new Error("boom"); }', url)).toBe(url);
  });

  it('falls back to the input url when the function returns a non-string value', () => {
    const url = 'https://example.com/a.m3u8';

    expect(applyUrlFunction('function (url) { return 42; }', url)).toBe(url);
  });

  it('reports compile errors and null for valid sources', () => {
    expect(getUrlFunctionCompileError(DEFAULT_URL_FUNCTION)).toBeNull();
    expect(getUrlFunctionCompileError('function (url) {')).toBeTypeOf('string');
    expect(getUrlFunctionCompileError('"not a function"')).toBeTypeOf('string');
  });
});
