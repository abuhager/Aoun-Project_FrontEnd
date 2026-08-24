import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), 'utf8');

test('عقد الإشعارات يطابق أنواع Backend ونتيجة العد الكلية', async () => {
  const types = await readSource('../src/types/notification.types.ts');

  assert.match(types, /export type NotificationType/);
  for (const type of [
    'booking_expiry_reminder',
    'waitlist_promoted',
    'admin_warning',
    'admin_ban',
    'new_message',
    'offer_rejected',
  ]) {
    assert.match(types, new RegExp(`["']${type}["']`));
  }
  assert.match(types, /totalCount:\s+number/);
  assert.match(types, /hasMore:\s+boolean/);
  assert.match(types, /limit:\s+number/);
});

test('Notification API يرسل حداً مضبوطاً ويحافظ على مسارات القراءة', async () => {
  const api = await readSource('../src/lib/api/notificationApi.ts');

  assert.match(api, /getNotifications = async \(\s*limit = 20/);
  assert.match(api, /params:\s*\{ limit \}/);
  assert.match(api, /\/api\/notifications\/read-all/);
  assert.match(api, /\/api\/notifications\/\$\{id\}\/read/);
});

test('Hook يمنع تكرار Socket ويحد القائمة ويتجاهل الردود القديمة', async () => {
  const hook = await readSource('../src/hooks/useNotifications.ts');

  assert.match(hook, /seenIdsRef\.current\.has\(notification\._id\)/);
  assert.match(hook, /\.slice\(0, NOTIFICATION_LIMIT\)/);
  assert.match(hook, /requestSequenceRef/);
  assert.match(hook, /requestId !== requestSequenceRef\.current/);
  assert.match(hook, /setTotalCount/);
  assert.match(hook, /setHasMore/);
  assert.match(hook, /setError\('تعذر تحميل الإشعارات'\)/);
  assert.match(hook, /SOCKET_EVENTS\.NOTIFICATION_NEW/);
  assert.match(hook, /SOCKET_EVENTS\.NOTIFICATION_REFRESH/);
  assert.doesNotMatch(hook, /unreadMessages/);
});

test('جرس الإشعارات يعرض فشل التحميل ويغلق بثبات ويحمي التنقل', async () => {
  const bell = await readSource('../src/components/NotificationBell.tsx');

  assert.match(bell, /getSafeRedirectPath\(destination, ""\)/);
  assert.match(bell, /if \(isOpen\) close\(\)/);
  assert.match(bell, /onClick=\{\(\) => void refresh\(\)\}/);
  assert.match(bell, /role="alert"/);
  assert.match(bell, /hasMore/);
  assert.match(bell, /totalCount/);
  assert.match(bell, /admin_ban:\s*"block"/);
  assert.match(bell, /aria-live="polite"/);
});
