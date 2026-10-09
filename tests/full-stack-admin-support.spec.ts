import { test, expect, request, type Page } from '@playwright/test';

test.describe('@fullstack admin settings, support, privacy and demo', () => {
  test.skip(process.env.E2E_FULL_STACK !== 'true', 'Requires an isolated local backend and replica set');
  const backend = process.env.E2E_BACKEND_URL || 'http://127.0.0.1:3001';
  const password = 'ReviewSynthetic123!';

  test.beforeAll(() => {
    expect(['127.0.0.1', 'localhost']).toContain(new URL(backend).hostname);
  });

  async function login(page: Page, account: string) {
    await page.goto('/login');
    await page.getByLabel(/البريد الإلكتروني/).fill(`${account}@aoun.invalid`);
    await page.getByLabel('كلمة المرور', { exact: true }).fill(password);
    await page.getByRole('button', { name: /^دخول$|تسجيل الدخول/ }).click();
    await expect.poll(async () => new URL(page.url()).pathname).not.toBe('/login');
  }
  async function apiToken(account: string) {
    const api = await request.newContext();
    try {
      const response = await api.post(`${backend}/api/auth/login`, { data: { email: `${account}@aoun.invalid`, password } });
      expect(response.status()).toBe(200);
      const body = await response.json();
      return { token: body.accessToken, user: body.user };
    } finally { await api.dispose(); }
  }

  test('save feature switch through the real API, reload, and deny demo writes', async ({ page }) => {
    await login(page, 'super');
    await page.goto('/admin/settings');
    const toggle = page.getByRole('switch', { name: 'طلبات التبرع', exact: true });
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await toggle.click();
    await page.getByRole('button', { name: /حفظ الإعدادات/ }).click();
    await expect(page.getByRole('button', { name: /حفظ الإعدادات/ })).toBeDisabled();
    await page.reload();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    const user = await apiToken('user');
    const gated = await page.request.get(`${backend}/api/donation-requests`, { headers: { authorization: `Bearer ${user.token}` } });
    expect(gated.status()).toBe(403);
    expect((await gated.json()).code).toBe('DONATION_REQUESTS_DISABLED');
    const demo = await apiToken('demo');
    const header = { authorization: `Bearer ${demo.token}` };
    const settings = await (await page.request.get(`${backend}/api/settings`, { headers: header })).json();
    const denied = await page.request.patch(`${backend}/api/settings`, { headers: header, data: { expectedVersion: settings.version, donationRequestsEnabled: true } });
    expect(denied.status()).toBe(403); expect((await denied.json()).code).toBe('DEMO_READ_ONLY');
    await toggle.click();
    await page.getByRole('button', { name: /حفظ الإعدادات/ }).click();
    await expect(page.getByRole('button', { name: /حفظ الإعدادات/ })).toBeDisabled();
  });

  test('user opens private support, admin claims and replies via Socket, then resolves', async ({ page, browser }, testInfo) => {
    // Each attempt gets a fresh ticket so a previous claim cannot mask a failure.
    const requester = testInfo.retry ? 'outsider' : 'user';
    const unrelatedAccount = testInfo.retry ? 'user' : 'outsider';
    const subject = `طلب دعم اصطناعي عبر المتصفح ${testInfo.retry}`;
    await login(page, requester);
    await page.goto('/support');
    await page.getByLabel('عنوان المشكلة').fill(subject);
    await page.getByRole('button', { name: /فتح \/ إعادة فتح محادثة الدعم/ }).click();
    const composer = page.getByRole('textbox', { name: 'نص الرسالة', exact: true });
    await expect(composer).toBeEnabled();
    await composer.fill('أحتاج مساعدة تجريبية');
    await page.getByRole('button', { name: 'إرسال الرسالة', exact: true }).click();
    const context = await browser.newContext({ baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000' });
    const adminPage = await context.newPage();
    try {
      await login(adminPage, 'admin'); await adminPage.goto('/admin/support');
      const ticket = adminPage.getByRole('article').filter({ hasText: subject });
      await ticket.getByRole('button', { name: 'استلام الطلب', exact: true }).click();
      const reply = adminPage.getByRole('textbox', { name: 'نص الرسالة', exact: true });
      await expect(reply).toBeEnabled(); await reply.fill('رد الدعم الاصطناعي');
      await adminPage.getByRole('button', { name: 'إرسال الرسالة', exact: true }).click();
      await expect(page.getByText('رد الدعم الاصطناعي', { exact: true })).toBeVisible();
      await adminPage.getByRole('button', { name: 'إغلاق المحادثة', exact: true }).click();
      await ticket.getByRole('button', { name: 'تم حل المشكلة', exact: true }).click();
      await expect(ticket.getByText('تم الحل', { exact: true })).toBeVisible();
      await expect(composer).toBeDisabled();
      const outsider = await apiToken(unrelatedAccount);
      const admin = await apiToken('admin');
      const tickets = await (await adminPage.request.get(`${backend}/api/support/inbox`, { headers: { authorization: `Bearer ${admin.token}` } })).json();
      const id = tickets.tickets.find((row: { subject: string }) => row.subject === subject)._id;
      const denied = await adminPage.request.get(`${backend}/api/conversations/${id}/messages`, { headers: { authorization: `Bearer ${outsider.token}` } });
      expect(denied.status()).toBe(403);
    } finally {
      // Cleanup must preserve the original assertion if the test already timed out.
      await context.close().catch(() => undefined);
    }
  });
});
