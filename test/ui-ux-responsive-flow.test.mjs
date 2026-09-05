import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const read = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

const isLayoutFile = (filePath) =>
  /(^|[\\/])layout\.tsx$/.test(filePath);

const tsxFilesUnder = (relativeDir) => {
  const directory = path.join(projectRoot, relativeDir);
  return readdirSync(directory, { recursive: true })
    .filter((entry) => typeof entry === "string" && entry.endsWith(".tsx"))
    .map((entry) => ({
      path: path.join(relativeDir, entry),
      source: read(path.join(relativeDir, entry)),
    }));
};

test("الجذر يعرّف viewport آمن للشاشات والحواف ويستخدم dvh", () => {
  const layout = read("src/app/layout.tsx");

  assert.match(layout, /export const viewport: Viewport/);
  assert.match(layout, /width: "device-width"/);
  assert.match(layout, /initialScale: 1/);
  assert.match(layout, /viewportFit: "cover"/);
  assert.match(layout, /themeColor: "#006155"/);
  assert.match(layout, /min-h-dvh/);
  assert.match(layout, /overflow-x-clip/);
});

test("التخطي إلى المحتوى موجود ولا توجد عناصر main متداخلة", () => {
  const mainLayout = read("src/app/(main)/layout.tsx");
  const authLayout = read("src/app/(auth)/layout.tsx");

  for (const layout of [mainLayout, authLayout]) {
    assert.match(layout, /href="#main-content"/);
    assert.match(layout, /className="skip-link"/);
    assert.match(layout, /<main id="main-content" tabIndex=\{-1\}/);
  }

  const routedFiles = [
    ...tsxFilesUnder("src/app/(main)"),
    ...tsxFilesUnder("src/app/(auth)"),
  ].filter(({ path: filePath }) => !isLayoutFile(filePath));

  for (const file of routedFiles) {
    assert.doesNotMatch(file.source, /^\s*<main\b/m, `main متداخل في ${file.path}`);
  }
});

test("CSS العام يغطي التركيز والحركة المنخفضة وتكبير iOS والـoverflow", () => {
  const css = read("src/app/globals.css");

  assert.match(css, /:focus-visible/);
  assert.match(css, /outline: 3px solid/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /scroll-behavior: auto !important/);
  assert.match(css, /font-size: 1rem !important/);
  assert.match(css, /overflow-x: clip/);
  assert.match(css, /min-height: 100dvh/);
  assert.doesNotMatch(css, /transition:\s*all 300ms/);
});

test("الحوار المشترك يحبس التركيز ويدعم Escape ويعيد التركيز", () => {
  const dialog = read("src/components/ui/AccessibleDialog.tsx");

  assert.match(dialog, /role=\{role\}/);
  assert.match(dialog, /aria-modal="true"/);
  assert.match(dialog, /event\.key === "Escape"/);
  assert.match(dialog, /event\.key !== "Tab"/);
  assert.match(dialog, /document\.body\.style\.overflow = "hidden"/);
  assert.match(dialog, /previousFocusRef\.current\?\.focus/);
  assert.match(dialog, /data-dialog-initial-focus/);
});

test("حوارات المسارات الحساسة تستخدم الغلاف الموحد", () => {
  const modalFiles = [
    "src/components/AppealModal/index.tsx",
    "src/components/ReportModal/index.tsx",
    "src/components/GlobalRatingModal/index.tsx",
    "src/components/PhoneVerifyModal.tsx",
    "src/components/ChatDrawer/index.tsx",
    "src/components/ConversationList/index.tsx",
    "src/app/(main)/(protected)/dashboard/components/ActionModal.tsx",
    "src/app/(main)/items/[id]/components/ConfirmModal.tsx",
    "src/app/(main)/(protected)/admin/users/components/UserActionDialog.tsx",
    "src/app/(main)/(protected)/admin/items/components/DeleteItemDialog.tsx",
    "src/app/(main)/(protected)/admin/reports/components/ReportReviewDialog.tsx",
    "src/app/(main)/(protected)/admin/hubs/components/HubFormDialog.tsx",
    "src/app/(main)/donation-requests/components/DonationOfferDialog.tsx",
  ];

  for (const filePath of modalFiles) {
    assert.match(read(filePath), /AccessibleDialog/, `حوار غير موحد في ${filePath}`);
  }
});

