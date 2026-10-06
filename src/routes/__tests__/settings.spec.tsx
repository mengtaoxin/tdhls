import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';

import { routeTree } from '@/routeTree.gen';
import { LIVE_DELAY_KEY } from '@/lib/hls/playerPrefs';
import { LOCALE_KEY } from '@/lib/locale';
import { usePlayerPrefsStore } from '@/stores/playerPrefs';
import { TestProviders } from '@/__tests__/renderWithProviders';

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

describe('/settings route', () => {
  it('renders the language and live delay preferences with their current values', async () => {
    const router = await renderApp();
    await router.navigate({ to: '/settings' });

    const languageGroup = screen.getByRole('radiogroup', { name: 'Language' });
    expect(within(languageGroup).getByRole('radio', { name: 'English' })).toBeChecked();

    const delayGroup = screen.getByRole('radiogroup', { name: 'Live delay' });
    expect(within(delayGroup).getByRole('radio', { name: '60s' })).toBeChecked();
  });

  it('switches the UI language from the settings page and persists it', async () => {
    const user = userEvent.setup();
    const router = await renderApp();
    await router.navigate({ to: '/settings' });

    await user.click(screen.getByRole('radio', { name: '中文' }));

    expect(localStorage.getItem(LOCALE_KEY)).toBe('zh');
    expect(await screen.findByRole('radiogroup', { name: '语言' })).toBeInTheDocument();
  });

  it('changes the live delay from the settings page and persists it', async () => {
    const user = userEvent.setup();
    const router = await renderApp();
    await router.navigate({ to: '/settings' });

    await user.click(screen.getByRole('radio', { name: '30s' }));

    expect(usePlayerPrefsStore.getState().liveDelaySec).toBe(30);
    expect(localStorage.getItem(LIVE_DELAY_KEY)).toBe('30');
    expect(screen.getByRole('radio', { name: '30s' })).toBeChecked();
  });
});
