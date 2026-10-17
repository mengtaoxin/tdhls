import { buildHlsConfig, LIVE_BUFFER_CONFIG } from '@/lib/hls/hlsConfig';
import { hlsJsEngine, type HlsEngine } from '@/lib/hls/hlsEngine';

export type PlayerErrorKind = 'network' | 'media' | 'unsupported';

export type AttachOptions = {
  liveDelaySec: number;
  onError: (kind: PlayerErrorKind) => void;
  onLiveChange: (live: boolean) => void;
};

export type PlayerHandle = {
  destroy: () => void;
  /** Seconds behind the live edge, or null for VOD / unknown. */
  getLatency: () => number | null;
  /** Seeks back to the configured delay behind the live edge. */
  seekToLiveSync: () => void;
};

const HLS_MIME = 'application/vnd.apple.mpegurl';
const MEDIA_ERR_NETWORK = 2;
/** Ignore tiny decoder nudges; larger forward seeks are treated as catch-up. */
const FORWARD_SEEK_TOLERANCE_SEC = 0.5;

type SeekRange = { start: number; end: number };

function seekableRange(video: HTMLVideoElement): SeekRange | null {
  const { seekable } = video;
  if (seekable.length === 0) return null;
  return { start: seekable.start(0), end: seekable.end(seekable.length - 1) };
}

function delayedLivePoint(video: HTMLVideoElement, delaySec: number): number | null {
  const range = seekableRange(video);
  return range ? Math.max(range.start, range.end - delaySec) : null;
}

function isBuffered(video: HTMLVideoElement, time: number): boolean {
  const { buffered } = video;
  for (let i = 0; i < buffered.length; i++) {
    if (time >= buffered.start(i) && time < buffered.end(i)) return true;
  }
  return false;
}

export function attachStream(
  video: HTMLVideoElement,
  url: string,
  options: AttachOptions,
  engine: HlsEngine = hlsJsEngine,
): PlayerHandle {
  if (engine.isSupported()) return attachWithHlsJs(video, url, options, engine);
  if (video.canPlayType(HLS_MIME)) return attachNative(video, url, options);
  options.onError('unsupported');
  return { destroy: () => {}, getLatency: () => null, seekToLiveSync: () => {} };
}

/**
 * Tracks live state, blocks unintended forward seeks toward the live edge, and
 * resyncs only when a paused position is no longer playable.
 */
function createLiveTracker(
  video: HTMLVideoElement,
  options: AttachOptions,
  liveSyncTarget: () => number | null,
) {
  let live = false;
  let allowForwardSeek = false;
  let reverting = false;
  let lastTime: number | null = null;
  let latencyFloor: number | null = null;

  const seekToLiveSync = () => {
    const target = liveSyncTarget();
    if (target == null) return;
    allowForwardSeek = true;
    latencyFloor = null;
    try {
      video.currentTime = target;
    } finally {
      allowForwardSeek = false;
    }
  };

  const onPlay = () => {
    if (!live) return;
    const { currentTime } = video;
    const range = seekableRange(video);
    if (range && currentTime < range.start && !isBuffered(video, currentTime)) seekToLiveSync();
  };

  const onTimeUpdate = () => {
    if (!live || video.seeking || reverting) return;
    const { currentTime } = video;
    if (lastTime == null || (currentTime >= lastTime && currentTime - lastTime < 2)) {
      lastTime = currentTime;
    }
  };

  const onSeeking = () => {
    if (!live || allowForwardSeek || reverting) {
      lastTime = video.currentTime;
      return;
    }
    if (lastTime == null) {
      lastTime = video.currentTime;
      return;
    }

    const target = video.currentTime;
    if (target <= lastTime + FORWARD_SEEK_TOLERANCE_SEC) {
      lastTime = target;
      return;
    }

    // Expired pause: position left the playlist window and is no longer buffered.
    const range = seekableRange(video);
    if (range && lastTime < range.start && !isBuffered(video, lastTime)) {
      lastTime = target;
      latencyFloor = null;
      return;
    }

    reverting = true;
    video.currentTime = lastTime;
    reverting = false;
  };

  video.addEventListener('play', onPlay);
  video.addEventListener('timeupdate', onTimeUpdate);
  video.addEventListener('seeking', onSeeking);

  return {
    isLive: () => live,
    setLive(next: boolean) {
      if (next === live) return;
      live = next;
      if (!next) {
        lastTime = null;
        latencyFloor = null;
      }
      options.onLiveChange(next);
    },
    seekToLiveSync,
    /** Hold the highest observed latency until the user seeks back to live. */
    holdLatency(measured: number | null): number | null {
      if (measured == null) {
        latencyFloor = null;
        return null;
      }
      latencyFloor = latencyFloor == null ? measured : Math.max(latencyFloor, measured);
      return latencyFloor;
    },
    dispose: () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('seeking', onSeeking);
    },
  };
}

function attachWithHlsJs(
  video: HTMLVideoElement,
  url: string,
  options: AttachOptions,
  engine: HlsEngine,
): PlayerHandle {
  let recoveredMediaError = false;

  const hls = engine.create(buildHlsConfig(options.liveDelaySec), {
    onLive(live) {
      if (live && !tracker.isLive()) hls.updateConfig(LIVE_BUFFER_CONFIG);
      tracker.setLive(live);
    },
    onFatalError(type) {
      if (type === 'media' && !recoveredMediaError) {
        recoveredMediaError = true;
        hls.recoverMediaError();
        return;
      }
      options.onError(type === 'network' ? 'network' : 'media');
    },
  });

  const tracker = createLiveTracker(
    video,
    options,
    () => hls.liveSyncPosition ?? delayedLivePoint(video, options.liveDelaySec),
  );

  hls.load(url, video);

  return {
    destroy() {
      tracker.dispose();
      hls.destroy();
    },
    getLatency: () => (tracker.isLive() ? tracker.holdLatency(hls.latency) : null),
    seekToLiveSync: tracker.seekToLiveSync,
  };
}

function attachNative(video: HTMLVideoElement, url: string, options: AttachOptions): PlayerHandle {
  const tracker = createLiveTracker(video, options, () =>
    delayedLivePoint(video, options.liveDelaySec),
  );

  const onLoadedMetadata = () => {
    const live = video.duration === Number.POSITIVE_INFINITY;
    tracker.setLive(live);
    if (live) tracker.seekToLiveSync();
  };
  const onError = () => {
    options.onError(video.error?.code === MEDIA_ERR_NETWORK ? 'network' : 'media');
  };

  video.addEventListener('loadedmetadata', onLoadedMetadata);
  video.addEventListener('error', onError);
  video.src = url;

  return {
    destroy() {
      tracker.dispose();
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('error', onError);
      video.removeAttribute('src');
      video.load();
    },
    getLatency() {
      const range = seekableRange(video);
      const measured = tracker.isLive() && range ? range.end - video.currentTime : null;
      return tracker.holdLatency(measured);
    },
    seekToLiveSync: tracker.seekToLiveSync,
  };
}
