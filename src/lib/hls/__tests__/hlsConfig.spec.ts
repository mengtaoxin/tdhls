import { describe, expect, it } from 'vitest';

import { buildHlsConfig } from '@/lib/hls/hlsConfig';

describe('buildHlsConfig', () => {
  it.each([
    [10, { maxBufferLength: 30, maxMaxBufferLength: 60 }],
    [30, { maxBufferLength: 30, maxMaxBufferLength: 60 }],
    [60, { maxBufferLength: 60, maxMaxBufferLength: 120 }],
  ])('keeps a %ds delay behind the live edge with a matching buffer', (delay, buffer) => {
    const config = buildHlsConfig(delay);

    expect(config.liveSyncDuration).toBe(delay);
    expect(config.maxBufferLength).toBe(buffer.maxBufferLength);
    expect(config.maxMaxBufferLength).toBe(buffer.maxMaxBufferLength);
  });

  it('never jumps forward on its own while paused inside the live window', () => {
    const config = buildHlsConfig(60);

    expect(config.liveMaxLatencyDuration).toBeGreaterThanOrEqual(24 * 60 * 60);
  });

  it('never speeds playback up to catch up with the target delay', () => {
    expect(buildHlsConfig(60).maxLiveSyncPlaybackRate).toBe(1);
  });
});
