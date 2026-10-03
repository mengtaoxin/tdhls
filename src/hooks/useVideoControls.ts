import { useEffect, useState, type RefObject } from 'react';

import { usePlayerPrefsStore } from '@/stores/playerPrefs';

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
  const muted = usePlayerPrefsStore((s) => s.muted);
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
    video.muted = muted;
  }, [videoRef, muted]);

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

  const toggleMute = () => storeMuted(!muted);

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
    muted,
    isFullscreen,
    togglePlay,
    toggleMute,
    seek,
    toggleFullscreen,
  };
}

export type VideoControls = ReturnType<typeof useVideoControls>;
