import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WatchPage } from '@/components/WatchPage';
import { useHlsPlayer } from '@/hooks/useHlsPlayer';
import { LIVE_DELAY_KEY, resolvePlayerPrefs } from '@/lib/hls/playerPrefs';
import { usePlayerPrefsStore } from '@/stores/playerPrefs';
import { renderWithTestRouter } from '@/__tests__/renderWithProviders';

vi.mock('@/hooks/useHlsPlayer', () => ({ useHlsPlayer: vi.fn() }));

const useHlsPlayerMock = vi.mocked(useHlsPlayer);
const STREAM = 'https://example.com/live.m3u8';

function mockPlayer(overrides: Partial<ReturnType<typeof useHlsPlayer>> = {}) {
  const player = {
    isLive: false,
    error: null,
    latency: null,
    seekToLiveSync: vi.fn(),
    ...overrides,
  };
  useHlsPlayerMock.mockReturnValue(player);
  return player;
}

async function renderWatch(url = STREAM) {
  return renderWithTestRouter({ component: () => <WatchPage url={url} /> });
}

describe('WatchPage', () => {
  beforeEach(() => {
    useHlsPlayerMock.mockReset();
    mockPlayer();
  });

  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(document, 'fullscreenElement');
  });

  it('shows an error and no player for an invalid URL', async () => {
    await renderWatch('javascript:alert(1)');

    expect(screen.getByText('This stream URL is missing or invalid.')).toBeInTheDocument();
    expect(screen.queryByTestId('player-video')).not.toBeInTheDocument();
    expect(useHlsPlayerMock).not.toHaveBeenCalled();
  });

  it('plays the stream in a video with custom controls and the stored delay', async () => {
    await renderWatch();

    const video = screen.getByTestId('player-video');
    expect(video).not.toHaveAttribute('controls');
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mute' })).toBeInTheDocument();
    expect(screen.queryByRole('slider', { name: 'Volume' })).not.toBeInTheDocument();
    expect(useHlsPlayerMock).toHaveBeenLastCalledWith(expect.anything(), STREAM, 60);
  });

  it('shows player errors', async () => {
    mockPlayer({ error: 'network' });
    await renderWatch();

    expect(screen.getByRole('alert')).toHaveTextContent(/could not be loaded/);
  });

  it('toggles play with Space and mute with M on the player', async () => {
    await renderWatch();
    const region = screen.getByRole('region', { name: 'Video player' });
    const video = screen.getByTestId<HTMLVideoElement>('player-video');

    await act(async () => {
      fireEvent.keyDown(region, { key: ' ' });
    });
    expect(video.paused).toBe(false);
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();

    fireEvent.keyDown(region, { key: 'm' });
    expect(video.muted).toBe(true);
    expect(screen.getByRole('button', { name: 'Unmute' })).toBeInTheDocument();
  });

  it('does not toggle play when the video is clicked', async () => {
    const user = userEvent.setup();
    await renderWatch();
    const video = screen.getByTestId<HTMLVideoElement>('player-video');

    await user.click(video);

    expect(video.paused).toBe(true);
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
  });

  async function renderFullscreenWatch() {
    await renderWatch();
    const region = screen.getByRole('region', { name: 'Video player' });
    vi.useFakeTimers();
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: region });
    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    return region;
  }

  it('auto-hides the controls after 10 seconds idle in fullscreen and shows them on click', async () => {
    const region = await renderFullscreenWatch();

    act(() => vi.advanceTimersByTime(9_999));
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole('button', { name: 'Play' })).not.toBeInTheDocument();

    fireEvent.pointerDown(region);
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
  });

  it('shows hidden fullscreen controls when the pointer moves over the player', async () => {
    const region = await renderFullscreenWatch();
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.queryByRole('button', { name: 'Play' })).not.toBeInTheDocument();

    fireEvent.pointerMove(region);

    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
  });

  it('plays live with the delay from settings and seeks back to live on demand', async () => {
    const user = userEvent.setup();
    localStorage.setItem(LIVE_DELAY_KEY, '30');
    usePlayerPrefsStore.setState(resolvePlayerPrefs());
    const player = mockPlayer({ isLive: true, latency: 90 });
    await renderWatch();

    expect(useHlsPlayerMock).toHaveBeenLastCalledWith(expect.anything(), STREAM, 30);
    expect(screen.queryByRole('button', { name: '30s' })).not.toBeInTheDocument();

    act(() => usePlayerPrefsStore.getState().setLiveDelay(10));
    expect(useHlsPlayerMock).toHaveBeenLastCalledWith(expect.anything(), STREAM, 10);

    await user.click(screen.getByRole('button', { name: 'Back to live' }));
    expect(player.seekToLiveSync).toHaveBeenCalledTimes(1);
  });
});
