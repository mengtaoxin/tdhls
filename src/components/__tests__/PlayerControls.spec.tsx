import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PlayerControls, type PlayerControlsProps } from '@/components/PlayerControls';
import type { VideoControls } from '@/hooks/useVideoControls';
import { renderWithProviders } from '@/__tests__/renderWithProviders';

function fakeControls(overrides: Partial<VideoControls> = {}): VideoControls {
  return {
    paused: true,
    currentTime: 10,
    duration: 100,
    volume: 0.5,
    muted: false,
    isFullscreen: false,
    togglePlay: vi.fn(),
    setVolume: vi.fn(),
    toggleMute: vi.fn(),
    seek: vi.fn(),
    toggleFullscreen: vi.fn(),
    ...overrides,
  };
}

function renderControls(props: Partial<PlayerControlsProps> = {}) {
  const all: PlayerControlsProps = {
    controls: fakeControls(),
    isLive: false,
    latency: null,
    liveDelaySec: 60,
    onLiveDelayChange: vi.fn(),
    onBackToLive: vi.fn(),
    ...props,
  };
  renderWithProviders(<PlayerControls {...all} />);
  return all;
}

describe('PlayerControls', () => {
  it('shows Play while paused and Pause while playing', async () => {
    const user = userEvent.setup();
    const { controls } = renderControls();

    await user.click(screen.getByRole('button', { name: 'Play' }));
    expect(controls.togglePlay).toHaveBeenCalledTimes(1);

    renderControls({ controls: fakeControls({ paused: false }) });
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
  });

  it('toggles mute and reflects the muted state in the label', async () => {
    const user = userEvent.setup();
    const { controls } = renderControls();

    await user.click(screen.getByRole('button', { name: 'Mute' }));
    expect(controls.toggleMute).toHaveBeenCalledTimes(1);

    renderControls({ controls: fakeControls({ muted: true }) });
    expect(screen.getByRole('button', { name: 'Unmute' })).toBeInTheDocument();
  });

  it('changes the volume from the slider', () => {
    const { controls } = renderControls();

    fireEvent.change(screen.getByRole('slider', { name: 'Volume' }), { target: { value: 0.3 } });

    expect(controls.setVolume).toHaveBeenCalledWith(0.3);
  });

  it('shows a seek bar and time for VOD', () => {
    const { controls } = renderControls();

    expect(screen.getByText('0:10 / 1:40')).toBeInTheDocument();
    expect(screen.queryByText('LIVE')).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('slider', { name: 'Seek' }), { target: { value: 42 } });
    expect(controls.seek).toHaveBeenCalledWith(42);
  });

  it('shows the live badge, latency, and delay choice for live streams', async () => {
    const user = userEvent.setup();
    const props = renderControls({ isLive: true, latency: 62 });

    expect(screen.getByText('LIVE')).toBeInTheDocument();
    expect(screen.getByText('62s behind live')).toBeInTheDocument();
    expect(screen.queryByRole('slider', { name: 'Seek' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '60s' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: '10s' }));
    expect(props.onLiveDelayChange).toHaveBeenCalledWith(10);
  });

  it('offers Back to live only when well behind the chosen delay', async () => {
    const user = userEvent.setup();
    renderControls({ isLive: true, latency: 70 });
    expect(screen.queryByRole('button', { name: 'Back to live' })).not.toBeInTheDocument();

    const props = renderControls({ isLive: true, latency: 71 });
    await user.click(screen.getByRole('button', { name: 'Back to live' }));
    expect(props.onBackToLive).toHaveBeenCalledTimes(1);
  });

  it('toggles fullscreen', async () => {
    const user = userEvent.setup();
    const { controls } = renderControls();

    await user.click(screen.getByRole('button', { name: 'Fullscreen' }));
    expect(controls.toggleFullscreen).toHaveBeenCalledTimes(1);

    renderControls({ controls: fakeControls({ isFullscreen: true }) });
    expect(screen.getByRole('button', { name: 'Exit fullscreen' })).toBeInTheDocument();
  });
});
