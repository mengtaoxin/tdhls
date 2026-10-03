import { describe, expect, it } from 'vitest';

import {
  DEFAULT_LIVE_DELAY,
  LIVE_DELAY_KEY,
  MUTED_KEY,
  resolvePlayerPrefs,
  writeLiveDelay,
  writeMuted,
} from '@/lib/hls/playerPrefs';

describe('playerPrefs', () => {
  it('returns defaults when storage is empty', () => {
    expect(resolvePlayerPrefs()).toEqual({
      liveDelaySec: DEFAULT_LIVE_DELAY,
      muted: false,
    });
    expect(DEFAULT_LIVE_DELAY).toBe(60);
  });

  it('falls back to defaults for invalid stored values', () => {
    localStorage.setItem(LIVE_DELAY_KEY, '45');
    localStorage.setItem(MUTED_KEY, 'maybe');

    expect(resolvePlayerPrefs()).toEqual({
      liveDelaySec: DEFAULT_LIVE_DELAY,
      muted: false,
    });
  });

  it('round-trips written values', () => {
    writeLiveDelay(10);
    writeMuted(true);

    expect(resolvePlayerPrefs()).toEqual({ liveDelaySec: 10, muted: true });
  });

  it('ignores writes of unsupported delays', () => {
    writeLiveDelay(30);
    writeLiveDelay(45);

    expect(localStorage.getItem(LIVE_DELAY_KEY)).toBe('30');
  });
});
