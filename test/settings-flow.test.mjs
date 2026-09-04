import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readSource = (relativePath) => readFile(new URL(relativePath, import.meta.url), 'utf8');

test('عقد الإعدادات العامة يغطي الهوية والقوائم والصيانة وسياسة Safe Hub', async () => {
  const [types, api] = await Promise.all([
    readSource('../src/types/settings.types.ts'),
    readSource('../src/lib/api/settingsApi.ts'),
  ]);

  for (const field of [
    'platformName',
    'contactEmail',
    'categories',
    'locations',
    'reportReasons',
    'maxAvatarSizeMb',
    'requireHubForBooking',
    'maintenanceMode',
    'updatedAt',
  ]) {
    assert.match(types, new RegExp(`\\b${field}\\b`));
  }

  assert.match(api, /PUBLIC_SETTINGS_CACHE_KEY/);
  assert.match(api, /UpdateSettingsResponse/);
});

test('صفحة الإدارة ترسل الحقول المتغيرة فقط وتحصر التعديل بالمشرف الأعلى', async () => {
  const page = await readSource(
    '../src/app/(main)/(protected)/admin/settings/page.tsx'
  );

  assert.match(page, /const changedFields = useMemo/);
  assert.match(page, /Object\.fromEntries\([\s\S]*changedFields/);
  assert.match(page, /user\?\.role === "super_admin"/);
  assert.match(page, /disabled=\{!canEdit \|\| saving\}/);
  assert.match(page, /window\.confirm/);
  assert.match(page, /applyPublicSettings\(result\.publicSettings\)/);

  for (const field of [
    'studentQuota',
    'locations',
    'maxWaitlistPerItem',
    'appealWindowHours',
    'maxOtpAttempts',
    'maxAvatarSizeMb',
    'profilePageSize',
  ]) {
    assert.match(page, new RegExp(`\\b${field}\\b`));
  }
});

test('الإعدادات تتزامن فورياً عبر Socket وSWR وتُركب داخل الـProviders الصحيحة', async () => {
  const [sync, layout, events, types] = await Promise.all([
    readSource('../src/components/SettingsSync.tsx'),
    readSource('../src/app/layout.tsx'),
    readSource('../src/config/socket.ts'),
    readSource('../src/types/socket.types.ts'),
  ]);

  assert.match(events, /SETTINGS_UPDATED: "settings:updated"/);
  assert.match(types, /SOCKET_EVENTS\.SETTINGS_UPDATED/);
  assert.match(sync, /socket\.on\(SOCKET_EVENTS\.SETTINGS_UPDATED/);
  assert.match(sync, /mutate\(PUBLIC_SETTINGS_CACHE_KEY, settings/);
  assert.match(sync, /useEffect\(\(\) => \{\s*void refreshSettings\(\);/);
  assert.match(sync, /socket\.recovered/);
  assert.match(layout, /<SocketProvider>[\s\S]*<SettingsSync \/>[\s\S]*<MaintenanceGate>/);
});

test('واجهة الصيانة تسمح بدخول الإدارة وتحجب محتوى المستخدم العادي', async () => {
  const gate = await readSource('../src/components/MaintenanceGate.tsx');

  assert.match(gate, /maintenanceMode/);
  assert.match(gate, /user\?\.role === "admin" \|\| user\?\.role === "super_admin"/);
  assert.match(gate, /AUTH_BYPASS_PATHS/);
  assert.match(gate, /إعادة المحاولة/);
  assert.match(gate, /mailto:/);
});

test('سياسة Safe Hub الديناميكية تطبق على الإضافة والتعديل وعروض الطلبات', async () => {
  const sources = await Promise.all([
    readSource('../src/app/(main)/(protected)/add-item/hooks/useAddItem.ts'),
    readSource('../src/app/(main)/(protected)/add-item/page.tsx'),
    readSource('../src/app/(main)/(protected)/items/[id]/edit/hooks/useEditItem.ts'),
    readSource('../src/app/(main)/(protected)/items/[id]/edit/page.tsx'),
    readSource('../src/app/(main)/donation-requests/[id]/offer/page.tsx'),
    readSource('../src/app/(main)/donation-requests/hooks/useDonationRequests.ts'),
    readSource('../src/lib/api/donationRequestApi.ts'),
  ]);

  assert.match(sources[0], /hubRequired && !formData\.hubId/);
  assert.match(sources[1], /required=\{hubRequired\}/);
  assert.match(sources[2], /hubRequired && !formData\.hubId/);
  assert.match(sources[3], /required=\{hubRequired\}/);
  assert.match(sources[4], /requireHubForBooking && !form\.safeHub/);
  assert.match(sources[5], /requireHubForBooking && !respondForm\.safeHub/);
  assert.match(sources[6], /if \(payload\.safeHub\) formData\.append/);
});

test('لوحة البلاغات تعرض عدد البلاغات المعتمدة وسجل الإعدادات واضح للمشرف', async () => {
  const [reports, logs, navbar] = await Promise.all([
    readSource('../src/app/(main)/(protected)/admin/reports/components/ReportReviewDialog.tsx'),
    readSource('../src/app/(main)/(protected)/admin/logs/components/AdminLogsTable.tsx'),
    readSource('../src/components/Navbar/index.tsx'),
  ]);

  assert.match(reports, /actionedReportsAgainstUser/);
  assert.match(reports, /بلاغ معتمد/);
  assert.match(logs, /SETTINGS_UPDATE/);
  assert.match(logs, /changedFields/);
  assert.match(navbar, /userRole === "admin" \|\| userRole === "super_admin"/);
});
