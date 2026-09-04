import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = new URL("../", import.meta.url);
const read = (relativePath) =>
  fs.readFileSync(new URL(relativePath, root), "utf8");

const {
  normalizeApiError,
  shouldRetryApiRequest,
} = await import(`../src/lib/api/apiError.ts?flow14=${Date.now()}`);

const walkSource = (directory) => {
  const absolute = new URL(directory, root);
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.posix.join(directory, entry.name);
    return entry.isDirectory() ? walkSource(relative) : [relative];
  });
};

test("RootLayout لا ينتظر Backend ويُرسم ديناميكياً لتطبيق CSP nonce", () => {
  const layout = read("src/app/layout.tsx");
  const provider = read("src/components/ApiStateProvider.tsx");
  const sync = read("src/components/SettingsSync.tsx");
  const config = read("src/lib/api/swrConfig.ts");

  assert.match(layout, /ApiStateProvider initialPublicSettings=\{null\}/);
  assert.match(layout, /SiteConfigProvider settings=\{null\}/);
  assert.match(layout, /import \{ connection \} from "next\/server"/);
  assert.match(layout, /await connection\(\)/);
  assert.match(layout, /async function RootLayout/);
  assert.doesNotMatch(layout, /getServerPublicSettings|generateMetadata/);
  assert.match(provider, /SWRConfig/);
  assert.match(provider, /PUBLIC_SETTINGS_CACHE_KEY/);
  assert.match(sync, /void refreshSettings\(\)/);
  assert.match(config, /dedupingInterval/);
  assert.match(config, /shouldRetryOnError: shouldRetryApiRequest/);
});

test("المراكز العامة تستخدم cache واحداً بدل طلب مستقل في كل شاشة", () => {
  const hook = read("src/hooks/usePublicHubs.ts");
  const pageHook = read("src/app/(main)/hubs/hooks/useHubs.ts");
  const selector = read("src/components/HubSelector.tsx");
  const requests = read("src/app/(main)/donation-requests/hooks/useDonationRequests.ts");

  assert.match(hook, /useSWR<SafeHub\[]>/);
  assert.match(hook, /PUBLIC_HUBS_CACHE_KEY/);
  for (const source of [pageHook, selector, requests]) {
    assert.match(source, /usePublicHubs/);
    assert.doesNotMatch(source, /axiosInstance|\.get\(["']\/api\/hubs/);
  }
});

test("الصفحات والـhooks لا تتجاوز طبقة API المشتركة", () => {
  const files = walkSource("src").filter(
    (file) => /\.(ts|tsx)$/.test(file) && !file.startsWith("src/lib/api/")
  );

  for (const file of files) {
    const source = read(file);
    assert.doesNotMatch(source, /from\s+["']axios["']/, file);
    assert.doesNotMatch(
      source,
      /axiosInstance\.(get|post|put|patch|delete)\s*\(/,
      file
    );
    assert.doesNotMatch(source, /\bfetch\s*\(/, file);
  }
});

test("طلبات القوائم الحساسة للفلتر تلغي الرد القديم", () => {
  const requests = read("src/app/(main)/donation-requests/hooks/useDonationRequests.ts");
  const profile = read("src/app/(main)/(protected)/profile/[id]/hooks/usePublicProfile.ts");
  const notifications = read("src/hooks/useNotifications.ts");
  const adminUsers = read("src/app/(main)/(protected)/admin/users/hooks/useAdminUsers.ts");

  assert.match(requests, /loadControllerRef\.current\?\.abort\(\)/);
  assert.match(requests, /getDonationRequests\([\s\S]*controller\.signal/);
  assert.match(profile, /getPublicProfile\(id, page, controller\.signal\)/);
  assert.match(notifications, /getNotifications\(NOTIFICATION_LIMIT, controller\.signal\)/);
  assert.match(adminUsers, /getAdminUsers\(\{ page, search \}, signal\)/);
});

test("طابور تهيئة المصادقة ينظف timeout وabort ولا يحتفظ بالطلب المنتهي", () => {
  const source = read("src/lib/api/axiosInstance.ts");

  assert.match(source, /const initQueue = new Set<InitQueueItem>/);
  assert.match(source, /initQueue\.delete\(item\)/);
  assert.match(source, /removeEventListener\?\.\("abort", onAbort\)/);
  assert.match(source, /new axios\.CanceledError\("REQUEST_CANCELED"\)/);
  assert.doesNotMatch(source, /initQueueRejects/);
});

test("تغيير كلمة المرور يمسح مستخدم AuthContext ولا يترك Socket بهوية قديمة", () => {
  const reset = read("src/app/(auth)/reset-password/hooks/useResetPassword.ts");

  assert.match(reset, /const \{ setUser \} = useAuth\(\)/);
  assert.match(reset, /setUser\(null\)/);
  assert.match(reset, /if \(hasReadFragment\.current\) return/);
});

test("التقييم يعيد الاستعلام بعد الحفظ دون مهلة زمنية اعتباطية", () => {
  const rating = read("src/components/GlobalRatingModal/useGlobalRating.ts");

  assert.match(rating, /submitRating\(/);
  assert.match(rating, /await checkPendingRatings\(\)/);
  assert.match(rating, /getPendingRating\(controller\.signal\)/);
  assert.doesNotMatch(rating, /setTimeout|500/);
});

test("تحديث إعدادات الإدارة يحدّث SiteConfig وSWR بنفس العملية", () => {
  const settings = read("src/app/(main)/(protected)/admin/settings/page.tsx");

  assert.match(settings, /applyPublicSettings\(result\.publicSettings\)/);
  assert.match(settings, /mutate\(PUBLIC_SETTINGS_CACHE_KEY, result\.publicSettings/);
  assert.match(settings, /revalidate: false/);
});

test("أخطاء API لها مصدر تطبيع واحد ومسار توافق خفيف", () => {
  const canonical = read("src/lib/api/apiError.ts");
  const compatibility = read("src/lib/api/extractErrorMsg.ts");
  const apiTypes = read("src/types/api.types.ts");

  assert.match(canonical, /normalizeApiError/);
  assert.match(canonical, /shouldRetryApiRequest/);
  assert.match(compatibility, /export \{ extractErrorMsg \} from "\.\/apiError"/);
  assert.doesNotMatch(apiTypes, /function extractApiError/);
});

test("تطبيع الخطأ يحفظ code/status ويخفي رموز الأخطاء الداخلية", () => {
  const conflictError = {
    isAxiosError: true,
    response: {
      status: 409,
      data: { msg: "موجود مسبقاً", code: "ALREADY_EXISTS", requestId: "req-1" },
    },
  };
  const conflict = normalizeApiError(conflictError);
  const internal = normalizeApiError(new Error("AUTH_INIT_TIMEOUT"), "تعذر الاتصال");

  assert.deepEqual(
    {
      message: conflict.message,
      code: conflict.code,
      status: conflict.status,
      requestId: conflict.requestId,
    },
    {
      message: "موجود مسبقاً",
      code: "ALREADY_EXISTS",
      status: 409,
      requestId: "req-1",
    }
  );
  assert.equal(internal.message, "تعذر الاتصال");
  assert.equal(shouldRetryApiRequest({
    isAxiosError: true,
    response: { status: 503, data: {} },
  }), true);
  assert.equal(shouldRetryApiRequest(conflictError), false);
});
