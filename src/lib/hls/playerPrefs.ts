import { getItem, setItem, type ClientStorage } from '@/lib/clientStorage';

export const LIVE_DELAY_KEY = 'tdhls.liveDelay';
export const VOLUME_KEY = 'tdhls.volume';
export const MUTED_KEY = 'tdhls.muted';

export const LIVE_DELAY_OPTIONS = [10, 30, 60] as const;
export const DEFAULT_LIVE_DELAY = 60 satisfies LiveDelay;
export const DEFAULT_VOLUME = 1;

export type LiveDelay = (typeof LIVE_DELAY_OPTIONS)[number];

export type PlayerPrefs = {
  liveDelaySec: LiveDelay;
  volume: number;
  muted: boolean;
};

export function isLiveDelay(value: number): value is LiveDelay {
  return (LIVE_DELAY_OPTIONS as readonly number[]).includes(value);
}

export function clampVolume(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function readNumber(key: string, storage: ClientStorage): number | null {
  const raw = getItem(key, storage);
  if (raw == null || raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function resolvePlayerPrefs(storage: ClientStorage = localStorage): PlayerPrefs {
  const delay = readNumber(LIVE_DELAY_KEY, storage);
  const volume = readNumber(VOLUME_KEY, storage);
  return {
    liveDelaySec: delay != null && isLiveDelay(delay) ? delay : DEFAULT_LIVE_DELAY,
    volume: volume == null ? DEFAULT_VOLUME : clampVolume(volume),
    muted: getItem(MUTED_KEY, storage) === 'true',
  };
}

export function writeLiveDelay(value: number, storage: ClientStorage = localStorage): void {
  if (!isLiveDelay(value)) return;
  setItem(LIVE_DELAY_KEY, String(value), storage);
}

export function writeVolume(value: number, storage: ClientStorage = localStorage): void {
  if (!Number.isFinite(value)) return;
  setItem(VOLUME_KEY, String(clampVolume(value)), storage);
}

export function writeMuted(value: boolean, storage: ClientStorage = localStorage): void {
  setItem(MUTED_KEY, String(value), storage);
}
