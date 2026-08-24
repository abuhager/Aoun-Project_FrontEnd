import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

process.env.NODE_ENV = "production";
process.env.NEXT_PUBLIC_API_URL = "https://api.aoun.example";
process.env.BACKEND_URL = "https://internal-api.aoun.example";

const configModule = await import(`../next.config.ts?flow14=${Date.now()}`);
const routeModule = await import("../src/config/routes.ts");
const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("إعداد production يرفض API عبر HTTP ويضيف isolation headers", async () => {
  assert.throws(
    () => configModule.normalizeBaseUrl("http://api.aoun.example", "API_URL"),
    /HTTPS/
  );

  const rules = await configModule.default.headers();
  const globalHeaders = Object.fromEntries(
    rules[0].headers.map(({ key, value }) => [key, value])
  );
  assert.equal(globalHeaders["Cross-Origin-Opener-Policy"], "same-origin-allow-popups");
  assert.equal(globalHeaders["Cross-Origin-Resource-Policy"], "same-origin");
  assert.equal(globalHeaders["X-XSS-Protection"], "0");
  assert.equal(globalHeaders["Strict-Transport-Security"].includes("includeSubDomains"), true);
});

test("صفحة reset لا تُخزّن ولا ترسل Referer", async () => {
  const rules = await configModule.default.headers();
  const resetRule = rules.find(({ source }) => source === "/reset-password/:path*");
  assert.ok(resetRule);

  const headers = Object.fromEntries(
    resetRule.headers.map(({ key, value }) => [key, value])
  );
  assert.match(headers["Cache-Control"], /no-store/);
  assert.equal(headers["Referrer-Policy"], "no-referrer");
  assert.match(headers["X-Robots-Tag"], /noindex/);
});

test("reset token ينتقل من fragment إلى JSON body ولا يدخل API URL أو Storage", () => {
  const hook = read("src/app/(auth)/reset-password/hooks/useResetPassword.ts");
  const authApi = read("src/lib/api/authApi.ts");
  const legacyPage = read("src/app/(auth)/reset-password/[token]/page.tsx");

  assert.match(hook, /window\.location\.hash/);
  assert.match(hook, /window\.history\.replaceState/);
  assert.match(hook, /resetPassword\(\{ token: resetToken, password \}\)/);
  assert.doesNotMatch(hook, /localStorage|sessionStorage|useParams/);

  assert.match(authApi, /['"]\/api\/auth\/reset-password['"]/);
  assert.doesNotMatch(authApi, /reset-password\/\$\{/);
  assert.match(legacyPage, /reset-password#token=/);
});

test("مسار API العام للمصادقة لا يسمح بامتدادات بعد reset-password", () => {
  assert.equal(routeModule.isAuthSafeUrl("/api/auth/reset-password"), true);
  assert.equal(routeModule.isAuthSafeUrl("/api/auth/reset-password/token"), false);
});

test("session marker يبقى SameSite=Lax في production", () => {
  const cookieUtils = read("src/lib/utils/cookieUtils.ts");
  assert.match(cookieUtils, /SameSite=Lax/);
  assert.doesNotMatch(cookieUtils, /SameSite=None/);
});

