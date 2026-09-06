import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

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
    read("src/app/(main)/(protected)/admin/items/PageClient.tsx"),
    read("src/app/(main)/(protected)/admin/items/hooks/useAdminItems.ts"),
  ].join("\n");
  const overview = read("src/app/(main)/(protected)/admin/PageClient.tsx");

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
  // Check the contract actually consumed by ratingApi / GlobalRatingModal,
  // instead of the unused UserRating declaration removed during cleanup.
  const source = ts.createSourceFile("rating.types.ts", ratingTypes, ts.ScriptTarget.Latest, true);
  const pending = source.statements.find(
    (node) => ts.isInterfaceDeclaration(node) && node.name.text === "PendingRatingResponse"
  );
  assert.ok(pending, "PendingRatingResponse must remain defined");
  const nullableObject = (type) => {
    assert.ok(type && ts.isUnionTypeNode(type), "Expected an explicitly nullable union");
    assert.ok(type.types.some((node) => ts.isLiteralTypeNode(node) && node.literal.kind === ts.SyntaxKind.NullKeyword));
    const object = type.types.find(ts.isTypeLiteralNode);
    assert.ok(object, "Expected object data alongside null");
    return object;
  };
  const pendingItem = nullableObject(pending.members.find((member) => member.name.getText(source) === "pendingRating")?.type);
  for (const field of ["donor", "bookedBy"]) {
    nullableObject(pendingItem.members.find((member) => member.name.getText(source) === field)?.type);
  }
  assert.match(apiTypes, /requestId\?: string/);
  assert.match(apiTypes, /message\?:\s+string/);
});
