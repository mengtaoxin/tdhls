import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { StreamUrlForm } from '@/components/StreamUrlForm';
import { DEFAULT_URL_FUNCTION } from '@/lib/hls/urlFunction';
import { usePlayerPrefsStore } from '@/stores/playerPrefs';
import { renderWithProviders } from '@/__tests__/renderWithProviders';

describe('StreamUrlForm', () => {
  afterEach(() => {
    usePlayerPrefsStore.setState({ urlFunction: DEFAULT_URL_FUNCTION });
  });

  it('shows an error and does not play an invalid URL', async () => {
    const user = userEvent.setup();
    const onPlay = vi.fn();
    renderWithProviders(<StreamUrlForm onPlay={onPlay} />);

    await user.type(screen.getByLabelText('Stream URL (.m3u8)'), 'ftp://example.com/a.m3u8');
    await user.click(screen.getByRole('button', { name: 'Play' }));

    expect(await screen.findByText('Enter a full http:// or https:// URL.')).toBeInTheDocument();
    expect(onPlay).not.toHaveBeenCalled();
  });

  it('plays the trimmed stream URL', async () => {
    const user = userEvent.setup();
    const onPlay = vi.fn();
    renderWithProviders(<StreamUrlForm onPlay={onPlay} />);
    const url = 'https://example.com/live/index.m3u8?token=a&b=1';

    await user.type(screen.getByLabelText('Stream URL (.m3u8)'), `  ${url}{Enter}`);

    expect(onPlay).toHaveBeenCalledExactlyOnceWith(url);
  });

  it('plays the url transformed by the configured url function', async () => {
    usePlayerPrefsStore.setState({
      urlFunction: 'function (url) { return url.replace("a.m3u8", "b.m3u8"); }',
    });
    const user = userEvent.setup();
    const onPlay = vi.fn();
    renderWithProviders(<StreamUrlForm onPlay={onPlay} />);

    await user.type(
      screen.getByLabelText('Stream URL (.m3u8)'),
      'https://example.com/a.m3u8{Enter}',
    );

    expect(onPlay).toHaveBeenCalledExactlyOnceWith('https://example.com/b.m3u8');
  });

  it('plays the original url when the configured function is broken', async () => {
    usePlayerPrefsStore.setState({ urlFunction: 'function (url) {' });
    const user = userEvent.setup();
    const onPlay = vi.fn();
    renderWithProviders(<StreamUrlForm onPlay={onPlay} />);
    const url = 'https://example.com/a.m3u8';

    await user.type(screen.getByLabelText('Stream URL (.m3u8)'), `${url}{Enter}`);

    expect(onPlay).toHaveBeenCalledExactlyOnceWith(url);
  });
});
