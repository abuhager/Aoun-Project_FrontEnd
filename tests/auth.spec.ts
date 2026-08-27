import { test, expect } from "@playwright/test";

const email = process.env.DEMO_STUDENT_EMAIL;
const password = process.env.DEMO_STUDENT_PASSWORD;

test("QA04-E2E-002: الطالب يسجل الدخول", async ({ page }) => {
  test.skip(!email || !password, "عرّف DEMO_STUDENT_EMAIL/PASSWORD قبل التشغيل");

  await page.goto("/login");
  await page.getByLabel(/البريد|email/i).fill(email!);
  await page.locator("#login-password").fill(password!);
  await page.getByRole("button", { name: /دخول|تسجيل الدخول|login/i }).click();

  await expect(page).toHaveURL(/(?:dashboard|browse)/);
});
