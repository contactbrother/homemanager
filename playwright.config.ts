import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright covers two things and no more: cross-client isolation and the sign-in
 * journey. There is no unit test layer in this release, by decision recorded in
 * plan.md. If a regression matters more than these two, it belongs in this folder.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000/sign-in",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
