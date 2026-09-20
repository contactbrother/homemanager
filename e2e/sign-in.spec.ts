import { test, expect } from "@playwright/test";

/**
 * SC-002, SC-012.
 *
 * Sign-in is email and password. A wrong password and an unknown address must produce
 * the same message so the screen never confirms which addresses hold an account.
 */
const UNREGISTERED = `nobody-${Date.now()}@example.invalid`;

test("the sign-in screen offers one primary action and a route to sign up", async ({
  page,
}) => {
  await page.goto("/sign-in");
  await expect(page.getByLabel("Your email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Create an account" })).toBeVisible();
});

test("an unregistered address is not told it is unregistered", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Your email").fill(UNREGISTERED);
  await page.getByLabel("Password").fill("not-a-real-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("alert")).toHaveText("Email or password is incorrect.");
  await expect(page.getByText(/not registered|no account|unknown/i)).toHaveCount(0);
});

test("the sign-up screen asks for a name, email and password", async ({ page }) => {
  await page.goto("/sign-up");
  await expect(page.getByLabel("Your name")).toBeVisible();
  await expect(page.getByLabel("Your email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
});
