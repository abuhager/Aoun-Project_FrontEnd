import { test, expect } from "@playwright/test";

for (const [recipientConfirmed, donorConfirmed] of [[false, false], [true, false], [false, true], [true, true]]) {
  test(`@ci booking timer needs both confirmations (${recipientConfirmed}/${donorConfirmed})`, async ({ page }) => {
    const id = "507f1f77bcf86cd799439011";
    const userId = "507f1f77bcf86cd799439012";
    await page.route("**/api/**", async route => {
      const path = new URL(route.request().url()).pathname;
      let body: unknown = { success: true, data: { unreadCount: 0, notifications: [], items: [] } };
      if (path === "/api/auth/refresh") {
        body = { accessToken: "booking-test-token", user: { _id: userId, name: "متبرع", role: "user", isVerified: true, trustLevel: 2 } };
      } else if (path === `/api/items/${id}`) {
        body = {
          _id: id, title: "غرض لاختبار مهلة الحجز", status: "محجوز", condition: "مستعمل جيد",
          category: "إلكترونيات", location: "عمّان", imageUrl: null,
          createdAt: new Date().toISOString(), bookedAt: new Date(Date.now() - 70 * 3600000).toISOString(),
          expiryHours: 72, recipientConfirmed, donorConfirmed, linkedRequestId: null,
          donor: { _id: userId, name: "متبرع" },
          bookedBy: { _id: "507f1f77bcf86cd799439013", name: "مستلم" },
          waitlist: [], waitlistCount: 0,
        };
      } else if (path === "/api/settings/public") {
        body = { platformName: "عون", donationRequestsEnabled: true, categories: [], locations: [], reportReasons: [] };
      }
      await route.fulfill({ json: body });
    });
    await page.goto(`/items/${id}`);
    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { name: "غرض لاختبار مهلة الحجز" })).toBeVisible();
    const timer = main.getByText("⏱️ مهلة استلام الحاجز", { exact: true });
    if (recipientConfirmed && donorConfirmed) await expect(timer).toBeHidden();
    else await expect(timer).toBeVisible();
  });
}
