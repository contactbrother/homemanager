import { test, expect } from "@playwright/test";

/**
 * SC-006, SC-014, FR-004. The test the product cannot ship without.
 *
 * Isolation is enforced by row level security, not by application code, so this
 * exercises the real thing: sign in as one client and try to reach another's records
 * by direct URL. A client who reaches another's data must see not-found, never a
 * permission error, because the existence of the record is itself information.
 *
 * This needs two real signed-in sessions and seeded data, which cannot be created
 * from an empty database by the test itself: FR-002 makes sign-in invite-only, so
 * accounts must be created by the team first. Supply storage states and ids through
 * the environment; without them the test skips rather than passing vacuously.
 *
 *   E2E_CLIENT_A_STATE   path to a Playwright storageState JSON for client A
 *   E2E_CLIENT_B_STATE   path to a Playwright storageState JSON for client B
 *   E2E_B_PROPERTY_ID    a property id belonging to client B
 *   E2E_B_TASK_ID        a task id belonging to client B
 *   E2E_DEACTIVATED_STATE  optional, a storageState for a deactivated client
 *
 * Generate a storage state by signing in once and running:
 *   await context.storageState({ path: "a.json" })
 */
const A_STATE = process.env.E2E_CLIENT_A_STATE;
const B_STATE = process.env.E2E_CLIENT_B_STATE;
const B_PROPERTY = process.env.E2E_B_PROPERTY_ID;
const B_TASK = process.env.E2E_B_TASK_ID;
const DEACTIVATED_STATE = process.env.E2E_DEACTIVATED_STATE;

const configured = !!(A_STATE && B_STATE && B_PROPERTY && B_TASK);

test.describe("cross-client isolation", () => {
  test.skip(
    !configured,
    "Set E2E_CLIENT_A_STATE, E2E_CLIENT_B_STATE, E2E_B_PROPERTY_ID and E2E_B_TASK_ID",
  );

  test("client A cannot reach client B's property", async ({ browser }) => {
    const context = await browser.newContext({ storageState: A_STATE });
    const page = await context.newPage();

    const response = await page.goto(`/properties/${B_PROPERTY}`);
    expect(response?.status()).toBe(404);
    await expect(page.getByText(/forbidden|not allowed|permission/i)).toHaveCount(0);

    await context.close();
  });

  test("client A cannot reach client B's task", async ({ browser }) => {
    const context = await browser.newContext({ storageState: A_STATE });
    const page = await context.newPage();

    const response = await page.goto(`/tasks/${B_TASK}`);
    expect(response?.status()).toBe(404);

    await context.close();
  });

  test("client A's own task list contains nothing belonging to B", async ({
    browser,
  }) => {
    const context = await browser.newContext({ storageState: A_STATE });
    const page = await context.newPage();

    await page.goto("/tasks");
    await expect(page.locator(`a[href="/tasks/${B_TASK}"]`)).toHaveCount(0);

    await context.close();
  });

  test("client B can reach their own property, so the refusal above is isolation, not breakage", async ({
    browser,
  }) => {
    const context = await browser.newContext({ storageState: B_STATE });
    const page = await context.newPage();

    const response = await page.goto(`/properties/${B_PROPERTY}`);
    expect(response?.status()).toBe(200);

    await context.close();
  });

  test("neither client can reach the admin area", async ({ browser }) => {
    for (const state of [A_STATE, B_STATE]) {
      const context = await browser.newContext({ storageState: state });
      const page = await context.newPage();

      const response = await page.goto("/admin");
      // 404, never 403: the admin area's existence is not confirmed. FR-005.
      expect(response?.status()).toBe(404);

      await context.close();
    }
  });
});

test("a deactivated client reaches nothing and is returned to sign-in", async ({
  browser,
}) => {
  test.skip(!DEACTIVATED_STATE, "Set E2E_DEACTIVATED_STATE to run the deactivation check");

  const context = await browser.newContext({ storageState: DEACTIVATED_STATE });
  const page = await context.newPage();

  await page.goto("/");
  await expect(page).toHaveURL(/\/sign-in/);

  await context.close();
});
