const PLACEHOLDER = '--:--';

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Formats seconds as `m:ss`, or `h:mm:ss` from one hour up. */
export function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return PLACEHOLDER;
  const total = Math.floor(sec);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return hours > 0 ? `${hours}:${pad2(minutes)}:${pad2(seconds)}` : `${minutes}:${pad2(seconds)}`;
}
