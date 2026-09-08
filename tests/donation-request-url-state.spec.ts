import { test, expect } from "@playwright/test";

test("@ci AOU016: فلاتر طلبات التبرع والرجوع محفوظة في URL", async ({ page }) => {
  await page.route("**/api/settings/public**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  );
  await page.route("**/api/hubs**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: '{"hubs":[]}' })
  );
  await page.route("**/api/donation-requests**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"requests":[],"page":1,"pages":1,"total":0}',
    })
  );

  await page.goto("/donation-requests?category=%D9%83%D8%AA%D8%A8&location=%D8%B9%D9%85%D8%A7%D9%86");
  await expect(page.getByLabel("فلترة حسب التصنيف")).toHaveValue("كتب");
  await expect(page.getByLabel("فلترة حسب المنطقة")).toHaveValue("عمان");

  await page.getByLabel("فلترة حسب التصنيف").selectOption("أثاث");
  await expect(page).toHaveURL(/category=%D8%A3%D8%AB%D8%A7%D8%AB/);
  await expect(page).toHaveURL(/location=%D8%B9%D9%85%D8%A7%D9%86/);

  await page.goBack();
  await expect(page.getByLabel("فلترة حسب التصنيف")).toHaveValue("كتب");
  await expect(page.getByLabel("فلترة حسب المنطقة")).toHaveValue("عمان");
});
