import { useEffect, useRef, useState, type RefObject } from 'react';

import { attachStream, type PlayerErrorKind, type PlayerHandle } from '@/lib/hls/player';

const LATENCY_POLL_MS = 1000;

type PlayerStatus = {
  isLive: boolean;
  error: PlayerErrorKind | null;
  latency: number | null;
};

const IDLE: PlayerStatus = { isLive: false, error: null, latency: null };

export function useHlsPlayer(
  videoRef: RefObject<HTMLVideoElement | null>,
  url: string,
  liveDelaySec: number,
) {
  const sourceKey = `${liveDelaySec}|${url}`;
  // Status is tagged with the source it belongs to, so a new url/delay starts from IDLE.
  const [status, setStatus] = useState<PlayerStatus & { key: string }>({ ...IDLE, key: '' });
  const handleRef = useRef<PlayerHandle | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const update = (patch: Partial<PlayerStatus>) =>
      setStatus((prev) => {
        const base = prev.key === sourceKey ? prev : { ...IDLE, key: sourceKey };
        const keys = Object.keys(patch) as Array<keyof PlayerStatus>;
        return keys.every((k) => base[k] === patch[k]) ? base : { ...base, ...patch };
      });

    const handle = attachStream(video, url, {
      liveDelaySec,
      onError: (error) => update({ error }),
      onLiveChange: (isLive) => update({ isLive }),
    });
    handleRef.current = handle;

    const pollId = setInterval(() => {
      const latency = handle.getLatency();
      update({ latency: latency == null ? null : Math.round(latency) });
    }, LATENCY_POLL_MS);

    return () => {
      clearInterval(pollId);
      handle.destroy();
      handleRef.current = null;
    };
  }, [videoRef, url, liveDelaySec, sourceKey]);

  const { isLive, error, latency } = status.key === sourceKey ? status : IDLE;

  return {
    isLive,
    error,
    latency,
    seekToLiveSync: () => handleRef.current?.seekToLiveSync(),
  };
}
