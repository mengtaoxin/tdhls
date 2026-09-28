import { useEffect, useState, type RefObject } from 'react';

import { usePlayerPrefsStore } from '@/stores/playerPrefs';

const UNMUTE_FALLBACK_VOLUME = 0.5;

type PlaybackState = {
  paused: boolean;
  currentTime: number;
  duration: number;
};

const PLAYBACK_EVENTS = ['play', 'pause', 'timeupdate', 'durationchange', 'loadedmetadata'];

export function useVideoControls(
  videoRef: RefObject<HTMLVideoElement | null>,
  containerRef: RefObject<HTMLElement | null>,
) {
  const volume = usePlayerPrefsStore((s) => s.volume);
  const muted = usePlayerPrefsStore((s) => s.muted);
  const storeVolume = usePlayerPrefsStore((s) => s.setVolume);
  const storeMuted = usePlayerPrefsStore((s) => s.setMuted);

  const [playback, setPlayback] = useState<PlaybackState>({
    paused: true,
    currentTime: 0,
    duration: Number.NaN,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = muted;
  }, [videoRef, volume, muted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const sync = () =>
      setPlayback({
        paused: video.paused,
        currentTime: video.currentTime,
        duration: video.duration,
      });
    sync();
    for (const type of PLAYBACK_EVENTS) video.addEventListener(type, sync);
    return () => {
      for (const type of PLAYBACK_EVENTS) video.removeEventListener(type, sync);
    };
  }, [videoRef]);

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(
        document.fullscreenElement != null && document.fullscreenElement === containerRef.current,
      );
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [containerRef]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      // A rejection means playback was blocked or interrupted; the UI stays paused.
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const setVolume = (value: number) => {
    storeVolume(value);
    if (value > 0 && muted) storeMuted(false);
  };

  const toggleMute = () => {
    if (muted && volume === 0) storeVolume(UNMUTE_FALLBACK_VOLUME);
    storeMuted(!muted);
  };

  const seek = (time: number) => {
    const video = videoRef.current;
    if (video) video.currentTime = time;
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    const request = document.fullscreenElement
      ? document.exitFullscreen()
      : container.requestFullscreen();
    request.catch(() => {});
  };

  return {
    ...playback,
    volume,
    muted,
    isFullscreen,
    togglePlay,
    setVolume,
    toggleMute,
    seek,
    toggleFullscreen,
  };
}

export type VideoControls = ReturnType<typeof useVideoControls>;
