import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { StreamUrlForm } from '@/components/StreamUrlForm';
import { renderWithTestRouter } from '@/__tests__/renderWithProviders';

describe('StreamUrlForm', () => {
  it('shows an error and stays put for an invalid URL', async () => {
    const user = userEvent.setup();
    const { router } = await renderWithTestRouter({ component: StreamUrlForm });

    await user.type(screen.getByLabelText('Stream URL (.m3u8)'), 'ftp://example.com/a.m3u8');
    await user.click(screen.getByRole('button', { name: 'Play' }));

    expect(await screen.findByText('Enter a full http:// or https:// URL.')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
  });

  it('navigates to the watch page with the stream URL', async () => {
    const user = userEvent.setup();
    const { router } = await renderWithTestRouter({ component: StreamUrlForm });
    const url = 'https://example.com/live/index.m3u8?token=a&b=1';

    await user.type(screen.getByLabelText('Stream URL (.m3u8)'), `  ${url}{Enter}`);

    await expect.poll(() => router.state.location.pathname).toBe('/watch');
    expect(router.state.location.search).toEqual({ url });
  });
});
