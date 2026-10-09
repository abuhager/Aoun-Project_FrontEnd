import { test, expect } from '@playwright/test';
import { settingsFixture } from './fixtures/settings';

for (const refreshFails of [false, true]) {
  test(`@ci dashboard updates booking allowance after cancellation${refreshFails ? ' and hides stale counts if refresh fails' : ''}`, async ({ page }) => {
    const user = { _id: '507f1f77bcf86cd799439011', name: 'مستلم للاختبار', email: 'recipient@aoun.invalid', role: 'user', isVerified: true, trustLevel: 2, trustScore: 70 };
    const itemId = '507f1f77bcf86cd799439012';
    let cancelled = false;
    let dashboardReads = 0;
    await page.route('**/api/**', async route => {
      const path = new URL(route.request().url()).pathname;
      let body: unknown = { success: true, data: { unreadCount: 0, notifications: [], conversations: [] } };
      if (path === '/api/auth/refresh') body = { accessToken: 'dashboard-test-token', user };
      if (path === '/api/settings/public') body = settingsFixture;
      if (path === '/api/ratings/pending') body = { pendingItem: null };
      if (path === `/api/items/cancel/${itemId}`) {
        cancelled = true;
        body = { msg: 'تم إلغاء الحجز', status: 'متاح', bookedBy: null };
      }
      if (path === '/api/items/me') {
        dashboardReads += 1;
        if (cancelled && refreshFails) {
          await route.fulfill({ status: 503, json: { message: 'تعذّر تحديث البيانات' } });
          return;
        }
        body = {
          user, myDonations: [],
          myRequests: cancelled ? [] : [{ _id: itemId, title: 'غرض محجوز للاختبار', status: 'محجوز', category: 'كتب', location: 'عمّان', condition: 'مستعمل جيد', imageUrl: null,
            createdAt: new Date().toISOString(), bookedAt: new Date().toISOString(), expiryHours: 72, recipientConfirmed: false, donorConfirmed: false,
            donor: { _id: '507f1f77bcf86cd799439013', name: 'متبرع للاختبار' }, bookedBy: user, waitlist: [] }],
          usage: { bookings: { used: cancelled ? 0 : 1, limit: 3, remaining: cancelled ? 3 : 2, eligible: true },
            requests: { used: 0, limit: 1, remaining: 1, enabled: true, eligible: true, month: '2026-10' }, donationsTotal: 0 },
        };
      }
      await route.fulfill({ json: body });
    });
    await page.context().addCookies([{ name: 'session_active', value: '1', url: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000' }]);
    await page.goto('/dashboard');
    await expect(page.getByText('1 / 3', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /طلباتي/ }).click();
    await page.getByRole('button', { name: /إلغاء الحجز/ }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'تأكيد', exact: true }).click();
    await expect.poll(() => dashboardReads).toBeGreaterThan(1);
    await expect(page.getByText('تم إلغاء الحجز', { exact: true })).toBeVisible();
    await expect(page.getByText('1 / 3', { exact: true })).toBeHidden();
    if (refreshFails) await expect(page.getByText('تعذر تحميل حدود الحجز', { exact: true })).toBeVisible();
    else await expect(page.getByText('0 / 3', { exact: true })).toBeVisible();
  });
}
