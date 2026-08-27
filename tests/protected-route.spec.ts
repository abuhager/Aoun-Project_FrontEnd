import { test, expect } from "@playwright/test";

test("QA04-E2E-008: الزائر لا يدخل Dashboard", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});
