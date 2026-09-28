import { useEffect, useRef, useState } from 'react';

export const CONTROLS_AUTO_HIDE_MS = 10_000;

/**
 * Hides player controls after a period without activity while `enabled`.
 * Call `reveal` on user activity to show them and restart the idle timer.
 */
export function useAutoHideControls(enabled: boolean, delayMs = CONTROLS_AUTO_HIDE_MS) {
  const [idle, setIdle] = useState(false);
  const [wasEnabled, setWasEnabled] = useState(enabled);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  if (enabled !== wasEnabled) {
    setWasEnabled(enabled);
    setIdle(false);
  }

  useEffect(() => {
    if (!enabled) return;
    timerRef.current = setTimeout(() => setIdle(true), delayMs);
    return () => clearTimeout(timerRef.current);
  }, [enabled, delayMs]);

  const visible = !enabled || !idle;

  const reveal = () => {
    if (!enabled) return;
    setIdle(false);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIdle(true), delayMs);
  };

  return { visible, reveal };
}
