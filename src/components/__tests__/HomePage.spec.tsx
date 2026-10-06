import { afterEach, describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { HomePage } from '@/components/HomePage';
import { STREAM_HISTORY_KEY, readStreamHistory } from '@/lib/hls/streamHistory';
import { DEFAULT_URL_FUNCTION } from '@/lib/hls/urlFunction';
import { usePlayerPrefsStore } from '@/stores/playerPrefs';
import { renderWithTestRouter } from '@/__tests__/renderWithProviders';

const url = (n: number) => `https://example.com/${n}.m3u8`;

function seedHistory(urls: string[]) {
  localStorage.setItem(STREAM_HISTORY_KEY, JSON.stringify(urls));
}

describe('HomePage', () => {
  afterEach(() => {
    usePlayerPrefsStore.setState({ urlFunction: DEFAULT_URL_FUNCTION });
  });

  it('keeps the entered url in history and state while passing the transformed url for playback', async () => {
    usePlayerPrefsStore.setState({
      urlFunction: 'function (u) { return u.replace("a.m3u8", "b.m3u8"); }',
    });
    const user = userEvent.setup();
    const { router } = await renderWithTestRouter({ component: HomePage });
    const entered = 'https://example.com/a.m3u8';
    const played = 'https://example.com/b.m3u8';

    await user.type(screen.getByLabelText('Stream URL (.m3u8)'), `${entered}{Enter}`);

    await expect.poll(() => router.state.location.pathname).toBe('/watch');
    expect(router.state.location.state.streamUrl).toBe(entered);
    expect(router.state.location.state.playbackUrl).toBe(played);
    expect(readStreamHistory()).toEqual([entered]);
  });

  it('plays a submitted URL via history state, not the query, and saves it', async () => {
    const user = userEvent.setup();
    const { router } = await renderWithTestRouter({ component: HomePage });
    const stream = 'https://example.com/live/index.m3u8?token=a&b=1';

    await user.type(screen.getByLabelText('Stream URL (.m3u8)'), `${stream}{Enter}`);

    await expect.poll(() => router.state.location.pathname).toBe('/watch');
    expect(router.state.location.href).toBe('/watch');
    expect(router.state.location.state.streamUrl).toBe(stream);
    expect(router.state.location.state.playbackUrl).toBe(stream);
    expect(readStreamHistory()).toEqual([stream]);
  });

  it('hides the history section when nothing has been played', async () => {
    await renderWithTestRouter({ component: HomePage });

    expect(screen.queryByRole('list', { name: 'Recent streams' })).not.toBeInTheDocument();
  });

  it('lists saved URLs most recent first below the input', async () => {
    seedHistory([url(2), url(1)]);
    await renderWithTestRouter({ component: HomePage });

    const input = screen.getByLabelText('Stream URL (.m3u8)');
    const list = screen.getByRole('list', { name: 'Recent streams' });
    expect(input.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(
      within(list)
        .getAllByRole('button', { name: /^Play / })
        .map((button) => button.textContent),
    ).toEqual([url(2), url(1)]);
  });

  it('plays a history entry and moves it to the top', async () => {
    const user = userEvent.setup();
    seedHistory([url(2), url(1)]);
    const { router } = await renderWithTestRouter({ component: HomePage });

    await user.click(screen.getByRole('button', { name: `Play ${url(1)}` }));

    await expect.poll(() => router.state.location.pathname).toBe('/watch');
    expect(router.state.location.state.streamUrl).toBe(url(1));
    expect(router.state.location.state.playbackUrl).toBe(url(1));
    expect(readStreamHistory()).toEqual([url(1), url(2)]);
  });

  it('removes a history entry', async () => {
    const user = userEvent.setup();
    seedHistory([url(2), url(1)]);
    const { router } = await renderWithTestRouter({ component: HomePage });

    await user.click(screen.getByRole('button', { name: `Remove ${url(2)}` }));

    expect(screen.queryByRole('button', { name: `Play ${url(2)}` })).not.toBeInTheDocument();
    expect(readStreamHistory()).toEqual([url(1)]);
    expect(router.state.location.pathname).toBe('/');
  });
});
