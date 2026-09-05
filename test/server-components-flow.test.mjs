import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(path, "utf8");

test("كل ملفات page تبقى Server Components وتحصر التفاعل في Client islands", async () => {
  const entries = await readdir("src/app", { recursive: true });
  const pagePaths = entries
    .map(String)
    .filter((path) => path.endsWith("page.tsx"))
    .map((path) => `src/app/${path}`);

  assert.equal(pagePaths.length, 30);
  const pages = await Promise.all(pagePaths.map(read));
  for (const source of pages) assert.doesNotMatch(source, /^"use client";/);
});

test("طبقة API العامة تعمل على السيرفر فقط وتستخدم Next fetch cache", async () => {
  const source = await read("src/lib/api/publicApiServer.ts");

  assert.match(source, /import "server-only"/);
  assert.match(source, /process\.env\.BACKEND_URL/);
  assert.match(source, /await fetch\(/);
  assert.match(source, /new AbortController\(\)/);
  assert.match(source, /controller\.abort\(/);
  assert.match(source, /clearTimeout\(timeout\)/);
  assert.match(source, /import \{ cache \} from "react"/);
  assert.match(source, /getPublicItemServer = cache/);
  assert.match(source, /revalidate/);
  assert.match(source, /tags/);
  assert.doesNotMatch(source, /axiosInstance/);
});

test("الصفحة الرئيسية تبث الأغراض داخل Suspense وBrowse بقي Server Component", async () => {
  const [home, latestItems, browse] = await Promise.all([
    read("src/app/(main)/page.tsx"),
    read("src/app/(main)/LatestItems.tsx"),
    read("src/app/(main)/browse/page.tsx"),
  ]);

  assert.doesNotMatch(home, /^"use client"/);
  assert.match(home, /<Suspense fallback=\{<LatestItemsSkeleton \/>\}>/);
  assert.doesNotMatch(home, /export default async function HomePage/);
  assert.match(latestItems, /export default async function LatestItems/);
  assert.match(latestItems, /getPublicItemsServer/);
  assert.match(latestItems, /\.catch\(/);
  assert.doesNotMatch(browse, /^"use client"/);
  assert.match(browse, /getPublicItemsServer/);
  assert.match(browse, /searchParams: Promise<BrowseSearchParams>/);
  await assert.rejects(access("src/app/(main)/browse/hooks/useBrowse.ts"));
  await assert.rejects(access("src/app/(main)/hooks/useHomePage.ts"));
});

test("صفحات التفاصيل تجلب النسخة العامة على السيرفر وتحصر التفاعل في Client islands", async () => {
  const [itemPage, itemClient, requestPage, requestClient, hubsPage, hubsClient] =
    await Promise.all([
      read("src/app/(main)/items/[id]/page.tsx"),
      read("src/app/(main)/items/[id]/ItemDetailsClient.tsx"),
      read("src/app/(main)/donation-requests/[id]/page.tsx"),
      read("src/app/(main)/donation-requests/[id]/DonationRequestDetailsClient.tsx"),
      read("src/app/(main)/hubs/page.tsx"),
      read("src/app/(main)/hubs/HubsExplorer.tsx"),
    ]);

  assert.match(itemPage, /getPublicItemServer/);
  assert.doesNotMatch(itemPage, /^"use client"/);
  assert.match(itemClient, /^"use client"/);
  assert.match(requestPage, /getPublicDonationRequestServer/);
  assert.doesNotMatch(requestPage, /^"use client"/);
  assert.match(requestClient, /^"use client"/);
  assert.match(hubsPage, /getPublicHubsServer/);
  assert.match(hubsClient, /^"use client"/);
});

test("الجزر العميلة الكبيرة تفصل منطق الحالة عن مكونات العرض", async () => {
  const [requestClient, profileClient, itemClient, navbar, conversations, settings, itemsTable, dashboardHook, chatDrawer, notificationBell, leaderboard, addItem, editItem, register] = await Promise.all([
    read("src/app/(main)/donation-requests/[id]/DonationRequestDetailsClient.tsx"),
    read("src/app/(main)/(protected)/profile/edit/PageClient.tsx"),
    read("src/app/(main)/items/[id]/ItemDetailsClient.tsx"),
    read("src/components/Navbar/index.tsx"),
    read("src/components/ConversationList/index.tsx"),
    read("src/app/(main)/(protected)/admin/settings/components/SettingsForm.tsx"),
    read("src/app/(main)/(protected)/dashboard/components/ItemsTable.tsx"),
    read("src/app/(main)/(protected)/dashboard/hooks/useDashboard.ts"),
    read("src/components/ChatDrawer/index.tsx"),
    read("src/components/NotificationBell.tsx"),
    read("src/app/(main)/(protected)/leaderboard/PageClient.tsx"),
    read("src/app/(main)/(protected)/add-item/PageClient.tsx"),
    read("src/app/(main)/(protected)/items/[id]/edit/PageClient.tsx"),
    read("src/app/(auth)/register/PageClient.tsx"),
  ]);

  assert.match(requestClient, /useDonationRequestDetails/);
  assert.match(requestClient, /DonationRequestDetailsSections/);
  assert.doesNotMatch(requestClient, /getOffersByRequest|acceptOffer\(/);

  assert.match(profileClient, /useEditProfile/);
  assert.match(profileClient, /<ProfileForms/);
  assert.doesNotMatch(profileClient, /useState|updateMyProfile\(/);

  assert.match(itemClient, /<ItemActions/);
  assert.doesNotMatch(itemClient, /<LevelGate/);

  assert.match(navbar, /useNavbarController/);
  assert.match(navbar, /<NavbarAccountActions/);
  assert.match(navbar, /<NavbarMobileMenu/);
  assert.doesNotMatch(navbar, /useEffect|useState|getConversationUnreadCount/);

  assert.match(conversations, /useConversationListController/);
  assert.match(conversations, /<ConversationInbox/);
  assert.doesNotMatch(conversations, /useSWR|markConversationRead/);

  assert.match(settings, /settingsFieldDefinitions/);
  assert.match(settings, /<NumericSection/);
  assert.match(itemsTable, /<DashboardItemCard/);
  assert.match(dashboardHook, /useDashboardRealtime/);
  assert.match(chatDrawer, /useChatPanelController/);
  assert.match(chatDrawer, /<ChatMessageList/);
  assert.match(notificationBell, /useNotificationBellController/);
  assert.match(notificationBell, /<NotificationPanel/);
  assert.match(leaderboard, /<LeaderboardList/);
  assert.doesNotMatch(leaderboard, /<Image/);
  assert.match(addItem, /<ItemEditorForm/);
  assert.match(editItem, /<ItemEditorForm/);
  assert.doesNotMatch(addItem, /<input|<select|<textarea/);
  assert.doesNotMatch(editItem, /<input|<select|<textarea/);
  assert.match(register, /useRegisterFormController/);
  assert.match(register, /<RegisterForm/);
  assert.doesNotMatch(register, /<input/);
});
