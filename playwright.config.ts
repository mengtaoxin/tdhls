import process from 'node:process';
import { defineConfig, devices } from '@playwright/test';

// https://playwright.dev/docs/test-configuration
export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  fullyParallel: true,
  reporter: 'html',
  use: {
    actionTimeout: 0,
    baseURL: process.env.CI ? 'http://localhost:4173' : 'http://localhost:3000',
    trace: 'on-first-retry',
    headless: true,
  },

  /* Select browsers with `--project` (e.g. chromium). */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],

  /* Dev server locally for fast feedback; preview server on CI for a production build. */
  webServer: {
    command: process.env.CI ? 'npm run preview' : 'npm run dev',
    port: process.env.CI ? 4173 : 3000,
    reuseExistingServer: !process.env.CI,
  },
});
