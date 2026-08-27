import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relativePath) =>
  fs.readFileSync(new URL(relativePath, root), "utf8");

test("صفحة طلبات التبرع بقيت الصفحة الكاملة بعد استخراج RequestState", () => {
  const page = read("src/app/(main)/donation-requests/DonationRequestsClient.tsx");

  assert.match(page, /export default function DonationRequestsClient/);
  assert.match(page, /getDonationRequests/);
  assert.match(page, /RequestState/);
  assert.match(page, /loadError/);
  assert.doesNotMatch(page, /export default function RequestState/);
});

test("حالة الطلب المشتركة تدعم الخطأ والفراغ وإعادة المحاولة ورقم التتبع", () => {
  const state = read("src/components/ui/RequestState.tsx");

  assert.match(state, /role="alert"/);
  assert.match(state, /onRetry/);
  assert.match(state, /referenceId/);
  assert.match(state, /isEmpty/);
});

test("حدود Next العامة توفر reset ولا تعرض رسالة الخطأ التقنية للمستخدم", () => {
  const routeError = read("src/app/error.tsx");
  const globalError = read("src/app/global-error.tsx");
  const notFound = read("src/app/not-found.tsx");

  for (const source of [routeError, globalError]) {
    assert.match(source, /reset/);
    assert.match(source, /error\.digest/);
    assert.doesNotMatch(source, />\s*\{error\.message\}\s*</);
  }
  assert.match(globalError, /<html lang="ar" dir="rtl">/);
  assert.match(globalError, /import Link from "next\/link"/);
  assert.doesNotMatch(globalError, /<a\s+href="\/"/);
  assert.match(notFound, /404/);
});

test("تطبيع أخطاء API هو المصدر المشترك للرسالة والكود ورقم الطلب", () => {
  const apiError = read("src/lib/api/apiError.ts");
  const page = read("src/app/(main)/donation-requests/DonationRequestsClient.tsx");

  assert.match(apiError, /interface NormalizedApiError/);
  assert.match(apiError, /requestId: string \| null/);
  assert.match(apiError, /isNetworkError/);
  assert.match(page, /normalizeApiError/);
});
