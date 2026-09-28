import { test, expect } from '@playwright/test';

test('home page renders inside the app shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('brand-title')).toHaveText('tdhls');
  await expect(page.getByRole('heading', { name: 'HLS streams, in the browser' })).toBeVisible();
});

test('opens the watch page with player controls for a pasted stream URL', async ({ page }) => {
  await page.route(
    (url) => url.hostname === 'example.com',
    (route) => route.abort(),
  );
  const streamUrl = 'https://example.com/live/index.m3u8';

  await page.goto('/');
  await page.getByLabel('Stream URL (.m3u8)').fill(streamUrl);
  await page.getByRole('button', { name: 'Play' }).click();

  await expect(page).toHaveURL(/\/watch$/);
  const player = page.getByRole('region', { name: 'Video player' });
  await expect(player.locator('video')).toBeVisible();
  await expect(player.getByRole('button', { name: /^(Play|Pause)$/ })).toBeVisible();
  await expect(player.getByRole('slider', { name: 'Volume' })).toBeAttached();

  await page.reload();
  await expect(player.locator('video')).toBeVisible();

  await page.getByRole('link', { name: 'Back to home' }).click();
  await page
    .getByRole('list', { name: 'Recent streams' })
    .getByRole('button', { name: `Play ${streamUrl}` })
    .click();
  await expect(page).toHaveURL(/\/watch$/);
  await expect(player.locator('video')).toBeVisible();
});

test('navigates to About from the header', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('banner').getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole('heading', { name: 'tdhls' })).toBeVisible();
});
