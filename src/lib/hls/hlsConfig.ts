import type { HlsConfig } from 'hls.js';

/**
 * hls.js only jumps to the live sync point inside the playlist window when playback is
 * more than `liveMaxLatencyDuration` behind the edge, so a huge value keeps a paused
 * position until it slides out of the window.
 */
const UNLIMITED_LATENCY_SEC = 24 * 60 * 60;

export function buildHlsConfig(delaySec: number): Partial<HlsConfig> {
  return {
    liveSyncDuration: delaySec,
    liveMaxLatencyDuration: UNLIMITED_LATENCY_SEC,
    maxLiveSyncPlaybackRate: 1,
    maxBufferLength: Math.max(30, delaySec),
    maxMaxBufferLength: Math.max(60, 2 * delaySec),
  };
}
