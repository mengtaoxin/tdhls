import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SettingsMenu } from '@/components/SettingsMenu';
import { LIVE_DELAY_KEY } from '@/lib/hls/playerPrefs';
import { usePlayerPrefsStore } from '@/stores/playerPrefs';
import { renderWithProviders } from '@/__tests__/renderWithProviders';

describe('SettingsMenu', () => {
  it('defaults the live delay to 60s', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsMenu />);

    await user.click(screen.getByRole('button', { name: 'Settings' }));

    expect(screen.getByRole('menuitemradio', { name: '60s' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('menuitemradio', { name: '10s' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('changes the live delay and persists it to localStorage', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsMenu />);

    await user.click(screen.getByRole('button', { name: 'Settings' }));
    await user.click(screen.getByRole('menuitemradio', { name: '30s' }));

    expect(usePlayerPrefsStore.getState().liveDelaySec).toBe(30);
    expect(localStorage.getItem(LIVE_DELAY_KEY)).toBe('30');

    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByRole('menuitemradio', { name: '30s' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });
});
