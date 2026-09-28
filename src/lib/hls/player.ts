import { buildHlsConfig } from '@/lib/hls/hlsConfig';
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

/** Tracks live state and resyncs a live stream whose paused position fell out of the window. */
function createLiveTracker(
  video: HTMLVideoElement,
  options: AttachOptions,
  liveSyncTarget: () => number | null,
) {
  let live = false;

  const seekToLiveSync = () => {
    const target = liveSyncTarget();
    if (target != null) video.currentTime = target;
  };

  const onPlay = () => {
    if (!live) return;
    const range = seekableRange(video);
    if (range && video.currentTime < range.start) seekToLiveSync();
  };
  video.addEventListener('play', onPlay);

  return {
    isLive: () => live,
    setLive(next: boolean) {
      if (next === live) return;
      live = next;
      options.onLiveChange(next);
    },
    seekToLiveSync,
    dispose: () => video.removeEventListener('play', onPlay),
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
    onLive: (live) => tracker.setLive(live),
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
    getLatency: () => (tracker.isLive() ? hls.latency : null),
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
      return tracker.isLive() && range ? range.end - video.currentTime : null;
    },
    seekToLiveSync: tracker.seekToLiveSync,
  };
}
