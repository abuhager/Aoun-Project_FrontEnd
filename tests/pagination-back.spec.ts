import { test, expect } from "@playwright/test";

test("QA04-E2E-009: الرجوع يحافظ على صفحة Browse", async ({ page }) => {
  await page.goto("/browse?page=2");
  await expect(page).toHaveURL(/\/browse\?page=2/);
  const firstItem = page.locator('a[href^="/items/"]').first();
  await expect(firstItem).toBeVisible();
  await firstItem.click();
  await expect(page).toHaveURL(/\/items\//);
  await page.goBack({ waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/browse\?page=2/);
});
