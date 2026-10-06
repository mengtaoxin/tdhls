import { getItem, setItem, type ClientStorage } from '@/lib/clientStorage';
import { DEFAULT_URL_FUNCTION, URL_FUNCTION_KEY } from '@/lib/hls/urlFunction';

export const LIVE_DELAY_KEY = 'tdhls.liveDelay';
export const MUTED_KEY = 'tdhls.muted';

export const LIVE_DELAY_OPTIONS = [10, 30, 60] as const;
export const DEFAULT_LIVE_DELAY = 60 satisfies LiveDelay;

export type LiveDelay = (typeof LIVE_DELAY_OPTIONS)[number];

export type PlayerPrefs = {
  liveDelaySec: LiveDelay;
  muted: boolean;
  urlFunction: string;
};

export function isLiveDelay(value: number): value is LiveDelay {
  return (LIVE_DELAY_OPTIONS as readonly number[]).includes(value);
}

function readNumber(key: string, storage: ClientStorage): number | null {
  const raw = getItem(key, storage);
  if (raw == null || raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function resolvePlayerPrefs(storage: ClientStorage = localStorage): PlayerPrefs {
  const delay = readNumber(LIVE_DELAY_KEY, storage);
  const urlFunction = getItem(URL_FUNCTION_KEY, storage);
  return {
    liveDelaySec: delay != null && isLiveDelay(delay) ? delay : DEFAULT_LIVE_DELAY,
    muted: getItem(MUTED_KEY, storage) === 'true',
    urlFunction:
      urlFunction != null && urlFunction.trim() !== '' ? urlFunction : DEFAULT_URL_FUNCTION,
  };
}

export function writeLiveDelay(value: number, storage: ClientStorage = localStorage): void {
  if (!isLiveDelay(value)) return;
  setItem(LIVE_DELAY_KEY, String(value), storage);
}

export function writeMuted(value: boolean, storage: ClientStorage = localStorage): void {
  setItem(MUTED_KEY, String(value), storage);
}

export function writeUrlFunction(value: string, storage: ClientStorage = localStorage): void {
  setItem(URL_FUNCTION_KEY, value, storage);
}
