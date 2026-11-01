import { defineConfig } from '@playwright/test';

const BASE_PATH = '/phantom-blade-zero-guide/';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  webServer: {
    // 测的是构建产物 dist，不是 Vite 开发服务器
    command: 'npm run preview:dist',
    url: `http://127.0.0.1:4173${BASE_PATH}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: {
    baseURL: `http://127.0.0.1:4173${BASE_PATH}`,
    trace: 'on-first-retry',
  },
});
