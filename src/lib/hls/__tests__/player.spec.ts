import { describe, expect, it, vi } from 'vitest';
import type { HlsConfig } from 'hls.js';

import type { HlsEngine, HlsEngineEvents, HlsInstance } from '@/lib/hls/hlsEngine';
import { attachStream, type AttachOptions } from '@/lib/hls/player';

type Ranges = Array<[number, number]>;

function timeRanges(ranges: Ranges) {
  return {
    length: ranges.length,
    start: (i: number) => ranges[i]![0],
    end: (i: number) => ranges[i]![1],
  };
}

class FakeVideo extends EventTarget {
  currentTime = 0;
  duration = Number.NaN;
  src = '';
  error: { code: number } | null = null;
  ranges: Ranges = [];
  bufferedRanges: Ranges = [];
  canPlayType = vi.fn(() => '');
  load = vi.fn();

  get seekable() {
    return timeRanges(this.ranges);
  }

  get buffered() {
    return timeRanges(this.bufferedRanges);
  }

  removeAttribute(name: string) {
    if (name === 'src') this.src = '';
  }

  emit(type: string) {
    this.dispatchEvent(new Event(type));
  }
}

type FakeHls = HlsInstance & {
  config: Partial<HlsConfig>;
  events: HlsEngineEvents;
  loaded: { url: string; media: unknown } | null;
  latency: number;
  liveSyncPosition: number | null;
};

function createFakeEngine(supported = true) {
  const instances: FakeHls[] = [];
  const engine: HlsEngine = {
    isSupported: () => supported,
    create(config, events) {
      const instance: FakeHls = {
        config,
        events,
        loaded: null,
        latency: 0,
        liveSyncPosition: null,
        load(url, media) {
          instance.loaded = { url, media };
        },
        updateConfig(patch) {
          Object.assign(instance.config, patch);
        },
        recoverMediaError: vi.fn(),
        destroy: vi.fn(),
      };
      instances.push(instance);
      return instance;
    },
  };
  return { engine, instances };
}

function setup({ supported = true, delay = 60 } = {}) {
  const video = new FakeVideo();
  const { engine, instances } = createFakeEngine(supported);
  const options: AttachOptions = {
    liveDelaySec: delay,
    onError: vi.fn(),
    onLiveChange: vi.fn(),
  };
  const handle = attachStream(
    video as unknown as HTMLVideoElement,
    'https://example.com/live.m3u8',
    options,
    engine,
  );
  return { video, instances, options, handle };
}

describe('attachStream with hls.js', () => {
  it('loads the stream with a config that keeps the chosen delay', () => {
    const { video, instances } = setup({ delay: 30 });

    expect(instances).toHaveLength(1);
    expect(instances[0]!.config.liveSyncDuration).toBe(30);
    expect(instances[0]!.loaded).toEqual({ url: 'https://example.com/live.m3u8', media: video });
  });

  it('reports live changes from level updates', () => {
    const { instances, options } = setup();

    instances[0]!.events.onLive(true);

    expect(options.onLiveChange).toHaveBeenCalledWith(true);
  });

  it('recovers once from a fatal media error, then reports the next one', () => {
    const { instances, options } = setup();
    const hls = instances[0]!;

    hls.events.onFatalError('media');
    expect(hls.recoverMediaError).toHaveBeenCalledTimes(1);
    expect(options.onError).not.toHaveBeenCalled();

    hls.events.onFatalError('media');
    expect(hls.recoverMediaError).toHaveBeenCalledTimes(1);
    expect(options.onError).toHaveBeenCalledWith('media');
  });

  it('reports fatal network errors without recovery', () => {
    const { instances, options } = setup();

    instances[0]!.events.onFatalError('network');

    expect(instances[0]!.recoverMediaError).not.toHaveBeenCalled();
    expect(options.onError).toHaveBeenCalledWith('network');
  });

  it('resumes a paused live stream in place while the position is still in the window', () => {
    const { video, instances } = setup();
    const hls = instances[0]!;
    hls.events.onLive(true);
    hls.liveSyncPosition = 940;
    video.ranges = [[900, 1000]];
    video.currentTime = 910;

    video.emit('play');

    expect(video.currentTime).toBe(910);
  });

  it('resumes a paused live stream in place after it left the window while still buffered', () => {
    const { video, instances } = setup();
    const hls = instances[0]!;
    hls.events.onLive(true);
    hls.liveSyncPosition = 940;
    video.ranges = [[900, 1000]];
    video.bufferedRanges = [[800, 990]];
    video.currentTime = 850;

    video.emit('play');

    expect(video.currentTime).toBe(850);
  });

  it('jumps to the live sync point when the paused position is neither in the window nor buffered', () => {
    const { video, instances } = setup();
    const hls = instances[0]!;
    hls.events.onLive(true);
    hls.liveSyncPosition = 940;
    video.ranges = [[900, 1000]];
    video.bufferedRanges = [[860, 990]];
    video.currentTime = 850;

    video.emit('play');

    expect(video.currentTime).toBe(940);
  });

  it('keeps buffering a live stream far ahead so a long pause can resume in place', () => {
    const { instances } = setup({ delay: 60 });
    const hls = instances[0]!;
    const longPauseSec = 10 * 60;

    hls.events.onLive(true);

    expect(hls.config.maxBufferLength).toBeGreaterThanOrEqual(longPauseSec);
    expect(hls.config.maxMaxBufferLength).toBeGreaterThanOrEqual(longPauseSec);
  });

  it('lets hls.js keep a lowered live buffer limit across playlist refreshes', () => {
    const { instances } = setup();
    const hls = instances[0]!;
    hls.events.onLive(true);

    hls.config.maxMaxBufferLength = 100;
    hls.events.onLive(true);

    expect(hls.config.maxMaxBufferLength).toBe(100);
  });

  it('keeps the delay-sized buffer for VOD', () => {
    const { instances } = setup({ delay: 60 });
    const hls = instances[0]!;

    hls.events.onLive(false);

    expect(hls.config.maxBufferLength).toBe(60);
    expect(hls.config.maxMaxBufferLength).toBe(120);
  });

  it('exposes latency and seeks back to the delayed live point on demand', () => {
    const { video, instances, handle } = setup();
    const hls = instances[0]!;

    expect(handle.getLatency()).toBeNull();

    hls.events.onLive(true);
    hls.latency = 95;
    hls.liveSyncPosition = 940;
    video.currentTime = 905;

    expect(handle.getLatency()).toBe(95);
    handle.seekToLiveSync();
    expect(video.currentTime).toBe(940);
  });

  it('destroys hls.js and stops listening on destroy', () => {
    const { video, instances, handle } = setup();
    const hls = instances[0]!;
    hls.events.onLive(true);
    hls.liveSyncPosition = 940;
    video.ranges = [[900, 1000]];
    video.currentTime = 850;

    handle.destroy();
    video.emit('play');

    expect(hls.destroy).toHaveBeenCalledTimes(1);
    expect(video.currentTime).toBe(850);
  });
});

