import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AppHeader } from '@/components/AppHeader';
import { renderWithTestRouter } from '@/__tests__/renderWithProviders';

describe('AppHeader', () => {
  it('renders the navigation links', async () => {
    await renderWithTestRouter({ component: AppHeader, extraPaths: ['/settings'] });

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
  });

  it('navigates to the settings page from the gear link', async () => {
    const user = userEvent.setup();
    const { router } = await renderWithTestRouter({
      component: AppHeader,
      extraPaths: ['/settings'],
    });

    await user.click(screen.getByRole('link', { name: 'Settings' }));

    expect(router.state.location.href).toBe('/settings');
  });
});
