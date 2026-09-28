import { describe, expect, it } from 'vitest';

import {
  DEFAULT_LIVE_DELAY,
  DEFAULT_VOLUME,
  LIVE_DELAY_KEY,
  MUTED_KEY,
  VOLUME_KEY,
  resolvePlayerPrefs,
  writeLiveDelay,
  writeMuted,
  writeVolume,
} from '@/lib/hls/playerPrefs';

describe('playerPrefs', () => {
  it('returns defaults when storage is empty', () => {
    expect(resolvePlayerPrefs()).toEqual({
      liveDelaySec: DEFAULT_LIVE_DELAY,
      volume: DEFAULT_VOLUME,
      muted: false,
    });
    expect(DEFAULT_LIVE_DELAY).toBe(60);
  });

  it('falls back to defaults for invalid stored values', () => {
    localStorage.setItem(LIVE_DELAY_KEY, '45');
    localStorage.setItem(VOLUME_KEY, 'loud');
    localStorage.setItem(MUTED_KEY, 'maybe');

    expect(resolvePlayerPrefs()).toEqual({
      liveDelaySec: DEFAULT_LIVE_DELAY,
      volume: DEFAULT_VOLUME,
      muted: false,
    });
  });

  it('clamps stored volume to 0..1', () => {
    localStorage.setItem(VOLUME_KEY, '1.7');
    expect(resolvePlayerPrefs().volume).toBe(1);
    localStorage.setItem(VOLUME_KEY, '-0.2');
    expect(resolvePlayerPrefs().volume).toBe(0);
  });

  it('round-trips written values', () => {
    writeLiveDelay(10);
    writeVolume(0.35);
    writeMuted(true);

    expect(resolvePlayerPrefs()).toEqual({ liveDelaySec: 10, volume: 0.35, muted: true });
  });

  it('ignores writes of unsupported delays and clamps written volume', () => {
    writeLiveDelay(30);
    writeLiveDelay(45);
    writeVolume(2);

    expect(localStorage.getItem(LIVE_DELAY_KEY)).toBe('30');
    expect(localStorage.getItem(VOLUME_KEY)).toBe('1');
  });
});
