import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useVideoControls } from '@/hooks/useVideoControls';
import { MUTED_KEY, VOLUME_KEY } from '@/lib/hls/playerPrefs';
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
  it('applies stored volume and mute to the video on mount', () => {
    usePlayerPrefsStore.setState({ volume: 0.4, muted: true });

    const { video } = setup();

    expect(video.volume).toBe(0.4);
    expect(video.muted).toBe(true);
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

  it('sets and persists volume, unmuting when the volume goes up', () => {
    usePlayerPrefsStore.setState({ volume: 0.5, muted: true });
    const { video, result } = setup();

    act(() => result.current.setVolume(0.8));

    expect(video.volume).toBe(0.8);
    expect(video.muted).toBe(false);
    expect(result.current.muted).toBe(false);
    expect(localStorage.getItem(VOLUME_KEY)).toBe('0.8');
    expect(localStorage.getItem(MUTED_KEY)).toBe('false');
  });

  it('toggles and persists mute', () => {
    const { video, result } = setup();

    act(() => result.current.toggleMute());
    expect(video.muted).toBe(true);
    expect(localStorage.getItem(MUTED_KEY)).toBe('true');

    act(() => result.current.toggleMute());
    expect(video.muted).toBe(false);
  });

  it('restores an audible volume when unmuting at zero volume', () => {
    usePlayerPrefsStore.setState({ volume: 0, muted: true });
    const { video, result } = setup();

    act(() => result.current.toggleMute());

    expect(video.muted).toBe(false);
    expect(video.volume).toBeGreaterThan(0);
  });

  it('seeks the video', () => {
    const { video, result } = setup();

    act(() => result.current.seek(42));

    expect(video.currentTime).toBe(42);
  });
});
