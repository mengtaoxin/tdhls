import { describe, expect, it } from 'vitest';

import { parseStreamUrl } from '@/lib/hls/streamUrl';

describe('parseStreamUrl', () => {
  it.each([
    ['https://example.com/live/index.m3u8', 'https://example.com/live/index.m3u8'],
    ['  http://example.com/a.m3u8?token=1  ', 'http://example.com/a.m3u8?token=1'],
  ])('accepts http(s) URL %j', (raw, expected) => {
    expect(parseStreamUrl(raw)).toBe(expected);
  });

  it.each(['', '   ', 'ftp://example.com/a.m3u8', 'javascript:alert(1)', 'not a url', '/a.m3u8'])(
    'rejects %j',
    (raw) => {
      expect(parseStreamUrl(raw)).toBeNull();
    },
  );
});
