import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { AppShell } from '@/components/AppShell';
import { TestProviders, renderWithTestRouter } from '@/__tests__/renderWithProviders';

describe('App', () => {
  it('renders AppShell with tdhls brand text and the routed page', async () => {
    await renderWithTestRouter({
      rootComponent: () => (
        <TestProviders>
          <AppShell />
        </TestProviders>
      ),
      component: () => <div data-testid="home-outlet">home</div>,
    });

    expect(screen.getByTestId('brand-title')).toHaveTextContent('tdhls');
    expect(screen.getByTestId('home-outlet')).toBeInTheDocument();
  });
});
