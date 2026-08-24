import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('Item API يستخدم مسارات Backend الفعلية ويترك FormData يحدد boundary', async () => {
  const source = await readSource('../src/lib/api/itemApi.ts');

  assert.match(source, /delete<\{ msg: string \}>\(\s*`\/api\/items\/\$\{id\}`/);
  assert.match(source, /`\/api\/items\/\$\{id\}\/confirm-delivery`/);
  assert.match(source, /`\/api\/items\/\$\{id\}\/confirm-receipt`/);
  assert.match(source, /`\/api\/items\/leave-waitlist\/\$\{id\}`/);
  assert.doesNotMatch(source, /\/api\/items\/delete\//);
  assert.doesNotMatch(source, /\/api\/items\/update\//);
  assert.doesNotMatch(source, /multipart\/form-data/);
});

test('Browse يرسل الفلاتر والصفحة إلى السيرفر ولا يرشح الصفحة الأولى محلياً', async () => {
  const [hook, page] = await Promise.all([
    readSource('../src/app/(main)/browse/hooks/useBrowse.ts'),
    readSource('../src/app/(main)/browse/page.tsx'),
  ]);

  assert.match(hook, /getItems\(/);
  assert.match(hook, /page: currentPage/);
  assert.match(hook, /search: debouncedSearch/);
  assert.match(hook, /location: selectedCity/);
  assert.match(hook, /category: selectedCategory/);
  assert.match(hook, /AbortController/);
  assert.doesNotMatch(hook, /\.filter\(/);
  assert.match(page, /صفحة \{currentPage\} من \{totalPages\}/);
  assert.match(page, /إعادة المحاولة/);
});

test('صفحة الغرض تعتمد حالة الانتظار من Backend وتنتظر تهيئة الهوية', async () => {
  const [hook, page, deliveryHook] = await Promise.all([
    readSource('../src/app/(main)/items/[id]/hooks/useItemDetails.ts'),
    readSource('../src/app/(main)/items/[id]/page.tsx'),
    readSource('../src/hooks/useDeliveryConfirmation.ts'),
  ]);

  assert.match(hook, /item\?\.isInWaitlist/);
  assert.match(hook, /bookingPreviouslyCancelled/);
  assert.match(hook, /leaveWaitlist\(itemId\)/);
  assert.match(hook, /if \(authLoading\) return/);
  assert.match(hook, /SOCKET_EVENTS\.ITEM_RECIPIENT_CONFIRMED/);
  assert.match(hook, /SOCKET_EVENTS\.ITEM_DELETED/);
  assert.doesNotMatch(hook, /localStorage/);
  assert.match(page, /disabled=\{delivery\.isLoading \|\| !isRecipientConfirmedActual\}/);
  assert.match(page, /!isRecipientConfirmedActual &&/);
  assert.match(page, /سجل دخولك للانضمام لقائمة الانتظار/);
  assert.match(deliveryHook, /confirmDeliveryRequest\(itemId\)/);
  assert.match(deliveryHook, /onError/);
});

test('إضافة وتعديل الغرض يتحققان من الصورة والمركز والمسار القديم يحوّل للجديد', async () => {
  const [addHook, addPage, editHook, editPage, legacyPage, legacyHook] = await Promise.all([
    readSource('../src/app/(main)/(protected)/add-item/hooks/useAddItem.ts'),
    readSource('../src/app/(main)/(protected)/add-item/page.tsx'),
    readSource('../src/app/(main)/(protected)/items/[id]/edit/hooks/useEditItem.ts'),
    readSource('../src/app/(main)/(protected)/items/[id]/edit/page.tsx'),
    readSource('../src/app/(main)/(protected)/edit-item/[id]/page.tsx'),
    readSource('../src/app/(main)/(protected)/edit-item/[id]/hooks/useEditItem.ts'),
  ]);

  for (const source of [addHook, editHook]) {
    assert.match(source, /image\/jpeg/);
    assert.match(source, /image\/webp/);
    assert.match(source, /URL\.revokeObjectURL/);
  }
  assert.match(addHook, /createItem\(/);
  assert.match(editHook, /updateItem\(itemId/);
  assert.match(editHook, /safeHub: formData\.hubId/);
  assert.match(addPage, /<HubSelector[\s\S]*required/);
  assert.match(editPage, /<HubSelector[\s\S]*required/);
  assert.match(legacyPage, /redirect\(`\/items\/\$\{id\}\/edit`\)/);
  assert.doesNotMatch(legacyHook, /localStorage|\/api\/items\/update\//);
});

test('Dashboard يطابق أحداث ومسارات دورة الحجز ويحتفظ بحالة الترقية', async () => {
  const [source, table] = await Promise.all([
    readSource('../src/app/(main)/(protected)/dashboard/hooks/useDashboard.ts'),
    readSource('../src/app/(main)/(protected)/dashboard/components/ItemsTable.tsx'),
  ]);

  assert.match(source, /deleteItem\(id\)/);
  assert.match(source, /cancelBooking\(id\)/);
  assert.match(source, /response\.status/);
  assert.match(source, /response\.bookedBy/);
  assert.match(source, /SOCKET_EVENTS\.ITEM_RECIPIENT_CONFIRMED/);
  assert.match(source, /SOCKET_EVENTS\.ITEM_DELIVERED/);
  assert.match(source, /SOCKET_EVENTS\.ITEM_BOOKING_TRANSFERRED/);
  assert.match(source, /await loadDashboard\(\)/);
  assert.doesNotMatch(source, /delivery:recipient_confirmed|delivery:completed/);
  assert.doesNotMatch(source, /\/api\/items\/delete\//);
  assert.match(table, /!item\.recipientConfirmed/);
});

test('الإشعارات الجديدة لها fallback آمن ورابط داخلي فقط', async () => {
  const [bell, types] = await Promise.all([
    readSource('../src/components/NotificationBell.tsx'),
    readSource('../src/types/notification.types.ts'),
  ]);

  assert.match(bell, /ICONS\[n\.type\] \?\? "notifications"/);
  assert.match(bell, /getSafeRedirectPath\(destination, ""\)/);
  assert.match(bell, /handleMarkOneRead/);
  assert.match(types, /metadata\?:/);
});
