import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { StreamUrlForm } from '@/components/StreamUrlForm';
import { renderWithProviders } from '@/__tests__/renderWithProviders';

describe('StreamUrlForm', () => {
  it('shows an error and does not play an invalid URL', async () => {
    const user = userEvent.setup();
    const onPlay = vi.fn();
    renderWithProviders(<StreamUrlForm onPlay={onPlay} />);

    await user.type(screen.getByLabelText('Stream URL (.m3u8)'), 'ftp://example.com/a.m3u8');
    await user.click(screen.getByRole('button', { name: 'Play' }));

    expect(await screen.findByText('Enter a full http:// or https:// URL.')).toBeInTheDocument();
    expect(onPlay).not.toHaveBeenCalled();
  });

  it('plays the trimmed entered URL unchanged', async () => {
    const user = userEvent.setup();
    const onPlay = vi.fn();
    renderWithProviders(<StreamUrlForm onPlay={onPlay} />);
    const url = 'https://example.com/live/index.m3u8?token=a&b=1';

    await user.type(screen.getByLabelText('Stream URL (.m3u8)'), `  ${url}{Enter}`);

    expect(onPlay).toHaveBeenCalledExactlyOnceWith(url);
  });
});
