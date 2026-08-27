import { test, expect } from "@playwright/test";

test("QA04-E2E-001: الزائر يفتح Browse", async ({ page }) => {
  await page.goto("/browse");
  await expect(page.getByRole("heading", { name: /اكتشف التبرعات المتاحة/i })).toBeVisible();
  await expect(page).toHaveURL(/\/browse/);
});
