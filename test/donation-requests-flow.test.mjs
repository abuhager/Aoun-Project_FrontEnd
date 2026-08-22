import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('Donation Request API يطابق مسارات القبول والرفض والسحب ويحافظ على FormData boundary', async () => {
  const source = await readSource('../src/lib/api/donationRequestApi.ts');

  assert.match(source, /offers\/\$\{offerId\}\/accept/);
  assert.match(source, /offers\/\$\{offerId\}\/reject/);
  assert.match(source, /offers\/\$\{offerId\}\/withdraw/);
  assert.match(source, /status:\s+'pending'/);
  assert.doesNotMatch(source, /multipart\/form-data/);
});

test('إرسال العرض لا يفتح offerId كأنه Item ID', async () => {
  const source = await readSource('../src/app/(main)/donation-requests/DonationRequestsClient.tsx');

  assert.doesNotMatch(source, /`\/items\/\$\{res\.offerId\}`/);
  assert.match(source, /تم إرسال العرض للمراجعة/);
  assert.match(source, /router\.push\(`\/donation-requests\/\$\{requestId\}`\)/);
});

test('قائمة الطلبات تمنع التبرع للطلب الشخصي وتتعامل مع الزائر', async () => {
  const source = await readSource('../src/app/(main)/donation-requests/DonationRequestsClient.tsx');

  assert.match(source, /request\.requester\?\._id !== user\?\._id/);
  assert.match(source, /login\?redirect=/);
  assert.match(source, /MAX_OFFER_IMAGE_BYTES/);
  assert.match(source, /image\/webp/);
});

test('تفاصيل الطلب تستخدم AuthContext ولا تطلب auth\/me مرة ثانية', async () => {
  const source = await readSource('../src/app/(main)/donation-requests/[id]/page.tsx');

  assert.match(source, /useAuth\(\)/);
  assert.match(source, /request\.requester\?\._id !== currentUserId/);
  assert.match(source, /getOffersByRequest\(id\)/);
  assert.doesNotMatch(source, /\/api\/auth\/me|axiosInstance/);
});

test('صاحب الطلب يستطيع قبول أو رفض العرض والمتبرع يستطيع سحب عرضه المعلق', async () => {
  const source = await readSource('../src/app/(main)/donation-requests/[id]/page.tsx');

  assert.match(source, /acceptOffer\(id, offerId\)/);
  assert.match(source, /rejectOffer\(id, offerId\)/);
  assert.match(source, /withdrawOffer\(id, offerId\)/);
  assert.match(source, /viewerOffer\.status === "pending"/);
  assert.match(source, /cancelDonationRequest\(id\)/);
});

test('صاحب العرض المرفوض لا يرى تفاصيل أو رابط الغرض الفائز', async () => {
  const source = await readSource('../src/app/(main)/donation-requests/[id]/page.tsx');

  assert.match(source, /viewerOffer\?\.status === "accepted"/);
  assert.match(source, /const respondedItem = canViewFulfilledItem/);
  assert.match(source, /تم اختيار عرض آخر/);
  assert.match(source, /لن تظهر لك بيانات الغرض أو المتبرع/);
  assert.match(source, /isAccepted && respondedItem/);
});

test('صفحة الغرض المرتبط بالطلب تمنع دورة الحجز العامة وتبقي التسليم للطرفين', async () => {
  const source = await readSource('../src/app/(main)/items/[id]/page.tsx');

  assert.match(source, /const isRequestLinked = Boolean\(item\.linkedRequestId\)/);
  assert.match(source, /!isRequestLinked && item\.status === "محجوز"/);
  assert.match(source, /!isRecipientConfirmedActual && !isRequestLinked/);
  assert.match(source, /لا يظهر في التصفح العام أو قوائم الانتظار/);
  assert.match(source, /delivery\.confirmReceipt/);
  assert.match(source, /delivery\.confirmDelivery/);
});

test('صفحة العرض المخصصة تتحقق من الصورة وتعود للطلب بعد الإرسال', async () => {
  const source = await readSource('../src/app/(main)/donation-requests/[id]/offer/page.tsx');

  assert.match(source, /MAX_IMAGE_BYTES = 5 \* 1024 \* 1024/);
  assert.match(source, /image\/jpeg/);
  assert.match(source, /URL\.revokeObjectURL/);
  assert.match(source, /respondToDonationRequest\(id/);
  assert.match(source, /router\.replace\(`\/donation-requests\/\$\{id\}\?offer=submitted`\)/);
  assert.doesNotMatch(source, /\/items\/\$\{.*offer/);
});

test('نموذج الطلب الجديد يطابق حدود Backend ويدعم urgency', async () => {
  const source = await readSource('../src/app/(main)/donation-requests/new/page.tsx');

  assert.match(source, /maxLength=\{100\}/);
  assert.match(source, /maxLength=\{500\}/);
  assert.match(source, /urgency: form\.urgency/);
  assert.match(source, /extractErrorMsg\(err, 'تعذر نشر الطلب'\)/);
});

test('القائمة والتفاصيل عامة بينما الإنشاء والعرض محميان', async () => {
  const [routes, axios] = await Promise.all([
    readSource('../src/config/routes.ts'),
    readSource('../src/lib/api/axiosInstance.ts'),
  ]);

  assert.match(routes, /segments\[1\] === 'new' \|\| segments\[2\] === 'offer'/);
  assert.ok(axios.includes('donation-requests\\/?$'));
  assert.ok(axios.includes('donation-requests\\/[a-f\\d]{24}'));
});

test('أنواع العرض والإشعارات تغطي كل حالات دورة Flow 6', async () => {
  const [types, bell] = await Promise.all([
    readSource('../src/types/donationRequest.types.ts'),
    readSource('../src/components/NotificationBell.tsx'),
  ]);

  assert.match(types, /\| 'withdrawn'/);
  assert.match(types, /\| 'request_expired'/);
  assert.match(types, /viewerOffer\?:/);
  assert.match(bell, /request_new_offer/);
  assert.match(bell, /offer_accepted/);
  assert.match(bell, /offer_withdrawn/);
});
