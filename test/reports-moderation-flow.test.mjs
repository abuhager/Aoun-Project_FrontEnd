import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), 'utf8');

test('عقد البلاغ يستخدم reportedUserId وitemId من الواجهة حتى الخدمة', async () => {
  const [types, api] = await Promise.all([
    readSource('../src/types/report.types.ts'),
    readSource('../src/lib/api/reportApi.ts'),
  ]);

  assert.match(types, /reportedUserId:\s*string/);
  assert.match(types, /itemId\?:\s*string/);
  assert.match(types, /ReportDecision = Exclude<ReportStatus, 'pending'>/);
  assert.match(api, /axiosInstance\.post[\s\S]*'\/api\/reports'/);
  assert.match(api, /resolveAdminReport/);
});

test('نافذة البلاغ تعرض الأسباب الديناميكية وتسمح بعقد التفاصيل الكامل', async () => {
  const modal = await readSource('../src/components/ReportModal/index.tsx');

  assert.match(modal, /useSettings\(\)/);
  assert.match(modal, /reportReasons\.length > 0/);
  assert.match(modal, /maxLength=\{1000\}/);
  assert.match(modal, /details\.length\}\/1000/);
  assert.match(modal, /extractErrorMsg/);
});

test('نافذة الاعتراض تستخدم API الموحد ولا تعرض مهلة ثابتة مضللة', async () => {
  const appeal = await readSource('../src/components/AppealModal/index.tsx');

  assert.match(appeal, /submitAppeal\(reportId/);
  assert.match(appeal, /REPORT_ALREADY_RESOLVED/);
  assert.doesNotMatch(appeal, /72 ساعة/);
  assert.doesNotMatch(appeal, /axiosInstance\.post/);
});

test('لوحة الإشراف لا تطلب البلاغات قبل حسم صلاحية المستخدم', async () => {
  const page = await readSource('../src/app/(main)/(protected)/admin/reports/page.tsx');

  assert.match(page, /!authLoading && isAdmin \? SWR_KEY/);
  assert.match(page, /getAdminReports/);
  assert.match(page, /resolveAdminReport/);
  assert.match(page, /await mutate\(\)/);
  assert.doesNotMatch(page, /globalMutate/);
  assert.doesNotMatch(page, /axiosInstance\.post/);
});

test('API الإدارة يرسل الفلتر فقط عند اختيار حالة فعلية', async () => {
  const api = await readSource('../src/lib/api/reportApi.ts');

  assert.match(api, /status === 'all' \? undefined : status/);
  assert.match(api, /\/api\/admin\/reports\/\$\{reportId\}\/resolve/);
});