test("القائمة الرئيسية متاحة بالكيبورد ولا تبقي قائمة الهاتف مخفية بصرياً فقط", () => {
  const navbar = [
    "src/components/Navbar/index.tsx",
    "src/components/Navbar/useNavbarController.ts",
    "src/components/Navbar/NavbarDesktopLinks.tsx",
    "src/components/Navbar/NavbarMobileMenu.tsx",
  ].map(read).join("\n");

  assert.match(navbar, /aria-controls=\{mobileMenuId\}/);
  assert.match(navbar, /aria-expanded=\{isMobileMenuOpen\}/);
  assert.match(navbar, /aria-current=\{isActive \? "page" : undefined\}/);
  assert.match(navbar, /event\.key !== "Escape"/);
  assert.match(navbar, /document\.body\.style\.overflow = "hidden"/);
  assert.match(navbar, /if \(!isMobileMenuOpen\) return null/);
  assert.match(navbar, /max-h-\[calc\(100dvh-4rem\)\]/);
});

test("لوحة الإشعارات تناسب 320px وتخرج من شجرة الوصول عند الإغلاق", () => {
  const bell = [
    "src/components/NotificationBell.tsx",
    "src/components/notifications/NotificationButton.tsx",
    "src/components/notifications/NotificationPanel.tsx",
    "src/components/notifications/useNotificationBellController.ts",
  ].map(read).join("\n");

  assert.match(bell, /\{isOpen && \(/);
  assert.match(bell, /fixed left-2 right-2 top-20/);
  assert.match(bell, /max-h-\[calc\(100dvh-6rem\)\]/);
  assert.match(bell, /aria-controls=\{panelId\}/);
  assert.match(bell, /event\.key !== "Escape"/);
});

test("كل وجهات الإدارة تظهر على الهاتف والجداول قابلة للتمرير الموصوف", () => {
  const adminLayout = read("src/app/(main)/(protected)/admin/layout.tsx");
  const responsiveTable = read("src/components/ui/ResponsiveTable.tsx");

  assert.match(adminLayout, /\{NAV_ITEMS\.map/);
  assert.doesNotMatch(adminLayout, /NAV_ITEMS\.slice/);
  assert.match(adminLayout, /overflow-x-auto/);
  assert.match(adminLayout, /safe-area-bottom/);
  assert.match(adminLayout, /aria-current=\{isActive \? "page" : undefined\}/);

  assert.match(responsiveTable, /role="region"/);
  assert.match(responsiveTable, /tabIndex=\{0\}/);
  assert.match(responsiveTable, /مرّر أفقياً/);

  const tableFiles = [
    "src/app/(main)/(protected)/admin/users/components/AdminUsersTable.tsx",
    "src/app/(main)/(protected)/admin/items/components/AdminItemsTable.tsx",
    "src/app/(main)/(protected)/admin/reports/components/AdminReportsContent.tsx",
    "src/app/(main)/(protected)/admin/logs/components/AdminLogsTable.tsx",
  ];
  for (const filePath of tableFiles) {
    assert.match(read(filePath), /ResponsiveTable/);
  }
});

test("لا تبقى وحدات vh القديمة ولا Navbar مكرر داخل صفحات المسار", () => {
  const srcFiles = tsxFilesUnder("src");

  for (const file of srcFiles) {
    assert.doesNotMatch(file.source, /min-h-screen/, `vh قديم في ${file.path}`);
  }

  const appFiles = tsxFilesUnder("src/app").filter(
    ({ path: filePath }) => !isLayoutFile(filePath)
  );
  for (const file of appFiles) {
    assert.doesNotMatch(file.source, /<Navbar\s*\/>/, `Navbar مكرر في ${file.path}`);
  }
});

test("الحالات الحية تعلن التحميل والنجاح والخطأ لقارئ الشاشة", () => {
  const loading = read("src/app/loading.tsx");
  const toast = read("src/hooks/useToast.tsx");
  const dashboardToast = read(
    "src/app/(main)/(protected)/dashboard/components/Toast.tsx"
  );

  assert.match(loading, /role="status"/);
  assert.match(loading, /aria-busy="true"/);
  assert.match(toast, /role=\{toast\.ok \? "status" : "alert"\}/);
  assert.match(toast, /aria-live=\{toast\.ok \? "polite" : "assertive"\}/);
  assert.match(toast, /max-w-\[calc\(100vw-2rem\)\]/);
  assert.match(dashboardToast, /useRef\(onClose\)/);
  assert.match(dashboardToast, /onCloseRef\.current\(\)/);
  assert.match(dashboardToast, /\[msg, type\]/);
  assert.match(dashboardToast, /role=\{isSuccess \? "status" : "alert"\}/);
  assert.doesNotMatch(dashboardToast, /setTimeout\(onClose/);
});
