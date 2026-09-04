import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("عميل الإدارة يطابق طرق ومسارات Backend الفعلية", () => {
  const api = read("src/lib/api/adminApi.ts");

  assert.match(api, /post<AdminUserMutationResponse>[\s\S]*\/ban/);
  assert.match(api, /post<AdminUserMutationResponse>[\s\S]*\/unban/);
  assert.match(api, /\/promote/);
  assert.match(api, /\/demote/);
  assert.doesNotMatch(api, /\/trust/);
  assert.doesNotMatch(api, /axiosInstance\.patch/);
});

test("صفحات الإدارة تعتمد العقود المشتركة وتعرض imageUrl الحقيقي", () => {
  const users = read("src/app/(main)/(protected)/admin/users/hooks/useAdminUsers.ts");
  const items = [
    read("src/app/(main)/(protected)/admin/items/page.tsx"),
    read("src/app/(main)/(protected)/admin/items/hooks/useAdminItems.ts"),
  ].join("\n");
  const overview = read("src/app/(main)/(protected)/admin/page.tsx");

  assert.match(users, /getAdminUsers/);
  assert.match(users, /cleanedNote\.length < 5/);
  assert.match(users, /banUser\(userId/);
  assert.match(items, /getAdminItems/);
  assert.match(items, /item\.imageUrl/);
  assert.doesNotMatch(items, /item\.images/);
  assert.match(overview, /getAdminStats/);
});

test("عقد التسجيل والتجديد يطابق الاستجابات الفعلية", () => {
  const authTypes = read("src/types/auth.types.ts");
  const authApi = read("src/lib/api/authApi.ts");
  const interceptor = read("src/lib/api/axiosInstance.ts");

  assert.match(authTypes, /phone:\s+string;/);
  assert.match(authTypes, /interface RefreshResponse/);
  assert.match(authTypes, /user:\s+AuthUser/);
  assert.match(authApi, /post<RefreshResponse>/);
  assert.match(interceptor, /post<RefreshResponse>/);
});

test("الأنواع تمثل القيم nullable التي يعيدها Backend", () => {
  const donationTypes = read("src/types/donationRequest.types.ts");
  const ratingTypes = read("src/types/rating.types.ts");
  const apiTypes = read("src/types/api.types.ts");

  assert.match(donationTypes, /description:\s+string \| null/);
  assert.match(donationTypes, /safeHub:[\s\S]*\| null/);
  assert.match(ratingTypes, /item:[\s\S]*\| null/);
  assert.match(apiTypes, /requestId\?: string/);
  assert.match(apiTypes, /message\?:\s+string/);
});
