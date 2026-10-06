import { describe, expect, it } from 'vitest';

import {
  DEFAULT_LIVE_DELAY,
  LIVE_DELAY_KEY,
  MUTED_KEY,
  resolvePlayerPrefs,
  writeLiveDelay,
  writeMuted,
  writeUrlFunction,
} from '@/lib/hls/playerPrefs';
import { DEFAULT_URL_FUNCTION, URL_FUNCTION_KEY } from '@/lib/hls/urlFunction';

describe('playerPrefs', () => {
  it('returns defaults when storage is empty', () => {
    expect(resolvePlayerPrefs()).toEqual({
      liveDelaySec: DEFAULT_LIVE_DELAY,
      muted: false,
      urlFunction: DEFAULT_URL_FUNCTION,
    });
    expect(DEFAULT_LIVE_DELAY).toBe(60);
  });

  it('falls back to defaults for invalid stored values', () => {
    localStorage.setItem(LIVE_DELAY_KEY, '45');
    localStorage.setItem(MUTED_KEY, 'maybe');
    localStorage.setItem(URL_FUNCTION_KEY, '   ');

    expect(resolvePlayerPrefs()).toEqual({
      liveDelaySec: DEFAULT_LIVE_DELAY,
      muted: false,
      urlFunction: DEFAULT_URL_FUNCTION,
    });
  });

  it('round-trips written values', () => {
    writeLiveDelay(10);
    writeMuted(true);
    const customFunction = 'function (url) { return url + "?token=1"; }';
    writeUrlFunction(customFunction);

    expect(resolvePlayerPrefs()).toEqual({
      liveDelaySec: 10,
      muted: true,
      urlFunction: customFunction,
    });
  });

  it('ignores writes of unsupported delays', () => {
    writeLiveDelay(30);
    writeLiveDelay(45);

    expect(localStorage.getItem(LIVE_DELAY_KEY)).toBe('30');
  });

  it('keeps a syntactically broken stored source as-is', () => {
    localStorage.setItem(URL_FUNCTION_KEY, 'function (url) {');

    expect(resolvePlayerPrefs().urlFunction).toBe('function (url) {');
  });
});
