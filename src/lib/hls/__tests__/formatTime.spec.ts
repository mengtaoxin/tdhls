import { describe, expect, it } from 'vitest';

import { formatTime } from '@/lib/hls/formatTime';

describe('formatTime', () => {
  it.each([
    [0, '0:00'],
    [5.9, '0:05'],
    [65, '1:05'],
    [3599, '59:59'],
    [3600, '1:00:00'],
    [3725, '1:02:05'],
  ])('formats %d seconds as %s', (sec, expected) => {
    expect(formatTime(sec)).toBe(expected);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1])('returns a placeholder for %d', (sec) => {
    expect(formatTime(sec)).toBe('--:--');
  });
});
