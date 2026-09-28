import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useHlsPlayer } from '@/hooks/useHlsPlayer';
import { attachStream, type AttachOptions, type PlayerHandle } from '@/lib/hls/player';

vi.mock('@/lib/hls/player', () => ({ attachStream: vi.fn() }));

const attachMock = vi.mocked(attachStream);

type Attached = {
  url: string;
  options: AttachOptions;
  handle: PlayerHandle & { latency: number | null };
};

function trackAttachments() {
  const attached: Attached[] = [];
  attachMock.mockImplementation((_video, url, options) => {
    const handle = {
      latency: null as number | null,
      destroy: vi.fn(),
      getLatency: () => handle.latency,
      seekToLiveSync: vi.fn(),
    };
    attached.push({ url, options, handle });
    return handle;
  });
  return attached;
}

describe('useHlsPlayer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    attachMock.mockReset();
  });

  const videoRef = { current: document.createElement('video') };

  it('attaches the stream with the delay and reports live state and errors', () => {
    const attached = trackAttachments();
    const { result } = renderHook(() => useHlsPlayer(videoRef, 'https://a/x.m3u8', 30));

    expect(attached).toHaveLength(1);
    expect(attached[0]!.url).toBe('https://a/x.m3u8');
    expect(attached[0]!.options.liveDelaySec).toBe(30);
    expect(result.current).toMatchObject({ isLive: false, error: null, latency: null });

    act(() => attached[0]!.options.onLiveChange(true));
    expect(result.current.isLive).toBe(true);

    act(() => attached[0]!.options.onError('network'));
    expect(result.current.error).toBe('network');
  });

  it('polls latency every second while live', () => {
    const attached = trackAttachments();
    const { result } = renderHook(() => useHlsPlayer(videoRef, 'https://a/x.m3u8', 60));

    act(() => attached[0]!.options.onLiveChange(true));
    attached[0]!.handle.latency = 61.6;
    act(() => vi.advanceTimersByTime(1000));

    expect(result.current.latency).toBe(62);
  });

  it('re-attaches with a clean state when the delay changes', () => {
    const attached = trackAttachments();
    const { result, rerender } = renderHook(
      ({ delay }) => useHlsPlayer(videoRef, 'https://a/x.m3u8', delay),
      { initialProps: { delay: 60 } },
    );
    act(() => attached[0]!.options.onError('media'));

    rerender({ delay: 10 });

    expect(attached[0]!.handle.destroy).toHaveBeenCalledTimes(1);
    expect(attached).toHaveLength(2);
    expect(attached[1]!.options.liveDelaySec).toBe(10);
    expect(result.current.error).toBeNull();
  });

  it('forwards seekToLiveSync to the current player', () => {
    const attached = trackAttachments();
    const { result } = renderHook(() => useHlsPlayer(videoRef, 'https://a/x.m3u8', 60));

    result.current.seekToLiveSync();

    expect(attached[0]!.handle.seekToLiveSync).toHaveBeenCalledTimes(1);
  });
});
