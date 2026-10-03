import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useVideoControls } from '@/hooks/useVideoControls';
import { MUTED_KEY } from '@/lib/hls/playerPrefs';
import { usePlayerPrefsStore } from '@/stores/playerPrefs';

function setup() {
  const video = document.createElement('video');
  const container = document.createElement('div');
  container.append(video);
  document.body.append(container);
  const videoRef = { current: video };
  const containerRef = { current: container };
  const { result } = renderHook(() => useVideoControls(videoRef, containerRef));
  return { video, result };
}

describe('useVideoControls', () => {
  it('applies stored mute on mount and leaves volume to the system', () => {
    usePlayerPrefsStore.setState({ muted: true });

    const { video } = setup();

    expect(video.muted).toBe(true);
    expect(video.volume).toBe(1);
  });

  it('toggles play and pause and tracks the paused state from media events', async () => {
    const { video, result } = setup();
    expect(result.current.paused).toBe(true);

    await act(async () => result.current.togglePlay());
    expect(video.paused).toBe(false);
    expect(result.current.paused).toBe(false);

    await act(async () => result.current.togglePlay());
    expect(video.paused).toBe(true);
    expect(result.current.paused).toBe(true);
  });

  it('toggles and persists mute', () => {
    const { video, result } = setup();

    act(() => result.current.toggleMute());
    expect(video.muted).toBe(true);
    expect(localStorage.getItem(MUTED_KEY)).toBe('true');

    act(() => result.current.toggleMute());
    expect(video.muted).toBe(false);
  });

  it('seeks the video', () => {
    const { video, result } = setup();

    act(() => result.current.seek(42));

    expect(video.currentTime).toBe(42);
  });
});
