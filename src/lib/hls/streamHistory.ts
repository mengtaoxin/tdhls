import { getItem, setItem, type ClientStorage } from '@/lib/clientStorage';

export const STREAM_HISTORY_KEY = 'tdhls.streamHistory';
export const STREAM_HISTORY_LIMIT = 10;

/** Stream URLs the user entered and played, most recent first. */
export function readStreamHistory(storage: ClientStorage = localStorage): string[] {
  const raw = getItem(STREAM_HISTORY_KEY, storage);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is string => typeof entry === 'string');
  } catch {
    return [];
  }
}

function writeStreamHistory(history: string[], storage: ClientStorage): string[] {
  setItem(STREAM_HISTORY_KEY, JSON.stringify(history), storage);
  return history;
}

export function addStreamHistory(url: string, storage: ClientStorage = localStorage): string[] {
  const rest = readStreamHistory(storage).filter((entry) => entry !== url);
  return writeStreamHistory([url, ...rest].slice(0, STREAM_HISTORY_LIMIT), storage);
}

export function removeStreamHistory(url: string, storage: ClientStorage = localStorage): string[] {
  return writeStreamHistory(
    readStreamHistory(storage).filter((entry) => entry !== url),
    storage,
  );
}
