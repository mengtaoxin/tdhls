import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { AppShell } from '@/components/AppShell';
import { TestProviders, renderWithTestRouter } from '@/__tests__/renderWithProviders';

describe('AppShell', () => {
  it('disables text selection on the app chrome while keeping inputs selectable', async () => {
    await renderWithTestRouter({
      rootComponent: () => (
        <TestProviders>
          <AppShell />
        </TestProviders>
      ),
      component: () => (
        <label>
          Stream URL
          <input data-testid="stream-input" />
        </label>
      ),
    });

    const app = document.querySelector('.tdhls-app');
    expect(app).toBeTruthy();
    expect(getComputedStyle(app!).userSelect).toBe('none');

    const input = screen.getByTestId('stream-input');
    expect(getComputedStyle(input).userSelect).toBe('text');
  });
});
