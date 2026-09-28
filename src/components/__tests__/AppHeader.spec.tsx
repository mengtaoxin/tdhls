import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AppHeader } from '@/components/AppHeader';
import { LOCALE_KEY } from '@/lib/locale';
import { renderWithTestRouter } from '@/__tests__/renderWithProviders';

describe('AppHeader', () => {
  it('switches the UI language from the locale menu and persists it', async () => {
    const user = userEvent.setup();
    await renderWithTestRouter({ component: AppHeader });

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();

    await user.click(screen.getByTestId('nav-locale-toggle'));
    await user.click(await screen.findByTestId('locale-option-zh'));

    expect(await screen.findByRole('link', { name: '首页' })).toBeInTheDocument();
    expect(localStorage.getItem(LOCALE_KEY)).toBe('zh');
  });

  it('offers the settings menu', async () => {
    await renderWithTestRouter({ component: AppHeader });

    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  });
});
