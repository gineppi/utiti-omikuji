import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: false,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }]
  ],
  outputDir: 'reports/artifacts',
  use: {
    headless: true,
    viewport: { width: 375, height: 667 },
    hasTouch: true,
    locale: 'ja-JP',
    trace: 'on-first-retry'
  }
});