import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8');

const readItemDetailsSource = async () => {
  const sources = await Promise.all([
    readSource('../src/app/(main)/items/[id]/ItemDetailsClient.tsx'),
    readSource('../src/app/(main)/items/[id]/components/ItemActions.tsx'),
  ]);
  return sources.join('\n');
};

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
  const [page, card, details] = await Promise.all([
    readSource('../src/app/(main)/browse/page.tsx'),
    readSource('../src/components/ui/ItemCard.tsx'),
    readItemDetailsSource(),
  ]);

  assert.match(page, /getPublicItemsServer\(/);
  assert.match(page, /page: values\.page/);
  assert.match(page, /search: values\.search/);
  assert.match(page, /location: values\.location/);
  assert.match(page, /category: values\.category/);
  assert.match(page, /searchParams: Promise<BrowseSearchParams>/);
  assert.match(page, /<form action="\/browse" method="get"/);
  assert.match(page, /buildBrowseHref/);
  assert.doesNotMatch(page, /\.filter\(/);
  assert.match(page, /صفحة \{currentPage\} من \{totalPages\}/);
  assert.match(page, /returnTo=\{browseReturnTo\}/);
  assert.match(card, /returnTo=\$\{encodeURIComponent\(returnTo\)\}/);
  assert.match(details, /requestedReturnTo\?\.startsWith\("\/browse\?"\)/);
  assert.match(page, /إعادة المحاولة/);
});

test('صفحة الغرض تعتمد حالة الانتظار من Backend وتنتظر تهيئة الهوية', async () => {
  const [hook, page, deliveryHook] = await Promise.all([
    readSource('../src/app/(main)/items/[id]/hooks/useItemDetails.ts'),
    readItemDetailsSource(),
    readSource('../src/hooks/useDeliveryConfirmation.ts'),
  ]);

  assert.match(hook, /item\?\.isInWaitlist/);
  assert.match(hook, /bookingPreviouslyCancelled/);
  assert.match(hook, /leaveWaitlist\(itemId\)/);
  assert.match(hook, /if \(authLoading\) return/);
  assert.match(hook, /SOCKET_EVENTS\.ITEM_RECIPIENT_CONFIRMED/);
  assert.match(hook, /SOCKET_EVENTS\.ITEM_DELETED/);
  assert.doesNotMatch(hook, /localStorage/);
  assert.match(page, /disabled=\{deliveryLoading \|\| !isRecipientConfirmed\}/);
  assert.match(page, /!isRecipientConfirmed &&/);
  assert.match(page, /سجل دخولك للانضمام لقائمة الانتظار/);
  assert.match(deliveryHook, /confirmDeliveryRequest\(itemId\)/);
  assert.match(deliveryHook, /onError/);
});

test('إضافة وتعديل الغرض يتحققان من الصورة والمركز والمسار القديم يحوّل للجديد', async () => {
  const [addHook, addPage, editHook, editPage, legacyPage] = await Promise.all([
    readSource('../src/app/(main)/(protected)/add-item/hooks/useAddItem.ts'),
    readSource('../src/app/(main)/(protected)/add-item/PageClient.tsx'),
    readSource('../src/app/(main)/(protected)/items/[id]/edit/hooks/useEditItem.ts'),
    readSource('../src/app/(main)/(protected)/items/[id]/edit/PageClient.tsx'),
    readSource('../src/app/(main)/(protected)/edit-item/[id]/page.tsx'),
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
});

test('Dashboard يطابق أحداث ومسارات دورة الحجز ويحتفظ بحالة الترقية', async () => {
  const [source, table, actions] = await Promise.all([
    readSource('../src/app/(main)/(protected)/dashboard/hooks/useDashboard.ts'),
    readSource('../src/app/(main)/(protected)/dashboard/components/ItemsTable.tsx'),
    readSource('../src/app/(main)/(protected)/dashboard/components/DashboardItemActions.tsx'),
  ]);
  const dashboardView = `${table}\n${actions}`;

  assert.match(source, /deleteItem\(id\)/);
  assert.match(source, /cancelBooking\(id\)/);
  assert.match(source, /response\.status/);
  assert.match(source, /response\.bookedBy/);
  assert.match(source, /SOCKET_EVENTS\.ITEM_RECIPIENT_CONFIRMED/);
  assert.match(source, /SOCKET_EVENTS\.ITEM_DELIVERED/);
  assert.match(source, /SOCKET_EVENTS\.ITEM_BOOKING_TRANSFERRED/);
  assert.match(source, /await loadDashboard\(\)/);
  assert.match(source, /deliveryInFlightRef/);
  assert.match(source, /deliveryLoadingItemId/);
  assert.match(source, /if \(!beginDeliveryRequest\(itemId\)\) return/);
  assert.doesNotMatch(source, /delivery:recipient_confirmed|delivery:completed/);
  assert.doesNotMatch(source, /\/api\/items\/delete\//);
  assert.match(dashboardView, /!item\.recipientConfirmed/);
  assert.match(dashboardView, /deliveryLoadingItemId === item\._id/);
  assert.match(dashboardView, /disabled=\{deliveryLoadingItemId !== null\}/);
  assert.doesNotMatch(dashboardView, /deliveryLoading && deliveryState\.itemId/);
});

test('الإشعارات الجديدة لها fallback آمن ورابط داخلي فقط', async () => {
  const [bell, types] = await Promise.all([
    Promise.all([
      readSource('../src/components/NotificationBell.tsx'),
      readSource('../src/components/notifications/NotificationPanel.tsx'),
      readSource('../src/components/notifications/notificationPresentation.ts'),
      readSource('../src/components/notifications/useNotificationBellController.ts'),
    ]).then((parts) => parts.join('\n')),
    readSource('../src/types/notification.types.ts'),
  ]);

  assert.match(bell, /NOTIFICATION_ICONS\[notification\.type\] \?\? "notifications"/);
  assert.match(bell, /getSafeRedirectPath\(destination, ""\)/);
  assert.match(bell, /handleMarkOneRead/);
  assert.match(types, /metadata\?:/);
});
