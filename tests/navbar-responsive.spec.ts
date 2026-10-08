import { test, expect } from "@playwright/test";

for (const width of [390, 1024, 1280, 1536, 1907]) {
  test(`@ci admin navbar fits without overlapping at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route("**/api/**", async route => {
      const path = new URL(route.request().url()).pathname;
      let body: unknown = { success: true, data: { unreadCount: 0, notifications: [], items: [] } };
      if (path === "/api/auth/refresh") {
        body = {
          accessToken: "navbar-test-token",
          user: { _id: "507f1f77bcf86cd799439011", name: "أدهم", email: "admin@example.test", role: "admin", isVerified: true, trustLevel: 2, gamification: { level: 2 } },
        };
      } else if (path === "/api/settings/public") {
        body = { platformName: "عون", donationRequestsEnabled: true, categories: [], locations: [], reportReasons: [] };
      }
      await route.fulfill({ json: body });
    });
    await page.goto("/browse");
    const nav = page.getByRole("navigation", { name: "التنقل الرئيسي", exact: true });
    await expect(nav.getByRole("button", { name: "الرسائل", exact: true })).toBeVisible();
    const links = nav.getByTestId("navbar-links");
    if (width >= 1536) {
      await expect(nav.getByRole("button", { name: "قائمة الحساب" })).toBeVisible();
      await expect(links).toBeVisible();
      const brand = await nav.getByRole("link", { name: /العودة إلى الرئيسية/ }).boundingBox();
      const actions = await nav.getByTestId("navbar-actions").boundingBox();
      const linkBoxes = await links.getByRole("link").all();
      for (const link of linkBoxes) {
        const box = await link.boundingBox();
        expect(box!.x).toBeGreaterThanOrEqual(actions!.x + actions!.width);
        expect(box!.x + box!.width).toBeLessThanOrEqual(brand!.x);
      }
      await expect(nav.getByRole("button", { name: "فتح القائمة" })).toBeHidden();
    } else {
      await expect(links).toBeHidden();
      await nav.getByRole("button", { name: "فتح القائمة" }).click();
      await expect(nav.getByRole("link", { name: "الدعم", exact: true })).toBeVisible();
      await expect(nav.getByRole("link", { name: "لوحة الإدارة", exact: true })).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
