import { useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';

import { useHlsPlayer } from '@/hooks/useHlsPlayer';
import { routeTree } from '@/routeTree.gen';
import { TestProviders } from '@/__tests__/renderWithProviders';

vi.mock('@/hooks/useHlsPlayer', () => ({
  useHlsPlayer: vi.fn(() => ({
    isLive: false,
    error: null,
    latency: null,
    seekToLiveSync: vi.fn(),
  })),
}));

const STREAM = 'https://example.com/live/index.m3u8?token=a&b=1';
const PLAYBACK = 'https://cdn.example.com/real/index.m3u8?sig=xyz';

beforeEach(() => {
  vi.mocked(useHlsPlayer).mockReset();
  vi.mocked(useHlsPlayer).mockReturnValue({
    isLive: false,
    error: null,
    latency: null,
    seekToLiveSync: vi.fn(),
  });
});

async function renderApp() {
  const router = createRouter({ routeTree, history: createMemoryHistory() });
  await router.load();
  render(
    <TestProviders>
      <RouterProvider router={router} />
    </TestProviders>,
  );
  return router;
}

describe('/watch route', () => {
  it('plays the transformed url while showing the entered url, without exposing either in the address', async () => {
    const router = await renderApp();

    await router.navigate({ to: '/watch', state: { streamUrl: STREAM, playbackUrl: PLAYBACK } });

    expect(await screen.findByTestId('player-video')).toBeInTheDocument();
    expect(vi.mocked(useHlsPlayer)).toHaveBeenLastCalledWith(expect.anything(), PLAYBACK, 60);
    expect(screen.getByText(STREAM)).toBeInTheDocument();
    expect(screen.queryByText(PLAYBACK)).not.toBeInTheDocument();
    expect(router.state.location.href).toBe('/watch');
  });

  it('shows the invalid URL error when opened without a stream', async () => {
    const router = await renderApp();

    await router.navigate({ to: '/watch' });

    expect(await screen.findByText('This stream URL is missing or invalid.')).toBeInTheDocument();
  });

  it('reloads the current route when Back to live is clicked', async () => {
    const user = userEvent.setup();
    const seekToLiveSync = vi.fn();
    const mounts = vi.fn();
    vi.mocked(useHlsPlayer).mockImplementation(() => {
      useEffect(() => {
        mounts();
      }, []);
      return { isLive: true, error: null, latency: 90, seekToLiveSync };
    });
    const router = await renderApp();

    await router.navigate({ to: '/watch', state: { streamUrl: STREAM, playbackUrl: PLAYBACK } });

    await screen.findByRole('button', { name: 'Back to live' });
    const mountsBefore = mounts.mock.calls.length;
    await user.click(screen.getByRole('button', { name: 'Back to live' }));

    await expect.poll(() => mounts.mock.calls.length).toBeGreaterThan(mountsBefore);
    expect(router.state.location.href).toBe('/watch');
    expect(router.state.location.state.streamUrl).toBe(STREAM);
    expect(router.state.location.state.playbackUrl).toBe(PLAYBACK);
    expect(vi.mocked(useHlsPlayer)).toHaveBeenLastCalledWith(expect.anything(), PLAYBACK, 60);
    expect(screen.getByText(STREAM)).toBeInTheDocument();
    expect(seekToLiveSync).not.toHaveBeenCalled();
  });
});
