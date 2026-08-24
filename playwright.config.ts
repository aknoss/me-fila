import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["html", { open: "never" }], ["list"]],
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  webServer: {
    command: "npm run build --prefix client && PORT=3000 DATABASE_HOST=127.0.0.1 DATABASE_PORT=3307 DATABASE_NAME=mefila_test DATABASE_USER=mefila-test-user DATABASE_PASSWORD=testpassword JWT_SECRET=test-secret-e2e npm start --prefix server",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      PORT: "3000",
      DATABASE_HOST: "127.0.0.1",
      DATABASE_PORT: "3307",
      DATABASE_NAME: "mefila_test",
      DATABASE_USER: "mefila-test-user",
      DATABASE_PASSWORD: "testpassword",
      JWT_SECRET: "test-secret-e2e",
      NODE_ENV: "test",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
