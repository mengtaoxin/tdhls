import { test, expect } from '@playwright/test';

test('home page renders inside the app shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('brand-title')).toHaveText('tdhls');
  await expect(page.getByRole('heading', { name: 'HLS streams, in the browser' })).toBeVisible();
});

test('navigates to About from the header', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('banner').getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole('heading', { name: 'tdhls' })).toBeVisible();
});
