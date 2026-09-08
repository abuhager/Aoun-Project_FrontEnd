import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const {
  buildDonationRequestListUrl,
  readDonationRequestListState,
} = await import("../src/lib/navigation/donationRequestListUrl.ts");

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("حالة فلاتر طلبات التبرع تُقرأ من URL وتعود إليه دون قيم افتراضية زائدة", () => {
  const state = readDonationRequestListState(
    new URLSearchParams("mine=true&category=%D9%83%D8%AA%D8%A8&location=%D8%B9%D9%85%D8%A7%D9%86&page=3")
  );

  assert.deepEqual(state, {
    mine: true,
    category: "كتب",
    location: "عمان",
    page: 3,
  });
  assert.equal(
    buildDonationRequestListUrl(state),
    "/donation-requests?mine=true&category=%D9%83%D8%AA%D8%A8&location=%D8%B9%D9%85%D8%A7%D9%86&page=3"
  );
  assert.equal(
    buildDonationRequestListUrl({ mine: false, category: "", location: "", page: 1 }),
    "/donation-requests"
  );
});

test("أعطال refresh المؤقتة لا تمسح الجلسة بينما رفض الخادم ينهيها", async () => {
  const { classifyRefreshFailure } = await import("../src/lib/auth/refreshFailure.ts");

  assert.equal(classifyRefreshFailure(new TypeError("Failed to fetch")), "temporary-unavailable");
  assert.equal(
    classifyRefreshFailure(Object.assign(new Error("unavailable"), { status: 503 })),
    "temporary-unavailable"
  );
  assert.equal(
    classifyRefreshFailure(Object.assign(new Error("expired"), { status: 401 })),
    "invalid-session"
  );
});

test("الخطوط والأيقونات محلية ولا تسمح CSP بخوادم Google Fonts", () => {
  const layout = read("src/app/layout.tsx");
  const fontCss = read("src/assets/fonts/fonts.css");
  const csp = read("src/config/csp.ts");

  assert.doesNotMatch(layout, /next\/font\/google|fonts\.googleapis|fonts\.gstatic/);
  assert.match(fontCss, /cairo-variable\.ttf/);
  assert.match(layout, /material-symbols\/outlined\.css/);
  assert.doesNotMatch(csp, /fonts\.googleapis|fonts\.gstatic/);
});

test("طلبات refresh بين التبويبات تمر عبر Web Locks باسم ثابت", () => {
  const lock = read("src/lib/auth/crossTabRefreshLock.ts");
  const axios = read("src/lib/api/axiosInstance.ts");
  const context = read("src/context/AuthContext.tsx");

  assert.match(lock, /aoun-auth-refresh/);
  assert.match(lock, /mode: "exclusive"/);
  assert.match(axios, /withCrossTabRefreshLock/);
  assert.match(context, /withCrossTabRefreshLock/);
});

test("عقد Socket القابل للقراءة الآلية يطابق ثوابت الواجهة", async () => {
  const contract = JSON.parse(read("contracts/aoun-socket.v1.json"));
  const { SOCKET_EVENTS } = await import("../src/config/socket.ts");
  const contractEvents = new Set([
    ...Object.values(contract.clientToServer),
    ...Object.values(contract.serverToClient),
  ]);
  assert.deepEqual(contractEvents, new Set(Object.values(SOCKET_EVENTS)));
});
