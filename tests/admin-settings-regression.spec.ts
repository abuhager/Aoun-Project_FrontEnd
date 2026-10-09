import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { settingsFixture } from './fixtures/settings';
import type { SystemSettings } from '../src/types/settings.types';

async function mockSettings(page: Page, role = 'super_admin') {
  let settings = structuredClone(settingsFixture);
  const patches: Record<string, unknown>[] = [];
  let conflict = false;
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    let body: unknown = { data: { unreadCount: 0, notifications: [], conversations: [] }, success: true };
    if (path === '/api/auth/refresh') body = { accessToken: 'settings-test-token', user: { _id: '507f1f77bcf86cd799439011', name: 'مشرف تجريبي للاختبار', role, isVerified: true, trustLevel: 2 } };
    if (path === '/api/settings/public') body = settings;
    if (path === '/api/settings') {
      if (route.request().method() === 'PATCH') {
        const payload = route.request().postDataJSON(); patches.push(payload);
        if (conflict) {
          conflict = false; settings = { ...settings, version: settings.version + 1, bookingExpiryHours: 96 };
          await route.fulfill({ status: 409, json: { code: 'SETTINGS_VERSION_CONFLICT' } }); return;
        }
        settings = { ...settings, ...payload, version: settings.version + 1 } as SystemSettings;
        body = { settings, publicSettings: settings, msg: 'تم الحفظ', changedFields: Object.keys(payload) };
      } else body = settings;
    }
    await route.fulfill({ json: body });
  });
  await page.context().addCookies([{ name: 'session_active', value: '1', url: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000' }]);
  await page.goto('/admin/settings');
  await expect(page.getByRole('switch', { name: 'طلبات التبرع', exact: true })).toBeVisible();
  return { patches, conflictNext: () => { conflict = true; } };
}

for (const mixed of [false, true]) {
  test(`@ci persists donation feature switch${mixed ? ' alongside another field' : ' by itself'}`, async ({ page }) => {
    const state = await mockSettings(page);
    const toggle = page.getByRole('switch', { name: 'طلبات التبرع', exact: true });
    await toggle.focus(); await page.keyboard.press('Space');
    if (mixed) await page.getByLabel('اسم المنصة', { exact: true }).fill('عون اختبار');
    await page.getByRole('button', { name: /حفظ الإعدادات/ }).click();
    await expect.poll(() => state.patches.length).toBe(1);
    expect(state.patches[0]).toEqual({ expectedVersion: 1, donationRequestsEnabled: false, ...(mixed ? { platformName: 'عون اختبار' } : {}) });
    await expect(page.getByRole('button', { name: /حفظ الإعدادات/ })).toBeDisabled();
    await page.reload();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
  });
}

test('@ci settings fields have accessible names and handle conflict reload', async ({ page }) => {
  const state = await mockSettings(page);
  await expect(page.getByRole('spinbutton', { name: /انتهاء الحجز/ })).toHaveValue('72');
  const unnamed = await page.locator('main input:not([type=hidden])').evaluateAll(inputs => inputs.filter(input => {
    const el = input as HTMLInputElement;
    return !(el.labels?.length || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby'));
  }).map(el => el.outerHTML));
  expect(unnamed).toEqual([]);
  const results = await new AxeBuilder({ page }).include('main').withRules([
    'label', 'button-name', 'aria-allowed-attr', 'aria-required-attr', 'aria-valid-attr-value', 'aria-roles', 'aria-toggle-field-name',
  ]).analyze();
  expect(results.violations).toEqual([]);
  state.conflictNext();
  await page.getByRole('switch', { name: 'طلبات التبرع', exact: true }).click();
  await page.getByRole('button', { name: /حفظ الإعدادات/ }).click();
  await expect(page.getByRole('spinbutton', { name: /انتهاء الحجز/ })).toHaveValue('96');
  await expect(page.getByRole('switch', { name: 'طلبات التبرع', exact: true })).toHaveAttribute('aria-checked', 'true');
});

test('@ci ordinary admin can inspect settings without editing them', async ({ page }) => {
  await mockSettings(page, 'admin');
  await expect(page.getByRole('switch', { name: 'طلبات التبرع', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: /حفظ الإعدادات/ })).toBeDisabled();
});
