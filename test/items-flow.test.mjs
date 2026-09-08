import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  getBrowseSearchRequestValue,
  isBrowseSearchReady,
  needsMoreBrowseSearchCharacters,
} from '../src/lib/navigation/browseSearch.ts';

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

  assert.match(source, /get<ItemsListResponse>\("\/api\/items"/);
  assert.match(source, /params: filters/);
  assert.match(source, /signal/);
  assert.match(source, /delete<\{ msg: string \}>\(\s*`\/api\/items\/\$\{id\}`/);
  assert.match(source, /`\/api\/items\/\$\{id\}\/confirm-delivery`/);
  assert.match(source, /`\/api\/items\/\$\{id\}\/confirm-receipt`/);
  assert.match(source, /`\/api\/items\/leave-waitlist\/\$\{id\}`/);
  assert.doesNotMatch(source, /\/api\/items\/delete\//);
  assert.doesNotMatch(source, /\/api\/items\/update\//);
  assert.doesNotMatch(source, /multipart\/form-data/);
});

test('Browse يبدأ من SSR ثم يحدّث النتائج مباشرة أثناء الكتابة بدون تنقّل Server جديد', async () => {
  const [page, experience, browseHook, results, filterSelect, liveSearch, card, details] = await Promise.all([
    readSource('../src/app/(main)/browse/page.tsx'),
    readSource('../src/components/browse/BrowseExperience.tsx'),
    readSource('../src/components/browse/useBrowseExperience.ts'),
    readSource('../src/components/browse/BrowseResults.tsx'),
    readSource('../src/components/browse/BrowseFilterSelect.tsx'),
    readSource('../src/components/browse/BrowseLiveSearchInput.tsx'),
    readSource('../src/components/ui/ItemCard.tsx'),
    readItemDetailsSource(),
  ]);

  assert.match(page, /getPublicItemsServer\(/);
  assert.match(page, /page: values\.page/);
  assert.match(page, /search: requestSearch \|\| undefined/);
  assert.match(page, /location: values\.location/);
  assert.match(page, /category: values\.category/);
  assert.match(page, /searchParams: Promise<BrowseSearchParams>/);
  assert.match(page, /getBrowseSearchRequestValue\(values\.search\)/);
  assert.match(page, /<BrowseExperience/);
  assert.match(page, /initialResult=\{result\}/);
  assert.match(page, /initialValues=\{values\}/);
  assert.match(experience, /useBrowseExperience/);
  assert.match(experience, /<BrowseFilters/);
  assert.match(experience, /<BrowseResults/);
  assert.match(browseHook, /SEARCH_DELAY_MS = 300/);
  assert.match(browseHook, /getBrowseSearchRequestValue\(searchQuery\)/);
  assert.match(browseHook, /getItems\(/);
  assert.match(browseHook, /new AbortController\(\)/);
  assert.match(browseHook, /controller\.abort\(\)/);
  assert.match(browseHook, /window\.history\.replaceState/);
  assert.doesNotMatch(browseHook, /router\.replace\(/);
  assert.match(browseHook, /page: requestValues\.page/);
  assert.match(browseHook, /search: requestValues\.search/);
  assert.match(browseHook, /location: requestValues\.location/);
  assert.match(browseHook, /category: requestValues\.category/);
  assert.doesNotMatch(browseHook, /\.filter\(/);
  assert.match(results, /صفحة \{currentPage\} من \{totalPages\}/);
  assert.match(experience, /returnTo=\{browse\.browseReturnTo\}/);
  assert.match(results, /SkeletonCard/);
  assert.match(filterSelect, /onValueChange\(event\.target\.value\)/);
  assert.match(liveSearch, /onValueChange\(event\.target\.value\)/);
  assert.match(liveSearch, /اكتب حرفًا إضافيًا لبدء البحث/);
  assert.doesNotMatch(`${experience}\n${results}`, />\s*بحث\s*<\/button>/);
  assert.match(card, /returnTo=\$\{encodeURIComponent\(returnTo\)\}/);
  assert.match(details, /requestedReturnTo\?\.startsWith\("\/browse\?"\)/);
  assert.match(results, /إعادة المحاولة/);
});

test('Browse ينتظر حرفين قبل البحث ويحافظ على النتائج عند الحرف الأول', () => {
  assert.equal(getBrowseSearchRequestValue(' ك '), '');
  assert.equal(getBrowseSearchRequestValue(' كت '), 'كت');
  assert.equal(isBrowseSearchReady('ك'), false);
  assert.equal(isBrowseSearchReady('كتاب'), true);
  assert.equal(needsMoreBrowseSearchCharacters('ك'), true);
  assert.equal(needsMoreBrowseSearchCharacters('كت'), false);
  assert.equal(needsMoreBrowseSearchCharacters(''), false);
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
  const [addHook, addPage, editHook, editPage, legacyPage, editorForm] = await Promise.all([
    readSource('../src/app/(main)/(protected)/add-item/hooks/useAddItem.ts'),
    readSource('../src/app/(main)/(protected)/add-item/PageClient.tsx'),
    readSource('../src/app/(main)/(protected)/items/[id]/edit/hooks/useEditItem.ts'),
    readSource('../src/app/(main)/(protected)/items/[id]/edit/PageClient.tsx'),
    readSource('../src/app/(main)/(protected)/edit-item/[id]/page.tsx'),
    readSource('../src/components/items/ItemEditorForm.tsx'),
  ]);

  for (const source of [addHook, editHook]) {
    assert.match(source, /image\/jpeg/);
    assert.match(source, /image\/webp/);
    assert.match(source, /URL\.revokeObjectURL/);
  }
  assert.match(addHook, /createItem\(/);
  assert.match(editHook, /updateItem\(itemId/);
  assert.match(editHook, /safeHub: formData\.hubId/);
  assert.match(addPage, /<ItemEditorForm/);
  assert.match(editPage, /<ItemEditorForm/);
  assert.match(addPage, /locations=\{locations\}/);
  assert.match(editPage, /locations=\{locations\}/);
  assert.match(editorForm, /locationOptions\.map/);
  assert.doesNotMatch(editorForm, /ITEM_CITIES/);
  assert.match(editorForm, /<HubSelector[\s\S]*required=\{hubRequired\}/);
  assert.match(legacyPage, /redirect\(`\/items\/\$\{id\}\/edit`\)/);
});

test('Dashboard يطابق أحداث ومسارات دورة الحجز ويحتفظ بحالة الترقية', async () => {
  const [dashboardHook, realtimeHook, table, actions] = await Promise.all([
    readSource('../src/app/(main)/(protected)/dashboard/hooks/useDashboard.ts'),
    readSource('../src/app/(main)/(protected)/dashboard/hooks/useDashboardRealtime.ts'),
    readSource('../src/app/(main)/(protected)/dashboard/components/ItemsTable.tsx'),
    readSource('../src/app/(main)/(protected)/dashboard/components/DashboardItemActions.tsx'),
  ]);
  const source = `${dashboardHook}\n${realtimeHook}`;
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
