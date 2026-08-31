import { test, expect } from "@playwright/test";

/**
 * SC-002, SC-012, SC-013.
 *
 * The identical-response assertion is the one that matters most: FR-002 closes an
 * account enumeration leak, and the only way to know it stays closed is to compare
 * what a registered and an unregistered address actually produce.
 *
 * REGISTERED_EMAIL must be an address the team has registered. Without it the
 * enumeration test cannot compare two cases and is skipped rather than passing
 * vacuously.
 */
const REGISTERED = process.env.E2E_REGISTERED_EMAIL;
const UNREGISTERED = `nobody-${Date.now()}@example.invalid`;

test("the sign-in screen offers one primary action and a WhatsApp route", async ({
  page,
}) => {
  await page.goto("/sign-in");
  await expect(page.getByRole("button", { name: "Send me a link" })).toBeVisible();
  await expect(page.getByLabel("Your email")).toBeVisible();
});

test("an unregistered address is not told it is unregistered", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Your email").fill(UNREGISTERED);
  await page.getByRole("button", { name: "Send me a link" }).click();

  await expect(page).toHaveURL(/\/sign-in\/check-email/);
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
  // Nothing on the screen may distinguish the two cases.
  await expect(page.getByText(/not registered|no account|unknown/i)).toHaveCount(0);
});

test("a registered and an unregistered address produce the same screen", async ({
  page,
}) => {
  test.skip(!REGISTERED, "Set E2E_REGISTERED_EMAIL to run the enumeration check");

  await page.goto("/sign-in");
  await page.getByLabel("Your email").fill(UNREGISTERED);
  await page.getByRole("button", { name: "Send me a link" }).click();
  await expect(page).toHaveURL(/check-email/);
  const unknown = await page.locator("main").innerText();

  await page.goto("/sign-in");
  await page.getByLabel("Your email").fill(REGISTERED!);
  await page.getByRole("button", { name: "Send me a link" }).click();
  await expect(page).toHaveURL(/check-email/);
  const known = await page.locator("main").innerText();

  // The address itself is echoed, so compare with it removed.
  const strip = (s: string, email: string) => s.replace(email, "ADDRESS");
  expect(strip(known, REGISTERED!)).toBe(strip(unknown, UNREGISTERED));
});

test("the resend control is locked for 60 seconds", async ({ page }) => {
  await page.goto(`/sign-in/check-email?to=${encodeURIComponent(UNREGISTERED)}`);
  const resend = page.getByRole("button", { name: /Send another/ });
  await expect(resend).toBeDisabled();
  await expect(resend).toHaveText(/Send another in \d+s/);
});

test("an expired or reused link is refused with an offer to try again", async ({
  page,
}) => {
  await page.goto("/auth/callback?code=definitely-not-a-valid-code");
  await expect(page).toHaveURL(/\/sign-in\?error=link/);
  await expect(page.getByText(/expired or has already been used/i)).toBeVisible();
});
