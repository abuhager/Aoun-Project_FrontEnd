import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(path, "utf8");

test("طبقة API العامة تعمل على السيرفر فقط وتستخدم Next fetch cache", async () => {
  const source = await read("src/lib/api/publicApiServer.ts");

  assert.match(source, /import "server-only"/);
  assert.match(source, /process\.env\.BACKEND_URL/);
  assert.match(source, /await fetch\(/);
  assert.match(source, /AbortSignal\.timeout\(getServerApiTimeoutMs\(\)\)/);
  assert.match(source, /import \{ cache \} from "react"/);
  assert.match(source, /getPublicItemServer = cache/);
  assert.match(source, /revalidate/);
  assert.match(source, /tags/);
  assert.doesNotMatch(source, /axiosInstance/);
});

test("الصفحة الرئيسية وBrowse أصبحا Server Components", async () => {
  const [home, browse] = await Promise.all([
    read("src/app/(main)/page.tsx"),
    read("src/app/(main)/browse/page.tsx"),
  ]);

  assert.doesNotMatch(home, /^"use client"/);
  assert.match(home, /getPublicItemsServer/);
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
