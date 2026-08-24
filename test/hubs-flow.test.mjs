import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('نموذج المركز يطابق حدود Backend ويقبل الإحداثي صفر', async () => {
  const { buildHubPayload, DEFAULT_HUB_WORKING_HOURS } = await import(
    '../src/lib/validation/hub.ts'
  );
  const base = {
    name: '  مركز عمان  ',
    address: '  شارع الجامعة  ',
    city: '  عمان  ',
    workingHours: '',
    lat: '0',
    lng: '0',
  };

  const valid = buildHubPayload(base);
  assert.deepEqual(valid.errors, []);
  assert.equal(valid.payload.name, 'مركز عمان');
  assert.equal(valid.payload.workingHours, DEFAULT_HUB_WORKING_HOURS);
  assert.deepEqual(valid.payload.coordinates, { lat: 0, lng: 0 });

  const partial = buildHubPayload({ ...base, lng: '' });
  assert.match(partial.errors.join(' '), /معاً/);

  const outsideBounds = buildHubPayload({ ...base, lat: '91', lng: '-181' });
  assert.match(outsideBounds.errors.join(' '), /-90 و90/);
  assert.match(outsideBounds.errors.join(' '), /-180 و180/);
});

test('مسح إحداثيات مركز موجود يرسل null صراحة', async () => {
  const { buildHubPayload } = await import('../src/lib/validation/hub.ts');
  const result = buildHubPayload({
    name: 'مركز عمان',
    address: 'شارع الجامعة',
    city: 'عمان',
    workingHours: '9:00 ص — 5:00 م',
    lat: '',
    lng: '',
  }, { clearExistingCoordinates: true });

  assert.deepEqual(result.errors, []);
  assert.equal(result.payload.coordinates, null);
});

test('API يفك غلاف استجابة التعطيل وإعادة التفعيل', async () => {
  const [source, axiosSource] = await Promise.all([
    readSource('../src/lib/api/hubApi.ts'),
    readSource('../src/lib/api/axiosInstance.ts'),
  ]);
  assert.match(source, /delete<HubMutationResponse>/);
  assert.match(source, /patch<HubMutationResponse>/);
  assert.equal((source.match(/return res\.data\.hub;/g) ?? []).length, 2);
  assert.ok(
    axiosSource.includes('{ pattern: /^\\/api\\/hubs\\/?$/, getOnly: true }')
  );
  assert.doesNotMatch(axiosSource, /hubs[^\n]*getOnly: false/);
});

test('صفحة المراكز تعتمد Navbar المشترك وتعرض البحث والخطأ وإعادة المحاولة', async () => {
  const [page, hook] = await Promise.all([
    readSource('../src/app/(main)/hubs/page.tsx'),
    readSource('../src/app/(main)/hubs/hooks/useHubs.ts'),
  ]);

  assert.doesNotMatch(page, /import Navbar|<Navbar/);
  assert.match(page, /role="alert"/);
  assert.match(page, /setSearch/);
  assert.match(page, /setCity/);
  assert.match(page, /إعادة المحاولة/);
  assert.match(hook, /usePublicHubs/);
  assert.doesNotMatch(hook, /getHubs\(/);
  assert.match(hook, /toLocaleLowerCase/);
});

test('اختيار المركز إلزامي عند طلبه ويتيح إعادة جلب القائمة', async () => {
  const source = await readSource('../src/components/HubSelector.tsx');
  assert.match(source, /required=\{required\}/);
  assert.match(source, /void refresh\(\)/);
  assert.match(source, /usePublicHubs/);
  assert.match(source, /لا توجد مراكز متاحة/);
});

test('لوحة الأدمن تستخدم التحقق المشترك ولا تخفي الإحداثي صفر', async () => {
  const [page, types] = await Promise.all([
    readSource('../src/app/(main)/(protected)/admin/hubs/page.tsx'),
    readSource('../src/types/hub.types.ts'),
  ]);

  assert.match(page, /buildHubPayload/);
  assert.match(page, /hub\.coordinates &&/);
  assert.doesNotMatch(page, /hub\.coordinates\?\.lat &&/);
  assert.doesNotMatch(types, /isActive\?:\s+boolean/);
  assert.match(types, /coordinates\?:\s+HubCoordinates \| null/);
});