describe('attachStream with native HLS', () => {
  function setupNative(delay = 60) {
    const video = new FakeVideo();
    video.canPlayType.mockImplementation(() => 'maybe');
    const { engine } = createFakeEngine(false);
    const options: AttachOptions = { liveDelaySec: delay, onError: vi.fn(), onLiveChange: vi.fn() };
    const handle = attachStream(
      video as unknown as HTMLVideoElement,
      'https://example.com/live.m3u8',
      options,
      engine,
    );
    return { video, options, handle };
  }

  it('plays the URL directly and seeks to the delayed live point for live streams', () => {
    const { video, options } = setupNative(60);
    expect(video.src).toBe('https://example.com/live.m3u8');

    video.duration = Number.POSITIVE_INFINITY;
    video.ranges = [[0, 300]];
    video.emit('loadedmetadata');

    expect(options.onLiveChange).toHaveBeenCalledWith(true);
    expect(video.currentTime).toBe(240);
  });

  it('clamps the start to the beginning of a short live window', () => {
    const { video } = setupNative(60);

    video.duration = Number.POSITIVE_INFINITY;
    video.ranges = [[100, 130]];
    video.emit('loadedmetadata');

    expect(video.currentTime).toBe(100);
  });

  it('leaves VOD at the start', () => {
    const { video, options } = setupNative(60);

    video.duration = 600;
    video.ranges = [[0, 600]];
    video.emit('loadedmetadata');

    expect(options.onLiveChange).not.toHaveBeenCalled();
    expect(video.currentTime).toBe(0);
  });

  it('computes latency from the seekable end and resyncs expired pauses', () => {
    const { video, handle } = setupNative(30);
    video.duration = Number.POSITIVE_INFINITY;
    video.ranges = [[0, 300]];
    video.emit('loadedmetadata');

    video.currentTime = 250;
    expect(handle.getLatency()).toBe(50);

    video.ranges = [[260, 360]];
    video.emit('play');
    expect(video.currentTime).toBe(330);
  });

  it('resumes a paused live stream in place while the expired position is still buffered', () => {
    const { video } = setupNative(30);
    video.duration = Number.POSITIVE_INFINITY;
    video.ranges = [[0, 300]];
    video.emit('loadedmetadata');

    video.currentTime = 250;
    video.ranges = [[260, 360]];
    video.bufferedRanges = [[200, 360]];
    video.emit('play');

    expect(video.currentTime).toBe(250);
  });

  it('maps media element errors to error kinds', () => {
    const { video, options } = setupNative();

    video.error = { code: 2 };
    video.emit('error');
    expect(options.onError).toHaveBeenLastCalledWith('network');

    video.error = { code: 3 };
    video.emit('error');
    expect(options.onError).toHaveBeenLastCalledWith('media');
  });

  it('releases the source on destroy', () => {
    const { video, handle } = setupNative();

    handle.destroy();

    expect(video.src).toBe('');
    expect(video.load).toHaveBeenCalled();
  });
});

describe('attachStream without HLS support', () => {
  it('reports unsupported', () => {
    const { options, handle } = setup({ supported: false });

    expect(options.onError).toHaveBeenCalledWith('unsupported');
    expect(handle.getLatency()).toBeNull();
  });
});
