import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useAutoHideControls } from '@/hooks/useAutoHideControls';

function setup(initiallyEnabled = true) {
  return renderHook(({ enabled }) => useAutoHideControls(enabled), {
    initialProps: { enabled: initiallyEnabled },
  });
}

const IDLE_MS = 10_000;

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe('useAutoHideControls', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('hides the controls after 10 seconds without activity', () => {
    const { result } = setup();

    advance(IDLE_MS - 1);
    expect(result.current.visible).toBe(true);

    advance(1);
    expect(result.current.visible).toBe(false);
  });

  it('never hides while disabled', () => {
    const { result } = setup(false);

    advance(IDLE_MS * 2);

    expect(result.current.visible).toBe(true);
  });

  it('reveals hidden controls on activity and restarts the idle timer', () => {
    const { result } = setup();
    advance(IDLE_MS);

    act(() => result.current.reveal());
    expect(result.current.visible).toBe(true);

    advance(IDLE_MS - 1);
    expect(result.current.visible).toBe(true);
    advance(1);
    expect(result.current.visible).toBe(false);
  });

  it('postpones hiding when there is activity while visible', () => {
    const { result } = setup();

    advance(IDLE_MS - 1);
    act(() => result.current.reveal());
    advance(IDLE_MS - 1);
    expect(result.current.visible).toBe(true);

    advance(1);
    expect(result.current.visible).toBe(false);
  });

  it('shows the controls again and restarts the timer when re-enabled', () => {
    const { result, rerender } = setup();
    advance(IDLE_MS);

    rerender({ enabled: false });
    expect(result.current.visible).toBe(true);

    rerender({ enabled: true });
    expect(result.current.visible).toBe(true);
    advance(IDLE_MS);
    expect(result.current.visible).toBe(false);
  });
});
