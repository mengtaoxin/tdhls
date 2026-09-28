import type { HlsConfig } from 'hls.js';

/**
 * hls.js only jumps to the live sync point inside the playlist window when playback is
 * more than `liveMaxLatencyDuration` behind the edge, so a huge value keeps a paused
 * position until it slides out of the window.
 */
const UNLIMITED_LATENCY_SEC = 24 * 60 * 60;

/**
 * Live segments that slide out of the playlist window before they are buffered are gone,
 * so a paused live stream keeps buffering far ahead to resume where it stopped. hls.js
 * lowers `maxMaxBufferLength` itself when the browser's buffer quota runs out.
 */
const LIVE_FORWARD_BUFFER_SEC = 30 * 60;

export const LIVE_BUFFER_CONFIG = {
  maxBufferLength: LIVE_FORWARD_BUFFER_SEC,
  maxMaxBufferLength: LIVE_FORWARD_BUFFER_SEC,
} as const satisfies Partial<HlsConfig>;

export function buildHlsConfig(delaySec: number): Partial<HlsConfig> {
  return {
    liveSyncDuration: delaySec,
    liveMaxLatencyDuration: UNLIMITED_LATENCY_SEC,
    maxLiveSyncPlaybackRate: 1,
    maxBufferLength: Math.max(30, delaySec),
    maxMaxBufferLength: Math.max(60, 2 * delaySec),
  };
}
