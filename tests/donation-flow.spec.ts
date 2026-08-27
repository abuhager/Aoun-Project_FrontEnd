import { test, expect, type Page } from "@playwright/test";

const studentEmail = process.env.DEMO_STUDENT_EMAIL;
const studentPassword = process.env.DEMO_STUDENT_PASSWORD;
const donorEmail = process.env.DEMO_DONOR_EMAIL;
const donorPassword = process.env.DEMO_DONOR_PASSWORD;

test.describe.serial("QA04 donation flow", () => {
  let requestTitle = "";

  const login = async (page: Page, email: string, password: string) => {
    await page.goto("/login");
    await page.getByLabel(/البريد الإلكتروني/i).fill(email);
    await page.locator("#login-password").fill(password);
    await page.getByRole("button", { name: /تسجيل الدخول/i }).click();
    await expect(page).toHaveURL(/\/(?:browse|dashboard)/);
  };

  test.beforeEach(() => {
    test.skip(
      process.env.E2E_RUN_MUTATING !== "true",
      "دورة التبرع تغيّر البيانات؛ شغّلها فقط بحسابات وبيئة اختبار مخصصة"
    );
    test.skip(
      !studentEmail || !studentPassword || !donorEmail || !donorPassword,
      "عرّف بيانات الطالب والمتبرع قبل تشغيل دورة التبرع"
    );
  });

  test("QA04-E2E-003: الطالب ينشئ طلبًا", async ({ page }) => {
    await login(page, studentEmail!, studentPassword!);

    requestTitle = `اختبار آلي ${Date.now()}`;
    await page.goto("/donation-requests/new");

    // ننتظر اكتمال Hydration وجلب الكوتا قبل تعديل حقول React controlled.
    await expect(
      page.getByText(/الطلبات الشهرية:|وصلت الحد الأقصى/)
    ).toBeVisible({ timeout: 10_000 });

    await page.locator("#request-title").fill(requestTitle);
    await page.locator("#request-category").selectOption({ index: 1 });
    await page.locator("#request-location").selectOption({ index: 1 });
    await page
      .locator("#request-description")
      .fill("طلب اختبار آلي مؤقت للتحقق من دورة التبرع.");

    const publishButton = page.getByRole("button", { name: "نشر الطلب" });
    const formState = await page.locator("form").evaluate((form) => {
      const fields = Array.from(
        form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
          "input, select, textarea"
        )
      );

      return fields.map((field) => ({
        id: field.id,
        name: field.name,
        type: field.type,
        value: field.value,
        required: field.required,
        disabled: field.disabled,
        valid: field.checkValidity(),
        validationMessage: field.validationMessage,
      }));
    });

    console.log("DONATION REQUEST FORM STATE", formState);
    await expect(publishButton).toBeEnabled();

    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("/api/donation-requests")
    );

    await publishButton.click();

    const createResponse = await createResponsePromise;
    const responseBody = await createResponse.text();

    console.log("CREATE REQUEST RESPONSE", {
      status: createResponse.status(),
      statusText: createResponse.statusText(),
      url: createResponse.url(),
      body: responseBody,
    });

    await expect(createResponse.ok(), responseBody).toBeTruthy();
    await expect(page).toHaveURL(/\/donation-requests/, { timeout: 10_000 });

    await page.goto("/donation-requests?mine=true");
    await expect(
      page.locator("article").filter({ hasText: requestTitle }).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("QA04-E2E-004 وQA04-E2E-005: المتبرع يرسل عرضًا", async ({ page }) => {
    await login(page, donorEmail!, donorPassword!);
    await page.goto("/donation-requests");

    const card = page.locator("article").filter({ hasText: requestTitle }).first();
    await expect(card).toBeVisible();
    await card.getByRole("button", { name: /سأتبرع بهذا/i }).click();

    const hubSelect = page.locator("select").last();
    if ((await hubSelect.locator("option").count()) > 1) {
      await hubSelect.selectOption({ index: 1 });
    }

    const postResponses: Promise<{
      url: string;
      status: number;
      statusText: string;
      body: string;
    }>[] = [];

    const capturePostResponse = (response: import("@playwright/test").Response) => {
      if (response.request().method() !== "POST") return;

      postResponses.push(
        response.text().then((body) => ({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          body,
        }))
      );
    };

    page.on("response", capturePostResponse);
    await page.getByRole("button", { name: /تأكيد التبرع/i }).click();
    await page.waitForTimeout(750);
    page.off("response", capturePostResponse);

    const offerResponses = await Promise.all(postResponses);
    console.log("DONATION OFFER POST RESPONSES", offerResponses);

    const offerResponse = offerResponses.find((response) =>
      response.url.includes("/api/")
    );

    expect(offerResponse, JSON.stringify(offerResponses)).toBeDefined();
    expect(offerResponse!.status, offerResponse!.body).toBeLessThan(400);
  });

  test("QA04-E2E-006: الطالب يرى العرض ويقبله", async ({ page }) => {
    await login(page, studentEmail!, studentPassword!);
    await page.goto("/donation-requests?mine=true");

    const card = page.locator("article").filter({ hasText: requestTitle }).first();
    await expect(card).toBeVisible();
    await card.getByRole("button", { name: /عرض التفاصيل/i }).click();
    await page.waitForURL(/\/donation-requests\/[a-f\d]{24}/);

    page.once("dialog", (dialog) => dialog.accept());

    const mutationResponses: Promise<{
      url: string;
      method: string;
      status: number;
      statusText: string;
      body: string;
    }>[] = [];

    const captureMutationResponse = (
      response: import("@playwright/test").Response
    ) => {
      const method = response.request().method();
      if (!["POST", "PATCH", "PUT", "DELETE"].includes(method)) return;

      mutationResponses.push(
        response.text().then((body) => ({
          url: response.url(),
          method,
          status: response.status(),
          statusText: response.statusText(),
          body,
        }))
      );
    };

    page.on("response", captureMutationResponse);
    await page.getByRole("button", { name: /قبول/i }).first().click();
    await page.waitForTimeout(750);
    page.off("response", captureMutationResponse);

    const acceptanceResponses = await Promise.all(mutationResponses);
    console.log("DONATION OFFER ACCEPTANCE RESPONSES", acceptanceResponses);

    const acceptanceResponse = acceptanceResponses.find((response) =>
      response.url.includes("/api/")
    );

    expect(acceptanceResponse, JSON.stringify(acceptanceResponses)).toBeDefined();
    expect(acceptanceResponse!.status, acceptanceResponse!.body).toBeLessThan(400);
  });
});
